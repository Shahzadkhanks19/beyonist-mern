/**
 * Static client data for products. Provides display metadata and fallbacks used by the storefront.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

export const products = [
  { id: "gluta-kojic", name: "Gluta Kojic Whitening Soap", category: "Cleansing", concern: "Brightening", image: "/images/gluta-kojic.webp", price: 399, rating: 4.8, badge: "Bestseller", description: "A focused cleansing bar formulated for a clearer, brighter-looking complexion." },
  { id: "sunblock-lotion", name: "Sunblock Body Lotion", category: "Sun Care", concern: "Protection", image: "/images/sunblock-lotion.webp", price: 699, rating: 4.9, badge: "Daily Essential", description: "Lightweight everyday sun care with a soft, non-greasy skin feel." },
  { id: "whipped-scrub", name: "Whipped Bleaching Scrub", category: "Body Care", concern: "Texture", image: "/images/whipped-scrub.webp", price: 549, rating: 4.7, badge: "Cult Favourite", description: "A whipped body polish created to visibly smooth and refine dull-looking skin." },
  { id: "ivy-serum", name: "Ivy Booster Serum", category: "Serums", concern: "Glow", image: "/images/ivy-serum.webp", price: 899, rating: 4.8, badge: "Glow Edit", description: "A concentrated booster designed to layer beautifully into a modern skincare ritual." },
  { id: "hydra-serum", name: "Tiar A Hydra Serum", category: "Serums", concern: "Hydration", image: "/images/hydra-serum.webp", price: 949, rating: 4.8, badge: "Hydration", description: "A replenishing serum for skin that looks plump, rested and comfortably hydrated." },
  { id: "whitening-lotion", name: "Whitening Lotion", category: "Body Care", concern: "Brightening", image: "/images/whitening-lotion.webp", price: 749, rating: 4.6, badge: "Body Ritual", description: "A silky daily body lotion for moisturised, more even-looking skin." },
  { id: "glaze-serum", name: "Glaze Whitening Serum", category: "Serums", concern: "Radiance", image: "/images/whitening-serum.webp", price: 999, rating: 4.9, badge: "Radiance", description: "A glossy-finish facial serum built around a radiant-skin routine." },
  { id: "milky-coconut", name: "Milky Coconut Body Lotion", category: "Body Care", concern: "Nourishment", image: "/images/milky-coconut.webp", price: 649, rating: 4.7, badge: "Comfort Care", description: "Creamy hydration with a comforting sensorial finish for everyday body care." },
];

export const categories = ["All", "Cleansing", "Serums", "Body Care", "Sun Care"];
