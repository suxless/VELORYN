import * as THREE from "three";
import {
  buildBodyLoft,
  buildCanopyLoft,
  frontLampPoints,
  rearLampPoints,
  pinstripePoints,
  FRONT_AXLE_X,
  REAR_AXLE_X,
  FRONT_AXLE_Z,
  REAR_AXLE_Z,
  WHEEL_RADIUS,
  type LoftData,
  type Vec3,
} from "./carGeometry";

export type ViewName = "hero" | "front" | "side" | "rear" | "top";
export type WheelFinish = "gold" | "graphite" | "champagne";

export interface StageOptions {
  variant: "hero" | "config";
  paint: string;
  wheels: WheelFinish;
  view: ViewName;
}

const VIEWS: Record<ViewName, { az: number; polar: number; dist: number }> = {
  hero: { az: 0.95, polar: 1.4, dist: 1 },
  front: { az: 0.32, polar: 1.43, dist: 0.98 },
  side: { az: Math.PI / 2, polar: 1.51, dist: 0.94 },
  rear: { az: Math.PI - 0.55, polar: 1.4, dist: 1 },
  top: { az: Math.PI / 2, polar: 0.14, dist: 0.9 },
};

const WHEEL_FINISHES: Record<WheelFinish, { color: string; metalness: number; roughness: number }> = {
  gold: { color: "#D4B46A", metalness: 0.95, roughness: 0.28 },
  graphite: { color: "#26372F", metalness: 0.85, roughness: 0.34 },
  champagne: { color: "#EADFC4", metalness: 0.9, roughness: 0.3 },
};

const wrapPi = (a: number): number => ((((a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);

function toGeometry(d: LoftData): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(d.positions, 3));
  g.setIndex(new THREE.BufferAttribute(d.indices, 1));
  g.computeVertexNormals();
  return g;
}

function tube(points: Vec3[], radius: number): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  return new THREE.TubeGeometry(curve, 64, radius, 8, false);
}

function radialTexture(stops: [number, string][], size = 512): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Reflection environment: emerald studio dome with champagne / mint / gold softboxes. */
function buildEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const env = new THREE.Scene();

  const dome = new THREE.SphereGeometry(20, 48, 24);
  const pos = dome.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const top = new THREE.Color("#0F6A53");
  const mid = new THREE.Color("#06362B");
  const bottom = new THREE.Color("#03140F");
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 20;
    if (y >= 0) tmp.copy(mid).lerp(top, Math.pow(y, 0.8));
    else tmp.copy(mid).lerp(bottom, Math.pow(-y, 0.6));
    colors.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  dome.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  env.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));

  const panel = (w: number, h: number, hex: string, k: number, p: Vec3) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(hex).multiplyScalar(k),
        side: THREE.DoubleSide,
        toneMapped: false,
      })
    );
    m.position.set(...p);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  panel(16, 5, "#EADFC4", 5, [0, 9, 0]); // overhead key
  panel(1.7, 9, "#EADFC4", 6, [-9, 4, 5]); // tall champagne strip
  panel(1.3, 10, "#64DCC0", 4.5, [9, 3, -6]); // mint rim strip
  panel(5, 4, "#D4B46A", 3, [-10, 3, 0]); // gold rear panel
  panel(7, 1.2, "#EADFC4", 3.5, [10, 1.6, 2]); // low front strip

  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(env, 0.03);
  pmrem.dispose();
  env.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    (m.material as THREE.Material | undefined)?.dispose();
  });
  return rt.texture;
}

export class CarStage {
  onReady?: () => void;

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  private car = new THREE.Group();
  private floorGroup = new THREE.Group();
  private target = new THREE.Vector3(0, 0.5, 0);

  private bodyMat: THREE.MeshPhysicalMaterial;
  private rimMat: THREE.MeshStandardMaterial;
  private lampMats: { mat: THREE.MeshBasicMaterial; base: number }[] = [];
  private paintTarget: THREE.Color;
  private rimTarget: THREE.Color;
  private envTexture: THREE.Texture;

  private view: ViewName;
  private az = 0;
  private polar = 1.4;
  private dist = 9;
  private userAz = 0;
  private userPolar = 0;
  private velAz = 0;
  private pointerAz = 0;
  private pointerPolar = 0;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private activePointer = -1;

  private width = 1;
  private height = 1;
  private raf = 0;
  private lastTime = 0;
  private time = 0;
  private introT = 0;
  private visible = true;
  private disposed = false;
  private readyFired = false;
  private reduceMotion: boolean;
  private ro: ResizeObserver;
  private io: IntersectionObserver;

  constructor(private canvas: HTMLCanvasElement, private opts: StageOptions) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    const coarse = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.reduceMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.view = opts.view;
    this.envTexture = buildEnvironment(this.renderer);
    this.scene.environment = this.envTexture;

    this.bodyMat = new THREE.MeshPhysicalMaterial({
      color: opts.paint,
      metalness: 0.7,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.15,
    });
    const rf = WHEEL_FINISHES[opts.wheels];
    this.rimMat = new THREE.MeshStandardMaterial({ color: rf.color, metalness: rf.metalness, roughness: rf.roughness });
    this.paintTarget = new THREE.Color(opts.paint);
    this.rimTarget = new THREE.Color(rf.color);

    this.buildCar();
    this.buildFloor();
    this.buildLights();
    this.scene.add(this.floorGroup, this.car);

    // initial camera state
    const v = VIEWS[this.view];
    this.az = v.az;
    this.polar = v.polar;
    this.resize();
    this.dist = this.fitDistance(this.view);

    // interaction
    canvas.style.touchAction = "pan-y";
    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", this.onDown);
    canvas.addEventListener("pointermove", this.onMove);
    canvas.addEventListener("pointerup", this.onUp);
    canvas.addEventListener("pointercancel", this.onUp);
    window.addEventListener("pointermove", this.onWindowMove, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas.parentElement ?? canvas);
    this.io = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting), { threshold: 0 });
    this.io.observe(canvas);
  }

  /* ---------- Public API ---------- */

  start(): void {
    this.lastTime = performance.now();
    const loop = (now: number) => {
      if (this.disposed) return;
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      if (!this.visible || document.hidden) return;
      this.update(dt);
      this.renderer.render(this.scene, this.camera);
      if (!this.readyFired) {
        this.readyFired = true;
        this.onReady?.();
      }
    };
    this.raf = requestAnimationFrame(loop);
  }

  setPaint(hex: string): void {
    this.paintTarget.set(hex);
  }

  setWheels(finish: WheelFinish): void {
    const f = WHEEL_FINISHES[finish];
    this.rimTarget.set(f.color);
    this.rimMat.metalness = f.metalness;
    this.rimMat.roughness = f.roughness;
  }

  setView(view: ViewName): void {
    if (view === this.view) return;
    this.view = view;
    this.userAz = 0;
    this.userPolar = 0;
    this.velAz = 0;
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.io.disconnect();
    const c = this.canvas;
    c.removeEventListener("pointerdown", this.onDown);
    c.removeEventListener("pointermove", this.onMove);
    c.removeEventListener("pointerup", this.onUp);
    c.removeEventListener("pointercancel", this.onUp);
    window.removeEventListener("pointermove", this.onWindowMove);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => this.disposeMaterial(x));
      else if (mat) this.disposeMaterial(mat);
    });
    this.envTexture.dispose();
    this.renderer.dispose();
  }

  /* ---------- Scene construction ---------- */

  private disposeMaterial(m: THREE.Material): void {
    const mm = m as THREE.MeshBasicMaterial;
    mm.map?.dispose();
    m.dispose();
  }

  private buildCar(): void {
    const dark = new THREE.MeshStandardMaterial({ color: "#06201A", metalness: 0.6, roughness: 0.42 });
    const gold = new THREE.MeshStandardMaterial({ color: "#D4B46A", metalness: 1, roughness: 0.26 });
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#03130E",
      metalness: 0.25,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.7,
    });

    this.car.add(new THREE.Mesh(toGeometry(buildBodyLoft()), this.bodyMat));
    this.car.add(new THREE.Mesh(toGeometry(buildCanopyLoft()), glass));

    // aero
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.028, 1.5), dark);
    splitter.position.set(2.1, 0.135, 0);
    this.car.add(splitter);
    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 1.4), dark);
    diffuser.position.set(-2.13, 0.17, 0);
    diffuser.rotation.z = -0.1;
    this.car.add(diffuser);

    // rear wing
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.03, 1.74), dark);
    wing.position.set(-2.02, 1.0, 0);
    wing.rotation.z = 0.1;
    this.car.add(wing);
    for (const s of [1, -1]) {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.27, 0.03), dark);
      strut.position.set(-1.98, 0.87, 0.36 * s);
      this.car.add(strut);
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.17, 0.018), gold);
      plate.position.set(-2.02, 1.0, 0.87 * s);
      this.car.add(plate);
    }

    // light signature
    const mint = new THREE.MeshBasicMaterial({ color: new THREE.Color("#64DCC0").multiplyScalar(1.6) });
    const warm = new THREE.MeshBasicMaterial({ color: new THREE.Color("#D4B46A").multiplyScalar(1.5) });
    this.lampMats.push({ mat: mint, base: 1.6 }, { mat: warm, base: 1.5 });
    for (const s of [1, -1] as const) {
      this.car.add(new THREE.Mesh(tube(frontLampPoints(s), 0.012), mint));
      this.car.add(new THREE.Mesh(tube(pinstripePoints(s), 0.0065), gold));
    }
    this.car.add(new THREE.Mesh(tube(rearLampPoints(), 0.011), warm));

    // wheels
    const wheels: [number, number, 1 | -1][] = [
      [FRONT_AXLE_X, FRONT_AXLE_Z, 1],
      [FRONT_AXLE_X, FRONT_AXLE_Z, -1],
      [REAR_AXLE_X, REAR_AXLE_Z, 1],
      [REAR_AXLE_X, REAR_AXLE_Z, -1],
    ];
    for (const [x, z, side] of wheels) {
      const w = this.buildWheel();
      w.position.set(x, WHEEL_RADIUS, z * side);
      if (side === -1) w.rotation.y = Math.PI;
      this.car.add(w);
    }
  }

  /** One wheel, axis along +Z (outer face toward +Z). */
  private buildWheel(): THREE.Group {
    const g = new THREE.Group();
    const tireMat = new THREE.MeshStandardMaterial({
      color: "#0A0F0E",
      roughness: 0.82,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const faceMat = new THREE.MeshStandardMaterial({ color: "#05221C", metalness: 0.7, roughness: 0.5 });

    const profile = [
      [0.22, -0.13], [0.3, -0.15], [0.345, -0.12], [0.352, -0.05],
      [0.352, 0.05], [0.345, 0.12], [0.3, 0.15], [0.22, 0.13],
    ].map(([r, h]) => new THREE.Vector2(r, h));
    const tireGeo = new THREE.LatheGeometry(profile, 56);
    tireGeo.rotateX(Math.PI / 2);
    g.add(new THREE.Mesh(tireGeo, tireMat));

    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.02, 40), faceMat);
    face.rotation.x = Math.PI / 2;
    face.position.z = 0.08;
    g.add(face);

    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.014, 12, 56), this.rimMat);
    lip.position.z = 0.1;
    g.add(lip);

    const spokes = 10;
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.2, 0.034), this.rimMat);
      spoke.position.set(Math.cos(a) * 0.135, Math.sin(a) * 0.135, 0.105);
      spoke.rotation.z = a - Math.PI / 2;
      g.add(spoke);
    }

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.03, 28), this.rimMat);
    hub.rotation.x = Math.PI / 2;
    hub.position.z = 0.11;
    g.add(hub);

    const caliperMat = new THREE.MeshStandardMaterial({ color: "#64DCC0", metalness: 0.3, roughness: 0.4 });
    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.05), caliperMat);
    caliper.position.set(0.12, 0.13, 0.05);
    caliper.rotation.z = -0.8;
    g.add(caliper);
    return g;
  }

  private buildFloor(): void {
    // soft platform glow
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(4.4, 96).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: radialTexture([
          [0, "rgba(11,74,58,0.95)"],
          [0.55, "rgba(11,74,58,0.45)"],
          [1, "rgba(11,74,58,0)"],
        ]),
        transparent: true,
        depthWrite: false,
      })
    );
    glow.position.y = 0.001;
    this.floorGroup.add(glow);

    // contact shadow
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(6.2, 2.9).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: radialTexture([
          [0, "rgba(0,0,0,0.78)"],
          [0.45, "rgba(0,0,0,0.38)"],
          [1, "rgba(0,0,0,0)"],
        ]),
        transparent: true,
        depthWrite: false,
      })
    );
    shadow.position.y = 0.004;
    this.floorGroup.add(shadow);

    // technical rings with tick marks
    const verts: number[] = [];
    const ring = (r: number, segs: number) => {
      for (let i = 0; i < segs; i++) {
        const a0 = (i / segs) * Math.PI * 2;
        const a1 = ((i + 1) / segs) * Math.PI * 2;
        verts.push(Math.cos(a0) * r, 0.006, Math.sin(a0) * r, Math.cos(a1) * r, 0.006, Math.sin(a1) * r);
      }
    };
    ring(3.2, 180);
    ring(3.62, 180);
    for (let deg = 0; deg < 360; deg += 3) {
      const a = (deg * Math.PI) / 180;
      const long = deg % 15 === 0;
      const r0 = 3.2;
      const r1 = 3.2 + (long ? 0.2 : 0.08);
      verts.push(Math.cos(a) * r0, 0.006, Math.sin(a) * r0, Math.cos(a) * r1, 0.006, Math.sin(a) * r1);
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    this.floorGroup.add(
      new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: "#D4B46A", transparent: true, opacity: 0.38 }))
    );
  }

  private buildLights(): void {
    const key = new THREE.DirectionalLight("#EADFC4", 1.1);
    key.position.set(4, 6, 3);
    const rim = new THREE.DirectionalLight("#64DCC0", 0.7);
    rim.position.set(-5, 2.5, -4);
    const hemi = new THREE.HemisphereLight("#AAC4B5", "#06362B", 0.35);
    this.scene.add(key, rim, hemi);
  }

  /* ---------- Interaction ---------- */

  private onDown = (e: PointerEvent): void => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    this.dragging = true;
    this.activePointer = e.pointerId;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.velAz = 0;
    this.canvas.setPointerCapture(e.pointerId);
    this.canvas.style.cursor = "grabbing";
  };

  private onMove = (e: PointerEvent): void => {
    if (!this.dragging || e.pointerId !== this.activePointer) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    const d = -dx * 0.0065;
    this.userAz += d;
    this.velAz = d;
    if (e.pointerType === "mouse") {
      this.userPolar = Math.max(-0.22, Math.min(0.22, this.userPolar - dy * 0.003));
    }
  };

  private onUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.activePointer) return;
    this.dragging = false;
    this.activePointer = -1;
    this.canvas.style.cursor = "grab";
    if (this.canvas.hasPointerCapture(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId);
  };

  private onWindowMove = (e: PointerEvent): void => {
    if (e.pointerType !== "mouse") return;
    this.pointerAz = (e.clientX / window.innerWidth - 0.5) * 0.16;
    this.pointerPolar = (e.clientY / window.innerHeight - 0.5) * 0.06;
  };

  private onVisibility = (): void => {
    this.lastTime = performance.now();
  };

  /* ---------- Frame update ---------- */

  private resize(): void {
    const el = this.canvas.parentElement ?? this.canvas;
    const w = Math.max(1, el.clientWidth);
    const h = Math.max(1, el.clientHeight);
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private fitDistance(view: ViewName): number {
    const tanV = Math.tan((this.camera.fov * Math.PI) / 360);
    const aspect = this.width / this.height;
    const wNeed = view === "top" ? 5.4 : 6.5;
    const hNeed = view === "top" ? 3.0 : 3.9;
    return Math.max(wNeed / (2 * tanV * aspect), hNeed / (2 * tanV)) * VIEWS[view].dist;
  }

  private update(dt: number): void {
    this.time += dt;
    this.introT = Math.min(1, this.introT + dt / 2.6);
    const e = this.reduceMotion ? 1 : easeOutCubic(this.introT);

    // inertia after drag
    if (!this.dragging) {
      this.userAz += this.velAz;
      this.velAz *= Math.exp(-dt * 3.2);
    }

    const v = VIEWS[this.view];
    const sway = this.reduceMotion || this.dragging ? 0 : Math.sin(this.time * 0.35) * 0.2;
    const targetAz = v.az + this.userAz + sway + this.pointerAz + (1 - e) * 0.75;
    const targetPolar = v.polar + this.userPolar + this.pointerPolar;
    const targetDist = this.fitDistance(this.view) * (1 + (1 - e) * 0.24);

    const k = 1 - Math.exp(-dt * 3.4);
    this.az += wrapPi(targetAz - this.az) * k;
    this.polar += (targetPolar - this.polar) * k;
    this.dist += (targetDist - this.dist) * k;

    const sp = Math.sin(this.polar);
    this.camera.position.set(
      this.target.x + this.dist * sp * Math.cos(this.az),
      this.target.y + this.dist * Math.cos(this.polar),
      this.target.z + this.dist * sp * Math.sin(this.az)
    );
    this.camera.lookAt(this.target);

    // intro: platform expands, car settles
    this.floorGroup.scale.setScalar(0.65 + 0.35 * e);
    this.car.position.y = (1 - e) * 0.18;

    // smooth material transitions
    const mk = 1 - Math.exp(-dt * 6);
    this.bodyMat.color.lerp(this.paintTarget, mk);
    this.rimMat.color.lerp(this.rimTarget, mk);

    // gentle light pulse
    const pulse = 0.88 + 0.12 * Math.sin(this.time * 1.3);
    this.lampMats[0].mat.color.set("#64DCC0").multiplyScalar(this.lampMats[0].base * pulse * e);
    this.lampMats[1].mat.color.set("#D4B46A").multiplyScalar(this.lampMats[1].base * pulse * e);
  }
}
