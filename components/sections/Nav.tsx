import { profile } from "@/lib/data";

const links = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="#top" className="font-mono text-sm font-medium tracking-tight">
          <span className="text-gradient">AO</span>
          <span className="text-muted">/</span>
        </a>
        <ul className="hidden gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-mono text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-cyan"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs uppercase tracking-[0.18em] text-fg transition-colors hover:text-violet"
        >
          Let&apos;s talk →
        </a>
      </nav>
    </header>
  );
}
