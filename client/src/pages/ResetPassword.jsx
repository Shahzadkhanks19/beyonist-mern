/** Customer password reset with client validation mirrored by the API. */
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { resetPassword } from "../services/authApi.js";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get("token") || "").trim();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    if (!token || token.length > 300) return setStatus({ type: "error", message: "This reset link is invalid or missing its security token." });
    if (form.password.length < 8 || form.password.length > 128) return setStatus({ type: "error", message: "Password must be between 8 and 128 characters." });
    if (form.confirmPassword !== form.password) return setStatus({ type: "error", message: "The passwords do not match." });

    setSubmitting(true);
    try {
      const response = await resetPassword(token, form.password);
      setForm({ password: "", confirmPassword: "" });
      setStatus({ type: "success", message: response.message || "Password reset successfully." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Unable to reset your password." });
    } finally { setSubmitting(false); }
  }

  return (
    <AuthShell eyebrow="Reset Password / Beyonist" title="Choose a" accent="new password." copy="Set a new customer password. Completing the reset signs out any existing account sessions for security." footnote={status.type === "success" ? <p className="mt-7 text-[9px] leading-5 text-black/65"><Link to="/login" className="border-b border-black pb-1 font-semibold uppercase tracking-[.1em] text-black">Sign in with the new password →</Link></p> : <p className="mt-7 text-[9px] leading-5 text-black/65">Need another link? <Link to="/forgot-password" className="border-b border-black pb-1 font-semibold uppercase tracking-[.1em] text-black">Request a new reset</Link></p>}>
      <div className="mt-12"><span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Password reset / 02</span><h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.92] tracking-[-.05em]">Set something<br/><em className="font-normal text-[#d13c3c]">only you know.</em></h2></div>
      <form onSubmit={submit} noValidate className="mt-9 overflow-hidden border border-black/10">
        <label className="group block border-b border-black/10 p-6"><span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 group-focus-within:text-[#d13c3c]">New password *</span><div className="mt-4 flex items-center gap-4"><input required minLength={8} maxLength={128} type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => { setForm((v) => ({ ...v, password: e.target.value.slice(0,128) })); setStatus({type:"",message:""}); }} autoComplete="new-password" placeholder="8–128 characters" className="min-w-0 flex-1 bg-transparent font-[Georgia] text-[25px] outline-none placeholder:text-black/60"/><button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[7px] font-semibold uppercase tracking-[.12em] text-black/65">{showPassword ? "Hide" : "Show"}</button></div></label>
        <label className="group block p-6"><span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 group-focus-within:text-[#d13c3c]">Confirm new password *</span><input required minLength={8} maxLength={128} type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => { setForm((v) => ({ ...v, confirmPassword: e.target.value.slice(0,128) })); setStatus({type:"",message:""}); }} autoComplete="new-password" placeholder="Repeat the password" className="mt-4 w-full bg-transparent font-[Georgia] text-[25px] outline-none placeholder:text-black/60"/></label>
        {status.message ? <div role="status" className={`border-t px-6 py-4 text-[9px] leading-5 ${status.type === "success" ? "border-black/10 bg-black text-white" : "border-[#d13c3c]/20 bg-[#d13c3c]/10 text-[#a51622]"}`}>{status.message}</div> : null}
        <button disabled={submitting || status.type === "success"} className="flex w-full items-center justify-between bg-[#d13c3c] px-6 py-5 text-[8px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-black disabled:opacity-50"><span>{submitting ? "Resetting password..." : status.type === "success" ? "Password reset" : "Set new password"}</span><span>{status.type === "success" ? "✓" : "↗"}</span></button>
      </form>
    </AuthShell>
  );
}
