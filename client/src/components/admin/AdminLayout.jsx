/**
 * Reusable admin UI component for admin layout. Keeps admin presentation and interaction patterns consistent across dashboard pages.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";
import AdminIcon from "./AdminIcon.jsx";
import { connectAdminRealtime, disconnectAdminRealtime } from "../../services/adminRealtime.js";

const nav = [
  ["Dashboard", "/admin/dashboard", "dashboard"],
  ["Orders", "/admin/orders", "orders"],
  ["Customers", "/admin/customers", "customers"],
  ["Reviews", "/admin/reviews", "reviews"],
  ["Products", "/admin/products", "products"],
  ["The Edit", "/admin/blogs", "blogs"],
  ["Coupons", "/admin/coupons", "leads"],
  ["Messages", "/admin/messages", "messages"],
  ["Leads", "/admin/leads", "leads"],
  ["Analytics", "/admin/analytics", "dashboard"],
  ["Settings", "/admin/settings", "settings"],
];

/**
 * Renders the Admin Layout component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminLayout() {
  const { admin, loading, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => { if (!admin) return undefined; connectAdminRealtime(); return () => disconnectAdminRealtime(); }, [admin]);

  if (loading) return <main className="min-h-dvh bg-[#0b0b0b]" />;
  if (!admin) {
    navigate("/admin/login", { replace: true });
    return null;
  }

  /**
   * Implements the sign out operation used by this module.
   */
  async function signOut() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-dvh bg-[#eee9e1] text-[#111]">
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-[268px] max-w-[88vw] flex-col bg-[#0b0b0b] text-white shadow-2xl transition-transform duration-300 max-[980px]:-translate-x-full ${open ? "max-[980px]:translate-x-0" : ""}`}
        aria-label="Admin navigation"
      >
        <div className="flex h-[84px] items-center justify-between border-b border-white/10 px-6">
          <img src="/brand/beyonist-wordmark-white.webp" srcSet="/brand/beyonist-wordmark-white-320.webp 320w, /brand/beyonist-wordmark-white-640.webp 640w, /brand/beyonist-wordmark-white.webp 720w" sizes="(max-width: 600px) 70vw, 225px" alt="Beyonist" loading="eager" className="w-[135px]"  width="720" height="112" decoding="async"/>
          <button type="button" className="hidden h-9 w-9 place-items-center rounded-full border border-white/10 max-[980px]:grid" onClick={() => setOpen(false)} aria-label="Close admin menu">
            <AdminIcon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-7">
          <span className="px-3 text-[7px] font-semibold uppercase tracking-[.19em] text-white/28">Admin workspace</span>
          <nav className="mt-4 space-y-1">
            {nav.map(([label, to, icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin/dashboard"}
                className={({ isActive }) => `group flex items-center gap-3 rounded-[2px] px-3 py-3.5 text-[9px] font-semibold uppercase tracking-[.1em] transition ${isActive ? "bg-[#cf1f2e] text-white" : "text-white/90 hover:bg-white/[.05] hover:text-white"}`}
              >
                <AdminIcon name={icon} className="h-[17px] w-[17px]" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-5">
          <div className="mb-4 px-3">
            <span className="block text-[6px] uppercase tracking-[.16em] text-white/90">Signed in as</span>
            <strong className="mt-1 block truncate font-[Georgia] text-[18px] font-normal">{admin.name}</strong>
            <span className="mt-1 block truncate text-[7px] text-white/32">{admin.email}</span>
          </div>
          <button type="button" onClick={signOut} className="flex w-full items-center gap-3 border border-white/10 px-3 py-3 text-[8px] font-semibold uppercase tracking-[.12em] text-white/90 transition hover:border-[#cf1f2e] hover:text-white">
            <AdminIcon name="logout" className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {open ? <button type="button" className="fixed inset-0 z-[60] hidden bg-black/55 backdrop-blur-[2px] max-[980px]:block" onClick={() => setOpen(false)} aria-label="Close navigation overlay" /> : null}

      <div className="min-h-dvh pl-[268px] max-[980px]:pl-0">
        <header className="sticky top-0 z-50 flex h-[84px] items-center justify-between border-b border-black/10 bg-[#f7f3ed]/95 px-[clamp(14px,4vw,54px)] backdrop-blur max-[600px]:h-[70px]">
          <div className="flex items-center gap-4">
            <button type="button" className="hidden h-10 w-10 shrink-0 place-items-center border border-black/10 max-[980px]:grid" onClick={() => setOpen(true)} aria-label="Open admin navigation">
              <AdminIcon name="menu" className="h-5 w-5" />
            </button>
            <div>
              <span className="text-[6px] font-semibold uppercase tracking-[.18em] text-[#cf1f2e]">Beyonist administration</span>
              <p className="mt-1 text-[8px] text-black/65">Commerce · CMS · Customer care</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="hidden items-center gap-2 border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.12em] sm:flex">
              View storefront <AdminIcon name="arrow" className="h-3 w-3" />
            </a>
            <button
              type="button"
              onClick={signOut}
              className="flex h-10 items-center gap-2 border border-black/10 px-3 text-[7px] font-semibold uppercase tracking-[.11em] transition hover:border-[#cf1f2e] hover:text-[#cf1f2e] max-[520px]:w-10 max-[520px]:justify-center max-[520px]:px-0"
              aria-label="Sign out of admin"
              title="Sign out"
            >
              <AdminIcon name="logout" className="h-4 w-4" />
              <span className="max-[520px]:hidden">Logout</span>
            </button>
          </div>
        </header>

        <main className="min-w-0 p-[clamp(14px,4vw,54px)] max-[600px]:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
