import type { WheelFinish } from "./carStage";

export const NAV = [
  { href: "#model", label: "Model" },
  { href: "#performance", label: "Performance" },
  { href: "#design", label: "Design" },
  { href: "#technology", label: "Technology" },
  { href: "#configure", label: "Configure" },
];

export const HERO_STATS = [
  { label: "Output", value: "1,914", unit: "hp" },
  { label: "0–100 km/h", value: "1.9", unit: "s" },
  { label: "Top speed", value: "402", unit: "km/h" },
  { label: "Range · WLTP", value: "520", unit: "km" },
];

export const PERFORMANCE = [
  { label: "Peak output", to: 1914, decimals: 0, unit: "hp", note: "1,427 kW from four independent motors" },
  { label: "Peak torque", to: 2100, decimals: 0, unit: "Nm", note: "Available from standstill, vectored per wheel" },
  { label: "0–100 km/h", to: 1.9, decimals: 1, unit: "s", note: "Launch control, 20 °C ambient" },
  { label: "0–300 km/h", to: 8.4, decimals: 1, unit: "s", note: "One uninterrupted pull" },
  { label: "Top speed", to: 402, decimals: 0, unit: "km/h", note: "Electronically limited" },
];

export interface Paint {
  id: string;
  name: string;
  hex: string;
  note: string;
}

export const PAINTS: Paint[] = [
  { id: "champagne", name: "Champagne Satin", hex: "#CFBE8E", note: "Fine metallic flake under triple clearcoat" },
  { id: "emerald", name: "Emerald Lacquer", hex: "#127055", note: "Twelve hand-polished layers" },
  { id: "malachite", name: "Malachite Pearl", hex: "#3FA384", note: "Pearl pigment that shifts toward mint" },
  { id: "pine", name: "Midnight Pine", hex: "#0C2A24", note: "Deep green, near-black in shade" },
];

export interface WheelOption {
  id: WheelFinish;
  name: string;
  hex: string;
}

export const WHEELS: WheelOption[] = [
  { id: "gold", name: "Cast Gold", hex: "#D4B46A" },
  { id: "graphite", name: "Green Graphite", hex: "#26372F" },
  { id: "champagne", name: "Champagne Satin", hex: "#EADFC4" },
];

export const MATERIALS = [
  {
    id: "lacquer",
    name: "Emerald lacquer",
    text: "Twelve layers, hand-polished between coats until the surface behaves like deep water.",
  },
  {
    id: "titanium",
    name: "Brushed champagne titanium",
    text: "Machined from a single billet, then brushed along the direction of airflow.",
  },
  {
    id: "gold",
    name: "Hand-set gold inlay",
    text: "Fine gold lines are set by hand into the carbon: the only ornament on the car.",
  },
  {
    id: "leather",
    name: "Malachite-grain leather",
    text: "Vegetable-tanned hides, embossed with a grain taken from polished malachite.",
  },
];

export const TECH = [
  {
    term: "Powertrain",
    text: "Four axial-flux motors, one per wheel. Torque is vectored 8,000 times per second.",
  },
  {
    term: "Battery",
    text: "118 kWh structural pack on a 900-volt architecture, with immersion-cooled cells.",
  },
  {
    term: "Charging",
    text: "Up to 350 kW DC. Ten to eighty percent in twelve minutes.",
  },
  {
    term: "Chassis",
    text: "Bonded carbon monocoque with cast titanium subframes. 1,640 kg, 44 / 56 balance.",
  },
];

export const COUNTRIES = [
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Germany",
  "France",
  "Switzerland",
  "Monaco",
  "Saudi Arabia",
  "Qatar",
  "Japan",
  "Singapore",
  "Other",
];
