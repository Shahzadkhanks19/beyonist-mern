/**
 * React context for admin auth context. Owns shared application state and exposes a stable API to consuming components.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { adminLogin as loginRequest, adminLogout as logoutRequest, adminMe } from "../services/adminApi.js";

const AdminAuthContext = createContext(null);

/**
 * Renders the Admin Auth Provider component and coordinates the state/behavior owned by this UI boundary.
 */
export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await adminMe();
      setAdmin(response.data || null);
      return response.data || null;
    } catch (error) {
      if (error.status !== 401) console.error("[admin-auth] session check failed", error);
      setAdmin(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email, password) => {
    const response = await loginRequest(email, password);
    setAdmin(response.data);
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    try { await logoutRequest(); } finally { setAdmin(null); }
  }, []);

  const value = useMemo(() => ({ admin, loading, login, logout, refresh }), [admin, loading, login, logout, refresh]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

/**
 * Implements the use admin auth operation used by this module.
 */
export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  return value;
}
