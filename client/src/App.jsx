/**
 * Root client application composition. Separates public/admin route trees, global providers, error boundaries, and deferred shared chrome.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary.jsx";
import RouteErrorBoundary from "./components/RouteErrorBoundary.jsx";
import Preloader from "./components/Preloader.jsx";
import PageSkeleton from "./components/PageSkeleton.jsx";
import RouteSeo from "./components/RouteSeo.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import { handleImageError } from "./utils/productImagePath.js";

const Home = lazy(() => import("./pages/Home.jsx"));
const OurStory = lazy(() => import("./pages/OurStory.jsx"));
const Edit = lazy(() => import("./pages/Edit.jsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.jsx"));
const Shop = lazy(() => import("./pages/Shop.jsx"));
const Product = lazy(() => import("./pages/Product.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Account = lazy(() => import("./pages/Account.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const TrackOrder = lazy(() => import("./pages/TrackOrder.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const Checkout = lazy(() => import("./pages/Checkout.jsx"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess.jsx"));
const PaymentFailure = lazy(() => import("./pages/PaymentFailure.jsx"));
const FAQ = lazy(() => import("./pages/FAQ.jsx"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions.jsx"));
const ReturnRefundPolicy = lazy(() => import("./pages/ReturnRefundPolicy.jsx"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const ReviewOrder = lazy(() => import("./pages/ReviewOrder.jsx"));

const Footer = lazy(() => import("./components/Footer.jsx"));
const FloatingActions = lazy(() => import("./components/FloatingActions.jsx"));
const AdminApp = lazy(() => import("./AdminApp.jsx"));

/**
 * Defers below-the-fold footer code until the main route has had a chance to
 * paint. This keeps it available quickly without competing with LCP resources.
 */
function DeferredFooter() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timeoutId;
    let idleId;
    const reveal = () => setReady(true);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(reveal, { timeout: 1800 });
    } else {
      timeoutId = window.setTimeout(reveal, 950);
    }

    return () => {
      if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return ready ? <Suspense fallback={null}><Footer /></Suspense> : null;
}

/**
 * Loads floating support controls after user interaction or a generous idle
 * timeout so their animation/chat bundle never competes with initial rendering.
 */
function DeferredFloatingActions() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timeoutId;
    let completed = false;
    const events = ["pointerdown", "keydown", "touchstart"];

    const reveal = () => {
      if (completed) return;
      completed = true;
      events.forEach((name) => window.removeEventListener(name, reveal, true));
      window.clearTimeout(timeoutId);
      setReady(true);
    };

    events.forEach((name) => window.addEventListener(name, reveal, { capture: true, once: true, passive: true }));
    timeoutId = window.setTimeout(reveal, 3800);

    return () => {
      completed = true;
      events.forEach((name) => window.removeEventListener(name, reveal, true));
      window.clearTimeout(timeoutId);
    };
  }, []);

  return ready ? <Suspense fallback={null}><FloatingActions /></Suspense> : null;
}


/**
 * Renders the Public App Content component and coordinates the state/behavior owned by this UI boundary.
 */
function PublicAppContent() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="beyonist-storefront min-h-screen overflow-x-clip bg-[#fffaf1] font-[Arial] text-[#171313]">
          <Preloader />
          <ScrollToTop />
          <a href="#main-content" className="sr-only z-[200] bg-white px-4 py-3 text-sm font-semibold text-black focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to main content</a>
          <Header />
          <div id="main-content" tabIndex="-1" className="outline-none">
          <RouteErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/blogs" element={<Edit />} />
                <Route path="/blogs/:slug" element={<BlogPost />} />
                <Route path="/about" element={<OurStory />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/return-refund-policy" element={<ReturnRefundPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failure" element={<PaymentFailure />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/account" element={<Account />} />
                <Route path="/review-order" element={<ReviewOrder />} />
                <Route path="/error" element={<ErrorPage onRetry={() => window.location.reload()} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </RouteErrorBoundary>
          </div>
          <DeferredFooter />
          <DeferredFloatingActions />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

/**
 * Renders the Admin App Content component and coordinates the state/behavior owned by this UI boundary.
 */
function AdminAppContent() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-[#0c0c0c]" aria-label="Loading admin" />}>
      <AdminApp />
    </Suspense>
  );
}

/**
 * Renders the App Content component and coordinates the state/behavior owned by this UI boundary.
 */
function AppContent() {
  const location = useLocation();
  const content = location.pathname.startsWith("/admin") ? <AdminAppContent /> : <PublicAppContent />;

  return (
    <>
      <RouteSeo />
      {content}
    </>
  );
}

/**
 * Renders the App component and coordinates the state/behavior owned by this UI boundary.
 */
export default function App() {
  return (
    <GlobalErrorBoundary>
      <div className="contents" onErrorCapture={handleImageError}>
        <AppContent />
      </div>
    </GlobalErrorBoundary>
  );
}
