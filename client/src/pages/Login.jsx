/**
 * Customer-facing login with client-side validation mirrored by server auth rules.
 */

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setStatus("");
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (email.length > 180 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setStatus("Enter a valid email address.");
      return;
    }
    if (password.length < 8 || password.length > 128) {
      setStatus("Password must be between 8 and 128 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(location.state?.from || "/account", { replace: true });
    } catch (error) {
      setStatus(error.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Customer Sign In / Beyonist"
      title="Welcome"
      accent="back."
      copy="Sign in when you want member benefits, account-only offers and a quicker return to checkout. Guest checkout remains available."
      footnote={<p className="mt-7 text-[9px] leading-5 text-black/65">No account yet? <Link to="/signup" className="border-b border-black pb-1 font-semibold uppercase tracking-[.1em] text-black">Create one</Link></p>}
    >
      <div className="mt-12">
        <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Member access / 01</span>
        <h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.92] tracking-[-.05em]">Sign in to your<br/><em className="font-normal text-[#d13c3c]">Beyonist account.</em></h2>
      </div>

      <form onSubmit={submit} noValidate className="mt-9 overflow-hidden border border-black/10">
        <label className="group block border-b border-black/10 p-6">
          <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 group-focus-within:text-[#d13c3c]">Email address *</span>
          <input type="email" required maxLength={180} value={form.email} onChange={(e) => { setForm((v) => ({ ...v, email: e.target.value.slice(0, 180) })); setStatus(""); }} autoComplete="email" inputMode="email" placeholder="you@example.com" className="mt-4 w-full bg-transparent font-[Georgia] text-[25px] outline-none placeholder:text-black/60" />
        </label>

        <label className="group block p-6">
          <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 group-focus-within:text-[#d13c3c]">Password *</span>
          <div className="mt-4 flex items-center gap-4">
            <input type={showPassword ? "text" : "password"} required minLength={8} maxLength={128} value={form.password} onChange={(e) => { setForm((v) => ({ ...v, password: e.target.value.slice(0, 128) })); setStatus(""); }} autoComplete="current-password" placeholder="Your password" className="min-w-0 flex-1 bg-transparent font-[Georgia] text-[25px] outline-none placeholder:text-black/60" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-[7px] font-semibold uppercase tracking-[.12em] text-black/65">{showPassword ? "Hide" : "Show"}</button>
          </div>
        </label>

        {status ? <div role="alert" className="border-t border-[#d13c3c]/20 bg-[#d13c3c]/10 px-6 py-4 text-[9px] text-[#a51622]">{status}</div> : null}

        <button disabled={submitting} className="flex w-full items-center justify-between bg-black px-6 py-5 text-[8px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-[#d13c3c] disabled:opacity-50">
          <span>{submitting ? "Signing you in..." : "Sign in"}</span><span>↗</span>
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between gap-5 text-[7px] uppercase tracking-[.12em] text-black/65 max-[560px]:items-start max-[560px]:flex-col">
        <span>Secure HttpOnly session</span>
        <Link to="/forgot-password" className="border-b border-black/40 pb-1 font-semibold text-black">Forgot password?</Link>
      </div>
    </AuthShell>
  );
}
