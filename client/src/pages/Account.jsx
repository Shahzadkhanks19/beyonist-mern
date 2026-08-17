/**
 * Customer-facing Account page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  changePassword,
  createAddress,
  createReview,
  createOrderReview,
  deleteAddress,
  deleteReview,
  deleteOrderReview,
  getAddresses,
  getCustomerDashboard,
  getCustomerOrders,
  getCustomerInvoice,
  getReviews,
  getWishlist,
  updateAddress,
  updateProfile,
  updateReview,
  updateOrderReview,
} from "../services/customerApi.js";
import { printOrderBill } from "../utils/printOrderBill.js";
import { responsiveImageProps } from "../utils/productImagePath.js";

const TABS = [
  ["overview", "Overview"],
  ["orders", "Orders"],
  ["wishlist", "Wishlist"],
  ["addresses", "Saved Addresses"],
  ["reviews", "My Reviews"],
  ["benefits", "Benefits & Offers"],
  ["profile", "Profile & Preferences"],
  ["security", "Security"],
];

const EMPTY_ADDRESS = {
  label: "Home",
  name: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "Haryana",
  postalCode: "",
  isDefault: false,
};

/**
 * Implements the pretty status operation used by this module.
 */
function prettyStatus(status = "") {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * Renders the Dashboard Sidebar component and coordinates the state/behavior owned by this UI boundary.
 */
function DashboardSidebar({ customer, tab, setTab, logout }) {
  const firstName = customer.name.split(" ")[0];
  const icons = {
    overview: "⌂",
    orders: "▣",
    wishlist: "♥",
    addresses: "⌖",
    reviews: "★",
    benefits: "%",
    profile: "○",
    security: "⌁",
  };

  return (
    <aside className="customer-panel h-fit overflow-hidden rounded-sm lg:sticky lg:top-[112px]">
      <div className="bg-[#d13c3c] p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white font-[Georgia] text-[22px] text-[#d13c3c]">{firstName[0]?.toUpperCase()}</div>
          <div className="min-w-0">
            <span className="block text-[7px] uppercase tracking-[.14em] text-white/90">My Beyonist</span>
            <strong className="mt-1 block truncate font-[Georgia] text-[22px] font-normal">{customer.name}</strong>
          </div>
        </div>
      </div>

      <nav className="p-2 max-[960px]:flex max-[960px]:gap-1 max-[960px]:overflow-x-auto max-[960px]:[scrollbar-width:none] max-[960px]:[&_button]:shrink-0">
        {TABS.map(([key,label])=>(
          <button
            type="button"
            key={key}
            onClick={()=>setTab(key)}
            className={`flex w-full items-center gap-3 rounded-sm px-3 py-3 text-left text-[9px] font-semibold transition ${
              tab===key ? "bg-[#fff2ef] text-[#d13c3c]" : "text-black/58 hover:bg-black/[.035] hover:text-black"
            }`}
          >
            <span className={`grid h-7 w-7 place-items-center rounded-full text-[12px] ${tab===key?"bg-[#d13c3c] text-white":"bg-black/[.045] text-black/65"}`}>{icons[key]}</span>
            <span className="whitespace-nowrap">{label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-black/10 p-3">
        <button type="button" onClick={logout} className="flex w-full items-center justify-between px-3 py-3 text-[8px] font-semibold uppercase tracking-[.1em] text-black/65 transition hover:text-[#d13c3c]"><span>Sign out</span><span>→</span></button>
      </div>
    </aside>
  );
}

/**
 * Renders the Stat Card component and coordinates the state/behavior owned by this UI boundary.
 */
function StatCard({ label, value, note }) {
  return (
    <div className="customer-panel rounded-sm p-5">
      <span className="text-[7px] font-semibold uppercase tracking-[.12em] text-black/65">{label}</span>
      <div className="mt-2 flex items-end justify-between gap-4">
        <strong className="font-[Georgia] text-[34px] font-normal leading-none">{value}</strong>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#fff2ef] text-[#d13c3c]">↗</span>
      </div>
      <p className="mt-3 text-[8px] leading-4 text-black/65">{note}</p>
    </div>
  );
}

/**
 * Renders the Order Card component and coordinates the state/behavior owned by this UI boundary.
 */
function OrderCard({ order, onInvoice, onOrderReview, onProductReview }) {
  return (
    <article className="overflow-hidden border border-black/10 bg-[#ffffff]">
      <div className="flex items-start justify-between gap-5 border-b border-black/10 p-5 max-[620px]:flex-col">
        <div>
          <span className="text-[6px] uppercase tracking-[.14em] text-black/65">
            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          <h3 className="mt-2 font-[Georgia] text-[26px] font-normal">{order.orderNumber}</h3>
        </div>
        <div className="text-right max-[620px]:text-left">
          <span className={`inline-flex px-3 py-2 text-[7px] font-semibold uppercase tracking-[.12em] ${order.status === "cancelled" ? "bg-black/10 text-black/65" : "bg-[#d13c3c] text-white"}`}>{prettyStatus(order.status)}</span>
          <strong className="mt-3 block font-[Georgia] text-[22px] font-normal">₹{Number(order.total).toLocaleString("en-IN")}</strong>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-5 p-5 max-[700px]:grid-cols-1">
        <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {order.items.map((item) => (
            <Link key={`${order.orderNumber}-${item.slug}`} to={`/product/${item.slug}`} className="relative grid h-[84px] w-[84px] shrink-0 place-items-center bg-[#eee6dc]">
              <img {...responsiveImageProps(item.image || "/images/product-hamper.webp", "96px")} alt={item.name} width="800" height="800" className="h-full w-full object-contain p-1" loading="lazy" decoding="async"/>
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-black px-1 text-[7px] text-white">{item.quantity}</span>
            </Link>
          ))}
        </div>
        <div className="flex self-end gap-2 max-[520px]:grid max-[520px]:w-full max-[520px]:grid-cols-1">
          <Link to={`/track-order?order=${encodeURIComponent(order.orderNumber)}`} className="bg-black px-5 py-3 text-center text-[7px] font-semibold uppercase tracking-[.13em] text-white">Track order ↗</Link>
          {order.status === "delivered" ? <>
            <button type="button" onClick={() => onInvoice?.(order)} className="border border-black px-5 py-3 text-[7px] font-semibold uppercase tracking-[.13em]">Download invoice ↓</button>
            <button type="button" onClick={() => onProductReview?.(order)} className="border border-[#d13c3c] px-5 py-3 text-[7px] font-semibold uppercase tracking-[.13em] text-[#d13c3c]">Review products ★</button>
            <button type="button" onClick={() => onOrderReview?.(order)} className="bg-[#d13c3c] px-5 py-3 text-[7px] font-semibold uppercase tracking-[.13em] text-white">Rate order ★</button>
          </> : null}
        </div>
      </div>
    </article>
  );
}

/**
 * Renders the Address Editor component and coordinates the state/behavior owned by this UI boundary.
 */
function AddressEditor({ initial, onCancel, onSave, busy }) {
  const [form, setForm] = useState(initial || EMPTY_ADDRESS);
  /**
   * Implements the set operation used by this module.
   */
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="border border-black/10 bg-[#ffffff]">
      <div className="flex items-center justify-between bg-[#111] px-5 py-4 text-white">
        <span className="text-[7px] font-semibold uppercase tracking-[.14em] text-[#d13c3c]">{initial?._id ? "Edit saved address" : "Add saved address"}</span>
        <button type="button" onClick={onCancel} className="text-[7px] uppercase tracking-[.12em]">Close ×</button>
      </div>
      <div className="grid grid-cols-2 max-[620px]:grid-cols-1">
        {[
          ["label", "Label", "Home"],
          ["name", "Recipient name", "Full name"],
          ["phone", "Mobile number", "9876543210"],
          ["postalCode", "PIN code", "122001"],
          ["city", "City", "Gurugram"],
          ["state", "State", "Haryana"],
        ].map(([key, label, placeholder]) => (
          <label key={key} className="border-b border-r border-black/10 p-5 max-[620px]:border-r-0">
            <span className="text-[6px] font-semibold uppercase tracking-[.14em] text-black/65">{label}</span>
            <input value={form[key] || ""} onChange={(e) => set(key, key === "phone" || key === "postalCode" ? e.target.value.replace(/\D/g, "") : e.target.value)} placeholder={placeholder} className="mt-3 w-full bg-transparent font-[Georgia] text-[21px] outline-none placeholder:text-black/60" />
          </label>
        ))}
      </div>

      {[
        ["addressLine1", "Address line 1", "House / flat / street"],
        ["addressLine2", "Address line 2", "Area / landmark (optional)"],
      ].map(([key, label, placeholder]) => (
        <label key={key} className="block border-b border-black/10 p-5">
          <span className="text-[6px] font-semibold uppercase tracking-[.14em] text-black/65">{label}</span>
          <input value={form[key] || ""} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className="mt-3 w-full bg-transparent font-[Georgia] text-[21px] outline-none placeholder:text-black/60" />
        </label>
      ))}

      <button type="button" onClick={() => set("isDefault", !form.isDefault)} className="flex w-full items-center gap-3 border-b border-black/10 p-5 text-left">
        <span className={`grid h-5 w-5 place-items-center border ${form.isDefault ? "border-[#d13c3c] bg-[#d13c3c] text-white" : "border-black/20 text-transparent"}`}>✓</span>
        <span className="text-[8px] font-semibold uppercase tracking-[.12em]">Use as default checkout address</span>
      </button>

      <button type="button" disabled={busy} onClick={() => onSave(form)} className="flex w-full items-center justify-between bg-[#d13c3c] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] text-white disabled:opacity-50">
        <span>{busy ? "Saving..." : "Save address"}</span><span>↗</span>
      </button>
    </div>
  );
}

/**
 * Renders the Review Editor component and coordinates the state/behavior owned by this UI boundary.
 */
function ReviewEditor({ initial, onCancel, onSave, busy }) {
  const [form, setForm] = useState({
    orderNumber: initial.orderNumber,
    productSlug: initial.productSlug,
    rating: initial.rating || 5,
    title: initial.title || "",
    body: initial.body || "",
  });

  return (
    <div className="border border-black/10 bg-[#ffffff]">
      <div className="flex items-center justify-between bg-[#111] px-5 py-4 text-white">
        <div>
          <span className="text-[6px] uppercase tracking-[.14em] text-white/90">{initial.productName}</span>
          <strong className="mt-1 block font-[Georgia] text-[21px] font-normal">{initial._id ? "Edit your review" : "Write a review"}</strong>
        </div>
        <button onClick={onCancel} className="text-[7px] uppercase tracking-[.12em]">Close ×</button>
      </div>

      <div className="p-5">
        <span className="text-[6px] font-semibold uppercase tracking-[.14em] text-black/65">Your rating</span>
        <div className="mt-3 flex gap-2">
          {[1,2,3,4,5].map((rating) => (
            <button key={rating} type="button" onClick={() => setForm((current) => ({ ...current, rating }))} className={`grid h-10 w-10 place-items-center border text-[18px] ${rating <= form.rating ? "border-[#d13c3c] bg-[#d13c3c] text-white" : "border-black/15 text-black/65"}`}>★</button>
          ))}
        </div>
      </div>

      <label className="block border-t border-black/10 p-5">
        <span className="text-[6px] font-semibold uppercase tracking-[.14em] text-black/65">Review title</span>
        <input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} placeholder="A short headline" className="mt-3 w-full bg-transparent font-[Georgia] text-[22px] outline-none placeholder:text-black/60" />
      </label>

      <label className="block border-t border-black/10 p-5">
        <span className="text-[6px] font-semibold uppercase tracking-[.14em] text-black/65">Your review</span>
        <textarea value={form.body} onChange={(e) => setForm((current) => ({ ...current, body: e.target.value }))} rows={5} placeholder="Tell us about the product..." className="mt-3 w-full resize-none bg-transparent font-[Georgia] text-[21px] leading-[1.35] outline-none placeholder:text-black/60" />
      </label>

      <button type="button" disabled={busy} onClick={() => onSave(form)} className="flex w-full items-center justify-between bg-[#d13c3c] px-5 py-4 text-[8px] font-semibold uppercase tracking-[.14em] text-white disabled:opacity-50">
        <span>{busy ? "Saving..." : "Save review"}</span><span>↗</span>
      </button>
    </div>
  );
}

/**
 * Renders the Account component and coordinates the state/behavior owned by this UI boundary.
 */
export default function Account() {
  const { customer, loading: authLoading, logout, refresh, toggleWishlist } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.some(([key]) => key === searchParams.get("tab")) ? searchParams.get("tab") : "overview";
  /**
   * Implements the set tab operation used by this module.
   */
  const setTab = (next) => setSearchParams(next === "overview" ? {} : { tab: next }, { replace: true });

  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [reviewData, setReviewData] = useState({ reviews: [], eligible: [], orderReviews: [], eligibleOrders: [] });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [addressEditor, setAddressEditor] = useState(null);
  const [reviewEditor, setReviewEditor] = useState(null);
  const [busy, setBusy] = useState(false);

  const [profile, setProfile] = useState({ name: "", email: "", phone: "", marketingOptIn: false, currentPassword: "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  /**
   * Loads core data for the current flow.
   */
  const loadCore = async () => {
    const response = await getCustomerDashboard();
    setDashboard(response.data);
  };

  /**
   * Loads tab data for the current flow.
   */
  const loadTab = async (activeTab) => {
    if (activeTab === "orders") setOrders((await getCustomerOrders()).data || []);
    if (activeTab === "wishlist") setWishlist((await getWishlist()).data || []);
    if (activeTab === "addresses") setAddresses((await getAddresses()).data || []);
    if (activeTab === "reviews") setReviewData((await getReviews()).data || { reviews: [], eligible: [], orderReviews: [], eligibleOrders: [] });
  };

  useEffect(() => {
    if (!customer) return;
    setProfile({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      marketingOptIn: customer.marketingOptIn,
      currentPassword: "",
    });
    let active = true;
    setLoading(true);
    Promise.all([
      getCustomerDashboard(),
      tab === "orders" ? getCustomerOrders() : null,
      tab === "wishlist" ? getWishlist() : null,
      tab === "addresses" ? getAddresses() : null,
      tab === "reviews" ? getReviews() : null,
    ])
      .then(([dash, orderResponse, wishlistResponse, addressResponse, reviewResponse]) => {
        if (!active) return;
        setDashboard(dash.data);
        if (orderResponse) setOrders(orderResponse.data || []);
        if (wishlistResponse) setWishlist(wishlistResponse.data || []);
        if (addressResponse) setAddresses(addressResponse.data || []);
        if (reviewResponse) setReviewData(reviewResponse.data || { reviews: [], eligible: [], orderReviews: [], eligibleOrders: [] });
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [customer, tab]);

  const stats = dashboard?.stats || {};
  const recentOrders = dashboard?.recentOrders || [];
  const activeOrders = useMemo(() => recentOrders.filter((order) => !["delivered", "cancelled"].includes(order.status)), [recentOrders]);

  async function removeWishlistItem(product) {
    try {
      setNotice("");
      await toggleWishlist(product.slug || product.id || product._id);
      setWishlist((current) => current.filter((item) => (item.slug || item.id || item._id) !== (product.slug || product.id || product._id)));
      setNotice("Removed from your wishlist.");
    } catch (error) {
      setNotice(error.message || "Unable to update your wishlist.");
    }
  }

  async function downloadInvoice(order) {
    try {
      setNotice("");
      const response = await getCustomerInvoice(order.orderNumber);
      printOrderBill(response.data);
    } catch (error) {
      setNotice(error.message || "Unable to download invoice.");
    }
  }

  function startOrderReview(order) {
    setTab("reviews");
    setReviewEditor({ _reviewType: "order", orderNumber: order.orderNumber, productName: `Order ${order.orderNumber}`, rating: 5, title: "", body: "" });
  }

  function startProductReviews() {
    setReviewEditor(null);
    setTab("reviews");
  }

  if (authLoading) return <main className="min-h-[65vh] bg-[#f5efe6]" />;
  if (!customer) return <Navigate to="/login" replace state={{ from: "/account" }} />;

  /**
   * Implements the save address operation used by this module.
   */
  async function saveAddress(form) {
    setBusy(true); setNotice("");
    try {
      if (form._id) await updateAddress(form._id, form);
      else await createAddress(form);
      setAddressEditor(null);
      await Promise.all([loadCore(), loadTab("addresses")]);
      setNotice("Saved address updated.");
    } catch (error) {
      setNotice(error.message);
    } finally { setBusy(false); }
  }

  /**
   * Removes address from the current workflow.
   */
  async function removeAddress(id) {
    setBusy(true); setNotice("");
    try {
      await deleteAddress(id);
      await Promise.all([loadCore(), loadTab("addresses")]);
      setNotice("Saved address removed.");
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }

  /**
   * Implements the save profile operation used by this module.
   */
  async function saveProfile(event) {
    event.preventDefault();
    setBusy(true); setNotice("");
    try {
      await updateProfile(profile);
      await refresh();
      setProfile((current) => ({ ...current, currentPassword: "" }));
      setNotice("Profile details updated.");
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }

  /**
   * Implements the save password operation used by this module.
   */
  async function savePassword(event) {
    event.preventDefault();
    setNotice("");
    if (password.newPassword !== password.confirmPassword) return setNotice("New passwords do not match.");
    setBusy(true);
    try {
      const response = await changePassword({ currentPassword: password.currentPassword, newPassword: password.newPassword });
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice(response.message || "Password updated.");
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }

  /**
   * Implements the save review operation used by this module.
   */
  async function saveReview(form) {
    setBusy(true); setNotice("");
    try {
      if (reviewEditor._reviewType === "order") {
        if (reviewEditor._id) await updateOrderReview(reviewEditor._id, form);
        else await createOrderReview(form);
      } else if (reviewEditor._id) await updateReview(reviewEditor._id, form);
      else await createReview(form);
      setReviewEditor(null);
      await Promise.all([loadCore(), loadTab("reviews")]);
      setNotice("Review saved and sent for moderation.");
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }

  /**
   * Removes review from the current workflow.
   */
  async function removeReview(id, type = "product") {
    setBusy(true); setNotice("");
    try {
      if (type === "order") await deleteOrderReview(id); else await deleteReview(id);
      await Promise.all([loadCore(), loadTab("reviews")]);
      setNotice("Review removed.");
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }

  return (
    <main className="customer-dashboard-shell bg-[#f5efe6]">
      {/* Section 1: Page section 1. */}
      <section className="px-[clamp(14px,4vw,54px)] py-[clamp(24px,4vw,48px)] text-[#171313]">
        <div className="mx-auto grid max-w-[1480px] grid-cols-[250px_minmax(0,1fr)] items-start gap-5 max-[960px]:grid-cols-1">
          <DashboardSidebar customer={customer} tab={tab} setTab={setTab} logout={logout} />

          <div className="min-w-0">
            <header className="customer-panel rounded-sm px-[clamp(18px,4vw,34px)] py-5">
              <div className="flex items-center justify-between gap-6 max-[650px]:items-start max-[650px]:flex-col">
                <div>
                  <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-[#d13c3c]">My account · {TABS.find(([key]) => key === tab)?.[1]}</span>
                  <h1 className="mt-2 font-[Georgia] text-[clamp(28px,3.4vw,42px)] font-normal">{tab === "overview" ? `Welcome back, ${customer.name.split(" ")[0]}.` : TABS.find(([key]) => key === tab)?.[1]}</h1>
                </div>
                <div className="flex gap-2">
                  <Link to="/shop" className="store-button-secondary px-4 py-3 text-[7px] font-semibold uppercase tracking-[.12em]">Continue shopping</Link>
                  <Link to="/track-order" className="store-button-primary px-4 py-3 text-[7px] font-semibold uppercase tracking-[.12em]">Track an order</Link>
                </div>
              </div>
              {notice ? <div className="mt-4 border-l-2 border-[#d13c3c] bg-[#d13c3c]/[.07] px-4 py-3 text-[9px]">{notice}</div> : null}
            </header>

            <div className="py-5">
              {tab === "overview" && (
                <section>
                  <div className="customer-panel rounded-sm bg-[#ffffff] p-[clamp(20px,4vw,34px)]">
                    <div className="grid grid-cols-[1fr_auto] items-start gap-6 max-[600px]:grid-cols-1">
                      <div>
                        <span className="text-[8px] font-semibold uppercase tracking-[.15em] text-[#d13c3c]">Account overview</span>
                        <h2 className="mt-3 font-[Georgia] text-[clamp(30px,4vw,48px)] font-normal leading-[1]">Everything you need<br/>after checkout.</h2>
                        <p className="mt-4 max-w-[650px] text-[10px] leading-6 text-black/65">Track purchases, download delivered invoices, manage addresses and share verified reviews from one account.</p>
                      </div>
                      <div className="rounded-sm bg-[#faf6af] px-5 py-4 text-right max-[600px]:text-left">
                        <span className="text-[6px] uppercase tracking-[.12em] text-black/65">Membership</span>
                        <strong className="mt-1 block font-[Georgia] text-[22px] font-normal capitalize">{customer.membershipTier || "Member"}</strong>
                        <span className="mt-1 block text-[7px] text-black/65">{stats.rewardPoints || 0} reward points</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
                    <StatCard label="Total orders" value={loading ? "—" : stats.totalOrders || 0} note="All purchases linked to this account." />
                    <StatCard label="Active orders" value={loading ? "—" : activeOrders.length} note="Orders still on their way." />
                    <StatCard label="Delivered" value={loading ? "—" : stats.deliveredOrders || 0} note="Completed deliveries and invoices." />
                  </div>

                  <div className="mt-10 grid grid-cols-[1.35fr_.65fr] gap-6 max-[850px]:grid-cols-1">
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-[8px] font-semibold uppercase tracking-[.14em]">Recent orders</span>
                        <button onClick={() => setTab("orders")} className="border-b border-black pb-1 text-[7px] uppercase tracking-[.12em]">View all ↗</button>
                      </div>
                      <div className="space-y-4">
                        {recentOrders.slice(0, 3).map((order) => <OrderCard key={order.orderNumber} order={order} onInvoice={downloadInvoice} onOrderReview={startOrderReview} onProductReview={startProductReviews} />)}
                        {!loading && !recentOrders.length ? <div className="border border-black/10 bg-[#ffffff] p-8 font-[Georgia] text-[28px]">No orders yet.</div> : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
                      {[
                        ["⌖", "Saved Addresses", "Manage delivery destinations.", "addresses"],
                        ["★", "My Reviews", "Review delivered purchases.", "reviews"],
                        ["○", "Profile", "Update account details.", "profile"],
                        ["⌁", "Security", "Change your password.", "security"],
                      ].map(([icon,title,copy,key]) => (
                        <button key={key} type="button" onClick={() => setTab(key)} className="customer-panel group rounded-sm p-5 text-left transition hover:border-[#d13c3c] hover:shadow-[0_14px_34px_rgba(209,60,60,.08)]">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#fff2ef] text-[14px] text-[#d13c3c]">{icon}</span>
                          <strong className="mt-5 block font-[Georgia] text-[22px] font-normal">{title}</strong>
                          <p className="mt-2 text-[8px] leading-5 text-black/65">{copy}</p>
                          <span className="mt-4 inline-flex items-center gap-2 text-[7px] font-semibold uppercase tracking-[.1em] text-[#d13c3c]">Manage <span>→</span></span>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {tab === "orders" && (
                <section>
                  <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Orders / 02</span>
                  <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.05em]">Every order,<br/><em className="font-normal text-[#d13c3c]">current and past.</em></h2>
                  <div className="mt-9 space-y-4">
                    {loading ? <div className="h-60 animate-pulse bg-black/[.04]" /> : orders.length ? orders.map((order) => <OrderCard key={order.orderNumber} order={order} onInvoice={downloadInvoice} onOrderReview={startOrderReview} onProductReview={startProductReviews} />) : <div className="border border-black/10 bg-[#ffffff] p-8 font-[Georgia] text-[28px]">No order history yet.</div>}
                  </div>
                </section>
              )}

              {tab === "wishlist" && (
                <section>
                  <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Saved products</span>
                  <div className="mt-4 flex items-end justify-between gap-6 max-[620px]:items-start max-[620px]:flex-col">
                    <div>
                      <h2 className="font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.95] tracking-[-.04em]">Your wishlist.</h2>
                      <p className="mt-3 max-w-[600px] text-[10px] leading-6 text-black/65">Products you save with the heart stay here across devices while you are signed in.</p>
                    </div>
                    <Link to="/shop" className="store-button-primary px-5 py-3.5 text-[7px] font-semibold uppercase tracking-[.12em]">Continue shopping →</Link>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
                    {wishlist.map((product) => {
                      const slug = product.slug || product.id || product._id;
                      const image = product.images?.[0] || product.image || "/images/product-hamper.webp";
                      return (
                        <article key={slug} className="customer-panel overflow-hidden rounded-sm">
                          <Link to={`/product/${slug}`} className="warm-product-surface grid aspect-square place-items-center border-b border-black/10">
                            <img {...responsiveImageProps(image, "(max-width: 560px) 88vw, 28vw")} alt={product.name} width="800" height="800" className="h-full w-full object-contain p-2" loading="lazy" decoding="async" />
                          </Link>
                          <div className="p-4">
                            <span className="text-[6px] uppercase tracking-[.12em] text-black/65">{product.category}</span>
                            <Link to={`/product/${slug}`} className="mt-2 block font-[Georgia] text-[22px] leading-[1.08] transition hover:text-[#d13c3c]">{product.name}</Link>
                            <div className="mt-5 flex items-center justify-between gap-3">
                              <strong className="text-[11px]">₹{Number(product.price || 0).toLocaleString("en-IN")}</strong>
                              <button type="button" onClick={() => removeWishlistItem(product)} className="text-[7px] font-semibold uppercase tracking-[.1em] text-[#d13c3c]">Remove ♥</button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                    {!loading && !wishlist.length ? (
                      <div className="col-span-full customer-panel rounded-sm p-8 text-center">
                        <strong className="font-[Georgia] text-[28px] font-normal">Nothing saved yet.</strong>
                        <p className="mx-auto mt-3 max-w-[480px] text-[9px] leading-5 text-black/65">Tap the heart on a product to keep it here for later.</p>
                      </div>
                    ) : null}
                  </div>
                </section>
              )}

              {tab === "addresses" && (
                <section>
                  <div className="flex items-end justify-between gap-6 max-[650px]:items-start max-[650px]:flex-col">
                    <div>
                      <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Saved Addresses / 03</span>
                      <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.05em]">Checkout destinations,<br/><em className="font-normal text-[#d13c3c]">remembered.</em></h2>
                    </div>
                    <button onClick={() => setAddressEditor({ ...EMPTY_ADDRESS, name: customer.name, phone: customer.phone })} className="bg-black px-5 py-4 text-[8px] font-semibold uppercase tracking-[.13em] text-white">Add address +</button>
                  </div>

                  <AnimatePresence>
                    {addressEditor ? <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8"><AddressEditor initial={addressEditor._id ? addressEditor : null} onCancel={() => setAddressEditor(null)} onSave={saveAddress} busy={busy} /></motion.div> : null}
                  </AnimatePresence>

                  <div className="mt-8 grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
                    {addresses.map((address) => (
                      <article key={address._id} className="border border-black/10 bg-[#ffffff] p-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[7px] font-semibold uppercase tracking-[.13em] text-[#d13c3c]">{address.label}</span>
                            {address.isDefault ? <span className="bg-black px-2 py-1 text-[6px] uppercase tracking-[.1em] text-white">Default</span> : null}
                          </div>
                          <span className="text-[7px] uppercase tracking-[.12em] text-black/65">India</span>
                        </div>
                        <strong className="mt-6 block font-[Georgia] text-[25px] font-normal">{address.name}</strong>
                        <address className="mt-3 not-italic text-[10px] leading-6 text-black/65">
                          {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}<br/>
                          {address.city}, {address.state} {address.postalCode}<br/>
                          +91 {address.phone}
                        </address>
                        <div className="mt-6 flex gap-4 border-t border-black/10 pt-4 text-[7px] font-semibold uppercase tracking-[.12em]">
                          <button onClick={() => setAddressEditor(address)}>Edit</button>
                          <button onClick={() => removeAddress(address._id)} className="text-[#d13c3c]">Delete</button>
                        </div>
                      </article>
                    ))}
                    {!loading && !addresses.length ? <div className="col-span-full border border-black/10 bg-[#ffffff] p-8 font-[Georgia] text-[28px]">No saved addresses yet.</div> : null}
                  </div>
                </section>
              )}

              {tab === "reviews" && (
                <section>
                  <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">My Reviews / 04</span>
                  <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.05em]">Products you bought.<br/><em className="font-normal text-[#d13c3c]">Opinions you own.</em></h2>

                  <AnimatePresence>
                    {reviewEditor ? <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8"><ReviewEditor initial={reviewEditor} onCancel={() => setReviewEditor(null)} onSave={saveReview} busy={busy} /></motion.div> : null}
                  </AnimatePresence>

                  {reviewData.eligible.length ? (
                    <div className="mt-9">
                      <span className="text-[7px] font-semibold uppercase tracking-[.14em]">Ready to review</span>
                      <div className="mt-4 grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
                        {reviewData.eligible.map((item) => (
                          <article key={`${item.orderNumber}-${item.productSlug}`} className="border border-black/10 bg-[#ffffff] p-4">
                            <div className="grid aspect-square place-items-center bg-[#eee6dc]">
                              <img {...responsiveImageProps(item.productImage || "/images/product-hamper.webp", "88px")} alt={item.productName} width="800" height="800" className="h-full w-full object-contain p-2" loading="lazy" decoding="async"/>
                            </div>
                            <span className="mt-4 block text-[6px] uppercase tracking-[.12em] text-black/65">{item.orderNumber}</span>
                            <strong className="mt-2 block font-[Georgia] text-[22px] font-normal">{item.productName}</strong>
                            <button onClick={() => setReviewEditor(item)} className="mt-5 w-full bg-black px-4 py-3 text-[7px] font-semibold uppercase tracking-[.12em] text-white">Write review ↗</button>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {reviewData.eligibleOrders?.length ? (
                    <div className="mt-10">
                      <span className="text-[7px] font-semibold uppercase tracking-[.14em]">Rate the overall order</span>
                      <div className="mt-4 grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
                        {reviewData.eligibleOrders.map((order) => (
                          <article key={order.orderNumber} className="border border-black/10 bg-[#ffffff] p-5">
                            <span className="text-[6px] uppercase tracking-[.12em] text-black/65">Delivered order</span>
                            <strong className="mt-2 block font-[Georgia] text-[24px] font-normal">{order.orderNumber}</strong>
                            <p className="mt-2 text-[9px] text-black/65">Share your experience with the complete order, packaging and delivery.</p>
                            <button type="button" onClick={() => setReviewEditor({ _reviewType: "order", orderNumber: order.orderNumber, productName: `Order ${order.orderNumber}`, rating: 5, title: "", body: "" })} className="mt-5 w-full bg-[#d13c3c] px-4 py-3 text-[7px] font-semibold uppercase tracking-[.12em] text-white">Review order ★</button>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-10">
                    <span className="text-[7px] font-semibold uppercase tracking-[.14em]">Your submitted reviews</span>
                    <div className="mt-4 space-y-4">
                      {reviewData.reviews.map((review) => (
                        <article key={review._id} className="grid grid-cols-[110px_1fr_auto] gap-5 border border-black/10 bg-[#ffffff] p-4 max-[700px]:grid-cols-[90px_1fr]">
                          <div className="grid aspect-square place-items-center bg-[#eee6dc]">
                            <img {...responsiveImageProps(review.productImage || "/images/product-hamper.webp", "88px")} alt={review.productName} width="800" height="800" className="h-full w-full object-contain p-1" loading="lazy" decoding="async"/>
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-[13px] text-[#d13c3c]">{"★".repeat(review.rating)}</span>
                              <span className="text-[6px] uppercase tracking-[.12em] text-black/65">{review.status}</span>
                            </div>
                            <strong className="mt-2 block font-[Georgia] text-[23px] font-normal">{review.title || review.productName}</strong>
                            <p className="mt-2 text-[10px] leading-5 text-black/65">{review.body}</p>
                          </div>
                          <div className="flex flex-col items-end gap-3 max-[700px]:col-start-2 max-[700px]:items-start">
                            <button onClick={() => setReviewEditor(review)} className="text-[7px] font-semibold uppercase tracking-[.12em]">Edit</button>
                            <button onClick={() => removeReview(review._id)} className="text-[7px] font-semibold uppercase tracking-[.12em] text-[#d13c3c]">Delete</button>
                          </div>
                        </article>
                      ))}
                      {!loading && !reviewData.reviews.length && !reviewData.orderReviews?.length ? <div className="border border-black/10 bg-[#ffffff] p-8 font-[Georgia] text-[28px]">You have not submitted a review yet.</div> : null}
                    </div>
                  </div>

                  {reviewData.orderReviews?.length ? <div className="mt-8 space-y-4">
                    <span className="text-[7px] font-semibold uppercase tracking-[.14em]">Overall order reviews</span>
                    {reviewData.orderReviews.map((review) => <article key={review._id} className="border border-black/10 bg-[#ffffff] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3"><div><span className="text-[14px] text-[#fbbc04]">{"★".repeat(review.rating)}</span><strong className="ml-3 font-[Georgia] text-[21px] font-normal">{review.title || review.orderNumber}</strong></div><span className="text-[6px] uppercase tracking-[.12em] text-black/65">{review.status}</span></div>
                      <p className="mt-3 text-[10px] leading-5 text-black/65">{review.body}</p>
                      <div className="mt-4 flex gap-4 text-[7px] font-semibold uppercase tracking-[.12em]"><button type="button" onClick={() => setReviewEditor({ ...review, _reviewType: "order", productName: `Order ${review.orderNumber}` })}>Edit</button><button type="button" onClick={() => removeReview(review._id, "order")} className="text-[#d13c3c]">Delete</button></div>
                    </article>)}
                  </div> : null}
                </section>
              )}

              {tab === "benefits" && (
                <section>
                  <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Benefits & Offers / 05</span>
                  <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.05em]">Why stay<br/><em className="font-normal text-[#d13c3c]">signed in?</em></h2>
                  <div className="mt-9 grid grid-cols-3 border-l border-t border-black/10 bg-[#ffffff] max-[760px]:grid-cols-1">
                    {[
                      ["Member offers", customer.offerAccess ? "Eligible for account-only campaigns when active." : "Offer access is not enabled."],
                      ["Member discounts", customer.discountAccess ? "Your account can receive member-specific discounts when configured." : "Discount access is not enabled."],
                      ["Reward points", `${customer.rewardPoints || 0} points currently recorded. Earning/redemption rules will come with the loyalty engine.`],
                    ].map(([title, copy], index) => (
                      <div key={title} className="border-b border-r border-black/10 p-7">
                        <span className="text-[6px] uppercase tracking-[.14em] text-black/65">{String(index + 1).padStart(2, "0")}</span>
                        <strong className="mt-14 block font-[Georgia] text-[29px] font-normal">{title}</strong>
                        <p className="mt-4 text-[9px] leading-5 text-black/65">{copy}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {tab === "profile" && (
                <section>
                  <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Profile & Preferences / 06</span>
                  <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.05em]">Your details,<br/><em className="font-normal text-[#d13c3c]">under your control.</em></h2>
                  <form onSubmit={saveProfile} className="mt-9 max-w-[900px] overflow-hidden border border-black/10 bg-[#ffffff]">
                    {[
                      ["name", "Full name", "Your name", "text"],
                      ["email", "Email address", "you@example.com", "email"],
                      ["phone", "Mobile number", "9876543210", "text"],
                    ].map(([key, label, placeholder, type]) => (
                      <label key={key} className="block border-b border-black/10 p-6">
                        <span className="text-[7px] font-semibold uppercase tracking-[.14em] text-black/65">{label}</span>
                        <input type={type} value={profile[key]} onChange={(e) => setProfile((current) => ({ ...current, [key]: key === "phone" ? e.target.value.replace(/\D/g, "").slice(0,10) : e.target.value }))} placeholder={placeholder} className="mt-4 w-full bg-transparent font-[Georgia] text-[25px] outline-none placeholder:text-black/60" />
                      </label>
                    ))}

                    {profile.email !== customer.email ? (
                      <label className="block border-b border-black/10 bg-[#d13c3c]/[.06] p-6">
                        <span className="text-[7px] font-semibold uppercase tracking-[.14em] text-[#d13c3c]">Current password required to change email</span>
                        <input type="password" value={profile.currentPassword} onChange={(e) => setProfile((current) => ({ ...current, currentPassword: e.target.value }))} placeholder="Current password" className="mt-4 w-full bg-transparent font-[Georgia] text-[25px] outline-none placeholder:text-black/60" />
                      </label>
                    ) : null}

                    <button type="button" onClick={() => setProfile((current) => ({ ...current, marketingOptIn: !current.marketingOptIn }))} className="flex w-full items-start gap-4 border-b border-black/10 p-6 text-left">
                      <span className={`grid h-5 w-5 shrink-0 place-items-center border ${profile.marketingOptIn ? "border-[#d13c3c] bg-[#d13c3c] text-white" : "border-black/20 text-transparent"}`}>✓</span>
                      <span>
                        <strong className="block text-[8px] uppercase tracking-[.12em]">Offers & product updates</strong>
                        <small className="mt-1 block text-[9px] leading-5 text-black/65">Marketing preference only. Order emails are transactional and still sent for purchases and status updates.</small>
                      </span>
                    </button>

                    <button disabled={busy} className="flex w-full items-center justify-between bg-black px-6 py-5 text-[8px] font-semibold uppercase tracking-[.14em] text-white disabled:opacity-50"><span>{busy ? "Saving..." : "Save profile changes"}</span><span>↗</span></button>
                  </form>
                </section>
              )}

              {tab === "security" && (
                <section>
                  <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Security / 07</span>
                  <h2 className="mt-5 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.9] tracking-[-.05em]">Change your<br/><em className="font-normal text-[#d13c3c]">password.</em></h2>
                  <p className="mt-5 max-w-[650px] text-[10px] leading-6 text-black/65">Passwords remain server-side only and are stored as one-way scrypt hashes.</p>

                  <form onSubmit={savePassword} className="mt-9 max-w-[780px] overflow-hidden border border-black/10 bg-[#ffffff]">
                    {[
                      ["currentPassword", "Current password", "Current password"],
                      ["newPassword", "New password", "8+ characters"],
                      ["confirmPassword", "Confirm new password", "Repeat new password"],
                    ].map(([key, label, placeholder]) => (
                      <label key={key} className="block border-b border-black/10 p-6">
                        <span className="text-[7px] font-semibold uppercase tracking-[.14em] text-black/65">{label}</span>
                        <input type="password" value={password[key]} onChange={(e) => setPassword((current) => ({ ...current, [key]: e.target.value }))} placeholder={placeholder} className="mt-4 w-full bg-transparent font-[Georgia] text-[25px] outline-none placeholder:text-black/60" />
                      </label>
                    ))}
                    <button disabled={busy} className="flex w-full items-center justify-between bg-[#d13c3c] px-6 py-5 text-[8px] font-semibold uppercase tracking-[.14em] text-white disabled:opacity-50"><span>{busy ? "Updating..." : "Update password"}</span><span>↗</span></button>
                  </form>
                </section>
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="h-3 bg-[#d13c3c]" />
    </main>
  );
}
