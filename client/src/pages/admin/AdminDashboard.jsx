/**
 * Admin page for admin dashboard, including its data loading, actions, validation, and presentation state.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "../../services/adminApi.js";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AdminStatus from "../../components/admin/AdminStatus.jsx";
import AdminIcon from "../../components/admin/AdminIcon.jsx";

/**
 * Implements the money operation used by this module.
 */
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
/**
 * Implements the date operation used by this module.
 */
const date = (value) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/**
 * Renders the Admin Dashboard component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try { const response = await getAdminDashboard(); setData(response.data); setError(""); }
    catch (err) { setError(err.message); }
  }
  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { const handler=(event)=>{ if(event.detail?.event?.startsWith("order:") || event.detail?.event?.startsWith("review:")) loadDashboard(); }; window.addEventListener("beyonist:admin-realtime",handler); return()=>window.removeEventListener("beyonist:admin-realtime",handler); }, []);

  const metrics = data?.metrics || {};
  const cards = [
    ["Collected revenue", money(metrics.revenue), "Paid, non-cancelled orders", "orders"],
    ["Collected this month", money(metrics.monthlyRevenue), "Paid orders this month", "orders"],
    ["Orders", metrics.totalOrders ?? "—", `${metrics.activeOrders ?? 0} currently active`, "orders"],
    ["Customers", metrics.totalCustomers ?? "—", "Active customer accounts", "customers"],
    ["Products", metrics.activeProducts ?? "—", "Active storefront products", "products"],
    ["Unread messages", metrics.newMessages ?? "—", `${metrics.subscribedLeads ?? 0} subscribed leads`, "messages"],
    ["Pending reviews", metrics.pendingReviews ?? "—", "Verified reviews awaiting moderation", "reviews"],
  ];

  return (
    <>
      <AdminPageHeader eyebrow="Overview / 01" title="Control room." copy="A focused view of orders, customers, catalogue content and customer-care activity." />

      {error ? <div className="mb-6 border border-[#cf1f2e]/20 bg-[#cf1f2e]/8 p-4 text-[9px] text-[#9c2630]">{error}</div> : null}

      {/* Section 1: Page section 1. */}

      <section className="grid grid-cols-3 border-l border-t border-black/10 max-[1100px]:grid-cols-2 max-[620px]:grid-cols-1">
        {cards.map(([label, value, copy, icon]) => (
          <article key={label} className="min-h-[160px] border-b border-r border-black/10 bg-[#f7f3ed] p-5 max-[620px]:min-h-0 max-[620px]:p-4">
            <div className="flex items-center justify-between text-black/32">
              <span className="text-[6px] font-semibold uppercase tracking-[.16em]">{label}</span>
              <AdminIcon name={icon} className="h-4 w-4" />
            </div>
            <strong className="mt-7 block font-[Georgia] text-[clamp(28px,3.2vw,44px)] font-normal leading-none">{value}</strong>
            <p className="mt-3 text-[8px] text-black/65">{copy}</p>
          </article>
        ))}
      </section>

      {/* Section 2: Commerce. */}

      <section className="mt-8 grid grid-cols-[1.35fr_.65fr] gap-6 max-[1050px]:grid-cols-1">
        <article className="border border-black/10 bg-[#f7f3ed]">
          <header className="flex items-center justify-between border-b border-black/10 px-5 py-4">
            <div><span className="text-[6px] uppercase tracking-[.16em] text-[#cf1f2e]">Commerce</span><h2 className="mt-1 font-[Georgia] text-[26px] font-normal">Recent orders</h2></div>
            <Link to="/admin/orders" className="text-[7px] font-semibold uppercase tracking-[.12em]">View all ↗</Link>
          </header>
          <div className="overflow-x-auto max-[700px]:hidden">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead><tr className="border-b border-black/10 text-[6px] uppercase tracking-[.13em] text-black/32"><th className="px-5 py-3">Order</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th><th>Date</th></tr></thead>
              <tbody>{(data?.recentOrders || []).map((order) => <tr key={order._id} className="border-b border-black/5 text-[9px]"><td className="px-5 py-4 font-semibold"><Link to={`/admin/orders/${order.orderNumber}`}>{order.orderNumber}</Link></td><td>{order.customer?.name}</td><td><AdminStatus value={order.status}/></td><td><AdminStatus value={order.paymentStatus}/></td><td>{money(order.total)}</td><td className="text-black/65">{date(order.createdAt)}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="hidden divide-y divide-black/10 max-[700px]:block">
            {(data?.recentOrders || []).map((order) => (
              <Link key={order._id} to={`/admin/orders/${order.orderNumber}`} className="block p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><strong className="block text-[9px]">{order.orderNumber}</strong><span className="mt-1 block truncate text-[7px] text-black/65">{order.customer?.name || "Guest customer"}</span></div>
                  <strong className="shrink-0 text-[9px]">{money(order.total)}</strong>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2"><AdminStatus value={order.status}/><AdminStatus value={order.paymentStatus}/><span className="ml-auto text-[7px] text-black/65">{date(order.createdAt)}</span></div>
              </Link>
            ))}
            {!(data?.recentOrders || []).length ? <p className="p-5 text-center text-[8px] text-black/65">No recent orders.</p> : null}
          </div>
        </article>

        <article className="border border-black/10 bg-[#0b0b0b] p-5 text-white">
          <span className="text-[6px] uppercase tracking-[.16em] text-[#cf1f2e]">Customer care</span>
          <h2 className="mt-2 font-[Georgia] text-[30px] font-normal">Latest messages.</h2>
          <div className="mt-5 divide-y divide-white/10">
            {(data?.recentMessages || []).map((item) => (
              <Link key={item._id} to="/admin/messages" className="block py-4">
                <div className="flex items-center justify-between gap-3"><strong className="font-[Georgia] text-[18px] font-normal">{item.name}</strong><AdminStatus value={item.status}/></div>
                <p className="mt-1 text-[7px] uppercase tracking-[.12em] text-white/90">{item.topic}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
