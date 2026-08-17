/**
 * Full editorial CMS for The Edit with structured article blocks, live preview,
 * publishing controls and SEO metadata.
 */
import { useEffect, useState } from "react";
import { createAdminPost, deleteAdminPost, getAdminPosts, updateAdminPost } from "../../services/adminApi.js";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AdminModal from "../../components/admin/AdminModal.jsx";
import AdminIcon from "../../components/admin/AdminIcon.jsx";
import AdminExportMenu from "../../components/admin/AdminExportMenu.jsx";
import BlogContentRenderer from "../../components/BlogContentRenderer.jsx";
import { responsiveImageProps } from "../../utils/productImagePath.js";

const categories = ["Serum Notes", "Daily Ritual", "Cleansing", "Formula Focus", "Skin Education", "Beyonist Journal"];
const blockOptions = [["paragraph","Paragraph"],["heading2","Heading 2"],["heading3","Heading 3"],["quote","Quote"],["bullets","Bullet list"],["numbered","Numbered list"],["image","Image"],["divider","Divider"]];

const makeBlock = (type="paragraph") => ({ id:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`, type, text:"", items:[""], url:"", alt:"", caption:"" });
const blank = { title:"",slug:"",excerpt:"",content:"",contentBlocks:[makeBlock()],category:"Beyonist Journal",tags:[],image:"",imageAlt:"",author:"Beyonist Editorial",readingTime:4,seoTitle:"",seoDescription:"",featured:false,published:false,publishedAt:"" };

function formFrom(post){
  if(!post) return {...blank,contentBlocks:[makeBlock()]};
  return {...blank,...post,tags:Array.isArray(post.tags)?post.tags:[],contentBlocks:Array.isArray(post.contentBlocks)&&post.contentBlocks.length?post.contentBlocks.map(b=>({...b,id:b.id||makeBlock(b.type).id})):post.content?[{...makeBlock(),text:post.content}]:[makeBlock()],publishedAt:post.publishedAt?new Date(post.publishedAt).toISOString().slice(0,16):""};
}

export default function AdminBlogs(){
  const [q,setQ]=useState(""); const [items,setItems]=useState([]); const [modal,setModal]=useState(false); const [editing,setEditing]=useState(null); const [form,setForm]=useState(formFrom()); const [message,setMessage]=useState(""); const [preview,setPreview]=useState(false);
  async function load(){const r=await getAdminPosts({q});setItems(r.data||[])}
  useEffect(()=>{const timer=setTimeout(()=>load().catch(e=>setMessage(e.message)),180);return()=>clearTimeout(timer)},[q]);
  function open(post=null){setEditing(post);setForm(formFrom(post));setPreview(false);setMessage("");setModal(true)}
  function change(name,value){setForm(v=>({...v,[name]:value}))}
  function updateBlock(index,patch){setForm(v=>({...v,contentBlocks:v.contentBlocks.map((b,i)=>i===index?{...b,...patch}:b)}))}
  function addBlock(type){setForm(v=>({...v,contentBlocks:[...v.contentBlocks,makeBlock(type)]}))}
  function removeBlock(index){setForm(v=>({...v,contentBlocks:v.contentBlocks.filter((_,i)=>i!==index)}))}
  function moveBlock(index,direction){setForm(v=>{const next=[...v.contentBlocks];const target=index+direction;if(target<0||target>=next.length)return v;[next[index],next[target]]=[next[target],next[index]];return {...v,contentBlocks:next}})}
  async function save(e){e.preventDefault();setMessage("");try{const payload={...form,content:form.contentBlocks.filter(b=>b.type!=="image"&&b.type!=="divider").map(b=>b.text||(b.items||[]).join(" ")).filter(Boolean).join("\\n\\n"),readingTime:Number(form.readingTime)||1,publishedAt:form.publishedAt||undefined};if(editing)await updateAdminPost(editing._id,payload);else await createAdminPost(payload);setModal(false);await load()}catch(err){setMessage(err.message)}}
  async function remove(post){if(!window.confirm(`Delete "${post.title}"?`))return;try{await deleteAdminPost(post._id);await load()}catch(err){setMessage(err.message)}}
  const field="border border-black/10 bg-white px-3 py-3 text-[9px] outline-none focus:border-black";
  return <>
    <AdminPageHeader eyebrow="CMS / The Edit" title="Editorial studio." copy="Write, structure, preview and publish complete Beyonist stories." action={<button type="button" onClick={()=>open()} className="flex items-center gap-2 bg-[#cf1f2e] px-4 py-3 text-[7px] font-semibold uppercase tracking-[.12em] text-white"><AdminIcon name="plus" className="h-4 w-4"/> New story</button>}/>
    <AdminExportMenu title="Blog Stories" rows={items} columns={[{label:"Title",value:"title"},{label:"Slug",value:"slug"},{label:"Category",value:"category"},{label:"Author",value:"author"},{label:"Published",value:p=>p.published?"Yes":"No"}]} />
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search stories…" className="mb-5 w-full border border-black/10 bg-[#f7f3ed] px-4 py-3.5 text-[9px] outline-none"/>
    {message&&!modal?<p className="mb-4 text-[9px] text-[#cf1f2e]">{message}</p>:null}
    <div className="grid grid-cols-3 gap-4 max-[1000px]:grid-cols-2 max-[650px]:grid-cols-1">{items.map(post=><article key={post._id} className="border border-black/10 bg-[#f7f3ed]"><div className="aspect-[1.4] bg-[#eee9e1]">{post.image?<img {...responsiveImageProps(post.image, "(max-width:650px) 88vw, (max-width:1000px) 44vw, 30vw")} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" width="800" height="570"/>:null}</div><div className="p-5"><div className="flex justify-between text-[6px] uppercase tracking-[.13em] text-black/65"><span>{post.category}</span><span>{post.published?"Published":"Draft"}</span></div><h2 className="mt-3 font-[Georgia] text-[25px] leading-[1.02]">{post.title}</h2><p className="mt-3 line-clamp-2 text-[8px] leading-5 text-black/65">{post.excerpt}</p><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={()=>open(post)} className="border border-black/10 py-2.5 text-[7px] uppercase">Edit</button><button type="button" onClick={()=>remove(post)} className="border border-[#cf1f2e]/20 py-2.5 text-[7px] uppercase text-[#cf1f2e]">Delete</button></div></div></article>)}</div>

    <AdminModal open={modal} title={editing?"Edit story":"Create story"} onClose={()=>setModal(false)} wide>
      <form onSubmit={save} className="space-y-5">
        {message?<p className="text-[9px] text-[#cf1f2e]">{message}</p>:null}
        <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
          <label><span className="text-[7px] uppercase text-black/65">Title</span><input required value={form.title} onChange={e=>change("title",e.target.value)} className={`mt-2 w-full ${field}`}/></label>
          <label><span className="text-[7px] uppercase text-black/65">Slug</span><input value={form.slug} onChange={e=>change("slug",e.target.value)} placeholder="Auto if blank" className={`mt-2 w-full ${field}`}/></label>
          <label><span className="text-[7px] uppercase text-black/65">Category</span><select value={form.category} onChange={e=>change("category",e.target.value)} className={`mt-2 w-full ${field}`}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
          <label><span className="text-[7px] uppercase text-black/65">Author</span><input value={form.author} onChange={e=>change("author",e.target.value)} className={`mt-2 w-full ${field}`}/></label>
          <label><span className="text-[7px] uppercase text-black/65">Reading time</span><input type="number" min="1" value={form.readingTime} onChange={e=>change("readingTime",e.target.value)} className={`mt-2 w-full ${field}`}/></label>
          <label><span className="text-[7px] uppercase text-black/65">Publish date</span><input type="datetime-local" value={form.publishedAt} onChange={e=>change("publishedAt",e.target.value)} className={`mt-2 w-full ${field}`}/></label>
        </div>
        <label className="block"><span className="text-[7px] uppercase text-black/65">Excerpt</span><textarea required maxLength="320" rows="3" value={form.excerpt} onChange={e=>change("excerpt",e.target.value)} className={`mt-2 w-full ${field}`}/><small className="text-[7px] text-black/65">{form.excerpt.length}/320</small></label>
        <div className="grid grid-cols-[1fr_180px] gap-4 max-[700px]:grid-cols-1"><label><span className="text-[7px] uppercase text-black/65">Hero image URL</span><input required value={form.image} onChange={e=>change("image",e.target.value)} className={`mt-2 w-full ${field}`}/></label><div className="aspect-[1.4] bg-[#eee9e1]">{form.image?<img {...responsiveImageProps(form.image, "180px")} alt="" className="h-full w-full object-contain" loading="lazy" decoding="async" width="480" height="480"/>:null}</div></div>
        <label className="block"><span className="text-[7px] uppercase text-black/65">Hero image alt text</span><input value={form.imageAlt} onChange={e=>change("imageAlt",e.target.value)} className={`mt-2 w-full ${field}`}/></label>
        <label className="block"><span className="text-[7px] uppercase text-black/65">Tags</span><input value={form.tags.join(", ")} onChange={e=>change("tags",e.target.value.split(",").map(x=>x.trim()).filter(Boolean))} placeholder="hydration, routine, serum" className={`mt-2 w-full ${field}`}/></label>

        <section className="border border-black/10 bg-[#f7f3ed]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 p-4"><div><strong className="font-[Georgia] text-[22px] font-normal">Article body</strong><p className="mt-1 text-[7px] text-black/65">Structured blocks keep formatting consistent and safe.</p></div><button type="button" onClick={()=>setPreview(v=>!v)} className="border border-black px-4 py-2 text-[7px] uppercase">{preview?"Edit blocks":"Live preview"}</button></div>
          {preview?<div className="bg-white p-[clamp(20px,5vw,50px)]"><BlogContentRenderer blocks={form.contentBlocks}/></div>:<div className="space-y-3 p-4">{form.contentBlocks.map((block,index)=><div key={block.id} className="border border-black/10 bg-white p-4"><div className="mb-3 flex flex-wrap items-center gap-2"><select value={block.type} onChange={e=>updateBlock(index,{type:e.target.value,items:[""]})} className={field}>{blockOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select><span className="ml-auto text-[7px] text-black/65">#{index+1}</span><button type="button" onClick={()=>moveBlock(index,-1)} className="border px-2 py-1">↑</button><button type="button" onClick={()=>moveBlock(index,1)} className="border px-2 py-1">↓</button><button type="button" onClick={()=>removeBlock(index)} className="border border-[#cf1f2e]/20 px-2 py-1 text-[#cf1f2e]">×</button></div>
            {["paragraph","heading2","heading3","quote"].includes(block.type)?<textarea rows={block.type==="paragraph"?5:2} value={block.text||""} onChange={e=>updateBlock(index,{text:e.target.value})} className={`w-full resize-y ${field}`}/>:null}
            {["bullets","numbered"].includes(block.type)?<textarea rows="5" value={(block.items||[]).join("\\n")} onChange={e=>updateBlock(index,{items:e.target.value.split("\\n")})} placeholder="One list item per line" className={`w-full ${field}`}/>:null}
            {block.type==="image"?<div className="grid gap-2"><input value={block.url||""} onChange={e=>updateBlock(index,{url:e.target.value})} placeholder="Image URL" className={field}/><input value={block.alt||""} onChange={e=>updateBlock(index,{alt:e.target.value})} placeholder="Alt text" className={field}/><input value={block.caption||""} onChange={e=>updateBlock(index,{caption:e.target.value})} placeholder="Caption (optional)" className={field}/></div>:null}
            {block.type==="divider"?<div className="my-5 border-t border-black/20"/>:null}
          </div>)}
          <div className="flex flex-wrap gap-2 border-t border-black/10 pt-4">{blockOptions.map(([type,label])=><button key={type} type="button" onClick={()=>addBlock(type)} className="border border-black/10 bg-white px-3 py-2 text-[7px] uppercase">+ {label}</button>)}</div></div>}
        </section>

        <section className="grid grid-cols-2 gap-4 border border-black/10 p-4 max-[700px]:grid-cols-1"><label><span className="text-[7px] uppercase text-black/65">SEO title</span><input maxLength="70" value={form.seoTitle} onChange={e=>change("seoTitle",e.target.value)} className={`mt-2 w-full ${field}`}/><small className="text-[7px] text-black/65">{form.seoTitle.length}/70</small></label><label><span className="text-[7px] uppercase text-black/65">SEO description</span><textarea maxLength="180" rows="3" value={form.seoDescription} onChange={e=>change("seoDescription",e.target.value)} className={`mt-2 w-full ${field}`}/><small className="text-[7px] text-black/65">{form.seoDescription.length}/180</small></label></section>

        <div className="flex flex-wrap gap-5 border-t border-black/10 pt-4 text-[8px]"><label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.published)} onChange={e=>change("published",e.target.checked)}/> Published</label><label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.featured)} onChange={e=>change("featured",e.target.checked)}/> Featured</label></div>
        <button className="w-full bg-[#cf1f2e] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] text-white">{editing?"Save story":form.published?"Publish story":"Save draft"}</button>
      </form>
    </AdminModal>
  </>;
}
