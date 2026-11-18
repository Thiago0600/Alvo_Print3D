import type { Metadata } from "next";
import { CatalogView } from "@/components/CatalogView";

export const metadata: Metadata = {
  title: "Catálogo de peças impressas em 3D",
  description:
    "Peças impressas em 3D: automóvel, industrial, decoração, casa e utilidades, acessórios, prototipagem e peças personalizadas. Entrega gratuita em Portugal continental.",
  alternates: { canonical: "/catalogo" },
};
export const revalidate = 120;

export default function Catalogo() {
  return <CatalogView />;
}
