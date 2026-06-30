import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Writing from "@/components/sections/Writing";
import Contact from "@/components/sections/Contact";
import ScrollProgress from "@/components/ScrollProgress";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Writing />
      <Contact />
    </>
  );
}
