/**
 * Admin page for admin customers, including its data loading, actions, validation, and presentation state.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useState } from "react";
import { getAdminCustomers, updateAdminCustomer } from "../../services/adminApi.js";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AdminModal from "../../components/admin/AdminModal.jsx";
import AdminExportMenu from "../../components/admin/AdminExportMenu.jsx";

/**
 * Implements the money operation used by this module.
 */
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

/**
 * Renders the Admin Customers component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminCustomers() {
  const [q, setQ] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  /**
   * Loads load data for the current flow.
   */
  async function load() {
    const response = await getAdminCustomers({ q, limit: 100 });
    setCustomers(response.data || []);
  }
  useEffect(() => { const t=setTimeout(()=>load().catch(e=>setMessage(e.message)),180); return()=>clearTimeout(t); }, [q]);

  /**
   * Implements the patch operation used by this module.
   */
  async function patch(customer, data) {
    try {
      const response = await updateAdminCustomer(customer._id, data);
      setCustomers((items) => items.map((item) => item._id === customer._id ? { ...item, ...response.data } : item));
      if (selected?._id === customer._id) setSelected((value) => ({ ...value, ...response.data }));
    } catch (e) { setMessage(e.message); }
  }

  return (
    <>
      <AdminPageHeader eyebrow="Customers / CRM" title="Customers." copy="Manage customer access, rewards and member offer eligibility without touching guest checkout." />
      <AdminExportMenu title="Customers" rows={customers} columns={[{label:"Name",value:"name"},{label:"Email",value:"email"},{label:"Phone",value:"phone"},{label:"Orders",value:"orderCount"},{label:"Spend",value:"totalSpend"},{label:"Points",value:"rewardPoints"},{label:"Active",value:c=>c.isActive?"Yes":"No"},{label:"Joined",value:c=>new Date(c.createdAt).toLocaleDateString("en-IN")}]} />
      <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search customer by name, email or phone…" className="mb-5 w-full border border-black/10 bg-[#f7f3ed] px-4 py-3.5 text-[9px] outline-none"/>
      {message ? <p className="mb-4 text-[9px] text-[#cf1f2e]">{message}</p> : null}

      <div className="grid grid-cols-3 gap-4 max-[1180px]:grid-cols-2 max-[700px]:grid-cols-1 max-[600px]:gap-3">
        {customers.map((customer) => (
          <article key={customer._id} className="border border-black/10 bg-[#f7f3ed] p-5">
            <div className="flex items-start justify-between gap-4"><div><span className="text-[6px] uppercase tracking-[.15em] text-[#cf1f2e]">{customer.isActive ? "Active member" : "Disabled"}</span><h2 className="mt-2 font-[Georgia] text-[25px] font-normal">{customer.name}</h2></div><button onClick={()=>setSelected(customer)} className="text-[7px] font-semibold uppercase tracking-[.1em]">Manage ↗</button></div>
            <p className="mt-4 text-[8px] leading-5 text-black/65">{customer.email}<br/>{customer.phone}</p>
            <div className="mt-5 grid grid-cols-3 border-l border-t border-black/10 text-center max-[420px]:grid-cols-1">
              <div className="border-b border-r border-black/10 p-3"><strong className="block font-[Georgia] text-[20px] font-normal">{customer.orderCount}</strong><span className="text-[5.5px] uppercase tracking-[.1em] text-black/65">Orders</span></div>
              <div className="border-b border-r border-black/10 p-3"><strong className="block font-[Georgia] text-[20px] font-normal">{money(customer.totalSpend)}</strong><span className="text-[5.5px] uppercase tracking-[.1em] text-black/65">Spend</span></div>
              <div className="border-b border-r border-black/10 p-3"><strong className="block font-[Georgia] text-[20px] font-normal">{customer.rewardPoints}</strong><span className="text-[5.5px] uppercase tracking-[.1em] text-black/65">Points</span></div>
            </div>
          </article>
        ))}
      </div>

      <AdminModal open={Boolean(selected)} title={selected ? selected.name : ""} onClose={()=>setSelected(null)}>
        {selected ? <div className="space-y-5">
          <div><span className="text-[6px] uppercase tracking-[.14em] text-black/65">Account</span><p className="mt-2 text-[9px] leading-6">{selected.email}<br/>{selected.phone}<br/>Joined {new Date(selected.createdAt).toLocaleDateString("en-IN")}</p></div>
          <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
            <button onClick={()=>patch(selected,{isActive:!selected.isActive})} className="border border-black/10 px-4 py-3 text-[8px] font-semibold uppercase tracking-[.1em]">{selected.isActive ? "Disable account" : "Activate account"}</button>
            <button onClick={()=>patch(selected,{offerAccess:!selected.offerAccess})} className="border border-black/10 px-4 py-3 text-[8px] font-semibold uppercase tracking-[.1em]">Offers: {selected.offerAccess ? "On" : "Off"}</button>
            <button onClick={()=>patch(selected,{discountAccess:!selected.discountAccess})} className="border border-black/10 px-4 py-3 text-[8px] font-semibold uppercase tracking-[.1em]">Discounts: {selected.discountAccess ? "On" : "Off"}</button>
            <label className="border border-black/10 p-3"><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Reward points</span><input type="number" min="0" value={selected.rewardPoints} onChange={(e)=>setSelected(v=>({...v,rewardPoints:e.target.value}))} onBlur={()=>patch(selected,{rewardPoints:selected.rewardPoints})} className="mt-2 w-full bg-transparent font-[Georgia] text-[22px] outline-none"/></label>
          </div>
          <div><span className="text-[6px] uppercase tracking-[.14em] text-black/65">Saved addresses</span><div className="mt-3 space-y-2">{(selected.addresses||[]).map((a)=><div key={a._id} className="border border-black/10 p-3 text-[8px] leading-5"><strong>{a.label}{a.isDefault?" · Default":""}</strong><br/>{a.addressLine1}, {a.city}, {a.state} {a.postalCode}</div>)}{!selected.addresses?.length?<p className="text-[8px] text-black/65">No saved addresses.</p>:null}</div></div>
        </div> : null}
      </AdminModal>
    </>
  );
}
