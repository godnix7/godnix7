"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const links = [
  { label: "About", href: "/#about" },
  { label: "Toolkit", href: "/#toolkit" },
  { label: "Projects", href: "/#projects" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-nav-wrap">
      <nav className="site-nav section-wrap" aria-label="Main navigation">
        <Link className="brand-mark" href="/#home" aria-label="Nischay Kademane home">
          <span>NK</span><i />
        </Link>
        <div className={`nav-links${open ? " nav-links-open" : ""}`}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>
          ))}
          <a className="nav-resume" href="https://github.com/godnix7" target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
          <Link className="nav-admin" href="/login" onClick={() => setOpen(false)}>Studio</Link>
        </div>
        <button className="nav-toggle" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
    </header>
  );
}
