import { profile } from "@/lib/data";

export default function Contact() {
  return (
    <section id="contact" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <p className="label mb-5" data-reveal>
          05 / Contact
        </p>
        <h2
          className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl"
          data-reveal
        >
          Let&apos;s build something{" "}
          <span className="text-gradient">intelligent.</span>
        </h2>

        <a
          href={`mailto:${profile.email}`}
          className="mt-10 inline-block text-2xl font-medium text-muted transition-colors hover:text-cyan sm:text-3xl"
          data-reveal
        >
          {profile.email}
        </a>

        <div className="mt-12 flex flex-wrap gap-6" data-reveal>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-[0.18em] text-muted hover:text-violet"
          >
            LinkedIn ↗
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-[0.18em] text-muted hover:text-violet"
          >
            GitHub ↗
          </a>
          <a
            href={`tel:${profile.phone.replace(/\s/g, "")}`}
            className="font-mono text-xs uppercase tracking-[0.18em] text-muted hover:text-violet"
          >
            {profile.phone}
          </a>
        </div>
      </div>

      <footer className="mx-auto mt-28 max-w-6xl border-t border-[var(--line)] pt-8">
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} {profile.name}. Built with Next.js, React
          Three Fiber &amp; GSAP.
        </p>
      </footer>
    </section>
  );
}
