"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
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

type Bloque = ClubContent["bloques"][number];
type Tono = "claro" | "oscuro";

const TIPO_LABEL: Record<string, string> = {
  TEXTO: "Novedad",
  VIDEO: "Video",
  DESCUENTO: "Tu beneficio",
  ENCUESTA: "Encuesta",
  INVITACION: "Invitación",
  IMAGEN: "Novedad",
};

const EASE = [0.16, 1, 0.3, 1] as const;

/* Soporta **negrita** y saltos de línea (el contenedor usa whitespace-pre-line). */
function renderRich(text: string, strongClass: string): ReactNode {
  return text.split(/\*\*/).map((chunk, i) =>
    i % 2 === 1 ? (
      <strong key={i} className={`font-medium ${strongClass}`}>
        {chunk}
      </strong>
    ) : (
      <span key={i}>{chunk}</span>
    )
  );
}

/* ---------- Íconos ---------- */

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

function IconClose({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Motion ---------- */

function Reveal({ children, delay = 0, y = 24 }: { children: ReactNode; delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function RevealOnLoad({ children, delay = 0, y = 24 }: { children: ReactNode; delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Marca ---------- */

function Logo({ className = "" }: { className?: string }) {
  return <span role="img" aria-label="Giapura" className={`logo-mask block aspect-[1219/422] ${className}`} />;
}

function Patron({ className }: { className: string }) {
  return (
    <span aria-hidden="true" className={`patron-mask pointer-events-none absolute inset-0 -z-10 ${className}`} />
  );
}

function Fondo({ color }: { color: string }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20" style={{ background: color }} />
  );
}

/* Fundido que cruza el borde entre dos secciones con curva suave (smoothstep): sin quiebre de
   pendiente no aparece la línea en la unión. La mitad del alto tiene que caber en el padding. */
function Union({ desde, hacia, alto }: { desde: string; hacia: string; alto: string }) {
  const pasos = 12;
  const stops = Array.from({ length: pasos + 1 }, (_, i) => {
    const t = i / pasos;
    const s = t * t * (3 - 2 * t);
    return `color-mix(in srgb, ${hacia} ${(s * 100).toFixed(1)}%, ${desde}) ${(t * 100).toFixed(1)}%`;
  });
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -z-[18]"
      style={{ top: `calc(${alto} / -2)`, height: alto, background: `linear-gradient(to bottom, ${stops.join(", ")})` }}
    />
  );
}

function Eyebrow({ children, tono, centrado = false }: { children: ReactNode; tono: Tono; centrado?: boolean }) {
  const estilos = {
    claro: { linea: "bg-gold/40", texto: "text-gold" },
    oscuro: { linea: "bg-gold-bright/50", texto: "text-gold-bright" },
  }[tono];
  return (
    <div className={`flex items-center gap-3 ${centrado ? "justify-center" : ""}`}>
      <span className={`h-px w-8 ${estilos.linea}`} aria-hidden="true" />
      <p className={`text-[0.72rem] font-medium uppercase tracking-[0.3em] ${estilos.texto}`}>{children}</p>
      {centrado && <span className={`h-px w-8 ${estilos.linea}`} aria-hidden="true" />}
    </div>
  );
}

/* ---------- Piezas ---------- */

function VideoEmbed({ url }: { url: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-paper/15 bg-dark shadow-[0_40px_100px_-40px_rgba(20,6,2,0.8)]">
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
    <div className="flex aspect-video w-full items-center justify-center rounded-3xl border border-gold/20 bg-gold/[0.08] text-center">
      <div className="space-y-4 px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold-bright">
          <IconPlay className="ml-0.5 h-5 w-5 text-gold" />
        </div>
        <p className="text-sm text-gold">Un mensaje para vos. Muy pronto.</p>
      </div>
    </div>
  );
}

function CodigoChip({ codigo, focusClass }: { codigo: string; focusClass: string }) {
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
    <>
      <button
        type="button"
        onClick={copiar}
        aria-label={`Copiar el código ${codigo}`}
        className={`group/codigo flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-gold-bright/25 bg-dark px-6 py-5 text-left outline-none transition-colors duration-200 hover:border-gold-bright/60 focus-visible:ring-2 focus-visible:ring-offset-2 ${focusClass}`}
      >
        <span className="min-w-0">
          <span className="block text-[0.7rem] font-medium uppercase tracking-[0.24em] text-paper/70">
            Tu código
          </span>
          <span
            className="font-display mt-1.5 block break-all text-[1.75rem] leading-tight tracking-wide text-gold-bright sm:text-4xl"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {codigo}
          </span>
        </span>
        <span
          className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors duration-200 sm:px-4 ${
            copiado ? "bg-gold-bright text-dark" : "bg-paper/12 text-paper group-hover/codigo:bg-paper/20"
          }`}
        >
          {copiado ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
          <span className="hidden sm:inline">{copiado ? "Copiado" : "Copiar"}</span>
        </span>
      </button>
      <span className="sr-only" aria-live="polite">
        {copiado ? "Código copiado" : ""}
      </span>
    </>
  );
}

function BotonCrema({ href, children, offsetClass }: { href: string; children: ReactNode; offsetClass: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`btn-shine group/cta inline-flex cursor-pointer items-center gap-2 rounded-full bg-gold-bright px-7 py-3.5 text-sm font-medium text-dark outline-none transition-colors duration-200 hover:bg-paper focus-visible:ring-2 focus-visible:ring-gold-bright focus-visible:ring-offset-2 ${offsetClass}`}
    >
      <span className="shine" />
      {children}
      <IconArrow className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
    </a>
  );
}

/* Marco del ticket impreso, tomado del PDF original (coordenadas en puntos, eje Y invertido). */
function MarcoTicket() {
  return (
    <svg
      viewBox="0 0 340.157 170.079"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <g transform="matrix(1 0 0 -1 0 170.079)">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          transform="translate(9.5223 14.7521)"
          d="M0 0C0.651 -0.13 1.303 -0.26 1.954 -0.39C2.364 -0.551 3.976 -1.242 4.802 -3.085C5.203 -3.981 5.27 -4.817 5.268 -5.337C108.666 -5.275 212.064 -5.213 315.462 -5.152C315.686 -4.343 315.909 -3.535 316.133 -2.726C316.343 -2.289 316.953 -1.17 318.227 -0.48C319.039 -0.04 319.792 0.046 320.237 0.059C320.513 46.498 320.79 92.938 321.066 139.377C320.52 139.411 319.581 139.545 318.562 140.113C317.329 140.8 316.622 141.764 316.3 142.269C315.937 143.257 315.574 144.246 315.211 145.234L5.268 146.597C5.3 146.451 5.787 144.014 4.097 142.203C2.408 140.391 0.136 140.913 0 140.947Z"
        />
        <g fill="currentColor">
          <ellipse cx="9.442" cy="161.693" rx="0.9" ry="0.9" />
          <ellipse cx="9.819" cy="8.227" rx="0.9" ry="0.9" />
          <ellipse cx="330.872" cy="8.451" rx="0.9" ry="0.9" />
          <ellipse cx="330.747" cy="160.506" rx="0.9" ry="0.9" />
        </g>
      </g>
    </svg>
  );
}

function TicketFundador() {
  const reduce = useReducedMotion();
  const [volteado, setVolteado] = useState(false);
  const resorte = { stiffness: 170, damping: 18 };
  const giro = useSpring(0, { stiffness: 90, damping: 15 });
  const rotX = useSpring(0, resorte);
  const rotY = useSpring(0, resorte);
  const rotYTotal = useTransform(() => giro.get() + rotY.get());
  const brilloOpacidad = useSpring(0, resorte);
  const brilloX = useMotionValue(50);
  const brilloY = useMotionValue(0);
  const brillo = useMotionTemplate`radial-gradient(circle at ${brilloX}% ${brilloY}%, rgba(255, 244, 214, 0.6), transparent 55%)`;

  function voltear() {
    const siguiente = !volteado;
    setVolteado(siguiente);
    if (reduce) giro.jump(siguiente ? 180 : 0);
    else giro.set(siguiente ? 180 : 0);
  }

  function inclinar(e: React.PointerEvent<HTMLButtonElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    rotY.set((x - 0.5) * 12);
    rotX.set((0.5 - y) * 12);
    brilloX.set(x * 100);
    brilloY.set(y * 100);
    brilloOpacidad.set(1);
  }

  function soltar() {
    rotX.set(0);
    rotY.set(0);
    brilloOpacidad.set(0);
  }

  const cara =
    "absolute inset-0 overflow-hidden rounded-md bg-[#d99947] bg-cover bg-center text-btn shadow-[0_30px_60px_-28px_rgba(36,13,8,0.6)] [backface-visibility:hidden]";
  const reflejo = (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ background: brillo, opacity: brilloOpacidad }}
    />
  );

  return (
    <div className="@container">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 48, rotateX: 24 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.1, ease: EASE }}
        style={{ transformPerspective: 1400 }}
      >
        <motion.button
          type="button"
          onClick={voltear}
          onPointerMove={inclinar}
          onPointerLeave={soltar}
          aria-pressed={volteado}
          whileTap={reduce ? undefined : { scale: 0.98 }}
          style={{ rotateX: rotX, rotateY: rotYTotal, transformPerspective: 1400, transformStyle: "preserve-3d" }}
          className="relative block aspect-[16/10] w-full cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-bg sm:aspect-[2/1]"
        >
          <span className="sr-only">{volteado ? "Ver el frente del ticket" : "Dar vuelta el ticket"}</span>

          <span aria-hidden={volteado} className={cara} style={{ backgroundImage: "url(/ticket-frente.webp)" }}>
            <span aria-hidden="true" className="ticket-brillo pointer-events-none absolute inset-0" />
            <MarcoTicket />
            {reflejo}
            <span className="relative flex h-full flex-col items-center justify-center px-[9%] text-center">
              <span className="font-display block whitespace-nowrap text-[9cqw] leading-none">TICKET FUNDADOR</span>
              <span className="mt-[2.2cqw] block max-w-[34ch] text-[max(2.8cqw,11px)] font-medium leading-snug">
                Este ticket acredita que formaste parte de la primer tanda nacional de Giapura.
              </span>
              <span className="mt-[2.6cqw] flex w-[78%] items-center gap-[2cqw]">
                <span aria-hidden="true" className="h-px flex-1 bg-current" />
                <span className="whitespace-nowrap text-[max(2.6cqw,11px)] font-bold">Miembro desde 15/9</span>
                <span aria-hidden="true" className="h-px flex-1 bg-current" />
              </span>
            </span>
          </span>

          <span
            aria-hidden={!volteado}
            className={cara}
            style={{ backgroundImage: "url(/ticket-dorso.webp)", transform: "rotateY(180deg)" }}
          >
            <span aria-hidden="true" className="ticket-brillo pointer-events-none absolute inset-0" />
            {reflejo}
            <span className="relative flex h-full flex-col items-center justify-center gap-[3.5cqw]">
              <Logo className="h-[14.7cqw] bg-current" />
              <span className="block text-[max(4.8cqw,15px)] font-bold leading-none tracking-[-0.02em]">
                Volvé a lo simple y real.
              </span>
            </span>
          </span>
        </motion.button>
      </motion.div>
      <p className="mt-4 text-center text-sm text-gold">Tocalo para darlo vuelta</p>
    </div>
  );
}

function BloqueCard({ bloque }: { bloque: Bloque }) {
  const embed = bloque.tipo === "VIDEO" ? toEmbedUrl(bloque.mediaUrl) : null;
  const destacado = bloque.tipo === "DESCUENTO" || bloque.tipo === "INVITACION";
  const offset = destacado ? "focus-visible:ring-offset-dark" : "focus-visible:ring-offset-btn";

  return (
    <article
      className={`overflow-hidden rounded-[1.75rem] border p-8 sm:p-10 ${
        destacado ? "border-gold-bright/35 bg-dark" : "border-paper/12 bg-paper/[0.04]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-gold-bright" aria-hidden="true" />
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-gold-bright">
          {TIPO_LABEL[bloque.tipo] ?? "Novedad"}
        </p>
      </div>

      {bloque.titulo && (
        <h3 className="font-display mt-4 text-[1.7rem] leading-[1.12] text-paper sm:text-3xl">{bloque.titulo}</h3>
      )}
      {bloque.cuerpo && (
        <p className="mt-4 max-w-[54ch] whitespace-pre-line text-[1.05rem] leading-relaxed text-paper/80">
          {bloque.cuerpo}
        </p>
      )}

      {embed && (
        <div className="mt-7">
          <VideoEmbed url={embed} />
        </div>
      )}

      {bloque.codigo && (
        <div className="mt-7">
          <CodigoChip codigo={bloque.codigo} focusClass={`focus-visible:ring-gold-bright ${offset}`} />
        </div>
      )}

      {bloque.tipo === "IMAGEN" && bloque.mediaUrl && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-paper/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bloque.mediaUrl} alt={bloque.titulo ?? "Novedad para Fundadores"} className="w-full" />
        </div>
      )}

      {bloque.ctaTexto && bloque.ctaUrl && (
        <div className="mt-8">
          <BotonCrema href={bloque.ctaUrl} offsetClass={offset}>
            {bloque.ctaTexto}
          </BotonCrema>
        </div>
      )}
    </article>
  );
}

function NovedadesForm({
  erpUrl,
  texto,
  botonTexto,
}: {
  erpUrl: string;
  texto: string | null;
  botonTexto: string;
}) {
  const id = useId();
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
      <div role="status" className="mx-auto flex max-w-md items-start gap-3 text-left">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-bright text-dark">
          <IconCheck className="h-3.5 w-3.5" />
        </span>
        <p className="text-lg text-paper">
          Listo, ya estás adentro. Cuando haya algo nuevo para Fundadores, te aviso a vos directamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {texto && (
        <p className="whitespace-pre-line text-[1.05rem] leading-[1.75] text-paper/80">
          {renderRich(texto, "text-gold-bright")}
        </p>
      )}
      <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3 text-left">
        <label htmlFor={id} className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-paper/70">
          Tu mail
        </label>
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="h-13 w-full rounded-full border border-paper/25 bg-paper/[0.06] px-5 text-paper outline-none transition-colors duration-200 placeholder:text-paper/60 hover:border-paper/40 focus-visible:border-gold-bright focus-visible:ring-2 focus-visible:ring-gold-bright/40"
        />
        <button
          type="submit"
          disabled={estado === "loading"}
          className="btn-shine h-13 w-full cursor-pointer rounded-full bg-gold-bright px-8 text-sm font-medium text-dark outline-none transition-colors duration-200 hover:bg-paper focus-visible:ring-2 focus-visible:ring-gold-bright focus-visible:ring-offset-2 focus-visible:ring-offset-dark disabled:cursor-wait disabled:opacity-70"
        >
          <span className="shine" />
          {estado === "loading" ? "Enviando…" : botonTexto}
        </button>
      </form>
      {estado === "error" && (
        <p role="alert" className="text-center text-sm text-gold-bright">
          Algo falló. Probá de nuevo en un momento.
        </p>
      )}
    </div>
  );
}

const POPUP_KEY = "club-popup-visto";

function marcarVisto() {
  try {
    localStorage.setItem(POPUP_KEY, "1");
  } catch {}
}

function MailPopup({ erpUrl }: { erpUrl: string }) {
  const [abierto, setAbierto] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(POPUP_KEY)) return;
    } catch {
      /* storage bloqueado: mostramos igual */
    }
    const t = setTimeout(() => setAbierto(true), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const panel = panelRef.current;
    const previo = document.activeElement as HTMLElement | null;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Foco al diálogo y no al input: evita abrir el teclado en mobile sin que la persona lo pida.
    panel?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAbierto(false);
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>("button:not([disabled]), input, a[href]")
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const actual = focusables.indexOf(document.activeElement as HTMLElement);
      if (actual === -1) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && actual === 0) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && actual === focusables.length - 1) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
      marcarVisto();
      previo?.focus();
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-dark/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={() => setAbierto(false)}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-titulo"
        aria-describedby="popup-texto"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative isolate w-full max-w-md overflow-hidden rounded-[1.75rem] border border-gold-bright/20 bg-dark p-8 text-left text-paper shadow-2xl outline-none sm:p-10"
      >
        <Patron className="bg-gold-bright opacity-[0.06]" />
        <button
          type="button"
          onClick={() => setAbierto(false)}
          aria-label="Cerrar"
          className="absolute right-3 top-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-paper/80 outline-none transition-colors duration-200 hover:bg-paper/10 hover:text-paper focus-visible:ring-2 focus-visible:ring-gold-bright"
        >
          <IconClose className="h-4 w-4" />
        </button>
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-gold-bright">Solo para Fundadores</p>
        <h2 id="popup-titulo" className="font-display mt-3 pr-8 text-[1.9rem] leading-tight text-paper">
          Lo que viene, te lo cuento a vos.
        </h2>
        <p id="popup-texto" className="mt-3 leading-relaxed text-paper/80">
          Cuando abra algo reservado para Fundadores, te aviso directamente. Sin newsletters, sin spam.
        </p>
        <div className="mt-7">
          <NovedadesForm erpUrl={erpUrl} texto={null} botonTexto="Avisame" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Página ---------- */

export function ClubExperience({ content, erpUrl }: { content: ClubContent; erpUrl: string }) {
  const { config, historial } = content;
  const heroEmbed = toEmbedUrl(config.heroVideoUrl);
  const descuento = content.bloques.find((b) => b.tipo === "DESCUENTO" && b.codigo);
  const bloques = content.bloques.filter((b) => b !== descuento);
  const hayReservado = bloques.length > 0 || historial.length > 0;
  const antesCierre = hayReservado ? "var(--btn)" : "var(--bg)";

  return (
    <main className="relative isolate">
      <MailPopup erpUrl={erpUrl} />
      <span aria-hidden="true" className="patron-mezcla pointer-events-none absolute inset-0 -z-10" />

      {/* Capítulo 1 — Bienvenida */}
      <section className="relative overflow-hidden px-6 pb-14 pt-12 text-gold sm:pb-20">
        <Fondo color="var(--gold-bright)" />
        <header className="flex justify-center">
          <Logo className="h-16 bg-gold sm:h-24" />
        </header>

        <div className="mx-auto max-w-3xl pt-6 text-center sm:pt-8">
          <Eyebrow tono="claro" centrado>
            Club Fundadores
          </Eyebrow>
          <h1 className="font-display mx-auto mt-6 max-w-[16ch] text-[2.6rem] leading-[1.04] text-balance text-gold sm:text-[3.8rem]">
            {config.heroTitulo}
          </h1>
          {config.heroSubtitulo && (
            <p className="mx-auto mt-7 max-w-[46ch] text-lg leading-relaxed text-gold sm:text-xl">
              {config.heroSubtitulo}
            </p>
          )}
          <RevealOnLoad delay={0.3} y={30}>
            <div className="mt-14">{heroEmbed ? <VideoEmbed url={heroEmbed} /> : <VideoPlaceholder />}</div>
          </RevealOnLoad>

          <div className="mx-auto mt-14 max-w-md">
            <h2 className="font-display text-[1.9rem] leading-tight text-gold sm:text-[2.3rem]">Tu primer regalo</h2>
            <div className="mt-5 text-left">
              {descuento?.codigo ? (
                <CodigoChip
                  codigo={descuento.codigo}
                  focusClass="focus-visible:ring-gold focus-visible:ring-offset-gold-bright"
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-gold/40 px-6 py-5 text-center">
                  <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-gold">Tu código</p>
                  <p className="font-display mt-1.5 text-2xl text-gold">Muy pronto</p>
                </div>
              )}
            </div>
            <p className="mt-4 text-sm text-gold">Canjealo en tu próxima compra online.</p>
          </div>
        </div>
      </section>

      {/* Capítulo 2 — Qué significa (crema + Pase Fundador) */}
      <section className="relative px-6 pb-24 pt-14 sm:pb-28 sm:pt-20">
        <Fondo color="var(--bg)" />
        <Union desde="var(--gold-bright)" hacia="var(--bg)" alto="6rem" />
        <div className="mx-auto max-w-3xl">
          <div>
            <Eyebrow tono="claro">Tu lugar en Giapura</Eyebrow>
            <Reveal>
              <h2 className="font-display mt-5 text-[2.2rem] leading-[1.08] text-balance text-cream sm:text-[2.9rem]">
                {config.introTitulo}
              </h2>
            </Reveal>
            {config.introTexto && (
              <p className="mt-8 max-w-[52ch] whitespace-pre-line text-[1.08rem] leading-[1.8] text-cream-dim">
                {renderRich(config.introTexto, "text-cream")}
              </p>
            )}
          </div>
          <div className="mt-14">
            <TicketFundador />
          </div>
        </div>
      </section>

      {/* Capítulo 3 — Reservado (marrón profundo) */}
      {hayReservado && (
        <section className="relative px-6 pb-14 pt-24 text-paper sm:pb-20 sm:pt-28">
          <Fondo color="var(--btn)" />
          <Union desde="var(--bg)" hacia="var(--btn)" alto="12rem" />
          <div className="mx-auto max-w-3xl">
            {bloques.length > 0 && (
              <div>
                <Eyebrow tono="oscuro" centrado>
                  Reservado para vos
                </Eyebrow>
                <Reveal>
                  <h2 className="font-display mt-5 text-center text-[2rem] leading-tight text-balance sm:text-[2.6rem]">
                    Solo para quienes estuvieron desde el principio.
                  </h2>
                </Reveal>
                <div className="mt-12 space-y-6">
                  {bloques.map((bloque) => (
                    <BloqueCard key={bloque.id} bloque={bloque} />
                  ))}
                </div>
              </div>
            )}

            {historial.length > 0 && (
              <div className={bloques.length > 0 ? "mt-24" : ""}>
                <Eyebrow tono="oscuro" centrado>
                  El recorrido
                </Eyebrow>
                <Reveal>
                  <h2 className="font-display mt-5 text-center text-2xl sm:text-3xl">Todo lo que ya pasó por acá</h2>
                </Reveal>
                <ul className="mx-auto mt-10 max-w-xl divide-y divide-paper/12 overflow-hidden rounded-2xl border border-paper/12">
                  {historial.map((item) => (
                    <li key={item.id} className="flex items-center gap-4 bg-dark/30 px-6 py-4">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          item.desbloqueado ? "bg-gold-bright text-dark" : "border border-paper/25 text-paper/70"
                        }`}
                      >
                        {item.desbloqueado ? <IconCheck className="h-3.5 w-3.5" /> : <IconLock className="h-3.5 w-3.5" />}
                      </span>
                      <span className={item.desbloqueado ? "text-paper" : "text-paper/70"}>{item.titulo}</span>
                      {!item.desbloqueado && (
                        <span className="ml-auto text-[0.7rem] font-medium uppercase tracking-[0.18em] text-gold-bright">
                          Pronto
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Capítulo 4 — Cierre (el más oscuro) */}
      <section
        className={`relative px-6 text-paper ${hayReservado ? "pt-14 sm:pt-20" : "pt-24 sm:pt-28"}`}
      >
        <Fondo color="var(--dark)" />
        <Union desde={antesCierre} hacia="var(--dark)" alto={hayReservado ? "6rem" : "12rem"} />
        <div className="mx-auto max-w-xl text-center">
          <Eyebrow tono="oscuro" centrado>
            Solo Fundadores
          </Eyebrow>
          <Reveal>
            <h2 className="font-display mt-5 text-[2.4rem] leading-[1.05] text-balance text-gold-bright sm:text-[3.4rem]">
              No te pierdas lo que viene.
            </h2>
          </Reveal>
          <div className="mt-8">
            <NovedadesForm erpUrl={erpUrl} texto={config.novedadesTexto} botonTexto="Avisame cuando haya algo nuevo" />
          </div>
        </div>

        <footer className="mx-auto mt-24 max-w-2xl border-t border-paper/10 py-16 text-center sm:mt-32">
          <p className="font-display mx-auto max-w-[26ch] text-2xl leading-snug text-paper">{config.footerTexto}</p>
          <Logo className="mx-auto mt-10 h-8 bg-gold-bright/80" />
        </footer>
      </section>
    </main>
  );
}
