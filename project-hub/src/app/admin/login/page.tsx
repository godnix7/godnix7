import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminSession, isAdminConfigured } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/dashboard");
  const configured = isAdminConfigured();
  return (
    <main className="login-page">
      <section className="login-aside">
        <Link href="/" className="brand-mark" aria-label="Back to project hub"><span>NK</span><i /></Link>
        <div className="login-aside-copy">
          <span className="section-kicker">PRIVATE AREA / 01</span>
          <h1>Make the<br /><em>work visible.</em></h1>
          <p>A quiet place to manage project notes, links, demos, and what the world can see.</p>
        </div>
        <Link href="/" className="detail-back"><ArrowLeft size={14} /> Back to project hub</Link>
      </section>
      <section className="login-panel">
        <div className="login-form">
          <span className="section-kicker">ADMIN / SIGN IN</span>
          <h2>Welcome back.</h2>
          <p>Sign in with the administrator credentials configured for this project.</p>
          <LoginForm configured={configured} />
          {!configured && <div className="admin-config-note">Set DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD_HASH, and SESSION_SECRET in the deployment environment, then apply the database schema.</div>}
        </div>
      </section>
    </main>
  );
}
