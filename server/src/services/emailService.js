/**
 * Server service for email service. Encapsulates reusable business/security logic outside route handlers.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Implements the email config operation used by this module.
 */
function emailConfig() {
  return {
    apiKey: String(process.env.RESEND_API_KEY || "").trim(),
    from: String(process.env.RESEND_FROM_EMAIL || "").trim(),
    siteUrl: String(process.env.PUBLIC_SITE_URL || process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, ""),
  };
}

/**
 * Implements the money operation used by this module.
 */
function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

/**
 * Implements the escape html operation used by this module.
 */
function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Sends email through the configured delivery service.
 */
async function sendEmail({ to, subject, html, text, idempotencyKey }) {
  const { apiKey, from } = emailConfig();

  if (!apiKey || !from) {
    console.warn("[email] RESEND_API_KEY or RESEND_FROM_EMAIL is missing; email skipped.");
    return { sent: false, reason: "not_configured" };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "beyonist-server/1.0",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (process.env.NODE_ENV === "production") {
        console.error("[email] Resend send failed:", response.status);
      } else {
        console.error("[email] Resend send failed:", response.status, payload);
      }
      return {
        sent: false,
        reason: "provider_error",
        status: response.status,
        providerMessage:
          payload?.message ||
          payload?.error?.message ||
          payload?.name ||
          "Resend rejected the request.",
      };
    }

    return { sent: true, id: payload.id || null };
  } catch (error) {
    console.error("[email] Resend request failed:", process.env.NODE_ENV === "production" ? error?.name || "network_error" : error);
    return { sent: false, reason: "network_error" };
  }
}

/**
 * Sends order confirmation email through the configured delivery service.
 */
export async function sendOrderConfirmationEmail(order) {
  const { siteUrl } = emailConfig();
  const trackUrl = `${siteUrl}/track-order?order=${encodeURIComponent(order.orderNumber)}`;

  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;">${escapeHtml(item.name)} × ${item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;">${money(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const subject = `Beyonist order confirmed — ${order.orderNumber}`;
  const html = `
    <div style="background:#f5f1ea;padding:32px;font-family:Arial,sans-serif;color:#111;">
      <div style="max-width:640px;margin:auto;background:#fffdf8;border:1px solid #e8e0d7;">
        <div style="background:#cf1f2e;color:#fff;padding:28px 32px;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:.7;">Beyonist / Order confirmed</div>
          <h1 style="font-family:Georgia,serif;font-weight:400;font-size:42px;line-height:1;margin:14px 0 0;">Your ritual is on the way.</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 22px;">Hi ${escapeHtml(order.customer.name)},</p>
          <p style="line-height:1.7;color:#555;">We received your order. You can use the reference below to track it whether you checked out as a guest or as a signed-in customer.</p>
          <div style="margin:28px 0;padding:22px;background:#f5f1ea;">
            <div style="font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:#777;">Order reference</div>
            <div style="font-family:Georgia,serif;font-size:28px;margin-top:8px;">${escapeHtml(order.orderNumber)}</div>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
          <table style="width:100%;margin-top:20px;font-size:14px;">
            <tr><td style="padding:6px 0;color:#666;">Subtotal</td><td style="padding:6px 0;text-align:right;">${money(order.subtotal)}</td></tr>
            ${order.discountAmount > 0 ? `<tr><td style="padding:6px 0;color:#337144;">Coupon ${escapeHtml(order.couponCode || "")}</td><td style="padding:6px 0;text-align:right;color:#337144;">- ${money(order.discountAmount)}</td></tr><tr><td style="padding:6px 0;color:#666;">After discount</td><td style="padding:6px 0;text-align:right;">${money(order.discountedSubtotal)}</td></tr>` : ""}
            ${order.taxEnabled ? `<tr><td style="padding:6px 0;color:#666;">Tax ${order.taxMode === "inclusive" ? `(included · ${order.taxRate}%)` : `(${order.taxRate}%)`}</td><td style="padding:6px 0;text-align:right;">${money(order.taxAmount)}</td></tr>` : ""}
            <tr><td style="padding:6px 0;color:#666;">Delivery</td><td style="padding:6px 0;text-align:right;">${order.shippingAmount ? money(order.shippingAmount) : "Complimentary"}</td></tr>
            <tr><td style="padding:10px 0;font-weight:bold;border-top:1px solid #ddd;">Total</td><td style="padding:10px 0;text-align:right;font-weight:bold;border-top:1px solid #ddd;">${money(order.total)}</td></tr>
          </table>
          <div style="margin-top:28px;padding-top:24px;border-top:1px solid #eee;line-height:1.7;color:#555;">
            <strong>Delivering to</strong><br/>
            ${escapeHtml(order.shippingAddress.addressLine1)}${order.shippingAddress.addressLine2 ? `, ${escapeHtml(order.shippingAddress.addressLine2)}` : ""}<br/>
            ${escapeHtml(order.shippingAddress.city)}, ${escapeHtml(order.shippingAddress.state)} ${escapeHtml(order.shippingAddress.postalCode)}
          </div>
          <a href="${trackUrl}" style="display:inline-block;margin-top:28px;background:#111;color:#fff;text-decoration:none;padding:14px 20px;font-size:11px;letter-spacing:1.3px;text-transform:uppercase;">Track your order →</a>
        </div>
      </div>
    </div>`;

  const text = `Beyonist order confirmed\n\nOrder: ${order.orderNumber}\nTotal: ${money(order.total)}\nStatus: ${order.status}\nTrack: ${trackUrl}`;

  return sendEmail({
    to: order.customer.email,
    subject,
    html,
    text,
    idempotencyKey: `order-confirmed-${order.orderNumber}`,
  });
}

/**
 * Sends order status email through the configured delivery service.
 */
export async function sendOrderStatusEmail(order, previousStatus, { reviewToken = "" } = {}) {
  const { siteUrl } = emailConfig();
  const trackUrl = `${siteUrl}/track-order?order=${encodeURIComponent(order.orderNumber)}`;
  const reviewUrl = reviewToken ? `${siteUrl}/review-order?order=${encodeURIComponent(order.orderNumber)}&token=${encodeURIComponent(reviewToken)}` : "";
  const prettyStatus = String(order.status || "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  const subject = `Beyonist order update — ${order.orderNumber} is ${prettyStatus}`;
  const html = `
    <div style="background:#f5f1ea;padding:32px;font-family:Arial,sans-serif;color:#111;">
      <div style="max-width:640px;margin:auto;background:#fffdf8;border:1px solid #e8e0d7;">
        <div style="background:#111;color:#fff;padding:28px 32px;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#cf1f2e;">Beyonist / Order update</div>
          <h1 style="font-family:Georgia,serif;font-weight:400;font-size:42px;line-height:1;margin:14px 0 0;">Your order is ${escapeHtml(prettyStatus)}.</h1>
        </div>
        <div style="padding:32px;">
          <p>Hi ${escapeHtml(order.customer.name)},</p>
          <p style="line-height:1.7;color:#555;">There is a new update for <strong>${escapeHtml(order.orderNumber)}</strong>.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:26px 0;">
            <div style="background:#f5f1ea;padding:18px;"><div style="font-size:10px;text-transform:uppercase;color:#777;">Previous</div><div style="margin-top:7px;">${escapeHtml(String(previousStatus || "placed").replaceAll("_", " "))}</div></div>
            <div style="background:#cf1f2e;color:#fff;padding:18px;"><div style="font-size:10px;text-transform:uppercase;opacity:.65;">Now</div><div style="margin-top:7px;">${escapeHtml(prettyStatus)}</div></div>
          </div>
          ${order.trackingNumber ? `<p style="line-height:1.7;color:#555;"><strong>Tracking number:</strong> ${escapeHtml(order.trackingNumber)}${order.courier ? `<br/><strong>Courier:</strong> ${escapeHtml(order.courier)}` : ""}</p>` : ""}
          <a href="${trackUrl}" style="display:inline-block;margin-top:24px;background:#cf1f2e;color:#fff;text-decoration:none;padding:14px 20px;font-size:11px;letter-spacing:1.3px;text-transform:uppercase;">View latest status →</a>
          ${order.status === "delivered" && reviewUrl ? `<div style="margin-top:24px;padding:24px;background:#f5f1ea;border-left:4px solid #cf1f2e;"><div style="font-family:Georgia,serif;font-size:26px;line-height:1.1;">How did your Beyonist order feel?</div><p style="line-height:1.7;color:#666;">Rate the overall order and each product separately. Your review is sent to our team for moderation before it can appear on the website.</p><a href="${reviewUrl}" style="display:inline-block;margin-top:8px;background:#111;color:#fff;text-decoration:none;padding:14px 20px;font-size:11px;letter-spacing:1.3px;text-transform:uppercase;">Rate your order →</a></div>` : ""}
        </div>
      </div>
    </div>`;

  const text = `Beyonist order update\n\nOrder: ${order.orderNumber}\nStatus: ${prettyStatus}${order.trackingNumber ? `\nTracking: ${order.trackingNumber}` : ""}\nTrack: ${trackUrl}${order.status === "delivered" && reviewUrl ? `\nRate your order: ${reviewUrl}` : ""}`;

  return sendEmail({
    to: order.customer.email,
    subject,
    html,
    text,
    idempotencyKey: `order-status-${order.orderNumber}-${order.status}-${String(order.updatedAt?.getTime?.() || Date.now())}`,
  });
}


/**
 * Sends password reset email through the configured delivery service.
 */
export async function sendPasswordResetEmail(customer, rawToken) {
  const { siteUrl } = emailConfig();
  const resetUrl = `${siteUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

  const subject = "Reset your Beyonist password";
  const html = `
    <div style="background:#f5f1ea;padding:32px;font-family:Arial,sans-serif;color:#111;">
      <div style="max-width:640px;margin:auto;background:#fffdf8;border:1px solid #e8e0d7;">
        <div style="background:#111;color:#fff;padding:28px 32px;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#cf1f2e;">Beyonist / Account security</div>
          <h1 style="font-family:Georgia,serif;font-weight:400;font-size:42px;line-height:1;margin:14px 0 0;">Reset your password.</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 18px;">Hi ${escapeHtml(customer.name)},</p>
          <p style="line-height:1.7;color:#555;">We received a request to reset the password for your Beyonist customer account.</p>
          <p style="line-height:1.7;color:#555;">This link expires in 30 minutes and can be used only once.</p>
          <a href="${resetUrl}" style="display:inline-block;margin-top:24px;background:#cf1f2e;color:#fff;text-decoration:none;padding:14px 20px;font-size:11px;letter-spacing:1.3px;text-transform:uppercase;">Reset password →</a>
          <div style="margin-top:28px;padding-top:24px;border-top:1px solid #eee;font-size:12px;line-height:1.7;color:#777;">
            If you did not request this, you can ignore this email. Your password will remain unchanged.
          </div>
        </div>
      </div>
    </div>`;

  const text = `Reset your Beyonist password\n\nThis link expires in 30 minutes and can be used only once:\n${resetUrl}\n\nIf you did not request this, ignore this email.`;

  return sendEmail({
    to: customer.email,
    subject,
    html,
    text,
    idempotencyKey: `password-reset-${customer._id}-${Date.now()}`,
  });
}


/**
 * Sends admin password reset email through the configured delivery service.
 */
export async function sendAdminPasswordResetEmail(admin, rawToken) {
  const { siteUrl } = emailConfig();
  const resetUrl = `${siteUrl}/admin/reset-password?token=${encodeURIComponent(rawToken)}`;

  const subject = "Beyonist admin password reset";
  const html = `
    <div style="background:#0b0b0b;padding:36px;font-family:Arial,sans-serif;color:#fff;">
      <div style="max-width:640px;margin:auto;border:1px solid #2a2a2a;background:#111;">
        <div style="padding:30px 34px;border-bottom:1px solid #2a2a2a;">
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#cf1f2e;">Beyonist / Admin security</div>
          <h1 style="font-family:Georgia,serif;font-weight:400;font-size:42px;line-height:1;margin:14px 0 0;">Reset administrator access.</h1>
        </div>
        <div style="padding:34px;color:#b8b8b8;line-height:1.7;">
          <p>Hi ${escapeHtml(admin.name)},</p>
          <p>A password reset was requested for your Beyonist administrator account.</p>
          <p>This secure link expires in <strong style="color:#fff;">20 minutes</strong>, is single-use, and a successful reset signs out all existing admin sessions.</p>
          <a href="${resetUrl}" style="display:inline-block;margin-top:24px;background:#cf1f2e;color:#fff;text-decoration:none;padding:14px 20px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;">Reset admin password →</a>
          <div style="margin-top:28px;padding-top:24px;border-top:1px solid #2a2a2a;font-size:12px;color:#777;">If you did not request this, ignore the message and review administrator access.</div>
        </div>
      </div>
    </div>`;

  const text = `Beyonist admin password reset\n\nThis secure link expires in 20 minutes and can be used once:\n${resetUrl}\n\nIf you did not request it, ignore this email.`;

  return sendEmail({
    to: admin.email,
    subject,
    html,
    text,
    idempotencyKey: `admin-password-reset-${admin._id}-${Date.now()}`,
  });
}
