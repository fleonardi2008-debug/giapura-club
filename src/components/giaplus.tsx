"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------- Reglas de GiaPlus (las placas de la guía) ---------- */

/* Puntos por cada $10.000 de compra. 1 punto = $10 de saldo. */
const NIVELES = [
  { nombre: "Maní Cero", frase: "Acabás de entrar al mundo Giapura.", puntos: 30, mani: 1 },
  { nombre: "Manija", frase: "Ya no comprás pasta de maní. La necesitás.", puntos: 40, mani: 2 },
  { nombre: "Maníatico", frase: "Llegaste a otro nivel de obsesión.", puntos: 50, mani: 3 },
  { nombre: "Fundador", frase: "El nivel más alto.", puntos: 75, mani: 4 },
];

const NIVEL_FUNDADOR = 3;
const BLOQUE_COMPRA = 10000;
const VALOR_PUNTO = 10;

type Accion = { id: string; texto: string; puntos: number; icono: NombreIcono; paraOtro?: boolean };
type Categoria = { id: string; nombre: string; icono: NombreIcono; acciones: Accion[] };

const CATEGORIAS: Categoria[] = [
  {
    id: "compras",
    nombre: "Comprando",
    icono: "bolsa",
    acciones: [
      { id: "primera", texto: "Tu primera compra", puntos: 100, icono: "bolsa" },
      { id: "monto", texto: "Gastar sobre cierto monto", puntos: 250, icono: "moneda" },
      { id: "cinco", texto: "Llegar a 5 compras", puntos: 100, icono: "estrella" },
    ],
  },
  {
    id: "instagram",
    nombre: "Instagram",
    icono: "instagram",
    acciones: [
      { id: "seguir", texto: "Seguir a Giapura", puntos: 15, icono: "instagram" },
      { id: "historia", texto: "Subir una historia", puntos: 30, icono: "instagram" },
    ],
  },
  {
    id: "amigos",
    nombre: "Amigos",
    icono: "amigos",
    acciones: [
      { id: "invitar", texto: "Invitar a un amigo", puntos: 30, icono: "amigos" },
      { id: "anfitrion", texto: "Cuando tu amigo compra, sumás", puntos: 50, icono: "moneda" },
      { id: "invitado", texto: "Tu amigo arranca con", puntos: 50, icono: "regalo", paraOtro: true },
    ],
  },
  {
    id: "vos",
    nombre: "Vos",
    icono: "usuario",
    acciones: [
      { id: "registro", texto: "Registrarte en GiaPlus", puntos: 15, icono: "usuario" },
      { id: "newsletter", texto: "Suscribirte al newsletter", puntos: 15, icono: "mail" },
      { id: "cumple", texto: "Tu regalo de cumpleaños", puntos: 50, icono: "regalo" },
    ],
  },
];

const CICLO: { id: string; titulo: string; texto: string; icono: NombreIcono }[] = [
  { id: "compras", titulo: "Comprás", texto: "Cada vez que comprás, sumás puntos.", icono: "bolsa" },
  { id: "sumas", titulo: "Sumás puntos", texto: "Cada punto te da saldo.", icono: "moneda" },
  { id: "subis", titulo: "Subís de nivel", texto: "A medida que acumulás, subís de nivel.", icono: "subir" },
  { id: "ganas", titulo: "Ganás más puntos", texto: "En cada nivel sumás más rápido.", icono: "estrella" },
  { id: "canjeas", titulo: "Canjeás", texto: "Ese saldo es para tus próximas compras.", icono: "regalo" },
];

const PASOS_REGISTRO: { texto: string; icono: NombreIcono }[] = [
  { texto: "Entrá a la tienda de Giapura.", icono: "tienda" },
  { texto: "Registrate en GiaPlus con el mail y el teléfono de tu primera compra.", icono: "mail" },
  { texto: "Listo: tu cuenta queda en nivel Fundador, el más alto.", icono: "estrella" },
];

const ALTURAS = ["sm:min-h-[9rem]", "sm:min-h-[10.5rem]", "sm:min-h-[12rem]", "sm:min-h-[13.5rem]"];

/* Formatos deterministas (servidor y navegador dan el mismo texto). */
const miles = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const pesos = (n: number) => `$${miles(n)}`;
const porcentaje = (n: number) => String(n).replace(".", ",");

/* ---------- Íconos (SVG, sin emojis) ---------- */

type NombreIcono =
  | "bolsa"
  | "moneda"
  | "subir"
  | "estrella"
  | "regalo"
  | "instagram"
  | "amigos"
  | "usuario"
  | "tienda"
  | "mail"
  | "check";

function Icono({ nombre, className = "" }: { nombre: NombreIcono; className?: string }) {
  const trazo = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...trazo}>
      {nombre === "bolsa" && (
        <>
          <path d="M6 7.5h12l1 12.5H5l1-12.5Z" />
          <path d="M9 7.5V6.5a3 3 0 0 1 6 0v1" />
        </>
      )}
      {nombre === "moneda" && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 8v8M8 12h8" />
        </>
      )}
      {nombre === "subir" && (
        <>
          <path d="m6 13 6-6 6 6" />
          <path d="m6 19 6-6 6 6" />
        </>
      )}
      {nombre === "estrella" && (
        <path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8Z" />
      )}
      {nombre === "regalo" && (
        <>
          <rect x="4" y="10" width="16" height="10" rx="1.5" />
          <path d="M3 7.5h18V10H3zM12 7.5V20" />
          <path d="M12 7.5C10.5 4.5 7 4.5 7 6.7c0 1 1 .8 5 .8Zm0 0c1.5-3 5-3 5-.8 0 1-1 .8-5 .8Z" />
        </>
      )}
      {nombre === "instagram" && (
        <>
          <rect x="4" y="4" width="16" height="16" rx="4.5" />
          <circle cx="12" cy="12" r="3.6" />
          <circle cx="16.8" cy="7.2" r=".5" fill="currentColor" />
        </>
      )}
      {nombre === "amigos" && (
        <>
          <circle cx="9" cy="8.5" r="3.2" />
          <path d="M3.5 19c.5-3.2 2.8-5 5.5-5s5 1.8 5.5 5" />
          <circle cx="17" cy="9.5" r="2.4" />
          <path d="M16 14.2c2.4 0 4 1.5 4.5 4.3" />
        </>
      )}
      {nombre === "usuario" && (
        <>
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M5 20c.6-3.8 3.4-6 7-6s6.4 2.2 7 6" />
        </>
      )}
      {nombre === "tienda" && (
        <>
          <path d="M4 9.5 5.5 4h13L20 9.5" />
          <path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
          <path d="M5.5 12.5V20h13v-7.5" />
        </>
      )}
      {nombre === "mail" && (
        <>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </>
      )}
      {nombre === "check" && <path d="M20 6 9 17l-5-5" />}
    </svg>
  );
}

function Mani({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <g transform="rotate(35 12 12)">
        <path d="M12 2c-3 0-5 2.2-5 4.8 0 1.6.8 2.6 1.4 3.4.5.7.6 1.2.6 1.8s-.1 1.1-.6 1.8C7.8 14.6 7 15.6 7 17.2 7 19.8 9 22 12 22s5-2.2 5-4.8c0-1.6-.8-2.6-1.4-3.4-.5-.7-.6-1.2-.6-1.8s.1-1.1.6-1.8C16.2 9.4 17 8.4 17 6.8 17 4.2 15 2 12 2Z" />
      </g>
    </svg>
  );
}

/* ---------- Piezas de movimiento ---------- */

function Aparece({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* Número que cuenta hacia el nuevo valor (sin saltos bruscos al mover el slider). */
function Numero({ valor, formato }: { valor: number; formato: (n: number) => string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(valor);
  const texto = useTransform(mv, (v) => formato(v));

  useEffect(() => {
    if (reduce) {
      mv.set(valor);
      return;
    }
    const controles = animate(mv, valor, { duration: 0.6, ease: EASE });
    return () => controles.stop();
  }, [valor, reduce, mv]);

  return <motion.span>{texto}</motion.span>;
}

/* ---------- Cabecera: la moneda ---------- */

function Moneda() {
  const reduce = useReducedMotion();
  const [vuelta, setVuelta] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={reduce ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ perspective: 900 }}
      >
        <motion.button
          type="button"
          onClick={() => setVuelta((v) => !v)}
          aria-pressed={vuelta}
          aria-label={
            vuelta
              ? "Diez pesos de saldo. Tocá para volver al punto."
              : "Un punto. Tocá para ver cuánto vale en pesos."
          }
          animate={{ rotateY: vuelta ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 110, damping: 13 }}
          whileHover={reduce ? undefined : { scale: 1.05 }}
          whileTap={reduce ? undefined : { scale: 0.94 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative block h-36 w-36 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-gold-bright focus-visible:ring-offset-4 focus-visible:ring-offset-btn"
        >
          <span
            className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#fff3cf,#f5cf89_45%,#d6a04c)] text-dark shadow-[0_18px_50px_-14px_rgba(0,0,0,0.7)] [backface-visibility:hidden]"
          >
            <span aria-hidden="true" className="absolute inset-2 rounded-full border-2 border-dark/20" />
            <span className="font-display text-6xl leading-none">1</span>
            <span className="mt-1 text-[0.7rem] font-bold uppercase tracking-[0.28em]">punto</span>
          </span>
          <span
            className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#fff3cf,#f5cf89_45%,#d6a04c)] text-dark shadow-[0_18px_50px_-14px_rgba(0,0,0,0.7)] [backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)" }}
          >
            <span aria-hidden="true" className="absolute inset-2 rounded-full border-2 border-dark/20" />
            <span className="font-display text-5xl leading-none">$10</span>
            <span className="mt-1 text-[0.7rem] font-bold uppercase tracking-[0.28em]">de saldo</span>
          </span>
        </motion.button>
      </motion.div>
      <p className="mt-6 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-paper/70">
        Tocá la moneda
      </p>
    </div>
  );
}

/* ---------- El ciclo ---------- */

function Ciclo() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.5 });
  const [activo, setActivo] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (reduce || manual || !visible) return;
    const t = setInterval(() => setActivo((a) => (a + 1) % CICLO.length), 2600);
    return () => clearInterval(t);
  }, [reduce, manual, visible]);

  const paso = CICLO[activo];

  return (
    <div ref={ref}>
      <p className="text-center text-[0.7rem] font-medium uppercase tracking-[0.28em] text-gold-bright">
        Así funciona
      </p>
      <h3 className="font-display mt-4 text-center text-[1.7rem] leading-tight text-balance sm:text-[2.1rem]">
        Un ciclo que se alimenta solo.
      </h3>

      <div className="relative mx-auto mt-10 aspect-square w-[min(21rem,100%)]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-gold-bright" aria-hidden="true">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.6" strokeDasharray="1.2 2.2" />
          <g transform="rotate(-90 50 50)">
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: activo / CICLO.length }}
              transition={reduce ? { duration: 0 } : { duration: 0.8, ease: EASE }}
            />
          </g>
        </svg>

        {CICLO.map((c, i) => {
          const angulo = ((-90 + i * (360 / CICLO.length)) * Math.PI) / 180;
          const on = i === activo;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              aria-label={`${i + 1}. ${c.titulo}`}
              onClick={() => {
                setActivo(i);
                setManual(true);
              }}
              style={{ left: `${50 + 40 * Math.cos(angulo)}%`, top: `${50 + 40 * Math.sin(angulo)}%` }}
              className={`absolute flex h-[3.25rem] w-[3.25rem] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border outline-none transition-[background-color,border-color,color,transform,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-gold-bright focus-visible:ring-offset-2 focus-visible:ring-offset-btn ${
                on
                  ? "scale-110 border-gold-bright bg-gold-bright text-dark shadow-[0_0_34px_-4px_rgba(245,207,137,0.65)]"
                  : "border-paper/25 bg-dark text-paper hover:border-gold-bright/60"
              }`}
            >
              <Icono nombre={c.icono} className="h-6 w-6" />
            </button>
          );
        })}

        <div
          className="absolute inset-[22%] flex items-center justify-center text-center"
          aria-live={manual ? "polite" : "off"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={paso.id}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
            >
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-paper/65">
                Paso {activo + 1} de {CICLO.length}
              </p>
              <p className="font-display mt-1.5 text-[1.35rem] leading-tight text-gold-bright">{paso.titulo}</p>
              <p className="mt-1.5 text-[0.82rem] leading-snug text-paper/80">{paso.texto}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ---------- Constructor ---------- */

function TituloPaso({ numero, titulo }: { numero: string; titulo: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span
        aria-hidden="true"
        className="font-display flex h-9 w-9 items-center justify-center rounded-full border border-gold-bright/60 text-lg text-gold-bright"
      >
        {numero}
      </span>
      <h4 className="font-display text-[1.4rem] leading-tight sm:text-2xl">{titulo}</h4>
    </div>
  );
}

function Niveles({ nivel, onChange }: { nivel: number; onChange: (n: number) => void }) {
  const reduce = useReducedMotion();
  const actual = NIVELES[nivel];
  const pct = (actual.puntos * VALOR_PUNTO) / (BLOQUE_COMPRA / 100);

  return (
    <div>
      <div role="group" aria-label="Elegí tu nivel" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:items-end">
        {NIVELES.map((n, i) => {
          const on = nivel === i;
          return (
            <button
              key={n.nombre}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(i)}
              className={`relative isolate flex min-h-[9.75rem] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-gold-bright focus-visible:ring-offset-2 focus-visible:ring-offset-btn ${ALTURAS[i]} ${
                on ? "border-gold-bright text-dark" : "border-paper/15 bg-dark/35 text-paper hover:border-paper/40"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="giaplus-nivel"
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-gold-bright"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <span className="flex flex-wrap items-start justify-between gap-x-2 gap-y-2">
                <span className="flex gap-0.5" aria-hidden="true">
                  {Array.from({ length: n.mani }).map((_, p) => (
                    <Mani key={p} className={`h-[1.15rem] w-[1.15rem] ${on ? "text-gold" : "text-gold-bright"}`} />
                  ))}
                </span>
                {i === NIVEL_FUNDADOR && (
                  <span
                    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] ${
                      on ? "border-dark/35 text-dark" : "border-gold-bright/50 text-gold-bright"
                    }`}
                  >
                    <Icono nombre="estrella" className="h-2.5 w-2.5" />
                    Tu nivel
                  </span>
                )}
              </span>
              <span>
                <span className="font-display block text-[1.35rem] leading-tight">{n.nombre}</span>
                <span className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-display text-[2rem] leading-none">+{n.puntos}</span>
                  <span className={`text-[0.72rem] leading-tight ${on ? "text-dark/80" : "text-paper/70"}`}>
                    pts cada $10.000
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={nivel}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.24 }}
          className="mt-5 text-center text-[1.02rem] leading-relaxed text-paper/85 sm:text-left"
        >
          <strong className="font-medium text-gold-bright">{actual.nombre}.</strong> {actual.frase}{" "}
          {nivel === NIVEL_FUNDADOR
            ? "Tu cuenta queda acá apenas te registrás."
            : "Llegás sumando puntos."}{" "}
          De lo que comprás, te vuelve el{" "}
          <strong className="font-medium text-gold-bright">{porcentaje(pct)}%</strong>.
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function Compra({
  bloques,
  onChange,
  puntosPorBloque,
}: {
  bloques: number;
  onChange: (n: number) => void;
  puntosPorBloque: number;
}) {
  const id = useId();
  const progreso = ((bloques - 1) / 9) * 100;

  return (
    <div className="rounded-2xl border border-paper/12 bg-dark/30 p-5 sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <label htmlFor={id} className="text-[0.95rem] text-paper/85">
          Si gastás
        </label>
        <span className="font-display text-[2.4rem] leading-none text-gold-bright sm:text-5xl">
          <Numero valor={bloques * BLOQUE_COMPRA} formato={pesos} />
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={1}
        max={10}
        step={1}
        value={bloques}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${miles(bloques * BLOQUE_COMPRA)} pesos`}
        className="giaplus-range mt-3"
        style={{ "--progreso": `${progreso}%` } as React.CSSProperties}
      />
      <div className="mt-1 flex justify-between text-xs text-paper/65">
        <span>$10.000</span>
        <span>$100.000</span>
      </div>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-paper/85">
        Cada $10.000 suman {puntosPorBloque} puntos:{" "}
        <strong className="font-medium text-gold-bright">
          {bloques} × {puntosPorBloque} = {miles(bloques * puntosPorBloque)} puntos
        </strong>
        , o sea {pesos(bloques * puntosPorBloque * VALOR_PUNTO)} de saldo para tu próxima compra.
      </p>
    </div>
  );
}

const LISTA = { oculto: {}, visible: { transition: { staggerChildren: 0.06 } } };
const ITEM = {
  oculto: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

function Tarjeta({
  accion,
  activa,
  onToggle,
}: {
  accion: Accion;
  activa: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();
  const [rafaga, setRafaga] = useState(0);

  if (accion.paraOtro) {
    return (
      <motion.div
        variants={ITEM}
        className="flex min-h-[4.25rem] items-center gap-3 rounded-2xl border border-dashed border-paper/25 px-4 py-3"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-paper/20 text-paper/70">
          <Icono nombre={accion.icono} className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-[0.95rem] leading-snug text-paper/80">{accion.texto}</span>
          <span className="mt-0.5 block text-[0.65rem] font-bold uppercase tracking-[0.18em] text-paper/60">
            Puntos para tu amigo
          </span>
        </span>
        <span className="font-display ml-auto shrink-0 text-xl text-paper/65">+{accion.puntos}</span>
      </motion.div>
    );
  }

  return (
    <motion.div variants={ITEM} className="relative">
      <button
        type="button"
        aria-pressed={activa}
        onClick={() => {
          if (!activa && !reduce) setRafaga((r) => r + 1);
          onToggle();
        }}
        className={`flex min-h-[4.25rem] w-full cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left outline-none transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-gold-bright focus-visible:ring-offset-2 focus-visible:ring-offset-btn motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
          activa
            ? "border-gold-bright bg-gold-bright/15"
            : "border-paper/15 bg-dark/35 hover:border-paper/40"
        }`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
            activa ? "border-gold-bright bg-gold-bright text-dark" : "border-paper/25 text-paper/80"
          }`}
        >
          <Icono nombre={activa ? "check" : accion.icono} className="h-5 w-5" />
        </span>
        <span className="min-w-0 text-[0.95rem] leading-snug">{accion.texto}</span>
        <span
          className={`font-display ml-auto shrink-0 text-2xl transition-colors duration-200 ${
            activa ? "text-gold-bright" : "text-paper/85"
          }`}
        >
          +{accion.puntos}
        </span>
      </button>
      <AnimatePresence>
        {rafaga > 0 && (
          <motion.span
            key={rafaga}
            aria-hidden="true"
            initial={{ opacity: 1, y: 0, scale: 0.9 }}
            animate={{ opacity: 0, y: -38, scale: 1.2 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            onAnimationComplete={() => setRafaga(0)}
            className="font-display pointer-events-none absolute right-4 top-1 text-2xl text-gold-bright"
          >
            +{accion.puntos}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Extras({
  seleccion,
  extras,
  onToggle,
  onReset,
}: {
  seleccion: string[];
  extras: number;
  onToggle: (id: string) => void;
  onReset: () => void;
}) {
  const reduce = useReducedMotion();
  const [categoria, setCategoria] = useState(0);
  const actual = CATEGORIAS[categoria];

  return (
    <div>
      <div role="group" aria-label="Tipos de acciones" className="flex flex-wrap gap-2">
        {CATEGORIAS.map((c, i) => {
          const on = categoria === i;
          const cantidad = c.acciones.filter((a) => seleccion.includes(a.id)).length;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => setCategoria(i)}
              className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-[0.92rem] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-gold-bright focus-visible:ring-offset-2 focus-visible:ring-offset-btn ${
                on
                  ? "border-gold-bright bg-gold-bright text-dark"
                  : "border-paper/25 text-paper hover:border-paper/50"
              }`}
            >
              <Icono nombre={c.icono} className="h-4 w-4" />
              {c.nombre}
              {cantidad > 0 && (
                <span
                  className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.7rem] font-bold ${
                    on ? "bg-dark text-gold-bright" : "bg-gold-bright text-dark"
                  }`}
                >
                  {cantidad}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <motion.div
        key={actual.id}
        variants={LISTA}
        initial={reduce ? false : "oculto"}
        animate="visible"
        className="mt-5 grid gap-3 sm:grid-cols-2"
      >
        {actual.acciones.map((a) => (
          <Tarjeta key={a.id} accion={a} activa={seleccion.includes(a.id)} onToggle={() => onToggle(a.id)} />
        ))}
      </motion.div>
      <div className="mt-4 flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
        <p aria-live="polite" className="text-paper/75">
          {seleccion.length > 0 ? (
            <>
              Lo que marcaste suma{" "}
              <strong className="font-medium text-gold-bright">+{miles(extras)} puntos</strong>, o sea{" "}
              {pesos(extras * VALOR_PUNTO)} de saldo.
            </>
          ) : (
            "Tocá las que hacés y mirá cuántos puntos sumás."
          )}
        </p>
        {seleccion.length > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 cursor-pointer items-center text-paper/70 underline underline-offset-4 outline-none hover:text-paper focus-visible:ring-2 focus-visible:ring-gold-bright"
          >
            Empezar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Registro ---------- */

function Registro({ cta }: { cta: ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-gold-bright/35 bg-dark p-6 sm:p-10">
      <h3 className="font-display text-center text-[1.8rem] leading-tight text-gold-bright sm:text-4xl">
        Vos ya sos Fundador.
      </h3>
      <p className="mx-auto mt-3 max-w-[44ch] text-center leading-relaxed text-paper/85">
        Activá tu GiaPlus en tres pasos.
      </p>
      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {PASOS_REGISTRO.map((p, i) => (
          <li
            key={p.icono}
            className="group rounded-2xl border border-paper/12 bg-paper/[0.04] p-5 text-center transition-transform duration-200 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold-bright/50 text-gold-bright transition-colors duration-200 group-hover:bg-gold-bright group-hover:text-dark">
              <Icono nombre={p.icono} className="h-6 w-6" />
            </span>
            <span className="font-display mt-4 block text-sm text-gold-bright">Paso {i + 1}</span>
            <span className="mt-1.5 block text-[0.95rem] leading-snug text-paper/90">{p.texto}</span>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex justify-center">{cta}</div>
    </div>
  );
}

/* ---------- Sección ---------- */

export function GiaPlusSection({ cta }: { cta: ReactNode }) {
  const [nivel, setNivel] = useState(NIVEL_FUNDADOR);
  const [bloques, setBloques] = useState(2);
  const [seleccion, setSeleccion] = useState<string[]>([]);

  const extras = CATEGORIAS.flatMap((c) => c.acciones)
    .filter((a) => !a.paraOtro && seleccion.includes(a.id))
    .reduce((suma, a) => suma + a.puntos, 0);

  function alternar(id: string) {
    setSeleccion((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mx-auto max-w-3xl text-center">
        <Aparece>
          <h2 className="mx-auto w-[min(17rem,72%)]">
            <span className="sr-only">GiaPlus</span>
            <span aria-hidden="true" className="logo-giaplus block aspect-[2000/692] w-full bg-gold-bright" />
          </h2>
        </Aparece>
        <p className="font-display mt-7 text-[1.7rem] leading-tight text-balance sm:text-[2.3rem]">
          Lo que comprás, te vuelve.
        </p>
        <p className="mx-auto mt-5 max-w-[50ch] text-[1.05rem] leading-relaxed text-paper/85">
          Cada compra te suma puntos y cada punto es saldo para la próxima. Con 100 puntos tenés $1.000 para usar.
        </p>
        <div className="mt-10">
          <Moneda />
        </div>
      </header>

      <Aparece className="mt-24">
        <Ciclo />
      </Aparece>

      <div className="mt-28">
        <Aparece className="mx-auto max-w-2xl text-center">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-gold-bright">Probalo</p>
          <h3 className="font-display mt-4 text-[1.9rem] leading-tight text-balance sm:text-[2.5rem]">
            Armá tu GiaPlus.
          </h3>
          <p className="mt-4 leading-relaxed text-paper/80">
            Elegí tu nivel, cuánto comprás y qué más hacés. Mirá cuánto te vuelve.
          </p>
        </Aparece>

        <div className="mx-auto mt-14 max-w-3xl space-y-14">
          <section aria-label="Tu nivel">
            <TituloPaso numero="1" titulo="Elegí tu nivel" />
            <Niveles nivel={nivel} onChange={setNivel} />
          </section>
          <section aria-label="Cuánto comprás">
            <TituloPaso numero="2" titulo="Cuánto comprás" />
            <Compra bloques={bloques} onChange={setBloques} puntosPorBloque={NIVELES[nivel].puntos} />
          </section>
          <section aria-label="Sumá más rápido">
            <TituloPaso numero="3" titulo="Sumá más rápido" />
            <Extras seleccion={seleccion} extras={extras} onToggle={alternar} onReset={() => setSeleccion([])} />
          </section>
        </div>
      </div>

      <Aparece className="mt-28">
        <Registro cta={cta} />
      </Aparece>
    </div>
  );
}
