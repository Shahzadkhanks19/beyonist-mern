/**
 * Admin page for admin entry, including its data loading, actions, validation, and presentation state.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

/**
 * Renders the Admin Entry component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminEntry() {
  const { admin, loading } = useAdminAuth();
  if (loading) return <main className="min-h-dvh bg-[#0c0c0c]" />;
  return <Navigate to={admin ? "/admin/dashboard" : "/admin/login"} replace />;
}
