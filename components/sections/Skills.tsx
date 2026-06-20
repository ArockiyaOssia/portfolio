import { skills } from "@/lib/data";

export default function Skills() {
  return (
    <section id="skills" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <p className="label mb-5" data-reveal>
          04 / Skills
        </p>
        <h2
          className="mb-16 text-3xl font-semibold tracking-tight sm:text-4xl"
          data-reveal
        >
          The toolkit
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {skills.map((group) => (
            <div key={group.group} className="glass p-6" data-reveal>
              <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-cyan">
                {group.group}
              </h3>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-muted transition-colors hover:text-fg"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
