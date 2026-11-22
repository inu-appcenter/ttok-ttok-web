"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { captureAnalytics } from "./index";

type AnalyticsLinkProps = {
  event?: string;
  properties?: Parameters<typeof captureAnalytics>[1];
};

export function AnalyticsAnchor({
  event,
  properties,
  ...props
}: AnalyticsLinkProps & Omit<ComponentProps<"a">, "onClick">) {
  return <a {...props} onClick={() => event && captureAnalytics(event, properties)} />;
}

export function AnalyticsLink({
  event,
  properties,
  onClick,
  ...props
}: AnalyticsLinkProps & ComponentProps<typeof Link>) {
  return <Link {...props} onClick={(click) => {
    if (event) captureAnalytics(event, properties);
    onClick?.(click);
  }} />;
}
