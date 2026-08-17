/** Secure email review page for delivered guest or customer orders. */
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getReviewInvite, submitInvitedOrderReview, submitInvitedProductReview } from "../services/reviewApi.js";

function ReviewForm({ title, subtitle, initial, onSave }) {
  const [rating, setRating] = useState(initial?.rating || 5);
  const [headline, setHeadline] = useState(initial?.title || "");
  const [body, setBody] = useState(initial?.body || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save() {
    try {
      setBusy(true); setMessage("");
      await onSave({ rating, title: headline, body });
      setMessage("Thank you. Your verified review has been sent for moderation.");
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  return <article className="border border-black/10 bg-[#ffffff]">
    <div className="border-b border-black/10 p-5"><span className="text-[7px] uppercase tracking-[.14em] text-[#d13c3c]">Verified purchase</span><h2 className="mt-2 font-[Georgia] text-[27px] font-normal">{title}</h2><p className="mt-2 text-[9px] text-black/65">{subtitle}</p></div>
    <div className="p-5"><div className="flex gap-2">{[1,2,3,4,5].map((n)=><button type="button" key={n} onClick={()=>setRating(n)} className={`grid h-11 w-11 place-items-center border text-[19px] ${n<=rating?"border-[#fbbc04] bg-[#fbbc04] text-white":"border-black/10 text-black/20"}`}>★</button>)}</div></div>
    <label className="block border-t border-black/10 p-5"><span className="text-[7px] uppercase tracking-[.12em] text-black/65">Headline</span><input value={headline} onChange={e=>setHeadline(e.target.value)} className="mt-3 w-full bg-transparent font-[Georgia] text-[22px] outline-none" placeholder="Sum it up" /></label>
    <label className="block border-t border-black/10 p-5"><span className="text-[7px] uppercase tracking-[.12em] text-black/65">Your review</span><textarea value={body} onChange={e=>setBody(e.target.value)} rows="4" className="mt-3 w-full resize-none bg-transparent font-[Georgia] text-[20px] leading-[1.4] outline-none" placeholder="Tell us what stood out..." /></label>
    {message?<p className="border-t border-black/10 px-5 py-3 text-[8px] text-[#3b7644]">{message}</p>:null}
    <button type="button" disabled={busy} onClick={save} className="flex w-full items-center justify-between bg-black px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] text-white disabled:opacity-50"><span>{busy?"Sending...":"Submit review"}</span><span>↗</span></button>
  </article>;
}

export default function ReviewOrder() {
  const [params] = useSearchParams();
  const order = params.get("order") || "";
  const token = params.get("token") || "";
  const [data,setData]=useState(null); const [error,setError]=useState("");
  useEffect(()=>{ if(!order||!token){setError("This review link is incomplete.");return;} getReviewInvite(order,token).then(r=>setData(r.data)).catch(e=>setError(e.message)); },[order,token]);
  if(error) return <main className="grid min-h-[65vh] place-items-center bg-[#fffaf1] px-6 text-center"><div><span className="text-[8px] uppercase tracking-[.16em] text-[#d13c3c]">Review link</span><h1 className="mt-5 font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal">This link can’t be used.</h1><p className="mt-5 text-black/65">{error}</p><Link to="/" className="mt-7 inline-block bg-black px-6 py-4 text-[8px] uppercase tracking-[.14em] text-white">Return home</Link></div></main>;
  if(!data) return <main className="min-h-[65vh] animate-pulse bg-[#fffaf1]"/>;
  return <main className="bg-[#fffaf1] px-[clamp(20px,5vw,78px)] py-[clamp(50px,7vw,90px)]"><div className="mx-auto max-w-[1180px]"><span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Delivered / {data.orderNumber}</span><h1 className="mt-5 max-w-[900px] font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.9]">Rate the ritual.<br/><em className="font-normal text-[#d13c3c]">Product by product.</em></h1><p className="mt-6 max-w-[650px] text-[11px] leading-6 text-black/65">Hi {data.customerName}. Each product can be reviewed separately, and you can leave one overall order review. Reviews are moderated before publication.</p>
    <div className="mt-10 grid grid-cols-2 gap-5 max-[760px]:grid-cols-1"><ReviewForm title="Overall order" subtitle="Packaging, delivery and your complete Beyonist experience." initial={data.orderReview} onSave={(review)=>submitInvitedOrderReview({...review,orderNumber:data.orderNumber,token})}/>{data.items.map(item=><ReviewForm key={item.slug} title={item.name} subtitle="Your experience with this purchased formula." initial={item.review} onSave={(review)=>submitInvitedProductReview({...review,orderNumber:data.orderNumber,token,productSlug:item.slug})}/>)}</div></div></main>;
}
