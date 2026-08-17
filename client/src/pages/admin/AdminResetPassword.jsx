/**
 * Admin page for admin reset password, including its data loading, actions, validation, and presentation state.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminAuthShell from "../../components/admin/AdminAuthShell.jsx";
import { adminResetPassword } from "../../services/adminApi.js";

/**
 * Renders the Admin Reset Password component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  /**
   * Implements the submit operation used by this module.
   */
  async function submit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    if (!token) return setStatus({ type: "error", message: "This administrator reset link is missing its security token." });
    if (form.password.length < 10) return setStatus({ type: "error", message: "Use at least 10 characters for an administrator password." });
    if (form.password !== form.confirm) return setStatus({ type: "error", message: "The new passwords do not match." });

    setSubmitting(true);
    try {
      const response = await adminResetPassword(token, form.password);
      setForm({ password: "", confirm: "" });
      setStatus({ type: "success", message: response.message });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally { setSubmitting(false); }
  }

  return (
    <AdminAuthShell
      eyebrow="Administrator / New password"
      title="Rebuild"
      accent="the key."
      copy="Set a new administrator password. Completing this reset invalidates every existing admin session."
      footer={status.type === "success" ? <Link to="/admin/login" className="border-b border-white/50 pb-1 text-[8px] font-semibold uppercase tracking-[.12em] text-white">Sign in with the new password ↗</Link> : <p className="text-[8px] text-white/90">Link expired? <Link to="/admin/forgot-password" className="border-b border-white/50 pb-1 font-semibold uppercase tracking-[.11em] text-white">Request another</Link></p>}
    >
      <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#cf1f2e]">Password reset / 03</span>
      <h2 className="mt-5 font-[Georgia] text-[clamp(42px,5vw,66px)] font-normal leading-[.9] tracking-[-.05em]">Choose a new<br/><em className="font-normal text-white/90">administrator key.</em></h2>

      <form onSubmit={submit} className="mt-9 overflow-hidden border border-white/10 bg-white/[.025]">
        <label className="block border-b border-white/10 p-6">
          <div className="flex items-center justify-between gap-4"><span className="text-[6px] font-semibold uppercase tracking-[.15em] text-white/90">New password</span><button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[6px] uppercase tracking-[.12em] text-white/90">{showPassword ? "Hide" : "Show"}</button></div>
          <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} autoComplete="new-password" placeholder="10+ characters" className="mt-4 w-full bg-transparent font-[Georgia] text-[25px] text-white outline-none placeholder:text-white/15" />
        </label>
        <label className="block p-6">
          <span className="text-[6px] font-semibold uppercase tracking-[.15em] text-white/90">Confirm password</span>
          <input type={showPassword ? "text" : "password"} value={form.confirm} onChange={(e) => setForm((c) => ({ ...c, confirm: e.target.value }))} autoComplete="new-password" placeholder="Repeat new password" className="mt-4 w-full bg-transparent font-[Georgia] text-[25px] text-white outline-none placeholder:text-white/15" />
        </label>

        {status.message ? <div className={`border-t px-6 py-4 text-[8px] leading-5 ${status.type === "success" ? "border-white/10 bg-white text-black" : "border-[#cf1f2e]/30 bg-[#cf1f2e]/10 text-[#f38b94]"}`}>{status.message}</div> : null}

        <button disabled={submitting || status.type === "success"} className="flex w-full items-center justify-between bg-[#cf1f2e] px-6 py-5 text-[8px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-white hover:text-black disabled:opacity-50"><span>{submitting ? "Resetting access..." : status.type === "success" ? "Password reset" : "Set new admin password"}</span><span>{status.type === "success" ? "✓" : "↗"}</span></button>
      </form>
    </AdminAuthShell>
  );
}
