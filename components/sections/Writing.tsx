import { blogs } from "@/lib/data";

export default function Writing() {
  return (
    <section id="writing" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <p className="label mb-5" data-reveal>
          05 / Writing
        </p>
        <h2
          className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
          data-reveal
        >
          Technical blogs
        </h2>
        <p className="mb-16 max-w-lg text-muted" data-reveal>
          6 published deep-dives on LLMs, agents, and voice AI — written while
          shipping POCs at F22 Labs.
        </p>

        <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--line)] sm:grid-cols-2">
          {blogs.map((b, i) => (
            <article
              key={b.title}
              className="flex items-start gap-4 bg-[var(--bg-soft)] p-6"
              data-reveal
            >
              <span className="font-mono text-xs text-cyan">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted">
                  {b.topic}
                </span>
                <h3 className="mt-1.5 text-base font-medium leading-snug text-fg">
                  {b.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
