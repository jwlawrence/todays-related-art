"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const GA_MEASUREMENT_ID = "G-SL0PYBP0X2";

/* /widget authenticates by a bearer token in its query string and every vendor
   here reports the full URL, so none of them run on that route. beforeSend is
   the second layer: the Vercel scripts are never removed once injected, so a
   client-side navigation into /widget would keep an already-loaded script
   reporting the credential. Any SDK added here needs it too. */
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
      <SpeedInsights
        beforeSend={(event) => ({ ...event, url: redactToken(event.url) })}
      />
    </>
  );
}
