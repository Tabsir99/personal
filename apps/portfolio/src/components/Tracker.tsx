"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  classifyReferrer,
  getLoadTime,
  getSessionId,
  isReturningVisitor,
  markSeen,
  send,
} from "@/lib/tracker";

export function Tracker() {
  const pathname = usePathname();
  const pageStartRef = useRef(0);
  const currentPathRef = useRef<string | null>(null);
  const exitedRef = useRef(false);
  const portfolioViewedRef = useRef(false);
  const sessionStartedRef = useRef(false);
  const firstPageViewRef = useRef(true);

  useEffect(() => {
    const path = pathname || "/";
    const now = Date.now();

    const flushExit = () => {
      if (exitedRef.current) return;
      if (!currentPathRef.current) return;
      exitedRef.current = true;
      send({
        type: "page_exit",
        sessionId: getSessionId(),
        timestamp: Date.now(),
        path: currentPathRef.current,
        data: { timeOnPage: Date.now() - pageStartRef.current },
      });
    };

    // First mount: maybe session_start, then page_view.
    if (!sessionStartedRef.current) {
      sessionStartedRef.current = true;
      const sid = getSessionId();
      const newSession = !sessionStorage.getItem("__t_sid_started");
      sessionStorage.setItem("__t_sid_started", "1");

      const fire = () => {
        if (newSession) {
          const returning = isReturningVisitor();
          send({
            type: "session_start",
            sessionId: sid,
            timestamp: now,
            path,
            country: "unknown",
            ip: "unknown",
            data: {
              isReturning: returning,
              referralSource: classifyReferrer(document.referrer),
            },
          });
          markSeen();
        }
        const loadTime = getLoadTime();
        send({
          type: "page_view",
          sessionId: sid,
          timestamp: Date.now(),
          path,
          data: {
            ...(document.referrer ? { referrer: document.referrer } : {}),
            ...(loadTime !== undefined ? { loadTime } : {}),
          },
        });
        firstPageViewRef.current = false;
        currentPathRef.current = path;
        pageStartRef.current = Date.now();
        if (path === "/" && !portfolioViewedRef.current) {
          portfolioViewedRef.current = true;
          send({
            type: "portfolio_view",
            sessionId: sid,
            timestamp: Date.now(),
            path,
          });
        }
      };

      const idle: typeof requestIdleCallback | undefined = (
        window as unknown as { requestIdleCallback?: typeof requestIdleCallback }
      ).requestIdleCallback;
      if (typeof idle === "function") {
        idle(fire, { timeout: 500 });
      } else {
        setTimeout(fire, 0);
      }
    } else if (currentPathRef.current !== path) {
      // SPA navigation.
      flushExit();
      exitedRef.current = false;
      const sid = getSessionId();
      send({
        type: "page_view",
        sessionId: sid,
        timestamp: now,
        path,
        data: {},
      });
      currentPathRef.current = path;
      pageStartRef.current = Date.now();
      if (path === "/" && !portfolioViewedRef.current) {
        portfolioViewedRef.current = true;
        send({
          type: "portfolio_view",
          sessionId: sid,
          timestamp: Date.now(),
          path,
        });
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushExit();
    };
    const onPageHide = () => flushExit();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [pathname]);

  return null;
}
