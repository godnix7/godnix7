"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, FileText, LayoutDashboard, LogOut, Plus, Presentation, Settings2 } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: FileText },
  { label: "Presentations", href: "/present", icon: Presentation },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="admin-shell">
      <div className="film-grain" aria-hidden="true" />
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <Link href="/dashboard" className="admin-brand">
            <span className="brand-mark"><span>NK</span><i /></span>
            <span><strong>Project desk</strong><small>Private workspace</small></span>
          </Link>
          <span className="admin-nav-label">Workspace</span>
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link href={href} key={href} className={`admin-nav-link${pathname === href || (href !== "/dashboard" && pathname.startsWith(href)) ? " active" : ""}`}>
              <Icon size={15} strokeWidth={1.6} /> {label}
            </Link>
          ))}
          <Link href="/dashboard/projects?new=1" className="admin-nav-link"><Plus size={15} strokeWidth={1.6} /> New project</Link>
          <span className="admin-nav-label">Public</span>
          <Link href="/" className="admin-nav-link">View project hub <ArrowUpRight size={13} /></Link>
          <div className="admin-sidebar-bottom">
            <span className="admin-nav-link"><Settings2 size={15} strokeWidth={1.6} /> Site configuration</span>
            <button type="button" onClick={logout}><LogOut size={14} /> Sign out</button>
          </div>
        </aside>
        <section className="admin-main">
          <div className="admin-topbar"><span>PORTFOLIO / ADMIN</span><span>Signed in as administrator</span></div>
          <div className="admin-content">{children}</div>
        </section>
      </div>
    </main>
  );
}
