/**
 * Reusable admin UI component for admin status. Keeps admin presentation and interaction patterns consistent across dashboard pages.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

const styles = {
  placed: "bg-[#e8e1d8] text-[#5c5147]",
  confirmed: "bg-[#e9e1cc] text-[#7a5d0c]",
  processing: "bg-[#dce7ef] text-[#275b78]",
  shipped: "bg-[#dedff0] text-[#4c4f86]",
  out_for_delivery: "bg-[#e7ddee] text-[#704d82]",
  delivered: "bg-[#dceadd] text-[#32683b]",
  cancelled: "bg-[#f0dddd] text-[#8a3434]",
  paid: "bg-[#dceadd] text-[#32683b]",
  cod_pending: "bg-[#e9e1cc] text-[#7a5d0c]",
  pending: "bg-[#e8e1d8] text-[#5c5147]",
  failed: "bg-[#f0dddd] text-[#8a3434]",
  refunded: "bg-[#dedff0] text-[#4c4f86]",
  new: "bg-[#f0dddd] text-[#8a3434]",
  read: "bg-[#dce7ef] text-[#275b78]",
  replied: "bg-[#dceadd] text-[#32683b]",
  closed: "bg-[#e8e1d8] text-[#5c5147]",
  subscribed: "bg-[#dceadd] text-[#32683b]",
  unsubscribed: "bg-[#e8e1d8] text-[#5c5147]",
};

/**
 * Renders the Admin Status component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminStatus({ value }) {
  return <span className={`inline-flex shrink-0 whitespace-nowrap px-2.5 py-1.5 text-[6.5px] font-semibold uppercase tracking-[.12em] ${styles[value] || "bg-black/5 text-black/65"}`}>{String(value || "—").replaceAll("_", " ")}</span>;
}
