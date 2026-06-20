import { profile } from "@/lib/data";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center px-6"
    >
      <div className="mx-auto w-full max-w-6xl">
        <p className="label mb-6" data-reveal>
          {profile.role} · {profile.location}
        </p>
        <h1
          className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl md:text-8xl"
          data-reveal
        >
          {profile.short}
          <br />
          <span className="text-gradient">{profile.tagline}</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted" data-reveal>
          {profile.blurb}
        </p>
        <div className="mt-10 flex flex-wrap gap-4" data-reveal>
          <a
            href="#projects"
            className="glass glow-violet rounded-full px-7 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
          >
            View work
          </a>
          <a
            href="#contact"
            className="rounded-full border border-[var(--line)] px-7 py-3 text-sm font-medium text-muted transition-colors hover:text-fg"
          >
            Get in touch
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted">
        scroll ↓
      </div>
    </section>
  );
}
