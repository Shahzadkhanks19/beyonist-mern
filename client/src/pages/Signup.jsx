/**
 * Customer-facing signup with validation mirrored by server account rules.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", marketingOptIn: true });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setStatus("");
    const name = form.name.trim().replace(/\s+/g, " ");
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.replace(/\D/g, "").slice(-10);

    if (name.length < 2 || name.length > 100 || !/[A-Za-zÀ-ž\u0900-\u097F]/.test(name)) return setStatus("Enter a valid name between 2 and 100 characters.");
    if (email.length > 180 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setStatus("Enter a valid email address.");
    if (!/^[6-9]\d{9}$/.test(phone)) return setStatus("Enter a valid Indian mobile number.");
    if (form.password.length < 8 || form.password.length > 128) return setStatus("Password must be between 8 and 128 characters.");

    setSubmitting(true);
    try {
      await signup({ ...form, name, email, phone });
      navigate("/account", { replace: true });
    } catch (error) {
      setStatus(error.message || "Unable to create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Create Account / Beyonist"
      title="Join the"
      accent="member edit."
      copy="Create an account for member-only offer eligibility, remembered customer details and a faster checkout experience. Shopping as a guest still stays open."
      footnote={<p className="mt-7 text-[9px] leading-5 text-black/65">Already a member? <Link to="/login" className="border-b border-black pb-1 font-semibold uppercase tracking-[.1em] text-black">Sign in</Link></p>}
    >
      <div className="mt-12">
        <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Membership / 01</span>
        <h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.92] tracking-[-.05em]">Create your<br/><em className="font-normal text-[#d13c3c]">customer account.</em></h2>
      </div>

      <form onSubmit={submit} noValidate className="mt-9 overflow-hidden border border-black/10">
        <div className="grid grid-cols-2 max-[620px]:grid-cols-1">
          <label className="group border-b border-r border-black/10 p-6 max-[620px]:border-r-0">
            <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 group-focus-within:text-[#d13c3c]">Full name *</span>
            <input required minLength={2} maxLength={100} value={form.name} onChange={(e) => { setForm((v) => ({ ...v, name: e.target.value.slice(0, 100) })); setStatus(""); }} autoComplete="name" placeholder="Your name" className="mt-4 w-full bg-transparent font-[Georgia] text-[23px] outline-none placeholder:text-black/60" />
          </label>
          <label className="group border-b border-black/10 p-6">
            <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 group-focus-within:text-[#d13c3c]">Mobile number *</span>
            <div className="mt-4 flex gap-2 font-[Georgia] text-[23px]"><span className="text-black/65">+91</span><input required pattern="[6-9][0-9]{9}" maxLength={10} value={form.phone} onChange={(e) => { setForm((v) => ({ ...v, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })); setStatus(""); }} inputMode="numeric" autoComplete="tel" placeholder="9876543210" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-black/60" /></div>
          </label>
        </div>

        <label className="group block border-b border-black/10 p-6">
          <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 group-focus-within:text-[#d13c3c]">Email address *</span>
          <input required maxLength={180} type="email" value={form.email} onChange={(e) => { setForm((v) => ({ ...v, email: e.target.value.slice(0, 180) })); setStatus(""); }} autoComplete="email" inputMode="email" placeholder="you@example.com" className="mt-4 w-full bg-transparent font-[Georgia] text-[24px] outline-none placeholder:text-black/60" />
        </label>

        <label className="group block border-b border-black/10 p-6">
          <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 group-focus-within:text-[#d13c3c]">Create password *</span>
          <div className="mt-4 flex items-center gap-4">
            <input required minLength={8} maxLength={128} type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => { setForm((v) => ({ ...v, password: e.target.value.slice(0, 128) })); setStatus(""); }} autoComplete="new-password" placeholder="8–128 characters" className="min-w-0 flex-1 bg-transparent font-[Georgia] text-[24px] outline-none placeholder:text-black/60" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[7px] font-semibold uppercase tracking-[.12em] text-black/65">{showPassword ? "Hide" : "Show"}</button>
          </div>
        </label>

        <button type="button" onClick={() => setForm((v) => ({ ...v, marketingOptIn: !v.marketingOptIn }))} className="flex w-full items-start gap-4 border-b border-black/10 p-6 text-left">
          <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border text-[10px] ${form.marketingOptIn ? "border-[#d13c3c] bg-[#d13c3c] text-white" : "border-black/20 text-transparent"}`}>✓</span>
          <span><strong className="block text-[8px] font-semibold uppercase tracking-[.13em]">Member offers & product updates</strong><small className="mt-1 block text-[9px] leading-5 text-black/65">Optional marketing consent. Your account works without it.</small></span>
        </button>

        {status ? <div role="alert" className="border-b border-[#d13c3c]/20 bg-[#d13c3c]/10 px-6 py-4 text-[9px] text-[#a51622]">{status}</div> : null}
        <button disabled={submitting} className="flex w-full items-center justify-between bg-black px-6 py-5 text-[8px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-[#d13c3c] disabled:opacity-50"><span>{submitting ? "Creating your account..." : "Create customer account"}</span><span>↗</span></button>
      </form>
    </AuthShell>
  );
}
