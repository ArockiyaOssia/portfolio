import { projects } from "@/lib/data";

export default function Projects() {
  return (
    <section id="projects" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <p className="label mb-5" data-reveal>
          03 / Projects
        </p>
        <h2
          className="mb-16 text-3xl font-semibold tracking-tight sm:text-4xl"
          data-reveal
        >
          Things I&apos;ve built
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((p) => {
            const Card = (
              <article
                className="glass group flex h-full flex-col p-7 transition-transform duration-300 hover:-translate-y-1.5 hover:glow-cyan"
                data-reveal
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-medium">{p.title}</h3>
                    <p className="mt-1 font-mono text-xs uppercase tracking-wider text-cyan">
                      {p.tag}
                    </p>
                  </div>
                  {p.org && (
                    <span className="rounded-full border border-[var(--line)] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-muted">
                      {p.org}
                    </span>
                  )}
                  {p.link && (
                    <span className="text-muted transition-colors group-hover:text-violet">
                      ↗
                    </span>
                  )}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted">
                  {p.desc}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-[var(--bg-soft)] px-2.5 py-1 font-mono text-[0.65rem] text-muted"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </article>
            );

            return p.link ? (
              <a
                key={p.title}
                href={p.link}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                {Card}
              </a>
            ) : (
              <div key={p.title}>{Card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
