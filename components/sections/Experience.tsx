import { experience } from "@/lib/data";

export default function Experience() {
  return (
    <section id="experience" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <p className="label mb-5" data-reveal>
          02 / Experience
        </p>
        <h2
          className="mb-16 text-3xl font-semibold tracking-tight sm:text-4xl"
          data-reveal
        >
          Where I&apos;ve worked
        </h2>

        <div className="space-y-6">
          {experience.map((job) => (
            <div
              key={job.company}
              className="glass group grid gap-6 p-8 md:grid-cols-[0.4fr_1fr]"
              data-reveal
            >
              <div>
                <h3 className="text-xl font-medium">{job.company}</h3>
                <p className="mt-1 text-sm text-cyan">{job.role}</p>
                <p className="mt-1 font-mono text-xs text-muted">
                  {job.period}
                </p>
                <p className="font-mono text-xs text-muted">{job.location}</p>
              </div>
              <ul className="space-y-3">
                {job.points.map((pt, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm leading-relaxed text-muted"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                    <span>{pt}</span>
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
