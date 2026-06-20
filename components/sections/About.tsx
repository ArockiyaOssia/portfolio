import Image from "next/image";
import { profile, stats } from "@/lib/data";

export default function About() {
  return (
    <section id="about" className="relative px-6 py-32">
      <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div data-reveal>
          <div className="glass glow-cyan relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl">
            <Image
              src={profile.photo}
              alt={profile.name}
              fill
              sizes="(max-width: 768px) 80vw, 380px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div>
          <p className="label mb-5" data-reveal>
            01 / About
          </p>
          <h2
            className="text-3xl font-semibold leading-snug tracking-tight sm:text-4xl"
            data-reveal
          >
            I build AI that actually ships —{" "}
            <span className="text-muted">
              from voice agents and grounded RAG to fine-tuned vision models.
            </span>
          </h2>
          <p className="mt-6 max-w-lg text-muted" data-reveal>
            {profile.blurb} I&apos;m a recent B.Tech graduate in AI &amp; Data
            Science who&apos;d rather measure latency and WER than talk in
            abstractions.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--line)] sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-[var(--bg-soft)] p-5 text-center"
                data-reveal
              >
                <div className="text-2xl font-semibold text-gradient">
                  {s.value}
                </div>
                <div className="mt-1 font-mono text-[0.62rem] uppercase tracking-wider text-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
