import { ClubExperience, type ClubContent } from "@/components/club-experience";

const ERP_URL = process.env.ERP_URL ?? "https://giapura-erp.vercel.app";
const PUBLIC_ERP_URL = process.env.NEXT_PUBLIC_ERP_URL ?? ERP_URL;

const FALLBACK: ClubContent = {
  config: {
    heroTitulo: "Bienvenido al Club Fundadores.",
    heroSubtitulo: "Un lugar reservado para quienes estuvieron desde el principio.",
    heroVideoUrl: null,
    introTitulo: "¿Qué significa ser Fundador?",
    introTexto:
      "Ser Fundador significa haber confiado en Giapura cuando todo esto recién empezaba.\n\nY por haber estado desde el principio, vas a tener acceso a cosas que no van a estar disponibles para todos.\n\nPuede ser:\n\n**Un lanzamiento antes que nadie.**\n**Un descuento exclusivo.**\n**Una encuesta para decidir algo importante de Giapura.**\n**Un beneficio especial.**\n\nO algo que todavía ni siquiera existe.\n\nNo hay una lista de beneficios cerrada.\n\nPorque quiero que el Club Fundadores crezca junto con Giapura.\n\nLo que sí te puedo asegurar es que, cuando haya algo reservado para Fundadores, **vos vas a poder acceder.**",
    novedadesTexto:
      "Cada tanto voy a abrir algo exclusivamente para Fundadores.\n\nY no quiero que tengas que acordarte de entrar a esta página para enterarte.\n\nDejame tu mail y te voy a avisar directamente cada vez que haya algo nuevo.\n\n**Sin newsletters.\nSin spam.\nSolo cuando haya algo para vos.**",
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
