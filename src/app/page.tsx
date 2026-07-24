import { ClubExperience, type ClubContent } from "@/components/club-experience";

const ERP_URL = process.env.ERP_URL ?? "https://giapura-erp.vercel.app";
const PUBLIC_ERP_URL = process.env.NEXT_PUBLIC_ERP_URL ?? ERP_URL;

const FALLBACK: ClubContent = {
  config: {
    heroTitulo: "Bienvenido al Club Fundadores",
    heroSubtitulo:
      "Un lugar reservado para quienes estuvieron desde el principio.",
    heroVideoUrl: null,
    introTitulo: "Qué es este acceso",
    introTexto:
      "Este número te acompaña. Cada tanto voy a abrir oportunidades reservadas únicamente para los Fundadores. A veces será un acceso anticipado. Otras, una encuesta. O un beneficio. Nunca va a ser exactamente lo mismo.",
    novedadesTexto:
      "No quiero que tengas que acordarte de entrar. Dejame tu mail y te aviso únicamente cuando haya algo nuevo para Fundadores.",
    footerTexto: "Gracias por haber estado desde el principio. — Fran",
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
