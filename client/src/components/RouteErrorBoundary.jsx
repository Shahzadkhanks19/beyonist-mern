/**
 * Reusable storefront component for route error boundary. Encapsulates shared UI behavior so page files stay focused on page composition.
 *
 * Keep this module focused on its current responsibility; shared logic belongs in
 * contexts, services, hooks, or utilities rather than being duplicated here.
 */

import { Component } from "react";
import { useLocation } from "react-router-dom";
import ErrorPage from "../pages/ErrorPage.jsx";

class Boundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[Beyonist route error]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          compact
          title="This page could not finish loading."
          message="A page-level error interrupted this route. The rest of the storefront is still available."
          onRetry={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}

/**
 * Renders the Route Error Boundary component and coordinates the state/behavior owned by this UI boundary.
 */
export default function RouteErrorBoundary({ children }) {
  const location = useLocation();
  return <Boundary key={`${location.pathname}${location.search}`}>{children}</Boundary>;
}
