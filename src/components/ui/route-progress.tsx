

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "@tanstack/react-router";

function RouteProgressInner() {
  const location = useLocation(); const pathname = location.pathname;
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset on route change complete
    setIsNavigating(false);
    setProgress(100);
    // Reset progress after animation completes
    const timeout = setTimeout(() => setProgress(0), 300);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (isNavigating) {
      // Start progress animation
      setProgress(10);
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          // Slow down as we approach 90%
          const increment = Math.max(1, (90 - prev) / 10);
          return Math.min(90, prev + increment);
        });
      }, 150);
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [isNavigating]);

  // Intercept link clicks to show loading state
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor) {
        const href = anchor.getAttribute("href");
        // Skip hash links and same-page links
        if (!href || href === "#" || href.startsWith("#")) return;

        const isInternal = href.startsWith("/");
        const isSameOrigin = anchor.origin === window.location.origin;
        const isNewTab = anchor.target === "_blank";
        const isDifferentPage = href !== pathname && !href.startsWith(pathname + "#");

        if (isInternal && isSameOrigin && !isNewTab && isDifferentPage) {
          setIsNavigating(true);
        }
      }
    };

    // Also intercept router.push calls by monitoring popstate
    const handlePopState = () => {
      setIsNavigating(true);
    };

    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-primary/20">
      <div
        className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <RouteProgressInner />
    </Suspense>
  );
}
