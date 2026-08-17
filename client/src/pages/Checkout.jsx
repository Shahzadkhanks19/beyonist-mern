/**
 * Customer-facing Checkout page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useCart } from "../context/CartContext.jsx";
import { createOrder, getCommerceQuote, getCommerceSettings } from "../services/checkoutApi.js";
import { responsiveImageProps } from "../utils/productImagePath.js";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh",
  "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
  "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu and Kashmir","Ladakh","Puducherry"
];

/**
 * Renders the Step component and coordinates the state/behavior owned by this UI boundary.
 */
function Step({ number, label, active = false, complete = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`grid h-7 w-7 place-items-center rounded-full border text-[7px] font-semibold ${
        complete ? "border-[#d13c3c] bg-[#d13c3c] text-white" : active ? "border-black bg-black text-white" : "border-black/15 text-black/65"
      }`}>{complete ? "✓" : number}</span>
      <span className={`text-[7px] font-semibold uppercase tracking-[.14em] ${active || complete ? "text-black" : "text-black/65"}`}>{label}</span>
    </div>
  );
}

/**
 * Renders the Field component and coordinates the state/behavior owned by this UI boundary.
 */
function Field({ label, children, className = "" }) {
  return (
    <label className={`group block border-b border-black/10 p-[clamp(20px,3vw,30px)] ${className}`}>
      <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65 transition group-focus-within:text-[#d13c3c]">{label}</span>
      {children}
    </label>
  );
}

/**
 * Renders the Checkout component and coordinates the state/behavior owned by this UI boundary.
 */
export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, itemCount, clearCart, hasUnavailableItems, unavailableItems, refreshAvailability } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "Haryana",
    postalCode: "",
    note: "",
    paymentMethod: "cod",
  });
  const [stateOpen, setStateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
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

  useEffect(() => {
    refreshAvailability().catch(() => {});
  }, []);

  useEffect(() => {
    getCommerceSettings().then((response) => setCommerce(response.data)).catch(() => {});
  }, []);

  useEffect(() => {
    getCommerceQuote(subtotal, appliedCoupon)
      .then((response) => setQuote(response.data))
      .catch(() => setQuote(null));
  }, [subtotal, appliedCoupon, commerce.standardDeliveryPrice, commerce.freeDeliveryThreshold, commerce.taxRate, commerce.taxMode]);

  const shipping = quote?.shippingAmount ?? (
    commerce.deliveryEnabled
      ? (commerce.freeDeliveryEnabled && subtotal >= commerce.freeDeliveryThreshold ? 0 : commerce.standardDeliveryPrice)
      : 0
  );
  const discount = quote?.discountAmount ?? 0;
  const tax = quote?.taxAmount ?? 0;
  const total = quote?.total ?? (subtotal + shipping);

  /**
   * Updates update while preserving the surrounding domain invariants.
   */
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const payload = useMemo(() => ({
    customer: {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    },
    shippingAddress: {
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      city: form.city.trim(),
      state: form.state,
      postalCode: form.postalCode.trim(),
      country: "India",
    },
    note: form.note.trim(),
    paymentMethod: form.paymentMethod,
    couponCode: appliedCoupon,
    items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
  }), [form, items, appliedCoupon]);

  /**
   * Validates validate and returns a normalized result for downstream logic.
   */
  const validate = () => {
    if (form.name.trim().length < 2) return "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) return "Enter a valid 10-digit Indian mobile number.";
    if (form.addressLine1.trim().length < 5) return "Enter your delivery address.";
    if (form.city.trim().length < 2) return "Enter your city.";
    if (!/^\d{6}$/.test(form.postalCode)) return "Enter a valid 6-digit PIN code.";
    return "";
  };

  /**
   * Implements the apply coupon operation used by this module.
   */
  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
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

  /**
   * Implements the place order operation used by this module.
   */
  const placeOrder = async (event) => {
    event.preventDefault();
    setError("");

    await refreshAvailability().catch(() => {});
    if (hasUnavailableItems) {
      setError("Your cart contains an out-of-stock or unavailable product. Return to your cart and remove it before placing the order.");
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
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
          message: "The checkout is ready for a payment gateway, but no live provider has been configured in this reconstruction yet.",
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
      navigate("/payment/failure", {
        state: {
          type: requestError.code || "order_failed",
          title: "We could not place the order.",
          message: requestError.message || "Please review the details and try again.",
          returnTo: "/checkout",
        },
      });
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
          <p className="mx-auto mt-6 max-w-xl text-[12px] leading-7 text-black/65">Add a formula to your cart before continuing.</p>
          <Link to="/shop" className="mt-8 inline-flex min-w-[220px] items-center justify-between bg-black px-6 py-4 text-[8px] font-semibold uppercase tracking-[.15em] text-white">
            <span>Return to shop</span><span>↗</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#fffaf1]">
      {/* Section 1: Secure Checkout / Beyonist. */}
      <section className="border-b border-black/10 bg-[#ffffff] px-[clamp(22px,5vw,78px)]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 py-5 max-[720px]:items-start max-[720px]:flex-col">
          <div>
            <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Secure Checkout / Beyonist</span>
            <p className="mt-2 font-[Georgia] text-[28px]">Complete the ritual.</p>
          </div>
          <div className="flex items-center gap-5 max-[560px]:gap-3">
            <Step number="01" label="Cart" complete />
            <span className="h-px w-8 bg-black/15 max-[560px]:w-4" />
            <Step number="02" label="Checkout" active />
            <span className="h-px w-8 bg-black/15 max-[560px]:w-4" />
            <Step number="03" label="Complete" />
          </div>
        </div>
      </section>

      {/* Section 2: Checkout paused. */}

      <section className="px-[clamp(22px,5vw,78px)] py-[clamp(55px,7vw,96px)]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1.2fr)_minmax(340px,.8fr)] gap-[clamp(45px,6vw,92px)] max-[1000px]:grid-cols-1">
          {hasUnavailableItems ? (
          <div className="mb-5 border border-[#d13c3c]/25 bg-[#d13c3c]/[.06] p-4">
            <span className="text-[7px] font-semibold uppercase tracking-[.14em] text-[#d13c3c]">Checkout paused</span>
            <p className="mt-2 text-[9px] leading-5 text-black/65">{unavailableItems.length} product(s) in your cart are currently out of stock or unavailable. Return to the cart and remove them before ordering.</p>
          </div>
        ) : null}

        <form onSubmit={placeOrder}>
            <div className="mb-10">
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Delivery details / 01</span>
              <h1 className="mt-4 font-[Georgia] text-[clamp(40px,5vw,72px)] font-normal leading-[.9] tracking-[-.055em]">Where should<br/><em className="font-normal text-[#d13c3c]">Beyonist arrive?</em></h1>
            </div>

            {/* Section 3: Page section 3. */}

            <section className="overflow-visible border border-black/10 bg-[#ffffff]">
              <div className="grid grid-cols-2 max-[650px]:grid-cols-1">
                <Field label="Full name *" className="border-r max-[650px]:border-r-0">
                  <input value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" placeholder="Your full name" className="mt-4 w-full bg-transparent font-[Georgia] text-[24px] outline-none placeholder:text-black/60" />
                </Field>
                <Field label="Email address *">
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" placeholder="you@example.com" className="mt-4 w-full bg-transparent font-[Georgia] text-[24px] outline-none placeholder:text-black/60" />
                </Field>
                <Field label="Mobile number *" className="border-r max-[650px]:border-r-0">
                  <div className="mt-4 flex items-center gap-2 font-[Georgia] text-[24px]">
                    <span className="text-black/65">+91</span>
                    <input value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel" placeholder="9876543210" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-black/60" />
                  </div>
                </Field>
                <Field label="PIN code *">
                  <input value={form.postalCode} onChange={(e) => update("postalCode", e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="postal-code" placeholder="122001" className="mt-4 w-full bg-transparent font-[Georgia] text-[24px] outline-none placeholder:text-black/60" />
                </Field>
              </div>

              <Field label="Address line 1 *">
                <input value={form.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} autoComplete="address-line1" placeholder="House / flat / building / street" className="mt-4 w-full bg-transparent font-[Georgia] text-[24px] outline-none placeholder:text-black/60" />
              </Field>

              <Field label="Address line 2">
                <input value={form.addressLine2} onChange={(e) => update("addressLine2", e.target.value)} autoComplete="address-line2" placeholder="Area / landmark (optional)" className="mt-4 w-full bg-transparent font-[Georgia] text-[24px] outline-none placeholder:text-black/60" />
              </Field>

              <div className="grid grid-cols-2 max-[650px]:grid-cols-1">
                <Field label="City *" className="border-r max-[650px]:border-r-0">
                  <input value={form.city} onChange={(e) => update("city", e.target.value)} autoComplete="address-level2" placeholder="Gurugram" className="mt-4 w-full bg-transparent font-[Georgia] text-[24px] outline-none placeholder:text-black/60" />
                </Field>

                <div className="relative border-b border-black/10 p-[clamp(20px,3vw,30px)]">
                  <span className="text-[7px] font-semibold uppercase tracking-[.15em] text-black/65">State *</span>
                  <button type="button" onClick={() => setStateOpen((v) => !v)} className="mt-4 flex w-full items-center justify-between font-[Georgia] text-[24px]">
                    <span>{form.state}</span><span className={`text-[14px] transition ${stateOpen ? "rotate-180" : ""}`}>⌄</span>
                  </button>

                  {stateOpen && (
                    <div className="absolute left-0 right-0 top-full z-30 max-h-[320px] overflow-y-auto border border-black/10 bg-[#ffffff] p-2 shadow-[0_22px_55px_rgba(0,0,0,.15)]">
                      {STATES.map((state) => (
                        <button key={state} type="button" onClick={() => { update("state", state); setStateOpen(false); }} className={`block w-full px-4 py-3 text-left text-[8px] uppercase tracking-[.11em] transition ${form.state === state ? "bg-[#d13c3c] text-white" : "hover:bg-black/[.045]"}`}>
                          {state}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Field label="Order note">
                <textarea value={form.note} onChange={(e) => update("note", e.target.value)} rows={3} placeholder="Anything we should know? (optional)" className="mt-4 w-full resize-none bg-transparent font-[Georgia] text-[22px] leading-[1.3] outline-none placeholder:text-black/60" />
              </Field>
            </section>

            {/* Section 4: Payment / 02. */}

            <section className="mt-10">
              <span className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#d13c3c]">Payment / 02</span>
              <h2 className="mt-4 font-[Georgia] text-[clamp(34px,4vw,56px)] font-normal leading-[.92] tracking-[-.05em]">Choose how to<br/><em className="font-normal text-[#d13c3c]">complete the order.</em></h2>

              <div className="mt-7 grid grid-cols-2 border-l border-t border-black/10 bg-[#ffffff] max-[650px]:grid-cols-1">
                <button type="button" onClick={() => update("paymentMethod", "cod")} className={`group min-h-[190px] border-b border-r p-6 text-left transition ${form.paymentMethod === "cod" ? "border-[#d13c3c] bg-[#d13c3c] text-white" : "border-black/10 hover:bg-white"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[7px] uppercase tracking-[.14em] ${form.paymentMethod === "cod" ? "text-white/90" : "text-black/65"}`}>01 / Available</span>
                    <span className={`grid h-6 w-6 place-items-center rounded-full border ${form.paymentMethod === "cod" ? "border-white bg-white text-[#d13c3c]" : "border-black/15 text-transparent"}`}>✓</span>
                  </div>
                  <strong className="mt-12 block font-[Georgia] text-[28px] font-normal">Cash on delivery</strong>
                  <p className={`mt-3 text-[9px] leading-5 ${form.paymentMethod === "cod" ? "text-white/90" : "text-black/65"}`}>Place the order now and pay according to the fulfilment method available to the store.</p>
                </button>

                <button type="button" onClick={() => update("paymentMethod", "online")} className={`group min-h-[190px] border-b border-r p-6 text-left transition ${form.paymentMethod === "online" ? "border-black bg-black text-white" : "border-black/10 hover:bg-white"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[7px] uppercase tracking-[.14em] ${form.paymentMethod === "online" ? "text-white/90" : "text-black/65"}`}>02 / Gateway ready</span>
                    <span className={`grid h-6 w-6 place-items-center rounded-full border ${form.paymentMethod === "online" ? "border-white bg-white text-black" : "border-black/15 text-transparent"}`}>✓</span>
                  </div>
                  <strong className="mt-12 block font-[Georgia] text-[28px] font-normal">Secure online payment</strong>
                  <p className={`mt-3 text-[9px] leading-5 ${form.paymentMethod === "online" ? "text-white/90" : "text-black/65"}`}>UI and payment states are ready. A live gateway must still be connected before real online transactions are accepted.</p>
                </button>
              </div>
            </section>

            {error ? <div className="mt-6 border border-[#d13c3c]/20 bg-[#d13c3c]/10 px-5 py-4 text-[9px] uppercase tracking-[.1em] text-[#a51622]">{error}</div> : null}

            <button disabled={submitting} className="group mt-8 flex w-full items-center justify-between bg-[#d13c3c] px-6 py-5 text-[8px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-black disabled:opacity-50">
              <span>{submitting ? "Placing your order..." : form.paymentMethod === "cod" ? `Place order · ₹${total}` : `Continue to payment · ₹${total}`}</span>
              <span className="transition-transform group-hover:translate-x-1">↗</span>
            </button>
          </form>

          <aside className="self-start min-[1001px]:sticky min-[1001px]:top-[140px]">
            <div className="overflow-hidden border border-black/10 bg-[#ffffff] shadow-[0_24px_65px_rgba(0,0,0,.06)]">
              <div className="bg-[#111] px-6 py-6 text-white">
                <span className="text-[7px] font-semibold uppercase tracking-[.16em] text-[#d13c3c]">Your order / {String(itemCount).padStart(2, "0")} items</span>
                <h2 className="mt-3 font-[Georgia] text-[35px] font-normal leading-none">The final edit.</h2>
              </div>

              <div className="max-h-[390px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.slug} className="grid grid-cols-[88px_1fr_auto] gap-4 border-b border-black/10 p-4">
                    <div className="relative grid aspect-square place-items-center bg-[#eee6dc]">
                      <img {...responsiveImageProps(item.image, "72px")} alt={item.name} width="800" height="800" className="h-full w-full object-contain p-1" loading="lazy" decoding="async"/>
                      <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-black px-1 text-[7px] text-white">{item.quantity}</span>
                    </div>
                    <div className="min-w-0 self-center">
                      <span className="text-[6px] uppercase tracking-[.13em] text-black/65">{item.category}</span>
                      <strong className="mt-1 block font-[Georgia] text-[18px] font-normal leading-[1.05]">{item.name}</strong>
                    </div>
                    <strong className="self-center text-[9px]">₹{item.price * item.quantity}</strong>
                  </div>
                ))}
              </div>

              <div className="p-6">
                <div className="mb-5 border-b border-black/10 pb-5">
                  <span className="text-[6px] font-semibold uppercase tracking-[.14em] text-black/65">Coupon</span>
                  <div className="mt-2 grid grid-cols-[1fr_auto]">
                    <input value={couponCode} onChange={(e)=>setCouponCode(e.target.value.toUpperCase())} placeholder="ENTER CODE" className="border border-black/10 bg-transparent px-3 py-3 text-[8px] font-semibold uppercase tracking-[.12em] outline-none"/>
                    <button type="button" onClick={applyCoupon} className="bg-black px-4 text-[7px] font-semibold uppercase tracking-[.12em] text-white">{appliedCoupon ? "Update" : "Apply"}</button>
                  </div>
                  {couponMessage ? <p className={`mt-2 text-[7px] ${appliedCoupon ? "text-[#3b7644]" : "text-[#d13c3c]"}`}>{couponMessage}</p> : null}
                  {appliedCoupon ? <button type="button" onClick={()=>{setAppliedCoupon("");setCouponCode("");setCouponMessage("");}} className="mt-2 text-[6px] uppercase tracking-[.12em] text-black/65 underline">Remove coupon</button> : null}
                </div>

                <div className="space-y-3 border-b border-black/10 pb-5 text-[9px]">
                  <div className="flex justify-between"><span className="text-black/65">Subtotal</span><strong>₹{subtotal}</strong></div>
                  {discount > 0 ? <div className="flex justify-between text-[#3b7644]"><span>Coupon {appliedCoupon}</span><strong>-₹{discount}</strong></div> : null}
                  <div className="flex justify-between"><span className="text-black/65">Delivery</span><strong>{shipping === 0 ? "Complimentary" : `₹${shipping}`}</strong></div>
                  {commerce.taxEnabled ? <div className="flex justify-between"><span className="text-black/65">Tax {commerce.taxMode === "inclusive" ? `(included · ${commerce.taxRate}%)` : `(${commerce.taxRate}%)`}</span><strong>{commerce.taxMode === "inclusive" ? `₹${tax} incl.` : `₹${tax}`}</strong></div> : null}
                </div>
                <div className="flex items-end justify-between gap-4 pt-5">
                  <div>
                    <span className="text-[7px] uppercase tracking-[.14em] text-black/65">Order total</span>
                    <p className="mt-1 text-[7px] text-black/65">Server revalidates products, coupon, delivery and tax before order creation.</p>
                  </div>
                  <strong className="font-[Georgia] text-[32px] font-normal">₹{total}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 border-l border-t border-black/10 bg-[#ffffff]">
              <Link to="/cart" className="border-b border-r border-black/10 p-5 transition hover:bg-white">
                <span className="text-[6px] uppercase tracking-[.14em] text-black/65">Edit</span>
                <strong className="mt-5 block font-[Georgia] text-[20px] font-normal">Back to cart ↗</strong>
              </Link>
              <Link to="/contact" className="border-b border-r border-black/10 p-5 transition hover:bg-white">
                <span className="text-[6px] uppercase tracking-[.14em] text-black/65">Help</span>
                <strong className="mt-5 block font-[Georgia] text-[20px] font-normal">Customer care ↗</strong>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <div className="h-3 bg-[#d13c3c]" />
    </main>
  );
}
