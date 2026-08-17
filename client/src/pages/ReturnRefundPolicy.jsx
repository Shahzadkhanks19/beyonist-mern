/**
 * Customer-facing Return Refund Policy page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import LegalPolicyLayout from "../components/LegalPolicyLayout.jsx";

const sections = [
  {
    title: "Eligibility for return",
    content: (
      <>
        <p>Eligible products may be returned through Beyonist customer support, subject to the condition of the item and the circumstances of the request.</p>
        <p>Customers should retain their order reference and provide enough information for the support team to identify the purchase.</p>
      </>
    ),
  },
  {
    title: "How to request a return",
    content: (
      <>
        <p>Contact customer care with the order number, product details and reason for the return. The support team will provide the appropriate return instructions where the request is eligible.</p>
        <p>The recovered policy states that customers may be responsible for return shipping costs unless the issue concerns a damaged or defective product or another resolution is agreed.</p>
      </>
    ),
  },
  {
    title: "Inspection and approval",
    content: (
      <>
        <p>Returned items may be inspected after receipt. A return is not treated as approved merely because the package has been sent back.</p>
        <p>Once inspection is complete, Beyonist will communicate whether the return has been accepted and what resolution applies.</p>
      </>
    ),
  },
  {
    title: "Refund timing",
    content: (
      <>
        <p>The recovered Beyonist return policy states that, once an eligible return is received, inspected and approved, the refund is processed to the original payment method within <strong>15 business days</strong>.</p>
        <p>Bank or payment-provider processing time may affect when the refunded amount appears after Beyonist has initiated it.</p>
      </>
    ),
  },
  {
    title: "Exchanges",
    content: (
      <>
        <p>The recovered policy allows an exchange request to follow the same return process. After the returned item is received and inspected, customer support can provide the next steps for an eligible exchange.</p>
      </>
    ),
  },
  {
    title: "Damaged or defective items",
    content: (
      <>
        <p>If an item arrives damaged or defective, contact customer support as soon as possible with the order reference and relevant details.</p>
        <p>The recovered policy states that Beyonist can arrange a replacement or refund according to the applicable resolution.</p>
      </>
    ),
  },
  {
    title: "Non-returnable or unsuitable requests",
    content: (
      <>
        <p>Some return requests may be declined where the product condition, hygiene considerations, misuse, missing contents or other circumstances make the item unsuitable for return.</p>
        <p>Customer care will review the order-specific circumstances before confirming the available resolution.</p>
      </>
    ),
  },
  {
    title: "Contact for returns",
    content: (
      <>
        <p>For a return, refund or exchange request, contact <strong>contact@beyonist.com</strong> or call <strong>+91 85279 99563</strong>.</p>
        <p>Keep the order number available so the support team can locate the purchase quickly.</p>
      </>
    ),
  },
];

/**
 * Renders the Return Refund Policy component and coordinates the state/behavior owned by this UI boundary.
 */
export default function ReturnRefundPolicy() {
  return (
    <LegalPolicyLayout
      eyebrow="Legal / Returns"
      title="Returns &"
      accent="Refunds."
      intro="A clearer view of how return requests, inspection, exchanges, damaged products and approved refunds are handled."
      highlights={[
        "Return requests begin with customer care.",
        "Returned items may be inspected before approval.",
        "Approved refunds: within 15 business days in the recovered policy.",
        "Damaged or defective items should be reported promptly.",
      ]}
      sections={sections}
    />
  );
}
