/**
 * React context for cart context. Owns shared application state and exposes a stable API to consuming components.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getProductAvailability } from "../services/catalogApi.js";
import { normalizeProductImagePath, normalizeProductImages } from "../utils/productImagePath.js";

const CartContext = createContext(null);
const STORAGE_KEY = "beyonist_cart_v1";

/**
 * Implements the normalise item operation used by this module.
 */
function normaliseItem(product, quantity = 1) {
  const normalizedProduct = normalizeProductImages(product);
  const slug = normalizedProduct.slug || normalizedProduct.id || normalizedProduct._id;
  const stock = Math.max(Number(normalizedProduct.stock ?? 0) || 0, 0);

  return {
    slug,
    name: normalizedProduct.name,
    category: normalizedProduct.category || "",
    price: Number(normalizedProduct.price || 0),
    compareAtPrice: Number(normalizedProduct.compareAtPrice || 0),
    image: normalizedProduct.images?.[0] || normalizedProduct.image || "/images/product-hamper.webp",
    stock,
    isActive: normalizedProduct.isActive !== false,
    available: normalizedProduct.isActive !== false && stock > 0,
    quantity: Math.min(Math.max(1, Number(quantity) || 1), Math.max(stock, 1)),
  };
}

/**
 * Implements the same inventory operation used by this module.
 */
function sameInventory(item, availability) {
  return (
    Number(item.stock) === Number(availability.stock) &&
    Boolean(item.isActive) === Boolean(availability.isActive) &&
    Boolean(item.available) === Boolean(availability.available) &&
    Number(item.price) === Number(availability.price ?? item.price) &&
    Number(item.compareAtPrice || 0) === Number(availability.compareAtPrice ?? item.compareAtPrice ?? 0) &&
    String(item.image || "") === String(availability.image || item.image || "")
  );
}

/**
 * Renders the Cart Provider component and coordinates the state/behavior owned by this UI boundary.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed)
        ? parsed.map((item) => ({
            ...item,
            image: normalizeProductImagePath(item.image) || "/images/product-hamper.webp",
            stock: Math.max(Number(item.stock ?? 0) || 0, 0),
            isActive: item.isActive !== false,
            available: item.isActive !== false && Number(item.stock ?? 0) > 0,
          }))
        : [];
    } catch {
      return [];
    }
  });

  const refreshingRef = useRef(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Cart still works in-memory when storage is unavailable.
    }
  }, [items]);

  const refreshAvailability = useCallback(async () => {
    if (refreshingRef.current) return;
    const slugs = items.map((item) => item.slug).filter(Boolean);
    if (!slugs.length) return;

    refreshingRef.current = true;
    try {
      const response = await getProductAvailability(slugs);
      const map = new Map((response.data || []).map((entry) => [entry.slug, entry]));

      setItems((current) => {
        let changed = false;

        const next = current.map((item) => {
          const availability = map.get(item.slug);
          if (!availability) return item;

          const stock = Math.max(Number(availability.stock) || 0, 0);
          const isActive = Boolean(availability.isActive);
          const available = Boolean(availability.available);

          const nextItem = {
            ...item,
            stock,
            isActive,
            available,
            name: availability.name || item.name,
            category: availability.category || item.category,
            price: Number(availability.price ?? item.price),
            compareAtPrice: Number(availability.compareAtPrice ?? item.compareAtPrice ?? 0),
            image: normalizeProductImagePath(availability.image || item.image) || "/images/product-hamper.webp",
            quantity: stock > 0 ? Math.min(Math.max(item.quantity, 1), stock) : item.quantity,
          };

          if (!sameInventory(item, nextItem) || nextItem.quantity !== item.quantity) changed = true;
          return nextItem;
        });

        return changed ? next : current;
      });
    } finally {
      refreshingRef.current = false;
    }
  }, [items]);

  // Refresh when cart composition changes.
  const slugKey = useMemo(() => items.map((item) => item.slug).sort().join("|"), [items]);
  useEffect(() => {
    if (!slugKey) return undefined;

    let timeoutId;
    let idleId;

    const refresh = () => refreshAvailability().catch(() => {});

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(refresh, { timeout: 1600 });
    } else {
      timeoutId = window.setTimeout(refresh, 750);
    }

    return () => {
      if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [slugKey]); // deliberately keyed only by cart composition

  // Refresh when user returns to the tab so CMS stock changes become visible.
  useEffect(() => {
    const onFocus = () => refreshAvailability().catch(() => {});
    const onVisibility = () => {
      if (document.visibilityState === "visible") onFocus();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshAvailability]);

  /**
   * Implements the add item operation used by this module.
   */
  const addItem = (product, quantity = 1) => {
    const nextItem = normaliseItem(product, quantity);

    if (!nextItem.slug || !nextItem.available || nextItem.stock <= 0) return false;

    setItems((current) => {
      const existing = current.find((item) => item.slug === nextItem.slug);

      if (!existing) return [...current, nextItem];

      const liveStock = Math.max(Number(nextItem.stock) || 0, 0);
      if (liveStock <= 0) return current;

      return current.map((item) =>
        item.slug === nextItem.slug
          ? {
              ...item,
              ...nextItem,
              quantity: Math.min(item.quantity + nextItem.quantity, liveStock),
            }
          : item
      );
    });

    return true;
  };

  /**
   * Implements the set quantity operation used by this module.
   */
  const setQuantity = (slug, quantity) => {
    setItems((current) =>
      current.map((item) => {
        if (item.slug !== slug) return item;

        const stock = Math.max(Number(item.stock) || 0, 0);
        if (stock <= 0 || item.available === false) return item;

        return {
          ...item,
          quantity: Math.min(Math.max(Number(quantity) || 1, 1), stock),
        };
      })
    );
  };

  /**
   * Removes item from the current workflow.
   */
  const removeItem = (slug) => setItems((current) => current.filter((item) => item.slug !== slug));
  /**
   * Implements the clear cart operation used by this module.
   */
  const clearCart = () => setItems([]);

  const value = useMemo(() => {
    const unavailableItems = items.filter((item) => item.available === false || item.isActive === false || Number(item.stock) <= 0);
    const purchasableItems = items.filter((item) => item.available !== false && item.isActive !== false && Number(item.stock) > 0);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const purchasableItemCount = purchasableItems.reduce((sum, item) => sum + item.quantity, 0);

    const subtotal = purchasableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const compareAtSubtotal = purchasableItems.reduce(
      (sum, item) => sum + (item.compareAtPrice > item.price ? item.compareAtPrice : item.price) * item.quantity,
      0
    );
    const savings = Math.max(compareAtSubtotal - subtotal, 0);

    return {
      items,
      unavailableItems,
      purchasableItems,
      hasUnavailableItems: unavailableItems.length > 0,
      itemCount,
      purchasableItemCount,
      subtotal,
      savings,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      refreshAvailability,
    };
  }, [items, refreshAvailability]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Implements the use cart operation used by this module.
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
