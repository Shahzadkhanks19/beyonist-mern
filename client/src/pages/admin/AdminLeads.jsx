/**
 * Admin page for admin leads, including its data loading, actions, validation, and presentation state.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useMemo, useState } from "react";
import { deleteAdminLead, getAdminLeads, updateAdminLead } from "../../services/adminApi.js";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AdminStatus from "../../components/admin/AdminStatus.jsx";
import AdminExportMenu from "../../components/admin/AdminExportMenu.jsx";

/**
 * Renders the Admin Leads component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminLeads(){
  const [filters,setFilters]=useState({q:"",status:""});
  const [items,setItems]=useState([]);
  const [message,setMessage]=useState("");
  /**
   * Loads load data for the current flow.
   */
  async function load(){const r=await getAdminLeads({...filters,limit:200});setItems(r.data||[])}
  useEffect(()=>{const t=setTimeout(()=>load().catch(e=>setMessage(e.message)),180);return()=>clearTimeout(t)},[filters.q,filters.status]);
  /**
   * Implements the toggle operation used by this module.
   */
  async function toggle(item){try{await updateAdminLead(item._id,item.status==="subscribed"?"unsubscribed":"subscribed");await load()}catch(e){setMessage(e.message)}}
  /**
   * Removes the requested record from the current workflow.
   */
  async function remove(item){if(!window.confirm(`Delete lead ${item.email}?`))return;try{await deleteAdminLead(item._id);await load()}catch(e){setMessage(e.message)}}
  /**
   * Implements the export csv operation used by this module.
   */
  function exportCsv(){const rows=[["Email","Status","Source","First captured","Last captured","Capture count"],...items.map(x=>[x.email,x.status,x.source,x.firstCapturedAt,x.lastCapturedAt,x.captureCount])];const csv=rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`beyonist-leads-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url)}
  return <>
    <AdminPageHeader eyebrow="Marketing / Leads" title="Captured leads." copy="Footer newsletter submissions are stored here. Export the current result set or control subscription state." action={<button onClick={exportCsv} className="bg-black px-4 py-3 text-[7px] font-semibold uppercase tracking-[.12em] text-white">Export CSV ↗</button>}/>
    <AdminExportMenu title="Leads" rows={items} columns={[{label:"Email",value:"email"},{label:"Status",value:"status"},{label:"Source",value:"source"},{label:"First Captured",value:"firstCapturedAt"},{label:"Last Captured",value:"lastCapturedAt"},{label:"Capture Count",value:"captureCount"}]} />
    <div className="mb-5 grid grid-cols-[1fr_210px] gap-3 max-[650px]:grid-cols-1"><input value={filters.q} onChange={e=>setFilters(v=>({...v,q:e.target.value}))} placeholder="Search email…" className="border border-black/10 bg-[#f7f3ed] px-4 py-3.5 text-[9px] outline-none"/><select value={filters.status} onChange={e=>setFilters(v=>({...v,status:e.target.value}))} className="border border-black/10 bg-[#f7f3ed] px-4 py-3 text-[8px] uppercase"><option value="">All leads</option><option value="subscribed">Subscribed</option><option value="unsubscribed">Unsubscribed</option></select></div>
    {message?<p className="mb-4 text-[9px] text-[#cf1f2e]">{message}</p>:null}
    <div className="overflow-x-auto border border-black/10 bg-[#f7f3ed] max-[700px]:hidden"><table className="w-full min-w-[760px]"><thead><tr className="border-b border-black/10 text-left text-[6px] uppercase tracking-[.13em] text-black/65"><th className="px-5 py-4">Email</th><th>Status</th><th>Source</th><th>Captured</th><th>Times</th><th className="pr-5 text-right">Actions</th></tr></thead><tbody>{items.map(item=><tr key={item._id} className="border-b border-black/5 text-[9px]"><td className="px-5 py-4">{item.email}</td><td><AdminStatus value={item.status}/></td><td className="capitalize">{item.source}</td><td className="text-black/65">{new Date(item.lastCapturedAt).toLocaleDateString("en-IN")}</td><td>{item.captureCount}</td><td className="pr-5 text-right"><button onClick={()=>toggle(item)} className="mr-4 border-b border-black pb-1 text-[7px] uppercase tracking-[.1em]">{item.status==="subscribed"?"Unsubscribe":"Resubscribe"}</button><button onClick={()=>remove(item)} className="text-[7px] uppercase tracking-[.1em] text-[#cf1f2e]">Delete</button></td></tr>)}</tbody></table></div>
    <div className="hidden space-y-3 max-[700px]:block">{items.map(item=><article key={item._id} className="border border-black/10 bg-[#f7f3ed] p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block break-all text-[9px]">{item.email}</strong><span className="mt-1 block text-[7px] capitalize text-black/65">{item.source} · captured {item.captureCount} time(s)</span></div><AdminStatus value={item.status}/></div><div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3"><span className="text-[7px] text-black/65">{new Date(item.lastCapturedAt).toLocaleDateString("en-IN")}</span><div className="flex gap-3"><button type="button" onClick={()=>toggle(item)} className="text-[7px] font-semibold uppercase tracking-[.1em]">{item.status==="subscribed"?"Unsubscribe":"Resubscribe"}</button><button type="button" onClick={()=>remove(item)} className="text-[7px] font-semibold uppercase tracking-[.1em] text-[#cf1f2e]">Delete</button></div></div></article>)}</div>
  </>;
}
