/**
 * Compact storefront product card used on the home page.
 * Mirrors the original Beyonist product-first card language with a modern finish.
 */
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { responsiveImageProps } from "../utils/productImagePath.js";

export default function ProductCard({ product, index = 0 }) {
  return (
    <motion.article
      className="group store-card flex h-full min-w-0 flex-col overflow-hidden rounded-sm"
      initial={{ opacity:0, y:18 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, amount:.2 }}
      transition={{ duration:.45, delay:Math.min(index*.05,.2) }}
    >
      <Link to={`/product/${product.id}`} className="warm-product-surface relative grid aspect-square place-items-center overflow-hidden border-b border-black/10">
        <img {...responsiveImageProps(product.image, "(max-width: 560px) 92vw, (max-width: 1050px) 46vw, 23vw")} alt={product.name} loading="lazy" decoding="async" width="800" height="800" className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-[1.025]"/>
        {product.badge ? <span className="absolute left-3 top-3 bg-white px-2.5 py-2 text-[7px] font-semibold uppercase tracking-[.11em]">{product.badge}</span> : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-3 text-[7px] uppercase tracking-[.11em] text-black/65">
          <span>{product.category}</span>
          <span>★ {product.rating}</span>
        </div>
        <h3 className="mt-3 font-[Georgia] text-[23px] font-normal leading-[1.08]">
          <Link to={`/product/${product.id}`} className="transition hover:text-[#d13c3c]">{product.name}</Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          <strong className="text-[12px]">₹{product.price}</strong>
          <Link to={`/product/${product.id}`} className="bg-[#d13c3c] px-4 py-2.5 text-[7px] font-semibold uppercase tracking-[.1em] text-white transition hover:bg-[#171313]">View product →</Link>
        </div>
      </div>
    </motion.article>
  );
}
