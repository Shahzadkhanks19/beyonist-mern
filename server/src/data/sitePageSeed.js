/**
 * Seed data for site page seed. Provides deterministic records used by the database seeding workflow.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

export const sitePageSeed = [
  {
    slug: "our-story",
    eyebrow: "Our Story / Beyonist Skincare",
    title: "Beauty that feels more like you.",
    intro: "Beyonist is built around a simple belief: skincare should support confidence, celebrate individuality and fit naturally into real life.",
    mission: "We champion the extraordinary in every person. Our mission is not just to enhance your appearance but to empower, uplift, and celebrate the unique beauty within you.",
    belief: "We believe that true beauty is not confined to external features; it radiates from confidence, kindness, and the authenticity that makes you, you.",
    chapters: [
      {
        number: "01",
        title: "Confidence before complexity.",
        body: "The shelf should feel approachable. Focused formulas, clear routines and product stories that make choosing easier."
      },
      {
        number: "02",
        title: "Products with a place.",
        body: "Every formula earns its role through how it fits into the ritual—from cleansing and hydration to serums, body care and daily protection."
      },
      {
        number: "03",
        title: "Beauty without a template.",
        body: "Beyonist celebrates individuality rather than asking everyone to chase the same version of beauty."
      }
    ],
    published: true
  }
];
