/**
 * Safe structured renderer for The Edit article blocks.
 * Raw HTML is never injected; the CMS stores typed blocks rendered as React.
 */
export default function BlogContentRenderer({ blocks = [], fallback = "" }) {
  const content = Array.isArray(blocks) && blocks.length
    ? blocks
    : (fallback ? [{ type: "paragraph", text: fallback }] : []);

  return (
    <div className="space-y-7">
      {content.map((block, index) => {
        const key = block.id || `${block.type || "paragraph"}-${index}`;

        if (block.type === "heading2") return <h2 key={key} className="pt-4 font-[Georgia] text-[clamp(34px,4vw,54px)] font-normal leading-[1.02] tracking-[-.04em]">{block.text}</h2>;
        if (block.type === "heading3") return <h3 key={key} className="pt-2 font-[Georgia] text-[clamp(27px,3vw,39px)] font-normal leading-[1.08] tracking-[-.03em]">{block.text}</h3>;
        if (block.type === "quote") return <blockquote key={key} className="border-l-[3px] border-[#cf1f2e] py-2 pl-[clamp(20px,3vw,38px)] font-[Georgia] text-[clamp(26px,3.2vw,42px)] leading-[1.25] tracking-[-.025em]">{block.text}</blockquote>;

        if (block.type === "bullets" || block.type === "numbered") {
          const Tag = block.type === "numbered" ? "ol" : "ul";
          return <Tag key={key} className={`${block.type === "numbered" ? "list-decimal" : "list-disc"} space-y-3 pl-6 text-[13px] leading-7 text-black/65`}>{(block.items || []).filter(Boolean).map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{item}</li>)}</Tag>;
        }

        if (block.type === "image") {
          if (!block.url) return null;
          return <figure key={key} className="my-10"><div className="grid min-h-[320px] place-items-center overflow-hidden bg-[#ebe2d8] p-[clamp(18px,4vw,44px)]"><img src={block.url} alt={block.alt || ""} loading="lazy" decoding="async" className="max-h-[620px] w-full object-contain" /></div>{block.caption ? <figcaption className="mt-3 text-[8px] leading-5 text-black/65">{block.caption}</figcaption> : null}</figure>;
        }

        if (block.type === "divider") return <hr key={key} className="my-10 border-0 border-t border-black/10" />;
        return <p key={key} className="text-[13px] leading-8 text-black/66">{block.text}</p>;
      })}
    </div>
  );
}
