import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Archivo, EB_Garamond, Fragment_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
});

const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
});

const fragment = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-fragment",
});

export const metadata: Metadata = {
  title: "Today's Related Art",
  description: "See which related art your kids have today",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Related Art",
  },
};

export const viewport: Viewport = {
  themeColor: "#F2EDDF",
  width: "device-width",
  initialScale: 1,
};

const DIRECTION_CONTRACT = `<!--
THESIS: The household's reference manual for the school rotation, lying open
at today's tab; refuses the family-app default of cream ground, rounded cards,
and pastel washes.
OWN-WORLD: Board-stock ground, print ink, five full-strength section boards
(oxide red, ultramarine, chrome yellow, grass, oxide orange); milk-acetate
leaves with runtime-solved alpha carry the reading; vermilion errata slips for
errors only; stepped fore-edge tab rail; hairline rules; condensed-caps
legends, heavy grotesk display, mono machine voice, Garamond prose at 17px+;
no easing — every change is a 90ms two-frame step hinged at the bound edge.
STORY: A parent glances, reads the class off the leaf, packs the bag.
FIRST VIEWPORT: Running header and dateline; today's board full-bleed in the
day's color with one acetate leaf per child (name legend, class display,
BRING mono line); week index below as the contents table; tab rail at the
fore edge with today's tab extended.
FORM: Manual Acetate Tab Board (catalog challenger over grounded list); seed a62fc54b.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${garamond.variable} ${fragment.variable}`}>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-SL0PYBP0X2"
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-SL0PYBP0X2');
        `}
      </Script>
      <body className="min-h-screen">
        <div dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        <Providers>
          <main>{children}</main>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
