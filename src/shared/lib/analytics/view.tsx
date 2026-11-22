"use client";

import { useEffect, useRef } from "react";

import { captureAnalytics } from "./index";

export function AnalyticsView({
  event,
  properties,
}: {
  event: Parameters<typeof captureAnalytics>[0];
  properties?: Parameters<typeof captureAnalytics>[1];
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    captureAnalytics(event, properties);
  }, [event, properties]);

  return null;
}
