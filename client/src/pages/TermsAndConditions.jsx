/**
 * Customer-facing Terms And Conditions page. Coordinates this route's UI state, user interactions, data loading, and responsive sections.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import LegalPolicyLayout from "../components/LegalPolicyLayout.jsx";

const sections = [
  {
    title: "About these terms",
    content: (
      <>
        <p>
          These Terms & Conditions govern use of the Beyonist website and the purchase of products offered through the storefront. By using the site or placing an order, you agree to these terms together with the applicable shipping and return policies.
        </p>
        <p>
          Beyonist Skincare Private Limited is identified in the recovered company material with its registered office in Gurugram, Haryana.
        </p>
      </>
    ),
  },
  {
    title: "Using the website",
    content: (
      <>
        <p>You may browse the storefront without creating a customer account. Some account features—such as saved addresses, order history, reviews and member benefits—require registration.</p>
        <p>You agree not to misuse the website, interfere with its operation, attempt unauthorised access, or use the service for unlawful or fraudulent activity.</p>
      </>
    ),
  },
  {
    title: "Customer accounts",
    content: (
      <>
        <p>Customers are responsible for keeping account credentials confidential and for the activity that occurs through their account.</p>
        <p>Guest checkout remains available. Creating an account is optional and does not change the basic right to purchase products through the storefront.</p>
      </>
    ),
  },
  {
    title: "Product information",
    content: (
      <>
        <p>We aim to present product descriptions, pricing, images, ingredients and usage information as accurately as possible. Product presentation may vary slightly by screen, packaging revision or available imagery.</p>
        <p>Skincare information on product pages is provided for product-use context and is not a substitute for individual medical advice.</p>
      </>
    ),
  },
  {
    title: "Orders and availability",
    content: (
      <>
        <p>Submitting an order creates a request to purchase the selected products. Orders remain subject to product availability, validation and fulfilment.</p>
        <p>If a product becomes unavailable or the requested quantity cannot be fulfilled, the order may need to be adjusted or cancelled and the customer contacted.</p>
      </>
    ),
  },
  {
    title: "Prices, payments and promotions",
    content: (
      <>
        <p>Prices displayed on the website are shown in Indian Rupees unless stated otherwise. Shipping charges, where applicable, are shown or calculated during checkout.</p>
        <p>Promotions, account-only offers, discount eligibility and reward features may have their own campaign conditions. Eligibility for a member benefit does not guarantee that a promotion is active at all times.</p>
      </>
    ),
  },
  {
    title: "Shipping and delivery",
    content: (
      <>
        <p>Delivery timing, processing, tracking and shipping methods are governed by the Shipping Policy. Estimated delivery dates are guidelines and may be affected by holidays, courier availability or events outside reasonable control.</p>
        <p>Customers are responsible for providing complete and accurate delivery details during checkout.</p>
      </>
    ),
  },
  {
    title: "Returns, exchanges and refunds",
    content: (
      <>
        <p>Eligible returns, exchanges, damaged-item resolutions and refunds are handled in accordance with the Return & Refund Policy.</p>
        <p>Returned products may be inspected before a refund or exchange is approved.</p>
      </>
    ),
  },
  {
    title: "Reviews and customer content",
    content: (
      <>
        <p>Verified customer reviews in the reconstructed storefront are limited to products from delivered orders. Reviews may be moderated before publication.</p>
        <p>Customers should submit truthful, relevant content and avoid unlawful, abusive, misleading or infringing material.</p>
      </>
    ),
  },
  {
    title: "Updates and contact",
    content: (
      <>
        <p>Beyonist may revise these terms when the website, products or operational policies change. The current version published on the website applies from its stated revision date.</p>
        <p>Questions about these terms can be sent to <strong>contact@beyonist.com</strong> or discussed with customer care at <strong>+91 85279 99563</strong>.</p>
      </>
    ),
  },
];

/**
 * Renders the Terms And Conditions component and coordinates the state/behavior owned by this UI boundary.
 */
export default function TermsAndConditions() {
  return (
    <LegalPolicyLayout
      eyebrow="Legal / Terms"
      title="Terms &"
      accent="Conditions."
      intro="The ground rules for using the Beyonist storefront, customer account and commerce experience."
      highlights={[
        "Guest checkout remains available.",
        "Orders remain subject to product availability.",
        "Shipping and returns are governed by their dedicated policies.",
        "Member offers may carry campaign-specific conditions.",
      ]}
      sections={sections}
    />
  );
}
