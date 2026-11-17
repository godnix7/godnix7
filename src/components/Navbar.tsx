"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";

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
        <a className="brand-mark" href="/#home" aria-label="Nischay Kademane home">
          <span>NK</span><i />
        </a>
        <div className={`nav-links${open ? " nav-links-open" : ""}`}>
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
          <a className="nav-resume" href="https://github.com/godnix7" target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
          <a className="nav-admin" href="/admin/login" onClick={() => setOpen(false)}>Studio</a>
        </div>
        <button className="nav-toggle" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
    </header>
  );
}
