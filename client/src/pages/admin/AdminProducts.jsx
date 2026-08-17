/**
 * Admin page for admin products, including its data loading, actions, validation, and presentation state.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useState } from "react";
import { createAdminProduct, deleteAdminProduct, getAdminProducts, updateAdminProduct } from "../../services/adminApi.js";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AdminModal from "../../components/admin/AdminModal.jsx";
import AdminIcon from "../../components/admin/AdminIcon.jsx";
import AdminExportMenu from "../../components/admin/AdminExportMenu.jsx";
import { responsiveImageProps } from "../../utils/productImagePath.js";


const imageFallback = (event) => {
  if (event.currentTarget.dataset.fallbackApplied) return;
  event.currentTarget.dataset.fallbackApplied = "true";
  event.currentTarget.src = "/images/product-hamper.webp";
};
const empty = { name:"", slug:"", shortDescription:"", description:"", category:"", concern:"", price:"", compareAtPrice:"", stock:"0", badge:"", images:"", ingredients:"", howToUse:"", benefits:"", cautions:"", tags:"", isActive:true, isFeatured:false, featuredOrder:999 };
/**
 * Implements the lines operation used by this module.
 */
const lines = (value) => Array.isArray(value) ? value.join("\n") : value || "";

/**
 * Renders the Admin Products component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminProducts() {
  const [q,setQ]=useState("");
  const [items,setItems]=useState([]);
  const [editing,setEditing]=useState(null);
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState(empty);
  const [message,setMessage]=useState("");

  /**
   * Loads load data for the current flow.
   */
  async function load(){const r=await getAdminProducts({q});setItems(r.data||[])}
  useEffect(()=>{const t=setTimeout(()=>load().catch(e=>setMessage(e.message)),180);return()=>clearTimeout(t)},[q]);

  /**
   * Implements the open operation used by this module.
   */
  function open(product=null){
    setEditing(product);
    setModal(true);
    setForm(product ? {...product, images:lines(product.images),ingredients:lines(product.ingredients),howToUse:lines(product.howToUse),benefits:lines(product.benefits),cautions:lines(product.cautions),tags:lines(product.tags)} : empty);
    setMessage("");
  }

  /**
   * Implements the save operation used by this module.
   */
  async function save(e){
    e.preventDefault();
    try{
      const payload={...form};
      if(editing) await updateAdminProduct(editing._id,payload); else await createAdminProduct(payload);
      setModal(false);setEditing(null);setForm(empty);await load();
    }catch(err){setMessage(err.message)}
  }

  /**
   * Removes the requested record from the current workflow.
   */
  async function remove(product){
    if(!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try{await deleteAdminProduct(product._id);await load()}catch(e){setMessage(e.message)}
  }

  const field="border border-black/10 bg-white/55 px-3 py-3 text-[9px] outline-none focus:border-black";
  return (
    <>
      <AdminPageHeader eyebrow="CMS / Products" title="Products." copy="Create and edit the storefront catalogue. Product orders retain their original item snapshots even after later CMS edits." action={<button onClick={()=>open()} className="flex items-center gap-2 bg-[#cf1f2e] px-4 py-3 text-[7px] font-semibold uppercase tracking-[.12em] text-white"><AdminIcon name="plus" className="h-4 w-4"/> New product</button>}/>
      <AdminExportMenu title="Products" rows={items} columns={[{label:"Name",value:"name"},{label:"Slug",value:"slug"},{label:"Category",value:"category"},{label:"Price",value:"price"},{label:"Compare At",value:"compareAtPrice"},{label:"Stock",value:"stock"},{label:"Rating",value:"rating"},{label:"Reviews",value:"reviewCount"},{label:"Active",value:p=>p.isActive?"Yes":"No"}]} />
      <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search products…" className="mb-5 w-full border border-black/10 bg-[#f7f3ed] px-4 py-3.5 text-[9px] outline-none"/>
      {message && !editing ? <p className="mb-4 text-[9px] text-[#cf1f2e]">{message}</p> : null}
      <div className="grid grid-cols-4 gap-4 max-[1250px]:grid-cols-3 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
        {items.map((p)=><article key={p._id} className="border border-black/10 bg-[#f7f3ed]">
          <div className="aspect-square bg-[#eee9e1] p-4"><img onError={imageFallback} {...responsiveImageProps(p.images?.[0], "220px")} alt="" className="h-full w-full object-contain" width="480" height="480" loading="lazy" decoding="async"/></div>
          <div className="p-4"><div className="flex items-center justify-between text-[6px] uppercase tracking-[.12em] text-black/65"><span>{p.category}</span><span>{p.isActive?"Active":"Hidden"}</span></div><h2 className="mt-2 min-h-[48px] font-[Georgia] text-[21px] font-normal leading-[1.05]">{p.name}</h2><div className="mt-4 flex items-end justify-between"><strong className="text-[10px]">₹{Number(p.price).toLocaleString("en-IN")}</strong><span className="text-[7px] text-black/65">Stock {p.stock}</span></div><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={()=>open(p)} className="flex items-center justify-center gap-2 border border-black/10 py-2.5 text-[7px] uppercase tracking-[.1em]"><AdminIcon name="edit" className="h-3.5 w-3.5"/> Edit</button><button onClick={()=>remove(p)} className="flex items-center justify-center gap-2 border border-[#cf1f2e]/20 py-2.5 text-[7px] uppercase tracking-[.1em] text-[#cf1f2e]"><AdminIcon name="trash" className="h-3.5 w-3.5"/> Delete</button></div></div>
        </article>)}
      </div>

      <AdminModal open={modal} title={editing ? "Edit product" : "New product"} onClose={()=>{setModal(false);setEditing(null);setForm(empty);setMessage("")}} wide>
        <form onSubmit={save} className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
          {message ? <p className="col-span-full text-[9px] text-[#cf1f2e]">{message}</p>:null}
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Name</span><input required value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} className={`mt-2 w-full ${field}`}/></label>
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Slug</span><input value={form.slug} onChange={e=>setForm(v=>({...v,slug:e.target.value}))} placeholder="Auto-created if blank" className={`mt-2 w-full ${field}`}/></label>
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Category</span><input required value={form.category} onChange={e=>setForm(v=>({...v,category:e.target.value}))} className={`mt-2 w-full ${field}`}/></label>
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Concern</span><input value={form.concern} onChange={e=>setForm(v=>({...v,concern:e.target.value}))} className={`mt-2 w-full ${field}`}/></label>
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Price</span><input required type="number" min="0" value={form.price} onChange={e=>setForm(v=>({...v,price:e.target.value}))} className={`mt-2 w-full ${field}`}/></label>
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Compare at price</span><input type="number" min="0" value={form.compareAtPrice||""} onChange={e=>setForm(v=>({...v,compareAtPrice:e.target.value}))} className={`mt-2 w-full ${field}`}/></label>
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Stock</span><input type="number" min="0" value={form.stock} onChange={e=>setForm(v=>({...v,stock:e.target.value}))} className={`mt-2 w-full ${field}`}/></label>
          <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Badge</span><input value={form.badge||""} onChange={e=>setForm(v=>({...v,badge:e.target.value}))} className={`mt-2 w-full ${field}`}/></label>
          <label className="col-span-full"><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Short description</span><input value={form.shortDescription||""} onChange={e=>setForm(v=>({...v,shortDescription:e.target.value}))} className={`mt-2 w-full ${field}`}/></label>
          <label className="col-span-full"><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Description</span><textarea required rows="5" value={form.description||""} onChange={e=>setForm(v=>({...v,description:e.target.value}))} className={`mt-2 w-full resize-y ${field}`}/></label>
          {["images","ingredients","howToUse","benefits","cautions","tags"].map(key=><label key={key}><span className="text-[6px] uppercase tracking-[.12em] text-black/65">{key.replace(/([A-Z])/g," $1")}</span><textarea rows="5" value={form[key]||""} onChange={e=>setForm(v=>({...v,[key]:e.target.value}))} placeholder="One entry per line" className={`mt-2 w-full resize-y ${field}`}/></label>)}
          <div className="col-span-full flex flex-wrap gap-5 border-t border-black/10 pt-4 text-[8px]"><label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.isActive)} onChange={e=>setForm(v=>({...v,isActive:e.target.checked}))}/> Active</label><label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.isFeatured)} onChange={e=>setForm(v=>({...v,isFeatured:e.target.checked}))}/> Featured</label><label className="flex items-center gap-2">Featured order <input type="number" min="0" value={form.featuredOrder||999} onChange={e=>setForm(v=>({...v,featuredOrder:e.target.value}))} className="w-20 border border-black/10 bg-white px-2 py-1"/></label></div>
          <button className="col-span-full bg-[#cf1f2e] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] text-white">{editing?"Save product":"Create product"}</button>
        </form>
      </AdminModal>
    </>
  );
}
