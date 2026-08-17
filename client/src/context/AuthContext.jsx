/**
 * React context for auth context. Owns shared application state and exposes a stable API to consuming components.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getMe, loginCustomer, logoutCustomer, signupCustomer } from "../services/authApi.js";
import { addToWishlist, removeFromWishlist } from "../services/customerApi.js";

const AuthContext = createContext(null);

/**
 * Renders the Auth Provider component and coordinates the state/behavior owned by this UI boundary.
 */
export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Guards auth state against stale /auth/me responses. Public pages defer the
  // initial session check for performance, so a pointer interaction can start a
  // session lookup immediately before login/signup. A later auth mutation bumps
  // this generation and makes the older lookup harmless.
  const authGenerationRef = useRef(0);

  const refresh = useCallback(async () => {
    const generation = authGenerationRef.current;

    try {
      const response = await getMe();
      const nextCustomer = response.data || null;

      if (generation === authGenerationRef.current) {
        setCustomer(nextCustomer);
        setLoading(false);
      }

      return nextCustomer;
    } catch {
      if (generation === authGenerationRef.current) {
        setCustomer(null);
        setLoading(false);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    let completed = false;

    const checkSession = () => {
      if (completed) return;
      completed = true;
      cleanup();
      refresh();
    };

    const timeoutId = window.setTimeout(checkSession, 4500);
    const interactionEvents = ["pointerdown", "keydown", "touchstart"];

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, checkSession, true);
      });
    };

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, checkSession, { capture: true, once: true, passive: true });
    });

    return cleanup;
  }, [refresh]);

  /**
   * Implements the signup operation used by this module.
   */
  const signup = async (payload) => {
    authGenerationRef.current += 1;
    const response = await signupCustomer(payload);
    setCustomer(response.data);
    setLoading(false);
    return response.data;
  };

  /**
   * Implements the login operation used by this module.
   */
  const login = async (payload) => {
    authGenerationRef.current += 1;
    const response = await loginCustomer(payload);
    setCustomer(response.data);
    setLoading(false);
    return response.data;
  };

  /**
   * Implements the logout operation used by this module.
   */
  const logout = async () => {
    authGenerationRef.current += 1;
    try {
      await logoutCustomer();
    } finally {
      setCustomer(null);
      setLoading(false);
    }
  };


  const isWishlisted = useCallback(
    (slug) => Boolean(customer?.wishlist?.includes(String(slug || "").trim().toLowerCase())),
    [customer],
  );

  const toggleWishlist = useCallback(async (slug) => {
    const normalizedSlug = String(slug || "").trim().toLowerCase();
    if (!normalizedSlug) return { authenticated: Boolean(customer), saved: false };

    // Authentication is intentionally deferred on initial public-page load for
    // performance. A wishlist interaction therefore resolves the existing cookie
    // session before treating the visitor as a guest.
    let activeCustomer = customer;
    if (!activeCustomer) {
      const generation = authGenerationRef.current;
      try {
        const response = await getMe();
        activeCustomer = response.data || null;

        if (generation !== authGenerationRef.current) {
          return { authenticated: Boolean(customer), saved: false };
        }

        setCustomer(activeCustomer);
        setLoading(false);
      } catch {
        if (generation === authGenerationRef.current) {
          setCustomer(null);
          setLoading(false);
        }
        return { authenticated: false, saved: false };
      }
    }

    if (!activeCustomer) return { authenticated: false, saved: false };

    const currentlySaved = (activeCustomer.wishlist || []).includes(normalizedSlug);
    const previousCustomer = activeCustomer;
    const optimisticWishlist = currentlySaved
      ? (activeCustomer.wishlist || []).filter((item) => item !== normalizedSlug)
      : [...new Set([...(activeCustomer.wishlist || []), normalizedSlug])];

    setCustomer({ ...activeCustomer, wishlist: optimisticWishlist });

    try {
      const response = currentlySaved
        ? await removeFromWishlist(normalizedSlug)
        : await addToWishlist(normalizedSlug);
      const nextCustomer = response.data || { ...activeCustomer, wishlist: optimisticWishlist };
      setCustomer(nextCustomer);
      return { authenticated: true, saved: !currentlySaved };
    } catch (error) {
      setCustomer(previousCustomer);
      throw error;
    }
  }, [customer]);

  const value = useMemo(
    () => ({
      customer,
      loading,
      isAuthenticated: Boolean(customer),
      signup,
      login,
      logout,
      refresh,
      isWishlisted,
      toggleWishlist,
    }),
    [customer, loading, refresh, isWishlisted, toggleWishlist]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Implements the use auth operation used by this module.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
