/**
 * Prints a premium A4 Beyonist order invoice from the immutable order snapshot.
 *
 * Pricing is display-only here: checkout/server pricing remains the source of
 * truth. The breakdown intentionally follows subtotal -> coupon -> tax ->
 * delivery -> total so the printed document mirrors the commerce engine.
 */

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]),
  );
}

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const dateTime = (value) => new Date(value).toLocaleString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function statusLabel(value) {
  return String(value || "—").replaceAll("_", " ");
}

function paymentLabel(order) {
  const method = order.paymentMethod === "cod" ? "Cash on delivery" : "Online payment";
  return `${method} · ${statusLabel(order.paymentStatus)}`;
}

export function printOrderBill(payload) {
  const order = payload?.order || {};
  const seller = payload?.seller || {};
  const address = order.shippingAddress || {};
  const customer = order.customer || {};

  const subtotal = Number(order.subtotal || 0);
  const discountAmount = Math.max(Number(order.discountAmount || 0), 0);
  const discountedSubtotal = Number.isFinite(Number(order.discountedSubtotal))
    && Number(order.discountedSubtotal) >= 0
    ? Number(order.discountedSubtotal)
    : Math.max(subtotal - discountAmount, 0);

  const taxEnabled = Boolean(order.taxEnabled) && Number(order.taxRate || 0) > 0;
  const taxAmount = Math.max(Number(order.taxAmount || 0), 0);
  const shippingAmount = Math.max(Number(order.shippingAmount || 0), 0);
  const couponApplied = discountAmount > 0 && Boolean(order.couponCode);
  const deliveryIsFree = shippingAmount === 0;

  const logoUrl = `${window.location.origin}/brand/beyonist-wordmark-black.webp`;

  const rows = (order.items || []).map((item, index) => `
    <tr>
      <td class="index">${String(index + 1).padStart(2, "0")}</td>
      <td>
        <strong class="product-name">${escapeHtml(item.name)}</strong>
        <small>${escapeHtml(item.slug)}</small>
      </td>
      <td class="num">${Number(item.quantity || 0)}</td>
      <td class="num">${money(item.price)}</td>
      <td class="num amount">${money(Number(item.price || 0) * Number(item.quantity || 0))}</td>
    </tr>
  `).join("");

  const couponRow = couponApplied
    ? `<div class="summary-row saving">
        <span><b>Coupon</b><small>${escapeHtml(order.couponCode)}</small></span>
        <strong>- ${money(discountAmount)}</strong>
      </div>
      <div class="summary-row net">
        <span>After discount</span>
        <strong>${money(discountedSubtotal)}</strong>
      </div>`
    : "";

  const taxRow = taxEnabled
    ? `<div class="summary-row">
        <span>
          Tax
          <small>${escapeHtml(order.taxMode === "inclusive" ? `Included · ${order.taxRate}%` : `${order.taxRate}%`)}</small>
        </span>
        <strong>${money(taxAmount)}</strong>
      </div>`
    : "";

  const deliveryRow = `
    <div class="summary-row">
      <span>Delivery${deliveryIsFree ? "<small>Complimentary</small>" : ""}</span>
      <strong>${deliveryIsFree ? "₹0.00" : money(shippingAmount)}</strong>
    </div>`;

  const win = window.open("", "_blank", "width=980,height=960");
  if (!win) throw new Error("Pop-up blocked. Allow pop-ups to print the invoice.");

  win.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(order.invoiceNumber || order.orderNumber)} — Beyonist Invoice</title>
  <style>
    :root{
      --ink:#111111;
      --red:#c83239;
      --cream:#f7f3ed;
      --line:#ddd6cd;
      --muted:#746e68;
      --green:#337144;
    }
    *{box-sizing:border-box}
    html{background:#ece7df}
    body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);background:#ece7df}
    main{width:210mm;min-height:297mm;margin:20px auto;background:#fff;padding:16mm 17mm 15mm;box-shadow:0 22px 65px rgba(0,0,0,.12)}
    .serif,h1,h2,h3{font-family:Georgia,"Times New Roman",serif;font-weight:400}
    .eyebrow{font-size:8px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--red)}
    .muted{color:var(--muted)}
    .top{display:grid;grid-template-columns:1fr auto;gap:32px;align-items:start;padding-bottom:20px;border-bottom:1.5px solid var(--ink)}
    .logo{display:block;width:184px;height:auto;object-fit:contain}
    .brand-note{margin-top:10px;font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
    .document{text-align:right}
    .document h1{margin:7px 0 3px;font-size:31px;line-height:1;letter-spacing:-.035em}
    .document .meta{font-size:9px;line-height:1.7;color:var(--muted)}
    .accent-bar{height:7px;background:linear-gradient(90deg,var(--red) 0 31%,var(--ink) 31% 100%);margin:18px 0 22px}
    .parties{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .party{min-height:148px;padding:18px;background:var(--cream);border-top:3px solid var(--ink)}
    .party.ship{border-color:var(--red)}
    .party h2{margin:10px 0 12px;font-size:21px;line-height:1.05}
    .party p{margin:5px 0;font-size:10px;line-height:1.55}
    .order-strip{display:grid;grid-template-columns:repeat(4,1fr);margin-top:16px;border:1px solid var(--line)}
    .order-strip>div{padding:11px 13px;border-right:1px solid var(--line)}
    .order-strip>div:last-child{border-right:0}
    .order-strip span{display:block;font-size:6px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--muted)}
    .order-strip strong{display:block;margin-top:5px;font-size:9px;text-transform:capitalize}
    .items-title{display:flex;align-items:end;justify-content:space-between;margin-top:26px;padding-bottom:9px;border-bottom:1px solid var(--ink)}
    .items-title h3{margin:0;font-size:20px}
    .items-title span{font-size:7px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted)}
    table{width:100%;border-collapse:collapse}
    th,td{padding:12px 7px;border-bottom:1px solid var(--line);text-align:left;vertical-align:middle}
    th{padding-top:10px;padding-bottom:8px;font-size:7px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted)}
    td{font-size:10px}
    td.index{width:34px;color:var(--red);font-size:7px;font-weight:700}
    .product-name{font-size:10px}
    td small{display:block;margin-top:4px;font-size:7px;color:var(--muted)}
    .num{text-align:right;white-space:nowrap}
    .amount{font-weight:700}
    .settlement{display:grid;grid-template-columns:1fr 330px;gap:28px;margin-top:22px;align-items:start}
    .note-card{padding:18px;background:#111;color:white;min-height:136px}
    .note-card .eyebrow{color:#e35158}
    .note-card h3{margin:12px 0 8px;font-size:20px}
    .note-card p{margin:0;font-size:8px;line-height:1.65;color:rgba(255,255,255,.64)}
    .summary{border-top:3px solid var(--ink)}
    .summary-row{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:9px 3px;border-bottom:1px solid var(--line);font-size:10px}
    .summary-row span{display:flex;align-items:center;gap:7px}
    .summary-row small{font-size:6.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
    .summary-row.saving{color:var(--green)}
    .summary-row.saving small{color:var(--green);border:1px solid rgba(51,113,68,.3);padding:3px 5px}
    .summary-row.net{background:var(--cream);padding-left:9px;padding-right:9px}
    .grand{display:flex;align-items:end;justify-content:space-between;padding:15px 3px 0}
    .grand span{font-family:Georgia,serif;font-size:19px}
    .grand strong{font-family:Georgia,serif;font-size:28px;font-weight:400}
    .footer{display:grid;grid-template-columns:1.25fr .75fr;gap:22px;margin-top:28px;padding-top:14px;border-top:1px solid var(--line)}
    .footer p{margin:0;font-size:7.5px;line-height:1.65;color:var(--muted)}
    .footer .right{text-align:right}
    .footer strong{color:var(--ink)}
    @media(max-width:760px){
      main{width:100%;min-height:0;margin:0;padding:24px;box-shadow:none}
      .top,.parties,.settlement,.footer{grid-template-columns:1fr}
      .document,.footer .right{text-align:left}
      .order-strip{grid-template-columns:1fr 1fr}
      .order-strip>div:nth-child(2){border-right:0}
      .order-strip>div:nth-child(-n+2){border-bottom:1px solid var(--line)}
      .settlement{gap:14px}
      .summary{width:100%}
    }
    .settlement-clean{grid-template-columns:1fr;justify-items:end}
    .settlement-clean>div{width:min(100%,520px)}
    @media print{
      html,body{background:#fff}
      main{width:auto;min-height:auto;margin:0;padding:10mm 11mm;box-shadow:none}
      @page{size:A4;margin:0}
      .accent-bar{print-color-adjust:exact;-webkit-print-color-adjust:exact}
      .party,.note-card,.summary-row.net{print-color-adjust:exact;-webkit-print-color-adjust:exact}
    }
  </style>
</head>
<body>
<main>
  <header class="top">
    <div>
      <img class="logo" src="${escapeHtml(logoUrl)}" alt="Beyonist">
      <div class="brand-note">Skin beyond ordinary</div>
    </div>
    <div class="document">
      <div class="eyebrow">${escapeHtml(payload.documentType || "ORDER INVOICE")}</div>
      <h1>${escapeHtml(order.invoiceNumber || "Invoice pending")}</h1>
      <div class="meta">
        Invoice No. ${escapeHtml(order.invoiceNumber || "—")}<br>
        Order No. ${escapeHtml(order.orderNumber || "—")}<br>
        Order date ${dateTime(order.createdAt)}<br>
        Invoice issued ${dateTime(order.invoiceIssuedAt || payload.generatedAt || new Date())}
      </div>
    </div>
  </header>

  <div class="accent-bar"></div>

  <section class="parties">
    <div class="party">
      <div class="eyebrow">Sold by</div>
      <h2>${escapeHtml(seller.name || "Beyonist")}</h2>
      <p>${escapeHtml(seller.address || "")}</p>
      ${seller.phone ? `<p>${escapeHtml(seller.phone)}</p>` : ""}
      ${seller.email ? `<p>${escapeHtml(seller.email)}</p>` : ""}
      ${seller.gstin ? `<p><strong>GSTIN</strong> ${escapeHtml(seller.gstin)}</p>` : ""}
    </div>

    <div class="party ship">
      <div class="eyebrow">Bill to / Ship to</div>
      <h2>${escapeHtml(customer.name || "Customer")}</h2>
      <p>${escapeHtml(customer.phone || "")}${customer.phone && order.email ? " · " : ""}${escapeHtml(order.email || customer.email || "")}</p>
      <p>${escapeHtml(address.addressLine1 || "")}${address.addressLine2 ? `<br>${escapeHtml(address.addressLine2)}` : ""}</p>
      <p>${escapeHtml(address.city || "")}${address.city ? ", " : ""}${escapeHtml(address.state || "")} ${escapeHtml(address.postalCode || "")}${address.country ? `<br>${escapeHtml(address.country)}` : ""}</p>
    </div>
  </section>

  <section class="order-strip">
    <div><span>Order status</span><strong>${escapeHtml(statusLabel(order.status))}</strong></div>
    <div><span>Payment</span><strong>${escapeHtml(paymentLabel(order))}</strong></div>
    <div><span>Items</span><strong>${Number(order.items?.length || 0)}</strong></div>
    <div><span>Currency</span><strong>INR</strong></div>
  </section>

  <section>
    <div class="items-title">
      <h3>Order contents</h3>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th class="num">Qty</th>
          <th class="num">Rate</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </section>

  <section class="settlement settlement-clean">
    <div>
      <div class="summary">
        <div class="summary-row">
          <span>Subtotal</span>
          <strong>${money(subtotal)}</strong>
        </div>
        ${couponRow}
        ${taxRow}
        ${deliveryRow}
      </div>
      <div class="grand">
        <span>Total</span>
        <strong>${money(order.total)}</strong>
      </div>
    </div>
  </section>

</main>

<script>
  window.addEventListener("load", () => {
    window.setTimeout(() => window.print(), 180);
  });
</script>
</body>
</html>`);

  win.document.close();
}
