/**
 * Admin page for admin orders, including its data loading, actions, validation, and presentation state.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminOrders } from "../../services/adminApi.js";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AdminStatus from "../../components/admin/AdminStatus.jsx";
import AdminExportMenu from "../../components/admin/AdminExportMenu.jsx";

/**
 * Implements the money operation used by this module.
 */
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
/**
 * Implements the date operation used by this module.
 */
const date = (value) => new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * Renders the Admin Orders component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminOrders() {
  const [filters, setFilters] = useState({ q: "", status: "", paymentStatus: "" });
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  /**
   * Loads load data for the current flow.
   */
  async function load() {
    try {
      setError("");
      const response = await getAdminOrders({ ...filters, limit: 100 });
      setOrders(response.data || []);
    } catch (err) { setError(err.message); }
  }

  useEffect(() => { const timer = setTimeout(load, 180); return () => clearTimeout(timer); }, [filters.q, filters.status, filters.paymentStatus]);
  useEffect(() => { const handler=(event)=>{ if(event.detail?.event?.startsWith("order:")) load(); }; window.addEventListener("beyonist:admin-realtime",handler); return()=>window.removeEventListener("beyonist:admin-realtime",handler); }, [filters.q, filters.status, filters.paymentStatus]);

  return (
    <>
      <AdminPageHeader eyebrow="Commerce / Orders" title="Orders." copy="Search, inspect, update fulfilment/payment state and generate a printable bill from the original order snapshot." />
      <AdminExportMenu title="Orders" rows={orders} columns={[{label:"Order",value:"orderNumber"},{label:"Customer",value:o=>o.customer?.name},{label:"Email",value:"email"},{label:"Status",value:"status"},{label:"Payment",value:"paymentStatus"},{label:"Subtotal",value:"subtotal"},{label:"Coupon",value:"couponCode"},{label:"Discount",value:"discountAmount"},{label:"Tax",value:"taxAmount"},{label:"Delivery",value:"shippingAmount"},{label:"Total",value:"total"},{label:"Placed",value:o=>date(o.createdAt)}]} />

      <div className="mb-5 grid grid-cols-[1fr_210px_210px] gap-3 max-[800px]:grid-cols-1">
        <input value={filters.q} onChange={(e) => setFilters((v) => ({ ...v, q: e.target.value }))} placeholder="Search order, customer, email or phone…" className="border border-black/10 bg-[#f7f3ed] px-4 py-3.5 text-[9px] outline-none focus:border-black" />
        <select value={filters.status} onChange={(e) => setFilters((v) => ({ ...v, status: e.target.value }))} className="border border-black/10 bg-[#f7f3ed] px-4 py-3 text-[8px] uppercase tracking-[.1em] outline-none">
          <option value="">All statuses</option><option value="placed">Placed</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="out_for_delivery">Out for delivery</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
        </select>
        <select value={filters.paymentStatus} onChange={(e) => setFilters((v) => ({ ...v, paymentStatus: e.target.value }))} className="border border-black/10 bg-[#f7f3ed] px-4 py-3 text-[8px] uppercase tracking-[.1em] outline-none">
          <option value="">All payments</option><option value="cod_pending">COD pending</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
        </select>
      </div>

      {error ? <p className="mb-4 text-[9px] text-[#cf1f2e]">{error}</p> : null}

      <div className="overflow-x-auto border border-black/10 bg-[#f7f3ed] max-[700px]:hidden">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead><tr className="border-b border-black/10 text-[6px] uppercase tracking-[.14em] text-black/65"><th className="px-5 py-4">Order</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th><th>Placed</th><th className="pr-5 text-right">Open</th></tr></thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-black/5 text-[9px] transition hover:bg-black/[.025]">
                <td className="px-5 py-4"><strong className="block">{order.orderNumber}</strong><span className="mt-1 block text-[7px] text-black/65">{order.items?.length || 0} item(s)</span></td>
                <td><strong className="font-normal">{order.customer?.name}</strong><span className="mt-1 block text-[7px] text-black/65">{order.email}</span></td>
                <td><AdminStatus value={order.status}/></td>
                <td><AdminStatus value={order.paymentStatus}/></td>
                <td className="font-semibold">{money(order.total)}</td>
                <td className="text-black/65">{date(order.createdAt)}</td>
                <td className="pr-5 text-right"><Link to={`/admin/orders/${order.orderNumber}`} className="border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-[.1em]">Manage ↗</Link></td>
              </tr>
            ))}
            {!orders.length ? <tr><td colSpan="7" className="px-5 py-16 text-center text-[9px] text-black/65">No orders match the current filters.</td></tr> : null}
          </tbody>
        </table>
      </div>

      <div className="hidden space-y-3 max-[700px]:block">
        {orders.map((order) => (
          <article key={order._id} className="border border-black/10 bg-[#f7f3ed] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <strong className="block text-[10px]">{order.orderNumber}</strong>
                <span className="mt-1 block truncate text-[7px] text-black/65">{order.customer?.name || "Guest customer"} · {order.items?.length || 0} item(s)</span>
              </div>
              <strong className="shrink-0 font-[Georgia] text-[19px] font-normal">{money(order.total)}</strong>
            </div>
            <p className="mt-3 truncate text-[8px] text-black/65">{order.email}</p>
            <div className="mt-3 flex flex-wrap gap-2"><AdminStatus value={order.status}/><AdminStatus value={order.paymentStatus}/></div>
            <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
              <span className="text-[7px] text-black/65">{date(order.createdAt)}</span>
              <Link to={`/admin/orders/${order.orderNumber}`} className="bg-black px-4 py-2.5 text-[7px] font-semibold uppercase tracking-[.1em] text-white">Manage ↗</Link>
            </div>
          </article>
        ))}
        {!orders.length ? <div className="border border-black/10 bg-[#f7f3ed] p-8 text-center text-[8px] text-black/65">No orders match the current filters.</div> : null}
      </div>
    </>
  );
}
