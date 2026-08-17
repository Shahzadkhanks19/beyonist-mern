/**
 * Reusable admin UI component for admin page header. Keeps admin presentation and interaction patterns consistent across dashboard pages.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

/**
 * Renders the Admin Page Header component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminPageHeader({ eyebrow, title, copy, action }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-8 border-b border-black/10 pb-7 max-[700px]:mb-5 max-[700px]:items-start max-[700px]:gap-5 max-[700px]:pb-5 max-[700px]:flex-col">
      <div>
        <span className="text-[7px] font-semibold uppercase tracking-[.18em] text-[#cf1f2e]">{eyebrow}</span>
        <h1 className="mt-3 font-[Georgia] text-[clamp(34px,5vw,64px)] font-normal leading-[.9] tracking-[-.045em]">{title}</h1>
        {copy ? <p className="mt-4 max-w-[650px] text-[10px] leading-6 text-black/65">{copy}</p> : null}
      </div>
      {action ? <div className="shrink-0 max-[700px]:w-full max-[700px]:[&_button]:w-full max-[700px]:[&_select]:w-full">{action}</div> : null}
    </div>
  );
}
