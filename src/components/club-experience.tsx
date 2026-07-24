"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { toEmbedUrl } from "@/lib/embed";

export type ClubContent = {
  config: {
    heroTitulo: string;
    heroSubtitulo: string | null;
    heroVideoUrl: string | null;
    introTitulo: string;
    introTexto: string | null;
    novedadesTexto: string | null;
    footerTexto: string;
  };
  bloques: {
    id: string;
    tipo: string;
    titulo: string | null;
    cuerpo: string | null;
    codigo: string | null;
    ctaTexto: string | null;
    ctaUrl: string | null;
    mediaUrl: string | null;
  }[];
  historial: { id: string; titulo: string; desbloqueado: boolean }[];
};

const TIPO_LABEL: Record<string, string> = {
  TEXTO: "Novedad",
  VIDEO: "Video",
  DESCUENTO: "Beneficio",
  ENCUESTA: "Encuesta",
  INVITACION: "Invitación",
  IMAGEN: "Novedad",
};

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function VideoEmbed({ url }: { url: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-dark/5 shadow-[0_30px_80px_-40px_rgba(36,13,8,0.5)]">
      <iframe
        src={url}
        title="Video de bienvenida"
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function VideoPlaceholder() {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-line bg-bg-3/60 text-center">
      <div className="space-y-2 px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line">
          <span className="ml-1 block h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-gold" />
        </div>
        <p className="text-sm text-muted">El video de bienvenida llega pronto.</p>
      </div>
    </div>
  );
}

function CodigoChip({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
    } catch {
      /* si el navegador bloquea el portapapeles, igual mostramos el estado */
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="group/codigo mt-6 flex w-full items-center justify-between gap-4 rounded-2xl border border-dashed border-gold/50 bg-bg-3/50 px-6 py-4 text-left transition-colors hover:border-gold"
      aria-label={`Copiar código ${codigo}`}
    >
      <span className="min-w-0">
        <span className="block text-xs font-medium uppercase tracking-[0.22em] text-muted">
          Tu código
        </span>
        <span className="font-display mt-1 block truncate text-2xl tracking-wide text-gold sm:text-3xl">
          {codigo}
        </span>
      </span>
      <span
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          copiado ? "bg-gold text-paper" : "bg-btn text-paper group-hover/codigo:bg-gold"
        }`}
      >
        {copiado ? "¡Copiado! ✓" : "Copiar"}
      </span>
    </button>
  );
}

function Bloque({ bloque }: { bloque: ClubContent["bloques"][number] }) {
  const embed = bloque.tipo === "VIDEO" ? toEmbedUrl(bloque.mediaUrl) : null;

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-bg-2/70 p-8 backdrop-blur-sm transition-shadow duration-500 hover:shadow-[0_40px_90px_-50px_rgba(36,13,8,0.55)] sm:p-10">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted">
        {TIPO_LABEL[bloque.tipo] ?? "Novedad"}
      </p>
      {bloque.titulo && (
        <h3 className="font-display mt-3 text-2xl leading-tight text-cream sm:text-3xl">
          {bloque.titulo}
        </h3>
      )}
      {bloque.cuerpo && (
        <p className="mt-4 max-w-2xl whitespace-pre-line text-cream-dim">{bloque.cuerpo}</p>
      )}

      {bloque.codigo && <CodigoChip codigo={bloque.codigo} />}

      {embed && (
        <div className="mt-6">
          <VideoEmbed url={embed} />
        </div>
      )}
      {bloque.tipo === "IMAGEN" && bloque.mediaUrl && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bloque.mediaUrl} alt={bloque.titulo ?? ""} className="w-full" />
        </div>
      )}

      {bloque.ctaTexto && bloque.ctaUrl && (
        <a
          href={bloque.ctaUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-shine mt-7 inline-flex items-center gap-2 rounded-full bg-btn px-6 py-3 text-sm font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5"
        >
          <span className="shine" />
          {bloque.ctaTexto}
          <span aria-hidden>→</span>
        </a>
      )}
    </article>
  );
}

function NovedadesForm({ erpUrl, texto }: { erpUrl: string; texto: string | null }) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEstado("loading");
    try {
      const res = await fetch(`${erpUrl}/api/public/club-novedades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setEstado(res.ok ? "ok" : "error");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <p className="text-lg text-cream">
        Listo. Te vamos a avisar únicamente cuando haya algo nuevo para Fundadores. ✓
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {texto && <p className="max-w-xl text-cream-dim">{texto}</p>}
      <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="h-12 flex-1 rounded-full border border-line bg-bg-2/80 px-5 text-cream outline-none transition-colors placeholder:text-muted focus:border-gold"
        />
        <button
          type="submit"
          disabled={estado === "loading"}
          className="btn-shine h-12 rounded-full bg-btn px-7 text-sm font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
        >
          <span className="shine" />
          {estado === "loading" ? "Enviando..." : "Avisame"}
        </button>
      </form>
      {estado === "error" && (
        <p className="text-sm text-gold">Hubo un problema. Probá de nuevo en un momento.</p>
      )}
    </div>
  );
}

export function ClubExperience({
  content,
  erpUrl,
}: {
  content: ClubContent;
  erpUrl: string;
}) {
  const { config, bloques, historial } = content;
  const heroEmbed = toEmbedUrl(config.heroVideoUrl);

  return (
    <main className="relative">
      {/* Aurora suave de fondo */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-aurora absolute -left-32 top-10 h-96 w-96 rounded-full bg-gold-bright/20 blur-3xl" />
        <div className="animate-aurora-2 absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-btn/10 blur-3xl" />
      </div>

      {/* Header minimal */}
      <header className="flex justify-center px-6 pt-10">
        <Image src="/logo.png" alt="Giapura" width={120} height={40} priority className="h-9 w-auto" />
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-3xl px-6 pt-16 text-center sm:pt-24">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted">
            Club Fundadores
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="font-display mt-5 text-4xl leading-[1.05] text-cream sm:text-6xl">
            {config.heroTitulo}
          </h1>
        </Reveal>
        {config.heroSubtitulo && (
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-cream-dim">{config.heroSubtitulo}</p>
          </Reveal>
        )}
        <Reveal delay={0.3}>
          <div className="mt-12">
            {heroEmbed ? <VideoEmbed url={heroEmbed} /> : <VideoPlaceholder />}
          </div>
        </Reveal>
      </section>

      {/* Qué es este acceso */}
      <section className="mx-auto max-w-2xl px-6 py-28 text-center sm:py-36">
        <Reveal>
          <h2 className="font-display text-3xl text-cream sm:text-4xl">{config.introTitulo}</h2>
        </Reveal>
        {config.introTexto && (
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl whitespace-pre-line text-lg leading-relaxed text-cream-dim">
              {config.introTexto}
            </p>
          </Reveal>
        )}
      </section>

      {/* Contenido dinámico */}
      {bloques.length > 0 && (
        <section className="mx-auto max-w-3xl space-y-6 px-6 pb-28 sm:pb-36">
          {bloques.map((bloque, i) => (
            <Reveal key={bloque.id} delay={i === 0 ? 0 : 0.05}>
              <Bloque bloque={bloque} />
            </Reveal>
          ))}
        </section>
      )}

      {/* Historial del Ticket */}
      {historial.length > 0 && (
        <section className="mx-auto max-w-xl px-6 pb-28 sm:pb-36">
          <Reveal>
            <h2 className="font-display text-center text-2xl text-cream sm:text-3xl">
              Historial del acceso
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="mt-10 space-y-px overflow-hidden rounded-2xl border border-line">
              {historial.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 bg-bg-2/60 px-6 py-4"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      item.desbloqueado
                        ? "bg-gold text-paper"
                        : "border border-line text-muted"
                    }`}
                    aria-hidden
                  >
                    {item.desbloqueado ? "✓" : "🔒"}
                  </span>
                  <span className={item.desbloqueado ? "text-cream" : "text-muted"}>
                    {item.titulo}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}

      {/* Activar novedades */}
      <section className="mx-auto max-w-2xl px-6 pb-28 sm:pb-36">
        <Reveal>
          <div className="rounded-3xl border border-line bg-bg-2/70 p-8 sm:p-12">
            <h2 className="font-display text-2xl text-cream sm:text-3xl">Activar novedades</h2>
            <div className="mt-5">
              <NovedadesForm erpUrl={erpUrl} texto={config.novedadesTexto} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <p className="font-display text-xl text-cream">{config.footerTexto}</p>
          <Image
            src="/logo.png"
            alt="Giapura"
            width={90}
            height={30}
            className="mx-auto mt-8 h-7 w-auto opacity-70"
          />
        </div>
      </footer>
    </main>
  );
}
