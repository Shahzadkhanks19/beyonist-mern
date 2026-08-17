/**
 * Admin page for admin order detail, including its data loading, actions, validation, and presentation state.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdminOrder, getAdminOrderBill, updateAdminOrder } from "../../services/adminApi.js";
import { printOrderBill } from "../../utils/printOrderBill.js";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AdminStatus from "../../components/admin/AdminStatus.jsx";
import AdminIcon from "../../components/admin/AdminIcon.jsx";

/**
 * Implements the money operation used by this module.
 */
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

/**
 * Renders the Admin Order Detail component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminOrderDetail() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({ status: "", paymentStatus: "", trackingNumber: "", courier: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  /**
   * Loads load data for the current flow.
   */
  async function load() {
    const response = await getAdminOrder(orderNumber);
    setOrder(response.data);
    setForm({
      status: response.data.status,
      paymentStatus: response.data.paymentStatus,
      trackingNumber: response.data.trackingNumber || "",
      courier: response.data.courier || "",
    });
  }

  useEffect(() => { load().catch((e) => setMessage(e.message)); }, [orderNumber]);
  useEffect(() => {
    const handler = (event) => {
      if (event.detail?.event?.startsWith("order:") && event.detail?.payload?.orderNumber === orderNumber) {
        load().catch((e) => setMessage(e.message));
      }
    };
    window.addEventListener("beyonist:admin-realtime", handler);
    return () => window.removeEventListener("beyonist:admin-realtime", handler);
  }, [orderNumber]);

  /**
   * Implements the save operation used by this module.
   */
  async function save() {
    try {
      setSaving(true); setMessage("");
      const response = await updateAdminOrder(orderNumber, form);
      setOrder(response.data);
      setMessage(response.emailNotification === "sent" ? "Order updated and customer status email sent." : "Order updated.");
    } catch (e) { setMessage(e.message); } finally { setSaving(false); }
  }

  /**
   * Implements the bill operation used by this module.
   */
  async function bill() {
    try {
      const response = await getAdminOrderBill(orderNumber);
      printOrderBill(response.data);
    } catch (e) { setMessage(e.message); }
  }

  if (!order) return <div className="py-20 text-[9px] text-black/65">{message || "Loading order…"}</div>;

  const address = order.shippingAddress || {};

  return (
    <>
      <AdminPageHeader
        eyebrow="Commerce / Order"
        title={order.orderNumber}
        copy={`Placed ${new Date(order.createdAt).toLocaleString("en-IN")}`}
        action={<div className="flex gap-2 max-[520px]:grid max-[520px]:grid-cols-1"><Link to="/admin/orders" className="border border-black/10 bg-[#f7f3ed] px-4 py-3 text-[7px] font-semibold uppercase tracking-[.12em]">← Orders</Link><button onClick={bill} className="flex items-center gap-2 bg-black px-4 py-3 text-[7px] font-semibold uppercase tracking-[.12em] text-white"><AdminIcon name="print" className="h-4 w-4"/> Generate bill</button></div>}
      />

      {message ? <div className="mb-5 border border-black/10 bg-[#f7f3ed] px-4 py-3 text-[8px]">{message}</div> : null}

      {/* Section 1: Items. */}

      <section className="grid grid-cols-[1.25fr_.75fr] gap-6 max-[1000px]:grid-cols-1">
        <div className="space-y-6">
          <article className="border border-black/10 bg-[#f7f3ed]">
            <header className="border-b border-black/10 px-5 py-4"><span className="text-[6px] uppercase tracking-[.16em] text-[#cf1f2e]">Items</span><h2 className="mt-1 font-[Georgia] text-[26px] font-normal">Order contents</h2></header>
            <div className="divide-y divide-black/10">
              {order.items.map((item) => <div key={`${item.slug}-${item.name}`} className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-4 p-5 max-[520px]:grid-cols-[58px_minmax(0,1fr)] max-[520px]:p-4">
                <div className="h-[72px] bg-[#eee9e1]"><img src={item.image} alt="" width="480" height="480" className="h-full w-full object-contain" loading="lazy" decoding="async"/></div>
                <div><strong className="font-[Georgia] text-[20px] font-normal">{item.name}</strong><p className="mt-1 text-[7px] text-black/65">{money(item.price)} × {item.quantity}</p></div>
                <strong className="text-[10px] max-[520px]:col-start-2">{money(item.price * item.quantity)}</strong>
              </div>)}
            </div>
            <div className="ml-auto w-full max-w-[360px] border-l border-t border-black/10 p-5 text-[9px] max-[520px]:max-w-none max-[520px]:border-l-0 max-[520px]:p-4">
              <div className="flex justify-between py-2"><span className="text-black/65">Subtotal</span><strong>{money(order.subtotal)}</strong></div>
              {order.discountAmount > 0 ? <>
                <div className="flex justify-between py-2 text-[#3b7644]"><span>Coupon {order.couponCode}</span><strong>-{money(order.discountAmount)}</strong></div>
                <div className="flex justify-between bg-black/[.025] px-2 py-2"><span className="text-black/65">After discount</span><strong>{money(order.discountedSubtotal ?? Math.max(Number(order.subtotal || 0) - Number(order.discountAmount || 0), 0))}</strong></div>
              </> : null}
              {order.taxEnabled ? <div className="flex justify-between py-2"><span className="text-black/65">Tax {order.taxMode === "inclusive" ? `(included · ${order.taxRate}%)` : `(${order.taxRate}%)`}</span><strong>{money(order.taxAmount)}</strong></div> : null}
              <div className="flex justify-between py-2"><span className="text-black/65">Delivery</span><strong>{Number(order.shippingAmount || 0) === 0 ? "₹0" : money(order.shippingAmount)}</strong></div>
              <div className="mt-2 flex justify-between border-t border-black pt-3 font-[Georgia] text-[22px]"><span>Total</span><strong className="font-normal">{money(order.total)}</strong></div>
            </div>
          </article>

          <article className="grid grid-cols-2 gap-px bg-black/10 max-[650px]:grid-cols-1">
            <div className="bg-[#f7f3ed] p-5"><span className="text-[6px] uppercase tracking-[.15em] text-[#cf1f2e]">Customer</span><h3 className="mt-2 font-[Georgia] text-[24px] font-normal">{order.customer.name}</h3><p className="mt-3 text-[9px] leading-6 text-black/65">{order.customer.phone}<br/>{order.email}</p></div>
            <div className="bg-[#f7f3ed] p-5"><span className="text-[6px] uppercase tracking-[.15em] text-[#cf1f2e]">Delivery address</span><p className="mt-3 text-[9px] leading-6 text-black/65">{address.addressLine1}{address.addressLine2 ? <><br/>{address.addressLine2}</> : null}<br/>{address.city}, {address.state} {address.postalCode}<br/>{address.country}</p></div>
          </article>
        </div>

        <aside className="self-start border border-black/10 bg-[#0b0b0b] p-5 text-white">
          <span className="text-[6px] uppercase tracking-[.16em] text-[#cf1f2e]">Fulfilment control</span>
          <div className="mt-4 flex gap-2"><AdminStatus value={order.status}/><AdminStatus value={order.paymentStatus}/></div>

          <label className="mt-6 block"><span className="text-[6px] uppercase tracking-[.14em] text-white/90">Order status</span><select value={form.status} onChange={(e) => setForm((v) => ({...v,status:e.target.value}))} className="mt-2 w-full border border-white/10 bg-white/[.05] px-3 py-3 text-[9px] outline-none"><option className="text-black" value="placed">Placed</option><option className="text-black" value="confirmed">Confirmed</option><option className="text-black" value="processing">Processing</option><option className="text-black" value="shipped">Shipped</option><option className="text-black" value="out_for_delivery">Out for delivery</option><option className="text-black" value="delivered">Delivered</option><option className="text-black" value="cancelled">Cancelled</option></select></label>
          <label className="mt-4 block"><span className="text-[6px] uppercase tracking-[.14em] text-white/90">Payment status</span><select value={form.paymentStatus} onChange={(e) => setForm((v) => ({...v,paymentStatus:e.target.value}))} className="mt-2 w-full border border-white/10 bg-white/[.05] px-3 py-3 text-[9px] outline-none"><option className="text-black" value="cod_pending">COD pending</option><option className="text-black" value="paid">Paid</option><option className="text-black" value="pending">Pending</option><option className="text-black" value="failed">Failed</option><option className="text-black" value="refunded">Refunded</option></select></label>
          <label className="mt-4 block"><span className="text-[6px] uppercase tracking-[.14em] text-white/90">Courier</span><input value={form.courier} onChange={(e) => setForm((v) => ({...v,courier:e.target.value}))} className="mt-2 w-full border border-white/10 bg-white/[.05] px-3 py-3 text-[9px] outline-none" placeholder="Courier name"/></label>
          <label className="mt-4 block"><span className="text-[6px] uppercase tracking-[.14em] text-white/90">Tracking number</span><input value={form.trackingNumber} onChange={(e) => setForm((v) => ({...v,trackingNumber:e.target.value}))} className="mt-2 w-full border border-white/10 bg-white/[.05] px-3 py-3 text-[9px] outline-none" placeholder="Tracking ID"/></label>

          <button disabled={saving} onClick={save} className="mt-6 w-full bg-[#cf1f2e] px-4 py-4 text-[8px] font-semibold uppercase tracking-[.14em] disabled:opacity-50">{saving ? "Saving…" : "Update order"}</button>
          <p className="mt-4 text-[7px] leading-5 text-white/90">Changing the fulfilment status triggers the existing customer status-email workflow when the status actually changes.</p>
        </aside>
      </section>
    </>
  );
}
