/**
 * Reusable storefront component for page skeleton. Encapsulates shared UI behavior so page files stay focused on page composition.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useLocation } from "react-router-dom";

/**
 * Renders the Bar component and coordinates the state/behavior owned by this UI boundary.
 */
function Bar({ className = "" }) {
  return <div className={`animate-pulse bg-black/[.055] ${className}`} />;
}

/**
 * Renders the Product Grid Skeleton component and coordinates the state/behavior owned by this UI boundary.
 */
function ProductGridSkeleton() {
  return (
    <main className="bg-[#fffaf1]">
      {/* Section 1: Page section 1. */}
      <section className="px-[clamp(22px,5vw,78px)] py-12">
        <div className="mx-auto max-w-[1440px]">
          <Bar className="h-3 w-32" />
          <Bar className="mt-6 h-20 max-w-[620px]" />
          <div className="mt-10 grid grid-cols-4 gap-4 max-[1000px]:grid-cols-3 max-[720px]:grid-cols-2 max-[480px]:grid-cols-1">
            {[0,1,2,3,4,5,6,7].map((item) => (
              <div key={item}>
                <Bar className="aspect-[.84/1]" />
                <Bar className="mt-4 h-3 w-2/5" />
                <Bar className="mt-3 h-7 w-4/5" />
                <Bar className="mt-3 h-3 w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * Renders the Dashboard Skeleton component and coordinates the state/behavior owned by this UI boundary.
 */
function DashboardSkeleton() {
  return (
    <main className="grid min-h-[75vh] grid-cols-[300px_1fr] bg-[#fffaf1] max-[900px]:grid-cols-1">
      <aside className="bg-[#111] p-8">
        <Bar className="h-3 w-28 !bg-white/10" />
        <Bar className="mt-7 h-14 w-14 rounded-full !bg-white/10" />
        <div className="mt-8 space-y-4">{[0,1,2,3,4,5].map((item) => <Bar key={item} className="h-10 !bg-white/10" />)}</div>
      </aside>
      {/* Section 2: Page section 2. */}
      <section className="p-[clamp(24px,5vw,64px)]">
        <Bar className="h-3 w-32" />
        <Bar className="mt-6 h-20 max-w-[620px]" />
        <div className="mt-10 grid grid-cols-3 gap-4 max-[700px]:grid-cols-1">
          {[0,1,2,3,4,5].map((item) => <Bar key={item} className="h-40" />)}
        </div>
      </section>
    </main>
  );
}

/**
 * Renders the Editorial Skeleton component and coordinates the state/behavior owned by this UI boundary.
 */
function EditorialSkeleton() {
  return (
    <main className="bg-[#fffaf1]">
      {/* Section 3: Page section 3. */}
      <section className="grid min-h-[560px] grid-cols-[.82fr_1.18fr] bg-[#111] max-[850px]:grid-cols-1">
        <div className="flex flex-col justify-center px-[clamp(22px,5vw,78px)] py-16">
          <Bar className="h-3 w-32 !bg-white/10" />
          <Bar className="mt-7 h-24 max-w-[620px] !bg-white/10" />
          <Bar className="mt-6 h-4 max-w-[480px] !bg-white/10" />
          <Bar className="mt-3 h-4 max-w-[390px] !bg-white/10" />
        </div>
        <div className="m-[6%] bg-white/[.06] p-10">
          <Bar className="h-full min-h-[430px] !bg-white/[.07]" />
        </div>
      </section>
      {/* Section 4: Page section 4. */}
      <section className="mx-auto max-w-[1320px] px-[clamp(22px,5vw,78px)] py-16">
        <div className="grid grid-cols-[.65fr_1.35fr] gap-12 max-[760px]:grid-cols-1">
          <div><Bar className="h-3 w-28" /><Bar className="mt-5 h-14 w-4/5" /></div>
          <div className="space-y-5">{[0,1,2,3].map((item) => <Bar key={item} className="h-20" />)}</div>
        </div>
      </section>
    </main>
  );
}

/**
 * Renders the Page Skeleton component and coordinates the state/behavior owned by this UI boundary.
 */
export default function PageSkeleton() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/account")) return <DashboardSkeleton />;
  if (pathname === "/shop" || pathname.startsWith("/product") || pathname === "/cart") return <ProductGridSkeleton />;
  return <EditorialSkeleton />;
}
