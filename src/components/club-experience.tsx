"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
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
  DESCUENTO: "Tu beneficio",
  ENCUESTA: "Encuesta",
  INVITACION: "Invitación",
  IMAGEN: "Novedad",
};

const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------- Íconos (SVG, sin emojis) ---------- */

function IconCheck({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLock({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconCopy({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconArrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlay({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

/* ---------- Motion ---------- */

function Reveal({
  children,
  delay = 0,
  y = 26,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function RevealOnLoad({
  children,
  delay = 0,
  y = 26,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Piezas ---------- */

function VideoEmbed({ url }: { url: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-line bg-dark/5 shadow-[0_40px_100px_-50px_rgba(36,13,8,0.6)]">
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
    <div className="flex aspect-video w-full items-center justify-center rounded-3xl border border-line bg-bg-3/50 text-center">
      <div className="space-y-3 px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-line bg-bg-2/60">
          <IconPlay className="ml-0.5 h-5 w-5 text-gold" />
        </div>
        <p className="text-sm text-muted">Un mensaje para vos. Muy pronto.</p>
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
      /* algunos navegadores bloquean el portapapeles: mostramos el estado igual */
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2200);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="group/codigo mt-7 flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl bg-dark px-6 py-5 text-left outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-gold-bright focus-visible:ring-offset-2 focus-visible:ring-offset-bg-2"
      aria-label={`Copiar el código ${codigo}`}
    >
      <span className="min-w-0">
        <span className="block text-[0.7rem] font-medium uppercase tracking-[0.24em] text-paper/60">
          Tu código
        </span>
        <span
          className="font-display mt-1.5 block truncate text-3xl tracking-wide text-gold-bright sm:text-4xl"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {codigo}
        </span>
      </span>
      <span
        className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
          copiado ? "bg-gold-bright text-dark" : "bg-paper/12 text-paper group-hover/codigo:bg-paper/20"
        }`}
      >
        {copiado ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
        {copiado ? "Copiado" : "Copiar"}
      </span>
    </button>
  );
}

function Bloque({ bloque }: { bloque: ClubContent["bloques"][number] }) {
  const embed = bloque.tipo === "VIDEO" ? toEmbedUrl(bloque.mediaUrl) : null;
  const destacado = bloque.tipo === "DESCUENTO" || bloque.tipo === "INVITACION";

  return (
    <article
      className={`overflow-hidden rounded-[1.75rem] border p-8 transition-shadow duration-500 sm:p-10 ${
        destacado
          ? "border-gold/25 bg-bg-2 shadow-[0_30px_80px_-55px_rgba(109,41,0,0.6)]"
          : "border-line bg-bg-2/60"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-muted">
          {TIPO_LABEL[bloque.tipo] ?? "Novedad"}
        </p>
      </div>

      {bloque.titulo && (
        <h3 className="font-display mt-4 text-[1.7rem] leading-[1.12] text-cream sm:text-3xl">
          {bloque.titulo}
        </h3>
      )}
      {bloque.cuerpo && (
        <p className="mt-4 max-w-[54ch] whitespace-pre-line text-[1.05rem] leading-relaxed text-cream-dim">
          {bloque.cuerpo}
        </p>
      )}

      {bloque.codigo && <CodigoChip codigo={bloque.codigo} />}

      {embed && (
        <div className="mt-7">
          <VideoEmbed url={embed} />
        </div>
      )}
      {bloque.tipo === "IMAGEN" && bloque.mediaUrl && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bloque.mediaUrl} alt={bloque.titulo ?? "Novedad para Fundadores"} className="w-full" />
        </div>
      )}

      {bloque.ctaTexto && bloque.ctaUrl && (
        <a
          href={bloque.ctaUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-shine group/cta mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-btn px-7 py-3.5 text-sm font-medium text-paper outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <span className="shine" />
          {bloque.ctaTexto}
          <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
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
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-paper">
          <IconCheck className="h-3.5 w-3.5" />
        </span>
        <p className="text-lg text-cream">
          Listo. Te aviso yo cuando abra algo nuevo. Nadie más lo va a saber antes que vos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {texto && <p className="max-w-[52ch] text-[1.05rem] leading-relaxed text-cream-dim">{texto}</p>}
      <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <label htmlFor="club-email" className="sr-only">
          Tu correo electrónico
        </label>
        <input
          id="club-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="h-13 flex-1 rounded-full border border-line bg-bg-2/80 px-5 py-3.5 text-cream outline-none transition-colors placeholder:text-muted focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/30"
        />
        <button
          type="submit"
          disabled={estado === "loading"}
          className="btn-shine h-13 cursor-pointer rounded-full bg-btn px-8 py-3.5 text-sm font-medium text-paper outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-wait disabled:opacity-60"
        >
          <span className="shine" />
          {estado === "loading" ? "Enviando…" : "Avisame primero"}
        </button>
      </form>
      {estado === "error" && (
        <p className="text-sm text-gold">Algo falló. Probá de nuevo en un momento.</p>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="h-px w-8 bg-line" aria-hidden="true" />
      <span className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-muted">
        {children}
      </span>
      <span className="h-px w-8 bg-line" aria-hidden="true" />
    </div>
  );
}

/* ---------- Página ---------- */

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
      {/* Aurora sutil de fondo */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-aurora absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-gold-bright/15 blur-3xl" />
        <div className="animate-aurora-2 absolute -right-32 top-1/3 h-[26rem] w-[26rem] rounded-full bg-btn/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="flex justify-center px-6 pt-10">
        <Image src="/logo.png" alt="Giapura" width={120} height={40} priority className="h-9 w-auto" />
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-3xl px-6 pt-20 text-center sm:pt-28">
        <RevealOnLoad>
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold/40" aria-hidden="true" />
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.32em] text-gold">
              Club Fundadores
            </p>
            <span className="h-px w-8 bg-gold/40" aria-hidden="true" />
          </div>
        </RevealOnLoad>
        <RevealOnLoad delay={0.12}>
          <h1 className="font-display mx-auto mt-6 max-w-[14ch] text-[2.6rem] leading-[1.02] text-cream sm:text-6xl">
            {config.heroTitulo}
          </h1>
        </RevealOnLoad>
        {config.heroSubtitulo && (
          <RevealOnLoad delay={0.24}>
            <p className="mx-auto mt-7 max-w-[46ch] text-lg leading-relaxed text-cream-dim sm:text-xl">
              {config.heroSubtitulo}
            </p>
          </RevealOnLoad>
        )}
        <RevealOnLoad delay={0.38} y={34}>
          <div className="mt-14">
            {heroEmbed ? <VideoEmbed url={heroEmbed} /> : <VideoPlaceholder />}
          </div>
        </RevealOnLoad>
      </section>

      {/* Qué significa este acceso */}
      <section className="mx-auto max-w-2xl px-6 py-28 text-center sm:py-36">
        <Reveal>
          <SectionLabel>Lo que es</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="font-display mt-7 text-[2rem] leading-tight text-cream sm:text-[2.6rem]">
            {config.introTitulo}
          </h2>
        </Reveal>
        {config.introTexto && (
          <Reveal delay={0.16}>
            <p className="mx-auto mt-7 max-w-[50ch] whitespace-pre-line text-lg leading-[1.75] text-cream-dim">
              {config.introTexto}
            </p>
          </Reveal>
        )}
      </section>

      {/* Contenido dinámico */}
      {bloques.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 pb-28 sm:pb-36">
          <Reveal>
            <SectionLabel>Reservado para vos</SectionLabel>
          </Reveal>
          <div className="mt-12 space-y-6">
            {bloques.map((bloque, i) => (
              <Reveal key={bloque.id} delay={i === 0 ? 0 : 0.04}>
                <Bloque bloque={bloque} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Historial */}
      {historial.length > 0 && (
        <section className="mx-auto max-w-xl px-6 pb-28 sm:pb-36">
          <Reveal>
            <SectionLabel>El recorrido</SectionLabel>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display mt-7 text-center text-2xl text-cream sm:text-3xl">
              Todo lo que ya pasó por acá
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <ul className="mt-10 divide-y divide-line overflow-hidden rounded-2xl border border-line">
              {historial.map((item) => (
                <li key={item.id} className="flex items-center gap-4 bg-bg-2/50 px-6 py-4">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      item.desbloqueado ? "bg-gold text-paper" : "border border-line text-muted"
                    }`}
                  >
                    {item.desbloqueado ? (
                      <IconCheck className="h-3.5 w-3.5" />
                    ) : (
                      <IconLock className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className={item.desbloqueado ? "text-cream" : "text-muted"}>
                    {item.titulo}
                  </span>
                  {!item.desbloqueado && (
                    <span className="ml-auto text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted">
                      Pronto
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}

      {/* Activar novedades */}
      <section className="mx-auto max-w-2xl px-6 pb-28 sm:pb-36">
        <Reveal>
          <div className="rounded-[2rem] border border-line bg-bg-2/60 p-8 sm:p-12">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-gold">
              Enterate primero
            </p>
            <h2 className="font-display mt-4 text-[1.7rem] leading-tight text-cream sm:text-3xl">
              Que no se te escape nada
            </h2>
            <div className="mt-6">
              <NovedadesForm erpUrl={erpUrl} texto={config.novedadesTexto} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <Reveal>
            <p className="font-display mx-auto max-w-[26ch] text-2xl leading-snug text-cream">
              {config.footerTexto}
            </p>
          </Reveal>
          <Image
            src="/logo.png"
            alt="Giapura"
            width={90}
            height={30}
            className="mx-auto mt-10 h-7 w-auto opacity-60"
          />
        </div>
      </footer>
    </main>
  );
}
