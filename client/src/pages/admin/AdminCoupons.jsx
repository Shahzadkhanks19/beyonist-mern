/**
 * Admin page for admin coupons, including its data loading, actions, validation, and presentation state.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useState } from "react";
import { createAdminCoupon, deleteAdminCoupon, getAdminCoupons, updateAdminCoupon } from "../../services/adminApi.js";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AdminModal from "../../components/admin/AdminModal.jsx";
import AdminExportMenu from "../../components/admin/AdminExportMenu.jsx";
import AdminStatus from "../../components/admin/AdminStatus.jsx";

const blank = {
  code: "", description: "", discountType: "percentage", value: 10,
  minimumSubtotal: 0, maximumDiscount: "", startsAt: "", endsAt: "",
  usageLimit: "", membersOnly: false, isActive: true,
};

/**
 * Implements the local input operation used by this module.
 */
const localInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0,16);
};

/**
 * Renders the Admin Coupons component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminCoupons() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState("");

  /**
   * Loads load data for the current flow.
   */
  async function load() {
    const response = await getAdminCoupons({ q });
    setItems(response.data || []);
  }

  useEffect(() => {
    const timer = setTimeout(() => load().catch((e) => setMessage(e.message)), 150);
    return () => clearTimeout(timer);
  }, [q]);

  /**
   * Implements the open operation used by this module.
   */
  function open(item = null) {
    setEditing(item);
    setForm(item ? {
      ...item,
      startsAt: localInput(item.startsAt),
      endsAt: localInput(item.endsAt),
      maximumDiscount: item.maximumDiscount ?? "",
      usageLimit: item.usageLimit ?? "",
    } : blank);
    setModal(true);
    setMessage("");
  }

  /**
   * Implements the save operation used by this module.
   */
  async function save(event) {
    event.preventDefault();
    try {
      if (editing) await updateAdminCoupon(editing._id, form);
      else await createAdminCoupon(form);
      setModal(false);
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  /**
   * Removes the requested record from the current workflow.
   */
  async function remove(item) {
    if (!window.confirm(`Delete coupon ${item.code}?`)) return;
    try {
      await deleteAdminCoupon(item._id);
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const field = "mt-2 w-full border border-black/10 bg-white/60 px-3 py-3 text-[9px] outline-none focus:border-black";

  return (
    <>
      <AdminPageHeader
        eyebrow="Commerce / Promotions"
        title="Coupons."
        copy="Create controlled promotional codes with validity windows, minimum spends, usage limits and optional member-only access."
        action={<button onClick={() => open()} className="bg-[#cf1f2e] px-4 py-3 text-[7px] font-semibold uppercase tracking-[.12em] text-white">+ New coupon</button>}
      />
      <AdminExportMenu title="Coupons" rows={items} columns={[{label:"Code",value:"code"},{label:"Type",value:"discountType"},{label:"Value",value:"value"},{label:"Min Subtotal",value:"minimumSubtotal"},{label:"Max Discount",value:"maximumDiscount"},{label:"Usage",value:"usageCount"},{label:"Limit",value:"usageLimit"},{label:"Active",value:c=>c.isActive?"Yes":"No"}]} />

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search coupon code…" className="mb-5 w-full border border-black/10 bg-[#f7f3ed] px-4 py-3.5 text-[9px] outline-none" />
      {message && !modal ? <p className="mb-4 text-[9px] text-[#cf1f2e]">{message}</p> : null}

      <div className="grid grid-cols-3 gap-4 max-[1050px]:grid-cols-2 max-[650px]:grid-cols-1">
        {items.map((item) => (
          <article key={item._id} className="border border-black/10 bg-[#f7f3ed] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[6px] uppercase tracking-[.14em] text-[#cf1f2e]">Promotion code</span>
                <h2 className="mt-2 font-[Georgia] text-[30px] font-normal">{item.code}</h2>
              </div>
              <AdminStatus value={item.isActive ? "subscribed" : "closed"} />
            </div>
            <p className="mt-3 min-h-[38px] text-[8px] leading-5 text-black/65">{item.description || "No public description."}</p>
            <div className="mt-5 grid grid-cols-2 gap-px bg-black/10">
              <div className="bg-[#f7f3ed] p-3"><span className="text-[5.5px] uppercase tracking-[.1em] text-black/65">Discount</span><strong className="mt-1 block font-[Georgia] text-[21px] font-normal">{item.discountType === "percentage" ? `${item.value}%` : `₹${item.value}`}</strong></div>
              <div className="bg-[#f7f3ed] p-3"><span className="text-[5.5px] uppercase tracking-[.1em] text-black/65">Used</span><strong className="mt-1 block font-[Georgia] text-[21px] font-normal">{item.usageCount}{item.usageLimit ? ` / ${item.usageLimit}` : ""}</strong></div>
            </div>
            <div className="mt-4 flex justify-between text-[7px] text-black/65"><span>Min ₹{item.minimumSubtotal}</span><span>{item.membersOnly ? "Members only" : "All customers"}</span></div>
            <div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => open(item)} className="border border-black/10 py-2.5 text-[7px] uppercase tracking-[.1em]">Edit</button><button onClick={() => remove(item)} className="border border-[#cf1f2e]/20 py-2.5 text-[7px] uppercase tracking-[.1em] text-[#cf1f2e]">Delete</button></div>
          </article>
        ))}
      </div>

      <AdminModal open={modal} title={editing ? "Edit coupon" : "New coupon"} onClose={() => setModal(false)} wide>
        <form onSubmit={save} className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
          {message ? <p className="col-span-full text-[9px] text-[#cf1f2e]">{message}</p> : null}
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Code</span><input required value={form.code} onChange={(e)=>setForm(v=>({...v,code:e.target.value.toUpperCase()}))} className={field}/></label>
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Type</span><select value={form.discountType} onChange={(e)=>setForm(v=>({...v,discountType:e.target.value}))} className={field}><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select></label>
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Value</span><input required type="number" min="0" step="0.01" value={form.value} onChange={(e)=>setForm(v=>({...v,value:e.target.value}))} className={field}/></label>
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Minimum subtotal</span><input type="number" min="0" value={form.minimumSubtotal} onChange={(e)=>setForm(v=>({...v,minimumSubtotal:e.target.value}))} className={field}/></label>
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Maximum discount</span><input type="number" min="0" value={form.maximumDiscount} onChange={(e)=>setForm(v=>({...v,maximumDiscount:e.target.value}))} placeholder="Optional" className={field}/></label>
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Usage limit</span><input type="number" min="1" value={form.usageLimit} onChange={(e)=>setForm(v=>({...v,usageLimit:e.target.value}))} placeholder="Unlimited" className={field}/></label>
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Starts</span><input type="datetime-local" value={form.startsAt} onChange={(e)=>setForm(v=>({...v,startsAt:e.target.value}))} className={field}/></label>
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Ends</span><input type="datetime-local" value={form.endsAt} onChange={(e)=>setForm(v=>({...v,endsAt:e.target.value}))} className={field}/></label>
          <label className="col-span-full"><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Description</span><input value={form.description} onChange={(e)=>setForm(v=>({...v,description:e.target.value}))} className={field}/></label>
          <div className="col-span-full flex flex-wrap gap-6 border-t border-black/10 pt-4 text-[8px]"><label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e)=>setForm(v=>({...v,isActive:e.target.checked}))}/> Active</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.membersOnly} onChange={(e)=>setForm(v=>({...v,membersOnly:e.target.checked}))}/> Signed-in customers only</label></div>
          <button className="col-span-full bg-[#cf1f2e] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] text-white">{editing ? "Save coupon" : "Create coupon"}</button>
        </form>
      </AdminModal>
    </>
  );
}
