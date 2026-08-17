/**
 * Admin page for admin settings, including its data loading, actions, validation, and presentation state.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useState } from "react";
import { getAdminCommerceSettings, getAdminSettings, updateAdminCommerceSettings, updateAdminPassword, updateAdminProfile } from "../../services/adminApi.js";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";

/**
 * Renders the Admin Settings component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminSettings(){
  const { refresh, logout } = useAdminAuth();
  const [profile,setProfile]=useState({name:"",email:"",currentPassword:""});
  const [password,setPassword]=useState({currentPassword:"",newPassword:"",confirmPassword:""});
  const [commerce,setCommerce]=useState({deliveryEnabled:true,standardDeliveryPrice:79,freeDeliveryEnabled:true,freeDeliveryThreshold:999,taxEnabled:false,taxRate:0,taxMode:"inclusive"});
  const [profileMessage,setProfileMessage]=useState("");
  const [passwordMessage,setPasswordMessage]=useState("");
  const [commerceMessage,setCommerceMessage]=useState("");
  const [commerceSaving,setCommerceSaving]=useState(false);

  useEffect(()=>{
    getAdminSettings().then(r=>setProfile(v=>({...v,name:r.data.name,email:r.data.email}))).catch(e=>setProfileMessage(e.message));
    getAdminCommerceSettings().then(r=>setCommerce(r.data)).catch(e=>setCommerceMessage(e.message));
  },[]);

  /**
   * Implements the save profile operation used by this module.
   */
  async function saveProfile(e){e.preventDefault();try{await updateAdminProfile(profile);setProfile(v=>({...v,currentPassword:""}));setProfileMessage("Admin profile updated.");await refresh()}catch(err){setProfileMessage(err.message)}}
  /**
   * Implements the save password operation used by this module.
   */
  async function savePassword(e){e.preventDefault();if(password.newPassword!==password.confirmPassword){setPasswordMessage("New passwords do not match.");return}try{const r=await updateAdminPassword({currentPassword:password.currentPassword,newPassword:password.newPassword});setPasswordMessage(r.message);setTimeout(async()=>{await logout();window.location.assign("/admin/login")},800)}catch(err){setPasswordMessage(err.message)}}
  /**
   * Implements the save commerce operation used by this module.
   */
  async function saveCommerce(e){
    e.preventDefault();
    setCommerceMessage("");
    setCommerceSaving(true);

    try {
      const payload = {
        deliveryEnabled: Boolean(commerce.deliveryEnabled),
        standardDeliveryPrice: Number(commerce.standardDeliveryPrice || 0),
        freeDeliveryEnabled: Boolean(commerce.freeDeliveryEnabled),
        freeDeliveryThreshold: Number(commerce.freeDeliveryThreshold || 0),
        taxEnabled: Boolean(commerce.taxEnabled),
        taxRate: Number(commerce.taxRate || 0),
        taxMode: commerce.taxMode,
      };

      const r = await updateAdminCommerceSettings(payload);
      setCommerce(r.data);
      setCommerceMessage(r.message || "Commerce pricing updated.");
    } catch(err) {
      setCommerceMessage(err.message);
    } finally {
      setCommerceSaving(false);
    }
  }

  const field="mt-2 w-full border border-black/10 bg-white/55 px-4 py-3 text-[9px] outline-none focus:border-black";
  return <>
    <AdminPageHeader eyebrow="Administration / Settings" title="Admin settings." copy="Administrator identity, security, delivery and tax configuration."/>

    {/* Section 1: Commerce / 01. */}

    <section className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
      <form onSubmit={saveCommerce} className="col-span-full border border-black/10 bg-[#f7f3ed] p-6 max-[600px]:p-4">
        <span className="text-[6px] uppercase tracking-[.15em] text-[#cf1f2e]">Commerce / 01</span>
        <div className="mt-2 grid grid-cols-[.8fr_1.2fr] gap-10 max-[900px]:grid-cols-1">
          <div><h2 className="font-[Georgia] text-[32px] font-normal">Delivery & tax.</h2><p className="mt-3 max-w-[430px] text-[8px] leading-5 text-black/65">These are live pricing rules. Checkout previews them, but the server recalculates every order before saving it.</p>{commerceMessage?<p className="mt-4 text-[8px] text-[#cf1f2e]">{commerceMessage}</p>:null}</div>
          <div className="grid grid-cols-2 gap-4 max-[650px]:grid-cols-1">
            <label className="flex items-center justify-between border border-black/10 p-4 text-[8px]"><span>Delivery enabled</span><input type="checkbox" checked={Boolean(commerce.deliveryEnabled)} onChange={e=>setCommerce(v=>({...v,deliveryEnabled:e.target.checked}))}/></label>
            <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Standard delivery price</span><input type="number" min="0" value={commerce.standardDeliveryPrice} onChange={e=>setCommerce(v=>({...v,standardDeliveryPrice:e.target.value}))} className={field}/></label>
            <label className="flex items-center justify-between border border-black/10 p-4 text-[8px]"><span>Free delivery enabled</span><input type="checkbox" checked={Boolean(commerce.freeDeliveryEnabled)} onChange={e=>setCommerce(v=>({...v,freeDeliveryEnabled:e.target.checked}))}/></label>
            <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Free delivery threshold</span><input type="number" min="0" value={commerce.freeDeliveryThreshold} onChange={e=>setCommerce(v=>({...v,freeDeliveryThreshold:e.target.value}))} className={field}/></label>
            <label className="flex items-center justify-between border border-black/10 p-4 text-[8px]"><span>Tax enabled</span><input type="checkbox" checked={Boolean(commerce.taxEnabled)} onChange={e=>setCommerce(v=>({...v,taxEnabled:e.target.checked}))}/></label>
            <label><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Tax rate %</span><input type="number" min={0} max={100} step="0.01" value={commerce.taxRate} onChange={e=>setCommerce(v=>({...v,taxRate:e.target.value}))} className={field}/><span className="mt-1 block text-[6.5px] leading-4 text-black/65">{commerce.taxEnabled ? "Required while tax is enabled." : "Tax is currently disabled."}</span></label>
            <label className="col-span-full"><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Tax mode</span><select value={commerce.taxMode} onChange={e=>setCommerce(v=>({...v,taxMode:e.target.value}))} className={field}><option value="inclusive">Inclusive — product prices already contain tax</option><option value="exclusive">Exclusive — tax added at checkout</option></select></label>
            <button disabled={commerceSaving} className="col-span-full bg-[#cf1f2e] px-4 py-4 text-[8px] font-semibold uppercase tracking-[.13em] text-white disabled:cursor-wait disabled:opacity-55">{commerceSaving ? "Saving pricing…" : "Save commerce pricing"}</button>
          </div>
        </div>
      </form>

      <form onSubmit={saveProfile} className="border border-black/10 bg-[#f7f3ed] p-6 max-[600px]:p-4"><span className="text-[6px] uppercase tracking-[.15em] text-[#cf1f2e]">Profile / 02</span><h2 className="mt-2 font-[Georgia] text-[30px] font-normal">Identity.</h2><p className="mt-3 text-[8px] leading-5 text-black/65">Changing the administrator email requires your current password.</p>{profileMessage?<p className="mt-4 text-[8px] text-[#cf1f2e]">{profileMessage}</p>:null}<label className="mt-6 block"><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Name</span><input required value={profile.name} onChange={e=>setProfile(v=>({...v,name:e.target.value}))} className={field}/></label><label className="mt-4 block"><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Admin email</span><input required type="email" value={profile.email} onChange={e=>setProfile(v=>({...v,email:e.target.value}))} className={field}/></label><label className="mt-4 block"><span className="text-[6px] uppercase tracking-[.12em] text-black/65">Current password</span><input type="password" value={profile.currentPassword} onChange={e=>setProfile(v=>({...v,currentPassword:e.target.value}))} className={field}/></label><button className="mt-6 w-full bg-black px-4 py-4 text-[8px] font-semibold uppercase tracking-[.13em] text-white">Save profile</button></form>

      <form onSubmit={savePassword} className="border border-black/10 bg-[#0b0b0b] p-6 text-white max-[600px]:p-4"><span className="text-[6px] uppercase tracking-[.15em] text-[#cf1f2e]">Security / 03</span><h2 className="mt-2 font-[Georgia] text-[30px] font-normal">Change password.</h2><p className="mt-3 text-[8px] leading-5 text-white/90">A successful password change revokes every admin session.</p>{passwordMessage?<p className="mt-4 text-[8px] text-[#ef6b75]">{passwordMessage}</p>:null}{[["currentPassword","Current password"],["newPassword","New password"],["confirmPassword","Confirm new password"]].map(([key,label])=><label key={key} className="mt-4 block"><span className="text-[6px] uppercase tracking-[.12em] text-white/90">{label}</span><input required type="password" value={password[key]} onChange={e=>setPassword(v=>({...v,[key]:e.target.value}))} className="mt-2 w-full border border-white/10 bg-white/[.05] px-4 py-3 text-[9px] outline-none focus:border-white/40"/></label>)}<button className="mt-6 w-full bg-[#cf1f2e] px-4 py-4 text-[8px] font-semibold uppercase tracking-[.13em]">Change password</button></form>
    </section>
  </>;
}
