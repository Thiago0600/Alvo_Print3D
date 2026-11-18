import type { Metadata, Viewport } from "next";
import { Sora, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteProvider } from "@/components/SiteProvider";
import { Assistant } from "@/components/Assistant";
import { getCompany } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["400", "600", "700", "800"] });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", weight: ["400", "500"] });

export const revalidate = 300;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Impressão 3D em Évora e Portugal | Alvo Print 3D",
    template: "%s | Alvo Print 3D",
  },
  description:
    "Impressão 3D personalizada em Évora com entrega gratuita em Portugal continental. Peças à medida, protótipos, peças industriais e para automóveis, e criação de modelos 3D a partir de fotografias com IA.",
  keywords: [
    "impressão 3D Portugal",
    "impressão 3D Évora",
    "peças personalizadas 3D",
    "fabricação de peças 3D",
    "impressão 3D industrial",
    "produção de peças em grandes quantidades",
    "criar modelo 3D através de fotografia",
  ],
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: "Alvo Print 3D",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Alvo Print 3D" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0e",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const company = await getCompany();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    url: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    telephone: `+${company.whatsapp}`,
    address: { "@type": "PostalAddress", addressLocality: company.city, addressCountry: "PT" },
    areaServed: { "@type": "Country", name: "Portugal" },
    description: "Impressão 3D personalizada, protótipos, peças industriais e produção em escala.",
  };
  return (
    <html lang="pt-PT" className={`${sora.variable} ${manrope.variable} ${plex.variable}`}>
      <body className="min-h-dvh">
        <SiteProvider company={company}>
          <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-orange focus:px-3 focus:py-2 focus:text-black">
            Saltar para o conteúdo
          </a>
          <Header />
          <main id="conteudo">{children}</main>
          <Footer />
          <Assistant />
        </SiteProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
