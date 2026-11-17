import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function HubNav() {
  return (
    <header className="h-nav">
      <div className="h-wrap h-nav-inner">
        <Link href="/" className="h-brand">
          <b>NK</b> Project Lab <small className="hide-sm">· Nischay Kademane</small>
        </Link>
        <nav className="h-links">
          <Link href="/#live" className="hide-sm">Live demos</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/present">Present</Link>
          <Link href="/admin/login">Login</Link>
          <a href="https://nischay.tech" className="h-btn h-btn-dark h-btn-sm">
            nischay.tech <ArrowUpRight size={14} />
          </a>
        </nav>
      </div>
    </header>
  );
}

export function HubFooter() {
  return (
    <footer className="h-foot">
      <div className="h-wrap">
        <span>© 2026 Nischay Venkatesh Kademane · Project Lab</span>
        <span style={{ display: "flex", gap: 18 }}>
          <a href="https://nischay.tech">Portfolio</a>
          <a href="https://github.com/godnix7" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/nischaykademane/" target="_blank" rel="noreferrer">LinkedIn</a>
        </span>
      </div>
    </footer>
  );
}
