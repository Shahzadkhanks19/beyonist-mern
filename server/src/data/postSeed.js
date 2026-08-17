/**
 * Seed data for post seed. Provides deterministic records used by the database seeding workflow.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

export const postSeed = [
  {
    title: "Three drops. Three intentions.",
    slug: "three-drops-three-intentions",
    excerpt: "A focused serum edit built around glow, hydration and a more considered daily ritual.",
    content: "Beyonist’s serum shelf is built around different intentions rather than a crowded routine. Glaze Whitening Serum, Ivy Booster Serum and Tiar-A Hydra Serum each occupy a different place in the ritual, from radiance to hydration and daily layering.",
    category: "Serum Notes",
    image: "/images/product-hamper.webp",
    readingTime: 4,
    featured: true,
    published: true,
  },
  {
    title: "The daily defence edit.",
    slug: "the-daily-defence-edit",
    excerpt: "How sun care earns a permanent place in a modern skincare routine.",
    content: "Daily sun care is less about adding another complicated step and more about building one repeatable habit. Beyonist Sunblock Lotion sits in that final protective stage of the morning routine.",
    category: "Daily Ritual",
    image: "/images/sunblock-lotion.webp",
    readingTime: 3,
    featured: false,
    published: true,
  },
  {
    title: "Cleanse with intention.",
    slug: "cleanse-with-intention",
    excerpt: "Why a smaller, more deliberate cleansing routine can feel easier to keep.",
    content: "Cleansing is the reset point of the routine. Gluta Kojic Soap represents that first deliberate step before serum, moisturiser and daily protection.",
    category: "Cleansing",
    image: "/images/gluta-kojic.webp",
    readingTime: 3,
    featured: false,
    published: true,
  },
  {
    title: "Texture matters.",
    slug: "texture-matters",
    excerpt: "From whipped scrubs to lightweight serums, the way a formula feels shapes the ritual around it.",
    content: "The physical experience of skincare changes how likely a routine is to become habitual. The whipped texture of the Beyonist scrub and the lightweight feel of the serum range create very different moments in the same shelf.",
    category: "Formula Focus",
    image: "/images/whipped-scrub.webp",
    readingTime: 5,
    featured: false,
    published: true,
  },
];
