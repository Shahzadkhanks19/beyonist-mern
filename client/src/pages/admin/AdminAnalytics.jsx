/**
 * Admin page for admin analytics, including its data loading, actions, validation, and presentation state.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useMemo, useState } from "react";
import { getAdminAnalytics } from "../../services/adminApi.js";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AdminStatus from "../../components/admin/AdminStatus.jsx";
import AdminExportMenu from "../../components/admin/AdminExportMenu.jsx";

/**
 * Implements the money operation used by this module.
 */
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/**
 * Renders the Admin Analytics component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    getAdminAnalytics(days).then((r) => setData(r.data)).catch((e) => setError(e.message));
  }, [days]);

  const maxRevenue = useMemo(() => Math.max(...(data?.daily || []).map((x) => x.orderValue || 0), 1), [data]);
  const summary = data?.summary || {};
  const cards = [
    ["Collected revenue", money(summary.revenue), `${summary.paidOrders ?? 0} paid order(s)`],
    ["Order value", money(summary.orderValue), `${days}-day non-cancelled value`],
    ["Discounts", money(summary.discounts), "Coupons applied"],
    ["Average order", money(summary.averageOrderValue), "Revenue / order"],
    ["Orders", summary.orders ?? "—", "Non-cancelled orders"],
    ["Unique buyers", summary.uniqueCustomers ?? "—", `${summary.newCustomers ?? 0} new accounts`],
    ["Tax captured", money(summary.taxCollected), "Snapshot tax amount"],
    ["Shipping on orders", money(summary.shippingCollected), `${summary.newLeads ?? 0} new leads`],
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Insights / Analytics"
        title="Store performance."
        copy="Operational analytics calculated from your own MongoDB orders, customers, products, leads and coupon usage."
        action={<select value={days} onChange={(e)=>setDays(Number(e.target.value))} className="border border-black/10 bg-[#f7f3ed] px-4 py-3 text-[8px] uppercase tracking-[.1em]"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last 365 days</option></select>}
      />
      <AdminExportMenu title={`Analytics ${days} days`} rows={data?.daily || []} columns={[{label:"Date",value:"date"},{label:"Orders",value:"orders"},{label:"Order Value",value:"orderValue"},{label:"Collected Revenue",value:"collectedRevenue"}]} />
      {error ? <p className="mb-4 text-[9px] text-[#cf1f2e]">{error}</p> : null}

      {/* Section 1: Revenue trend. */}

      <section className="grid grid-cols-4 border-l border-t border-black/10 max-[1150px]:grid-cols-2 max-[620px]:grid-cols-1">
        {cards.map(([label,value,copy])=><article key={label} className="border-b border-r border-black/10 bg-[#f7f3ed] p-5"><span className="text-[6px] uppercase tracking-[.14em] text-black/65">{label}</span><strong className="mt-6 block font-[Georgia] text-[32px] font-normal">{value}</strong><p className="mt-2 text-[7px] text-black/65">{copy}</p></article>)}
      </section>

      {/* Section 2: Revenue trend. */}

      <section className="mt-6 border border-black/10 bg-[#0b0b0b] p-6 text-white">
        <div className="flex items-end justify-between"><div><span className="text-[6px] uppercase tracking-[.15em] text-[#cf1f2e]">Revenue trend</span><h2 className="mt-2 font-[Georgia] text-[30px] font-normal">{days} days.</h2></div><span className="text-[7px] text-white/90">Daily order revenue</span></div>
        <div className="mt-8 overflow-x-auto pb-2"><div className="flex h-[220px] min-w-[620px] items-end gap-[3px] border-b border-white/10">
          {(data?.daily || []).map((point)=><div key={point.date} title={`${point.date}: ${money(point.orderValue)} order value · ${money(point.collectedRevenue)} collected · ${point.orders} order(s)`} className="group relative flex h-full min-w-0 flex-1 items-end"><div className="w-full bg-[#cf1f2e] transition group-hover:bg-white" style={{height:`${Math.max(((point.orderValue || 0)/maxRevenue)*100, point.orderValue ? 3 : 0)}%`}}/></div>)}
        </div></div>
      </section>

      {/* Section 3: Products. */}

      <section className="mt-6 grid grid-cols-2 gap-6 max-[950px]:grid-cols-1">
        <article className="border border-black/10 bg-[#f7f3ed] p-5"><span className="text-[6px] uppercase tracking-[.14em] text-[#cf1f2e]">Products</span><h2 className="mt-2 font-[Georgia] text-[28px] font-normal">Best sellers.</h2><div className="mt-5 divide-y divide-black/10">{(data?.topProducts||[]).map((item,index)=><div key={item._id} className="grid grid-cols-[28px_minmax(0,1fr)_auto] gap-3 py-3 text-[9px]"><span className="text-black/65">0{index+1}</span><div><strong className="font-normal">{item.name}</strong><span className="mt-1 block text-[7px] text-black/65">{item.quantity} units</span></div><strong>{money(item.orderValue)}</strong></div>)}</div></article>
        <article className="border border-black/10 bg-[#f7f3ed] p-5"><span className="text-[6px] uppercase tracking-[.14em] text-[#cf1f2e]">Promotions</span><h2 className="mt-2 font-[Georgia] text-[28px] font-normal">Coupon performance.</h2><div className="mt-5 divide-y divide-black/10">{(data?.couponUsage||[]).map((item)=><div key={item._id} className="grid grid-cols-[1fr_auto] gap-3 py-3 text-[9px]"><div><strong>{item._id}</strong><span className="mt-1 block text-[7px] text-black/65">{item.orders} orders · {money(item.discount)} discounted</span></div><strong>{money(item.orderValue)}</strong></div>)}{!data?.couponUsage?.length?<p className="py-5 text-[8px] text-black/65">No coupons used in this period.</p>:null}</div></article>
      </section>

      {/* Section 4: Fulfilment. */}

      <section className="mt-6 border border-black/10 bg-[#f7f3ed] p-5"><span className="text-[6px] uppercase tracking-[.14em] text-[#cf1f2e]">Fulfilment</span><h2 className="mt-2 font-[Georgia] text-[28px] font-normal">Order status mix.</h2><div className="mt-5 flex flex-wrap gap-3">{(data?.statusBreakdown||[]).map((item)=><div key={item._id} className="flex items-center gap-3 border border-black/10 px-4 py-3"><AdminStatus value={item._id}/><strong className="font-[Georgia] text-[20px] font-normal">{item.count}</strong></div>)}</div></section>
    </>
  );
}
