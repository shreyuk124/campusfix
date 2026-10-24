import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * Automatically resets scroll position to the top of the window (0, 0)
 * on every route change across desktop and mobile.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Instant scroll to top for window
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    // Also reset root document elements for cross-browser safety
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
}
