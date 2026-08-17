/** Creates and persists a stable invoice identifier for an order exactly once. */
export async function ensureInvoiceNumber(order) {
  if (order.invoiceNumber) return order.invoiceNumber;
  const year = new Date(order.createdAt || Date.now()).getFullYear();
  const suffix = String(order._id).slice(-8).toUpperCase();
  order.invoiceNumber = `INV-${year}-${suffix}`;
  order.invoiceIssuedAt = order.invoiceIssuedAt || new Date();
  await order.save();
  return order.invoiceNumber;
}
