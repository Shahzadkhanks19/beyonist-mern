/** Customer password-recovery request with privacy-preserving validation. */
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { forgotPassword } from "../services/authApi.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    const normalized = email.trim().toLowerCase();
    if (normalized.length > 180 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)) {
      setStatus({ type: "error", message: "Enter a valid email address." });
      return;
    }
    setSubmitting(true);
    try {
      const response = await forgotPassword(normalized);
      setStatus({ type: "success", message: response.message || "If that account exists, a reset link has been sent." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Unable to request a reset link." });
    } finally { setSubmitting(false); }
  }

  return (
    <AuthShell eyebrow="Forgot Password / Beyonist" title="Recover" accent="your account." copy="Request a secure, single-use password reset link. The link expires after 30 minutes." footnote={<p className="mt-7 text-[9px] leading-5 text-black/65">Remembered it? <Link to="/login" className="border-b border-black pb-1 font-semibold uppercase tracking-[.1em] text-black">Back to sign in</Link></p>}>
      <div className="mt-12"><span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Account recovery / 01</span><h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.92] tracking-[-.05em]">Send a secure<br/><em className="font-normal text-[#d13c3c]">reset link.</em></h2><p className="mt-5 max-w-[500px] text-[10px] leading-6 text-black/65">For privacy, the response is the same whether or not the email is registered.</p></div>
      <form onSubmit={submit} noValidate className="mt-9 overflow-hidden border border-black/10">
        <label className="group block p-6"><span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 group-focus-within:text-[#d13c3c]">Account email *</span><input required type="email" maxLength={180} value={email} onChange={(e) => { setEmail(e.target.value.slice(0,180)); setStatus({type:"",message:""}); }} autoComplete="email" inputMode="email" placeholder="you@example.com" className="mt-4 w-full bg-transparent font-[Georgia] text-[25px] outline-none placeholder:text-black/60"/></label>
        {status.message ? <div role="status" className={`border-t px-6 py-4 text-[9px] leading-5 ${status.type === "success" ? "border-black/10 bg-black text-white" : "border-[#d13c3c]/20 bg-[#d13c3c]/10 text-[#a51622]"}`}>{status.message}</div> : null}
        <button disabled={submitting} className="flex w-full items-center justify-between bg-[#d13c3c] px-6 py-5 text-[8px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-black disabled:opacity-50"><span>{submitting ? "Requesting reset link..." : "Email reset link"}</span><span>↗</span></button>
      </form>
      <div className="mt-4 flex items-center justify-between gap-5 text-[7px] uppercase tracking-[.12em] text-black/65"><span>30 minute expiry</span><span>Single use</span><span>Sessions revoked after reset</span></div>
    </AuthShell>
  );
}
