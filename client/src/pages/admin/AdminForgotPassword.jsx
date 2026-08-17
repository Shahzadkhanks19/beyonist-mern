/**
 * Admin page for admin forgot password, including its data loading, actions, validation, and presentation state.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import AdminAuthShell from "../../components/admin/AdminAuthShell.jsx";
import { adminForgotPassword } from "../../services/adminApi.js";

/**
 * Renders the Admin Forgot Password component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  /**
   * Implements the submit operation used by this module.
   */
  async function submit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    if (!/^\S+@\S+\.\S+$/.test(email)) return setStatus({ type: "error", message: "Enter a valid administrator email address." });

    setSubmitting(true);
    try {
      const response = await adminForgotPassword(email);
      setStatus({ type: "success", message: response.message });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally { setSubmitting(false); }
  }

  return (
    <AdminAuthShell
      eyebrow="Administrator / Recovery"
      title="Recover"
      accent="secure access."
      copy="Request a short-lived reset link for an active Beyonist administrator account."
      footer={<p className="text-[8px] leading-5 text-white/90">Remembered it? <Link to="/admin/login" className="border-b border-white/50 pb-1 font-semibold uppercase tracking-[.11em] text-white">Back to admin login</Link></p>}
    >
      <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#cf1f2e]">Password recovery / 02</span>
      <h2 className="mt-5 font-[Georgia] text-[clamp(42px,5vw,66px)] font-normal leading-[.9] tracking-[-.05em]">Reset access,<br/><em className="font-normal text-white/90">without exposing it.</em></h2>
      <p className="mt-5 max-w-[520px] text-[9px] leading-5 text-white/90">For privacy, the response does not reveal whether an administrator exists for the submitted email.</p>

      <form onSubmit={submit} className="mt-9 overflow-hidden border border-white/10 bg-white/[.025]">
        <label className="block p-6">
          <span className="text-[6px] font-semibold uppercase tracking-[.15em] text-white/90">Administrator email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="admin@beyonist.com" className="mt-4 w-full bg-transparent font-[Georgia] text-[25px] text-white outline-none placeholder:text-white/15" />
        </label>

        {status.message ? <div className={`border-t px-6 py-4 text-[8px] leading-5 ${status.type === "success" ? "border-white/10 bg-white text-black" : "border-[#cf1f2e]/30 bg-[#cf1f2e]/10 text-[#f38b94]"}`}>{status.message}</div> : null}

        <button disabled={submitting} className="flex w-full items-center justify-between bg-[#cf1f2e] px-6 py-5 text-[8px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-white hover:text-black disabled:opacity-50">
          <span>{submitting ? "Requesting link..." : "Send secure reset link"}</span><span>↗</span>
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-[6px] uppercase tracking-[.13em] text-white/90"><span>20 minute expiry</span><span>Single use</span><span>Reset revokes sessions</span></div>
    </AdminAuthShell>
  );
}
