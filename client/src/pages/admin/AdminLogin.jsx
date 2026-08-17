/**
 * Admin page for admin login, including its data loading, actions, validation, and presentation state.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AdminAuthShell from "../../components/admin/AdminAuthShell.jsx";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

/**
 * Renders the Admin Login component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminLogin() {
  const { admin, loading, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && admin) return <Navigate to="/admin" replace />;

  /**
   * Implements the submit operation used by this module.
   */
  async function submit(event) {
    event.preventDefault();
    setStatus("");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setStatus("Enter a valid administrator email address.");
    if (!form.password) return setStatus("Enter your administrator password.");

    setSubmitting(true);
    try {
      await login(form.email, form.password);
      const destination = location.state?.from?.pathname || "/admin";
      navigate(destination, { replace: true });
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminAuthShell
      eyebrow="Administrator / 01"
      title="Control the"
      accent="experience."
      copy="Private access for Beyonist catalogue, commerce, content, customers, leads and operations."
      footer={<p className="text-[8px] leading-5 text-white/90">Forgot your credentials? <Link to="/admin/forgot-password" className="border-b border-white/50 pb-1 font-semibold uppercase tracking-[.11em] text-white">Reset password</Link></p>}
    >
      <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#cf1f2e]">Secure sign in / 01</span>
      <h2 className="mt-5 font-[Georgia] text-[clamp(42px,5vw,66px)] font-normal leading-[.9] tracking-[-.05em]">Administrator<br/><em className="font-normal text-white/90">access only.</em></h2>

      <form onSubmit={submit} className="mt-9 overflow-hidden border border-white/10 bg-white/[.025]">
        <label className="block border-b border-white/10 p-6">
          <span className="text-[6px] font-semibold uppercase tracking-[.15em] text-white/90">Admin email</span>
          <input type="email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} autoComplete="username" placeholder="admin@beyonist.com" className="mt-4 w-full bg-transparent font-[Georgia] text-[25px] text-white outline-none placeholder:text-white/15" />
        </label>

        <label className="block p-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[6px] font-semibold uppercase tracking-[.15em] text-white/90">Password</span>
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[6px] font-semibold uppercase tracking-[.12em] text-white/90">{showPassword ? "Hide" : "Show"}</button>
          </div>
          <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} autoComplete="current-password" placeholder="Your admin password" className="mt-4 w-full bg-transparent font-[Georgia] text-[25px] text-white outline-none placeholder:text-white/15" />
        </label>

        {status ? <div className="border-t border-[#cf1f2e]/30 bg-[#cf1f2e]/10 px-6 py-4 text-[8px] leading-5 text-[#f38b94]">{status}</div> : null}

        <button disabled={submitting || loading} className="flex w-full items-center justify-between bg-[#cf1f2e] px-6 py-5 text-[8px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-white hover:text-black disabled:opacity-50">
          <span>{submitting ? "Authenticating..." : "Enter control room"}</span><span>↗</span>
        </button>
      </form>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[6px] uppercase tracking-[.12em] text-white/90">
        <span>HttpOnly session</span><span>Attempt lockout</span><span>Admin-only cookie</span>
      </div>
    </AdminAuthShell>
  );
}
