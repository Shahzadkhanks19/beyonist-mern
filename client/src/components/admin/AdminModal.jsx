/**
 * Reusable admin UI component for admin modal. Keeps admin presentation and interaction patterns consistent across dashboard pages.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

/**
 * Renders the Admin Modal component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminModal({ open, title, children, onClose, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/65 p-4 backdrop-blur-[2px] max-[600px]:items-end max-[600px]:p-0">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close modal background" />
      {/* Section 1: Page section 1. */}
      <section className={`relative z-[2] max-h-[90dvh] w-full overflow-y-auto bg-[#f7f3ed] shadow-2xl ${wide ? "max-w-[980px]" : "max-w-[720px]"} max-[600px]:max-h-[94dvh] max-[600px]:rounded-t-[14px]`}>
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-black/10 bg-[#f7f3ed] px-6 py-5 max-[600px]:px-4 max-[600px]:py-4">
          <h2 className="font-[Georgia] text-[28px] font-normal max-[600px]:text-[24px]">{title}</h2>
          <button type="button" onClick={onClose} className="h-9 w-9 border border-black/10 text-[20px]" aria-label="Close modal">×</button>
        </header>
        <div className="p-6 max-[600px]:p-4">{children}</div>
      </section>
    </div>
  );
}
