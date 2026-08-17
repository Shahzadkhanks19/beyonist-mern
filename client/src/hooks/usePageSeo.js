/**
 * Custom React hook for use page seo. Packages reusable lifecycle or state behavior behind a focused hook interface.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect } from "react";
import { applySeo } from "../components/RouteSeo.jsx";

/**
 * Implements the use page seo operation used by this module.
 */
export default function usePageSeo(meta) {
  const { title, description, image, noindex, canonicalPath } = meta || {};

  useEffect(() => {
    if (!title) return;
    applySeo({ title, description, image, noindex, canonicalPath });
  }, [title, description, image, noindex, canonicalPath]);
}
