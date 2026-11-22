import { filterAnalyticsInputProperties } from "./input-properties";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const includeInputValues = process.env.NEXT_PUBLIC_POSTHOG_CAPTURE_INPUT_VALUES === "true";

type AnalyticsProperties = Record<string, boolean | number | string | string[] | null>;
type AnalyticsClient = typeof import("posthog-js").default;

// Automatic interaction data is limited to public discovery screens.
const PUBLIC_DISCOVERY_PATH = /^\/(?:search|labs\/\d+)?$/;
const PUBLIC_DISCOVERY_URL = /^https?:\/\/[^/]+\/(?:search|labs\/\d+)?(?:[?#].*)?$/;

function sanitizeHeatmapData(data: unknown) {
  const byUrl: Record<string, unknown[]> = {};
  if (!data || typeof data !== "object") return byUrl;

  for (const [url, points] of Object.entries(data)) {
    if (!PUBLIC_DISCOVERY_URL.test(url) || !Array.isArray(points)) continue;
    const cleanUrl = url.split(/[?#]/, 1)[0];
    (byUrl[cleanUrl] ??= []).push(...points);
  }

  return byUrl;
}

let analyticsClient: Promise<AnalyticsClient | undefined> | undefined;

export function initializeAnalytics() {
  if (!projectToken || !apiHost || typeof window === "undefined") {
    return Promise.resolve(undefined);
  }

  analyticsClient ??= import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(projectToken, {
        api_host: apiHost,
        autocapture: {
          url_allowlist: [PUBLIC_DISCOVERY_URL],
          dom_event_allowlist: ["click", "submit"],
          element_allowlist: ["a", "button", "form"],
          capture_copied_text: false,
          capture_value_css_selector_allowlist: [],
        },
        mask_all_element_attributes: true,
        mask_all_text: true,
        rageclick: false,
        capture_pageview: "history_change",
        capture_pageleave: false,
        capture_dead_clicks: false,
        capture_exceptions: false,
        capture_heatmaps: true,
        capture_performance: { web_vitals: true, web_vitals_attribution: false },
        disable_capture_url_hashes: true,
        disable_session_recording: true,
        disable_surveys: true,
        advanced_disable_flags: true,
        person_profiles: "identified_only",
        save_campaign_params: false,
        save_referrer: false,
        property_denylist: ["$referrer", "$referring_domain"],
        before_send: (event) => {
          if (!event) {
            return null;
          }

          // Session entry properties can include the original URL and query parameters.
          const properties = Object.fromEntries(
            Object.entries(event.properties ?? {}).filter(
              ([key]) =>
                !key.startsWith("$session_entry_") &&
                !key.endsWith("_event") &&
                key !== "$initial_current_url",
            ),
          );

          filterAnalyticsInputProperties(properties, includeInputValues);

          if (typeof properties.$current_url === "string") {
            properties.$current_url = properties.$current_url.split(/[?#]/, 1)[0];
          }

          if (event.event === "$autocapture" &&
              !PUBLIC_DISCOVERY_PATH.test(String(properties.$pathname))) {
            return null;
          }

          if ("$heatmap_data" in properties) {
            const heatmapData = sanitizeHeatmapData(properties.$heatmap_data);
            if (Object.keys(heatmapData).length === 0 && event.event === "$$heatmap") {
              return null;
            }
            properties.$heatmap_data = heatmapData;
          }

          // PostHog can attach initial URL and referral data to identified events.
          delete properties.$set_once;
          return { ...event, $set_once: undefined, properties };
        },
      });
      return posthog;
    })
    .catch((error: unknown) => {
      console.warn("PostHog initialization failed.", error);
      return undefined;
    });
  return analyticsClient;
}

function withAnalytics(action: (client: AnalyticsClient) => void) {
  return initializeAnalytics()
    .then((client) => {
      if (client) action(client);
    })
    .catch(() => {
      // Analytics must not interrupt the product flow.
    });
}

export function captureAnalytics(event: string, properties?: AnalyticsProperties) {
  void withAnalytics((client) => client.capture(event, properties));
}

export function identifyAnalytics(memberId: number) {
  if (!Number.isSafeInteger(memberId) || memberId <= 0) return Promise.resolve();

  return withAnalytics((client) => {
    const id = String(memberId);
    if (client.get_property("$user_id") && client.get_distinct_id() !== id) {
      client.reset();
    }
    client.identify(id);
  });
}

export function setAnalyticsPurpose(purpose: "FINDER" | "RESEARCHER") {
  void withAnalytics((client) => client.setPersonProperties({ purpose }));
}

export function resetAnalytics() {
  return withAnalytics((client) => client.reset());
}
