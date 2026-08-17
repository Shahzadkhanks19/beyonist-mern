/**
 * Admin page for admin messages, including its data loading, actions, validation, and presentation state.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useState } from "react";
import { deleteAdminMessage, getAdminMessages, updateAdminMessage } from "../../services/adminApi.js";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AdminModal from "../../components/admin/AdminModal.jsx";
import AdminStatus from "../../components/admin/AdminStatus.jsx";
import AdminExportMenu from "../../components/admin/AdminExportMenu.jsx";

/**
 * Renders the Admin Messages component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminMessages(){
  const [filters,setFilters]=useState({q:"",status:""});
  const [items,setItems]=useState([]);
  const [selected,setSelected]=useState(null);
  const [message,setMessage]=useState("");
  /**
   * Loads load data for the current flow.
   */
  async function load(){const r=await getAdminMessages({...filters,limit:100});setItems(r.data||[])}
  useEffect(()=>{const t=setTimeout(()=>load().catch(e=>setMessage(e.message)),180);return()=>clearTimeout(t)},[filters.q,filters.status]);
  /**
   * Implements the status operation used by this module.
   */
  async function status(item,value){
    try{
      const r=await updateAdminMessage(item._id,value);
      setItems(xs=>xs.map(x=>x._id===item._id?r.data:x));
      setSelected(current=>current?._id===item._id?r.data:current);
      return r.data;
    }catch(e){
      setMessage(e.message);
      return null;
    }
  }
  /**
   * Removes the requested record from the current workflow.
   */
  async function remove(item){if(!window.confirm("Delete this contact message?"))return;try{await deleteAdminMessage(item._id);setSelected(null);await load()}catch(e){setMessage(e.message)}}
  return <>
    <AdminPageHeader eyebrow="Customer care / Inbox" title="Contact messages." copy="Every submission from the public contact form arrives here. Mark it read, replied or closed as you work through the inbox."/>
      <AdminExportMenu title="Contact Messages" rows={items} columns={[{label:"Name",value:"name"},{label:"Email",value:"email"},{label:"Phone",value:"phone"},{label:"Topic",value:"topic"},{label:"Status",value:"status"},{label:"Message",value:"message"},{label:"Created",value:"createdAt"}]} />
    <div className="mb-5 grid grid-cols-[1fr_210px] gap-3 max-[650px]:grid-cols-1"><input value={filters.q} onChange={e=>setFilters(v=>({...v,q:e.target.value}))} placeholder="Search messages…" className="border border-black/10 bg-[#f7f3ed] px-4 py-3.5 text-[9px] outline-none"/><select value={filters.status} onChange={e=>setFilters(v=>({...v,status:e.target.value}))} className="border border-black/10 bg-[#f7f3ed] px-4 py-3 text-[8px] uppercase"><option value="">All status</option><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="closed">Closed</option></select></div>
    {message?<p className="mb-4 text-[9px] text-[#cf1f2e]">{message}</p>:null}
    <div className="space-y-2">{items.map(item=><button key={item._id} onClick={async()=>{setSelected(item);if(item.status==="new"){const updated=await status(item,"read");if(updated)setSelected(updated)}}} className="grid w-full grid-cols-[160px_1fr_140px_auto] items-center gap-5 border border-black/10 bg-[#f7f3ed] p-4 text-left max-[850px]:grid-cols-1 max-[850px]:gap-3"><div><strong className="font-[Georgia] text-[19px] font-normal">{item.name}</strong><span className="mt-1 block text-[7px] text-black/65">{item.email}</span></div><div><span className="text-[7px] uppercase tracking-[.12em] text-[#cf1f2e]">{item.topic}</span><p className="mt-1 line-clamp-1 text-[8px] text-black/65">{item.message}</p></div><span className="text-[7px] text-black/65">{new Date(item.createdAt).toLocaleString("en-IN")}</span><AdminStatus value={item.status}/></button>)}</div>
    <AdminModal open={Boolean(selected)} title="Customer message" onClose={()=>setSelected(null)}>
      {selected?<div><div className="flex items-start justify-between gap-5 max-[520px]:flex-col"><div><span className="text-[6px] uppercase tracking-[.14em] text-[#cf1f2e]">{selected.topic}</span><h3 className="mt-2 font-[Georgia] text-[28px] font-normal">{selected.name}</h3><p className="mt-2 text-[8px] leading-5 text-black/65">{selected.email}<br/>{selected.phone||"No phone supplied"}</p></div><AdminStatus value={selected.status}/></div><p className="mt-7 whitespace-pre-wrap border-y border-black/10 py-6 text-[10px] leading-7">{selected.message}</p><div className="mt-5 grid grid-cols-4 gap-2 max-[600px]:grid-cols-2">{["new","read","replied","closed"].map(s=><button key={s} onClick={()=>status(selected,s)} className="border border-black/10 px-3 py-3 text-[7px] uppercase tracking-[.1em]">{s}</button>)}</div><div className="mt-5 flex gap-2"><a href={`mailto:${selected.email}`} className="flex-1 bg-[#cf1f2e] px-4 py-4 text-center text-[8px] font-semibold uppercase tracking-[.12em] text-white">Reply by email ↗</a><button onClick={()=>remove(selected)} className="border border-[#cf1f2e]/25 px-4 py-4 text-[8px] uppercase tracking-[.12em] text-[#cf1f2e]">Delete</button></div></div>:null}
    </AdminModal>
  </>;
}
