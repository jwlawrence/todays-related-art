"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const GA_MEASUREMENT_ID = "G-SL0PYBP0X2";

/* /widget authenticates by a bearer token in its query string and both vendors
   report the full URL, so neither one runs there. beforeSend is the second
   layer, for any other route that ends up carrying the param. */
function redactToken(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("token")) return url;
    parsed.searchParams.set("token", "REDACTED");
    return parsed.href;
  } catch {
    return url;
  }
}

export function Analytics() {
  const pathname = usePathname();

  if (pathname?.startsWith("/widget")) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      <VercelAnalytics
        beforeSend={(event) => ({ ...event, url: redactToken(event.url) })}
      />
      <SpeedInsights />
    </>
  );
}
