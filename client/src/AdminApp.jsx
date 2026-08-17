/**
 * Lazy-loaded admin route tree. Keeps administration code out of the public storefront's initial bundle.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";

const AdminEntry = lazy(() => import("./pages/admin/AdminEntry.jsx"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.jsx"));
const AdminForgotPassword = lazy(() => import("./pages/admin/AdminForgotPassword.jsx"));
const AdminResetPassword = lazy(() => import("./pages/admin/AdminResetPassword.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.jsx"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail.jsx"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers.jsx"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts.jsx"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs.jsx"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages.jsx"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads.jsx"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings.jsx"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons.jsx"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics.jsx"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews.jsx"));

/**
 * Renders the Admin App component and coordinates the state/behavior owned by this UI boundary.
 */
export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Suspense fallback={<main className="min-h-dvh bg-[#0c0c0c]" aria-label="Loading admin page" />}>
        <Routes>
          <Route path="/admin" element={<AdminEntry />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
          <Route path="/admin/reset-password" element={<AdminResetPassword />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:orderNumber" element={<AdminOrderDetail />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="/admin/*" element={<AdminEntry />} />
        </Routes>
      </Suspense>
    </AdminAuthProvider>
  );
}
