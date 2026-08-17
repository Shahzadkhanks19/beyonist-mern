/**
 * Customer-facing Shipping Policy page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import LegalPolicyLayout from "../components/LegalPolicyLayout.jsx";

const sections = [
  {
    title: "Shipping methods",
    content: (
      <>
        <p>The recovered Beyonist policy lists multiple shipping methods for customer orders.</p>
        <ul>
          <li><strong>Standard shipping:</strong> typically 7 business days for delivery within India.</li>
          <li><strong>Express shipping:</strong> generally 5 business days for delivery within India.</li>
          <li><strong>International shipping:</strong> listed in the recovered policy, with timing dependent on destination and availability.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Shipping cost",
    content: (
      <>
        <p>Shipping cost may depend on the selected method, destination and order characteristics.</p>
        <p>The reconstructed storefront currently unlocks complimentary standard shipping when the cart subtotal reaches <strong>₹999</strong>. Below that threshold, the current checkout calculation applies the configured shipping charge.</p>
      </>
    ),
  },
  {
    title: "Order processing",
    content: (
      <>
        <p>The recovered shipping policy states that order processing typically takes <strong>2 business days</strong>.</p>
        <p>Order confirmation is sent to the checkout email for both guest and signed-in customers. Status updates may also be sent as the order progresses.</p>
      </>
    ),
  },
  {
    title: "Tracking",
    content: (
      <>
        <p>Once tracking information is available, customers can use the Track Order page to follow the order using the order reference.</p>
        <p>Signed-in customers can also see their linked order history and tracking actions from the customer dashboard.</p>
      </>
    ),
  },
  {
    title: "Estimated delivery times",
    content: (
      <>
        <p>Delivery estimates are guidelines rather than guaranteed delivery dates. Holidays, courier operations, location, weather and other external events may affect actual timing.</p>
      </>
    ),
  },
  {
    title: "Order status updates",
    content: (
      <>
        <p>The reconstructed order system supports confirmation and status-update emails for both guest and signed-in purchases using the email supplied during checkout.</p>
        <p>Statuses may include placed, confirmed, processing, shipped, out for delivery, delivered or cancelled.</p>
      </>
    ),
  },
  {
    title: "Delivery address",
    content: (
      <>
        <p>Please provide complete and accurate shipping information during checkout. Incomplete or inaccurate address details may cause delay or failed delivery.</p>
        <p>Signed-in customers may save multiple addresses and choose a default delivery address from their customer dashboard.</p>
      </>
    ),
  },
  {
    title: "Questions about delivery",
    content: (
      <>
        <p>For delivery or tracking questions, contact <strong>contact@beyonist.com</strong> or call <strong>+91 85279 99563</strong>.</p>
        <p>You can also open Track Order directly from the navbar or customer dashboard.</p>
      </>
    ),
  },
];

/**
 * Renders the Shipping Policy component and coordinates the state/behavior owned by this UI boundary.
 */
export default function ShippingPolicy() {
  return (
    <LegalPolicyLayout
      eyebrow="Legal / Shipping"
      title="Shipping"
      accent="Policy."
      intro="Processing, delivery estimates, tracking and address expectations for Beyonist orders."
      highlights={[
        "Recovered policy: 2 business days processing.",
        "Standard: typically 7 business days within India.",
        "Express: generally 5 business days within India.",
        "Tracking and status emails support guests and members.",
      ]}
      sections={sections}
    />
  );
}
