/**
 * Reusable storefront component for scroll to top. Encapsulates shared UI behavior so page files stay focused on page composition.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Renders the Scroll To Top component and coordinates the state/behavior owned by this UI boundary.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const frame = window.requestAnimationFrame(() => {
      const main = document.getElementById("main-content");
      if (!main) return;
      main.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
