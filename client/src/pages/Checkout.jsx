/**
 * Customer-facing checkout. Keeps pricing authoritative on the server while adding
 * customer address reuse, PIN-assisted city/state entry, and mirrored client validation.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getAddresses } from "../services/customerApi.js";
import { createOrder, getCommerceQuote, getCommerceSettings, lookupPincode } from "../services/checkoutApi.js";
import { responsiveImageProps } from "../utils/productImagePath.js";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  note: "",
  paymentMethod: "cod",
};

function Field({ label, error, children, className = "" }) {
  return (
    <label className={`group block border-b border-black/10 p-[clamp(20px,3vw,30px)] ${className}`}>
      <span className={`text-[7px] font-semibold uppercase tracking-[.15em] transition ${error ? "text-[#d13c3c]" : "text-black/65 group-focus-within:text-[#d13c3c]"}`}>{label}</span>
      {children}
      {error ? <span className="mt-2 block text-[7px] leading-4 text-[#b41f2b]">{error}</span> : null}
    </label>
  );
}

function validateCheckout(form) {
  const errors = {};
  const name = form.name.trim().replace(/\s+/g, " ");
  const email = form.email.trim().toLowerCase();
  const phone = form.phone.replace(/\D/g, "");
  const addressLine1 = form.addressLine1.trim();
  const addressLine2 = form.addressLine2.trim();
  const city = form.city.trim();
  const state = form.state.trim();
  const postalCode = form.postalCode.replace(/\D/g, "");
  const note = form.note.trim();

  if (name.length < 2 || name.length > 100 || !/[A-Za-zÀ-ž\u0900-\u097F]/.test(name)) errors.name = "Enter a valid full name (2–100 characters).";
  if (email.length > 180 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Enter a valid email address.";
  if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (addressLine1.length < 5 || addressLine1.length > 220) errors.addressLine1 = "Enter a complete address (5–220 characters).";
  if (addressLine2.length > 220) errors.addressLine2 = "Address line 2 is too long.";
  if (city.length < 2 || city.length > 100 || !/[A-Za-zÀ-ž\u0900-\u097F]/.test(city)) errors.city = "Enter a valid city or district.";
  if (!state || !STATES.includes(state)) errors.state = "Select a valid state or union territory.";
  if (!/^\d{6}$/.test(postalCode)) errors.postalCode = "Enter a valid 6-digit PIN code.";
  if (note.length > 1000) errors.note = "Order note can contain up to 1000 characters.";
  if (!['cod', 'online'].includes(form.paymentMethod)) errors.paymentMethod = "Choose a valid payment method.";

  return errors;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { customer } = useAuth();
  const { items, subtotal, itemCount, clearCart, hasUnavailableItems, unavailableItems, refreshAvailability } = useCart();

  const [form, setForm] = useState(EMPTY_FORM);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState({ loading: false, message: "", ok: false });
  const [commerce, setCommerce] = useState({
    deliveryEnabled: true,
    standardDeliveryPrice: 79,
    freeDeliveryEnabled: true,
    freeDeliveryThreshold: 999,
    taxEnabled: false,
    taxRate: 0,
    taxMode: "inclusive",
  });
  const [quote, setQuote] = useState(null);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
    setError("");
  };

  const applyAddress = (address) => {
    if (!address) return;
    setSelectedAddressId(String(address._id || address.id || ""));
    setForm((current) => ({
      ...current,
      name: address.name || current.name || customer?.name || "",
      phone: String(address.phone || current.phone || customer?.phone || "").replace(/\D/g, "").slice(-10),
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: String(address.postalCode || "").replace(/\D/g, "").slice(0, 6),
    }));
    setFieldErrors({});
    setPincodeStatus({ loading: false, message: "Saved address selected.", ok: true });
  };

  useEffect(() => {
    refreshAvailability().catch(() => {});
    getCommerceSettings().then((response) => setCommerce(response.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!customer) {
      setAddresses([]);
      setSelectedAddressId("");
      return;
    }

    setForm((current) => ({
      ...current,
      name: current.name || customer.name || "",
      email: current.email || customer.email || "",
      phone: current.phone || String(customer.phone || "").replace(/\D/g, "").slice(-10),
    }));

    let active = true;
    setAddressesLoading(true);
    getAddresses()
      .then((response) => {
        if (!active) return;
        const next = Array.isArray(response.data) ? response.data : [];
        setAddresses(next);
        const preferred = next.find((address) => address.isDefault) || next[0];
        if (preferred) applyAddress(preferred);
      })
      .catch(() => {
        if (active) setAddresses([]);
      })
      .finally(() => {
        if (active) setAddressesLoading(false);
      });

    return () => { active = false; };
  }, [customer?.id]);

  useEffect(() => {
    getCommerceQuote(subtotal, appliedCoupon)
      .then((response) => setQuote(response.data))
      .catch(() => setQuote(null));
  }, [subtotal, appliedCoupon]);

  useEffect(() => {
    const pin = form.postalCode.replace(/\D/g, "");
    if (pin.length !== 6) {
      setPincodeStatus({ loading: false, message: "", ok: false });
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setPincodeStatus({ loading: true, message: "Finding city and state…", ok: false });
      try {
        const response = await lookupPincode(pin);
        if (!active) return;
        const location = response.data || {};
        setForm((current) => ({
          ...current,
          city: location.city || current.city,
          state: STATES.includes(location.state) ? location.state : current.state,
        }));
        setFieldErrors((current) => ({ ...current, postalCode: "", city: "", state: "" }));
        setPincodeStatus({ loading: false, message: `${location.city}, ${location.state}`, ok: true });
      } catch (lookupError) {
        if (!active) return;
        setPincodeStatus({ loading: false, message: lookupError.message || "PIN not found. Enter city and state manually.", ok: false });
      }
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [form.postalCode]);

  const shipping = quote?.shippingAmount ?? (
    commerce.deliveryEnabled
      ? (commerce.freeDeliveryEnabled && subtotal >= commerce.freeDeliveryThreshold ? 0 : commerce.standardDeliveryPrice)
      : 0
  );
  const discount = quote?.discountAmount ?? 0;
  const tax = quote?.taxAmount ?? 0;
  const total = quote?.total ?? Math.max(subtotal - discount, 0) + shipping + (commerce.taxMode === "exclusive" ? tax : 0);

  const payload = useMemo(() => ({
    customer: {
      name: form.name.trim().replace(/\s+/g, " "),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.replace(/\D/g, "").slice(-10),
    },
    shippingAddress: {
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.replace(/\D/g, ""),
      country: "India",
    },
    note: form.note.trim(),
    paymentMethod: form.paymentMethod,
    couponCode: appliedCoupon,
    items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
  }), [form, items, appliedCoupon]);

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 60);
    setCouponCode(code);
    if (!code) {
      setAppliedCoupon("");
      setCouponMessage("");
      return;
    }
    try {
      const response = await getCommerceQuote(subtotal, code);
      if (!response.data.coupon?.valid) {
        setAppliedCoupon("");
        setCouponMessage(response.data.coupon?.message || "This coupon is not valid.");
        return;
      }
      setAppliedCoupon(code);
      setQuote(response.data);
      setCouponMessage(`${code} applied · you save ₹${response.data.discountAmount}`);
    } catch (requestError) {
      setAppliedCoupon("");
      setCouponMessage(requestError.message);
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setError("");

    const errors = validateCheckout(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setError("Please correct the highlighted delivery details before continuing.");
      return;
    }

    await refreshAvailability().catch(() => {});
    if (hasUnavailableItems) {
      setError("Your cart contains an unavailable product. Remove it before placing the order.");
      return;
    }
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    if (form.paymentMethod === "online") {
      navigate("/payment/failure", {
        state: {
          type: "gateway_unavailable",
          title: "Online payment is not connected yet.",
          message: "Choose cash on delivery while the live payment gateway is being configured.",
          returnTo: "/checkout",
        },
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await createOrder(payload);
      clearCart();
      navigate("/payment/success", {
        replace: true,
        state: {
          orderNumber: response.data.orderNumber,
          total: response.data.total,
          paymentMethod: response.data.paymentMethod,
          paymentStatus: response.data.paymentStatus,
        },
      });
    } catch (requestError) {
      setError(requestError.message || "We could not place the order. Review the details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <main className="grid min-h-[68vh] place-items-center bg-[#fffaf1] px-6 py-20 text-center">
        <div className="max-w-[760px]">
          <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Checkout / Empty cart</span>
          <h1 className="mt-5 font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.9] tracking-[-.055em]">There is nothing to check out yet.</h1>
          <Link to="/shop" className="mt-8 inline-flex min-w-[220px] items-center justify-between bg-black px-6 py-4 text-[8px] font-semibold uppercase tracking-[.15em] text-white"><span>Return to shop</span><span>↗</span></Link>
        </div>
      </main>
    );
  }

  const inputClass = "mt-4 w-full bg-transparent font-[Georgia] text-[24px] outline-none placeholder:text-black/45";

  return (
    <main className="bg-[#fffaf1]">
      <section className="border-b border-black/10 bg-white px-[clamp(22px,5vw,78px)] py-6">
        <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-6 max-[700px]:items-start max-[700px]:flex-col">
          <div><span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Secure Checkout / Beyonist</span><p className="mt-2 font-[Georgia] text-[28px]">Complete the ritual.</p></div>
          <span className="text-[8px] uppercase tracking-[.15em] text-black/55">Cart ✓ &nbsp;→&nbsp; Checkout &nbsp;→&nbsp; Complete</span>
        </div>
      </section>

      <section className="px-[clamp(22px,5vw,78px)] py-[clamp(55px,7vw,96px)]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1.2fr)_minmax(340px,.8fr)] gap-[clamp(45px,6vw,92px)] max-[1000px]:grid-cols-1">
          <form onSubmit={placeOrder} noValidate>
            <div className="mb-10">
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Delivery details / 01</span>
              <h1 className="mt-4 font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.9] tracking-[-.055em]">Where should<br/><em className="font-normal text-[#d13c3c]">Beyonist arrive?</em></h1>
            </div>

            {customer ? (
              <section className="mb-6 border border-black/10 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div><span className="text-[7px] font-semibold uppercase tracking-[.15em] text-[#d13c3c]">Saved addresses</span><p className="mt-2 text-[10px] text-black/60">Select an address from your account or enter another address below.</p></div>
                  <Link to="/account" className="text-[7px] font-semibold uppercase tracking-[.12em] underline">Manage</Link>
                </div>
                {addressesLoading ? <p className="mt-4 text-[8px] uppercase tracking-[.12em] text-black/50">Loading saved addresses…</p> : null}
                {!addressesLoading && addresses.length ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 max-[650px]:grid-cols-1">
                    {addresses.map((address) => {
                      const id = String(address._id || address.id || "");
                      const selected = id && id === selectedAddressId;
                      return (
                        <button key={id || `${address.label}-${address.postalCode}`} type="button" onClick={() => applyAddress(address)} className={`border p-4 text-left transition ${selected ? "border-[#d13c3c] bg-[#d13c3c]/[.06]" : "border-black/10 hover:border-black/30"}`}>
                          <div className="flex items-center justify-between gap-3"><strong className="text-[8px] uppercase tracking-[.12em]">{address.label || "Address"}</strong>{address.isDefault ? <span className="text-[6px] uppercase tracking-[.12em] text-[#d13c3c]">Default</span> : null}</div>
                          <p className="mt-2 text-[9px] leading-5 text-black/65">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}<br/>{address.city}, {address.state} {address.postalCode}</p>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                {!addressesLoading && !addresses.length ? <p className="mt-4 text-[8px] leading-5 text-black/55">No saved addresses yet. The address you enter below can still be used for this order.</p> : null}
              </section>
            ) : null}

            {hasUnavailableItems ? <div className="mb-6 border border-[#d13c3c]/25 bg-[#d13c3c]/[.06] p-4 text-[9px] text-[#a51622]">{unavailableItems.length} item(s) are currently unavailable. Remove them from the cart before ordering.</div> : null}

            <section className="overflow-hidden border border-black/10 bg-white">
              <div className="grid grid-cols-2 max-[650px]:grid-cols-1">
                <Field label="Full name *" error={fieldErrors.name} className="border-r max-[650px]:border-r-0"><input value={form.name} onChange={(e) => update("name", e.target.value.slice(0, 100))} autoComplete="name" maxLength={100} required placeholder="Your full name" className={inputClass}/></Field>
                <Field label="Email address *" error={fieldErrors.email}><input type="email" value={form.email} onChange={(e) => update("email", e.target.value.slice(0, 180))} autoComplete="email" maxLength={180} required placeholder="you@example.com" className={inputClass}/></Field>
                <Field label="Mobile number *" error={fieldErrors.phone} className="border-r max-[650px]:border-r-0"><div className="mt-4 flex items-center gap-2 font-[Georgia] text-[24px]"><span className="text-black/45">+91</span><input value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel" pattern="[6-9][0-9]{9}" required placeholder="9876543210" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-black/45"/></div></Field>
                <Field label="PIN code *" error={fieldErrors.postalCode}><input value={form.postalCode} onChange={(e) => { setSelectedAddressId(""); update("postalCode", e.target.value.replace(/\D/g, "").slice(0, 6)); }} inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{6}" maxLength={6} required placeholder="342001" className={inputClass}/>{pincodeStatus.message ? <span className={`mt-2 block text-[7px] ${pincodeStatus.ok ? "text-[#347442]" : pincodeStatus.loading ? "text-black/50" : "text-[#b41f2b]"}`}>{pincodeStatus.message}</span> : null}</Field>
              </div>

              <Field label="Address line 1 *" error={fieldErrors.addressLine1}><input value={form.addressLine1} onChange={(e) => { setSelectedAddressId(""); update("addressLine1", e.target.value.slice(0, 220)); }} autoComplete="address-line1" minLength={5} maxLength={220} required placeholder="House / flat / building / street" className={inputClass}/></Field>
              <Field label="Address line 2" error={fieldErrors.addressLine2}><input value={form.addressLine2} onChange={(e) => update("addressLine2", e.target.value.slice(0, 220))} autoComplete="address-line2" maxLength={220} placeholder="Area / landmark (optional)" className={inputClass}/></Field>

              <div className="grid grid-cols-2 max-[650px]:grid-cols-1">
                <Field label="City / district *" error={fieldErrors.city} className="border-r max-[650px]:border-r-0"><input value={form.city} onChange={(e) => update("city", e.target.value.slice(0, 100))} autoComplete="address-level2" maxLength={100} required placeholder="Auto-filled from PIN" className={inputClass}/></Field>
                <Field label="State *" error={fieldErrors.state}><select value={form.state} onChange={(e) => update("state", e.target.value)} autoComplete="address-level1" required className={`${inputClass} cursor-pointer appearance-none`}><option value="">Select state</option>{STATES.map((state) => <option key={state} value={state}>{state}</option>)}</select></Field>
              </div>

              <Field label="Order note" error={fieldErrors.note}><textarea value={form.note} onChange={(e) => update("note", e.target.value.slice(0, 1000))} rows={3} maxLength={1000} placeholder="Anything we should know? (optional)" className="mt-4 w-full resize-none bg-transparent font-[Georgia] text-[22px] leading-[1.3] outline-none placeholder:text-black/45"/><span className="mt-2 block text-[7px] text-black/40">{form.note.length}/1000</span></Field>
            </section>

            <section className="mt-10">
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Payment / 02</span>
              <h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.92] tracking-[-.05em]">Choose how to<br/><em className="font-normal text-[#d13c3c]">complete the order.</em></h2>
              <div className="mt-7 grid grid-cols-2 border-l border-t border-black/10 bg-white max-[650px]:grid-cols-1">
                <button type="button" onClick={() => update("paymentMethod", "cod")} className={`min-h-[170px] border-b border-r p-6 text-left ${form.paymentMethod === "cod" ? "border-[#d13c3c] bg-[#d13c3c] text-white" : "border-black/10"}`}><span className="text-[7px] uppercase tracking-[.14em]">01 / Available</span><strong className="mt-12 block font-[Georgia] text-[28px] font-normal">Cash on delivery</strong></button>
                <button type="button" onClick={() => update("paymentMethod", "online")} className={`min-h-[170px] border-b border-r p-6 text-left ${form.paymentMethod === "online" ? "bg-black text-white" : "border-black/10"}`}><span className="text-[7px] uppercase tracking-[.14em]">02 / Gateway pending</span><strong className="mt-12 block font-[Georgia] text-[28px] font-normal">Secure online payment</strong></button>
              </div>
            </section>

            {error ? <div role="alert" className="mt-6 border border-[#d13c3c]/20 bg-[#d13c3c]/10 px-5 py-4 text-[9px] leading-5 text-[#a51622]">{error}</div> : null}
            <button disabled={submitting || hasUnavailableItems} className="group mt-8 flex w-full items-center justify-between bg-[#d13c3c] px-6 py-5 text-[8px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"><span>{submitting ? "Placing your order…" : form.paymentMethod === "cod" ? `Place order · ₹${total}` : `Continue to payment · ₹${total}`}</span><span>↗</span></button>
          </form>

          <aside className="self-start min-[1001px]:sticky min-[1001px]:top-[140px]">
            <div className="overflow-hidden border border-black/10 bg-white shadow-[0_24px_65px_rgba(0,0,0,.06)]">
              <div className="bg-[#111] px-6 py-6 text-white"><span className="text-[7px] font-semibold uppercase tracking-[.16em] text-[#d13c3c]">Your order / {String(itemCount).padStart(2, "0")} items</span><h2 className="mt-3 font-[Georgia] text-[35px] font-normal leading-none">The final edit.</h2></div>
              <div className="max-h-[390px] overflow-y-auto">
                {items.map((item) => <div key={item.slug} className="grid grid-cols-[88px_1fr_auto] gap-4 border-b border-black/10 p-4"><div className="relative grid aspect-square place-items-center bg-[#eee6dc]"><img {...responsiveImageProps(item.image, "72px")} alt={item.name} width="800" height="800" className="h-full w-full object-contain p-1" loading="lazy" decoding="async"/><span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-black px-1 text-[7px] text-white">{item.quantity}</span></div><div className="min-w-0 self-center"><span className="text-[6px] uppercase tracking-[.13em] text-black/55">{item.category}</span><strong className="mt-1 block font-[Georgia] text-[18px] font-normal leading-[1.05]">{item.name}</strong></div><strong className="self-center text-[9px]">₹{item.price * item.quantity}</strong></div>)}
              </div>
              <div className="p-6">
                <div className="mb-5 border-b border-black/10 pb-5"><span className="text-[6px] font-semibold uppercase tracking-[.14em] text-black/55">Coupon</span><div className="mt-2 grid grid-cols-[1fr_auto]"><input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 60))} maxLength={60} placeholder="ENTER CODE" className="border border-black/10 bg-transparent px-3 py-3 text-[8px] font-semibold uppercase tracking-[.12em] outline-none"/><button type="button" onClick={applyCoupon} className="bg-black px-4 text-[7px] font-semibold uppercase tracking-[.12em] text-white">{appliedCoupon ? "Update" : "Apply"}</button></div>{couponMessage ? <p className={`mt-2 text-[7px] ${appliedCoupon ? "text-[#347442]" : "text-[#d13c3c]"}`}>{couponMessage}</p> : null}{appliedCoupon ? <button type="button" onClick={() => { setAppliedCoupon(""); setCouponCode(""); setCouponMessage(""); }} className="mt-2 text-[6px] uppercase tracking-[.12em] underline">Remove coupon</button> : null}</div>
                <div className="space-y-3 border-b border-black/10 pb-5 text-[9px]"><div className="flex justify-between"><span className="text-black/55">Subtotal</span><strong>₹{subtotal}</strong></div>{discount > 0 ? <div className="flex justify-between text-[#347442]"><span>Coupon {appliedCoupon}</span><strong>-₹{discount}</strong></div> : null}{commerce.taxEnabled ? <div className="flex justify-between"><span className="text-black/55">Tax {commerce.taxMode === "inclusive" ? `(included · ${commerce.taxRate}%)` : `(${commerce.taxRate}%)`}</span><strong>{commerce.taxMode === "inclusive" ? `₹${tax} incl.` : `₹${tax}`}</strong></div> : null}<div className="flex justify-between"><span className="text-black/55">Delivery</span><strong>{shipping === 0 ? "Complimentary" : `₹${shipping}`}</strong></div></div>
                <div className="flex items-end justify-between gap-4 pt-5"><div><span className="text-[7px] uppercase tracking-[.14em] text-black/55">Order total</span><p className="mt-1 text-[7px] text-black/50">Coupon → tax → delivery is revalidated by the server.</p></div><strong className="font-[Georgia] text-[32px] font-normal">₹{total}</strong></div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 border-l border-t border-black/10 bg-white"><Link to="/cart" className="border-b border-r border-black/10 p-5"><span className="text-[6px] uppercase tracking-[.14em] text-black/55">Edit</span><strong className="mt-5 block font-[Georgia] text-[20px] font-normal">Back to cart ↗</strong></Link><Link to="/contact" className="border-b border-r border-black/10 p-5"><span className="text-[6px] uppercase tracking-[.14em] text-black/55">Help</span><strong className="mt-5 block font-[Georgia] text-[20px] font-normal">Customer care ↗</strong></Link></div>
          </aside>
        </div>
      </section>
      <div className="h-3 bg-[#d13c3c]"/>
    </main>
  );
}
