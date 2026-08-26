import { ClubExperience, type ClubContent } from "@/components/club-experience";

const ERP_URL = process.env.ERP_URL ?? "https://giapura-erp.vercel.app";
const PUBLIC_ERP_URL = process.env.NEXT_PUBLIC_ERP_URL ?? ERP_URL;

const FALLBACK: ClubContent = {
  config: {
    heroTitulo: "Estás adentro.",
    heroSubtitulo:
      "Muy poca gente va a ver esta página. Solo los que estuvieron desde el primer frasco. Vos sos uno de ellos.",
    heroVideoUrl: null,
    introTitulo: "Qué significa tener esta llave",
    introTexto:
      "Te lo digo simple: este acceso es tuyo y no vence.\n\nCada tanto voy a abrir algo que queda solo entre nosotros, los Fundadores. Un adelanto antes que nadie. Un beneficio que no está en ningún otro lado. A veces, tu opinión para decidir qué viene.\n\nNunca va a ser lo mismo. Y nunca va a estar abierto al público.",
    novedadesTexto:
      "No quiero que tengas que estar pendiente. Dejame tu mail y te aviso yo, en persona, solo cuando abra algo nuevo para Fundadores. Nada de spam. Nada de relleno.",
    footerTexto: "Gracias por haber estado desde el principio. Esto también es tuyo. — Fran",
  },
  bloques: [],
  historial: [],
};

async function getContent(): Promise<ClubContent> {
  try {
    const res = await fetch(`${ERP_URL}/api/public/club-contenido`, {
      cache: "no-store",
    });
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as Partial<ClubContent>;
    return {
      config: { ...FALLBACK.config, ...(data.config ?? {}) },
      bloques: data.bloques ?? [],
      historial: data.historial ?? [],
    };
  } catch {
    return FALLBACK;
  }
}

export default async function Page() {
  const content = await getContent();
  return <ClubExperience content={content} erpUrl={PUBLIC_ERP_URL} />;
}
