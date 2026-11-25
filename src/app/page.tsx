import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { Performance } from "@/components/Performance";
import { Design } from "@/components/Design";
import { Technology } from "@/components/Technology";
import { Configurator } from "@/components/Configurator";
import { Reserve } from "@/components/Reserve";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Manifesto />
        <Performance />
        <Design />
        <Technology />
        <Configurator />
        <Reserve />
      </main>
      <Footer />
    </>
  );
}
