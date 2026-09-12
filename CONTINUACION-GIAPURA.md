# Continuación — Proyecto Giapura · Club Fundadores

Documento para retomar el trabajo en **otra computadora**. Leélo (o pasáselo a Claude Code)
en la sesión nueva.

---

## 1. Qué estamos construyendo

Marca de pasta de maní **Giapura**. Hay **3 proyectos** (todos Next.js 16 + Tailwind v4,
deploy en Vercel con cada `git push`):

| Proyecto | Repo GitHub | URL en producción | Carpeta (compu vieja) |
|---|---|---|---|
| **giapura-erp** | `fleonardi2008-debug/giapura-erp` | `https://giapura-erp.vercel.app` | `D:\Users\Usuario\Downloads\CLAUDE GIAPURA` |
| **giapura-club** | `fleonardi2008-debug/giapura-club` | `https://club.giapura.com.ar` (dominio) · `giapura-club.vercel.app` | `D:\Users\Usuario\Downloads\giapura-club` |
| **giapura-landing** | `fleonardi2008-debug/giapura-landing` | `https://giapura-landing.vercel.app` | `D:\Users\Usuario\Downloads\giapura-landing` |

- **giapura-erp**: backoffice (ERP). Tiene además Prisma + PostgreSQL en **Neon** + login (Auth.js).
  Incluye el módulo **Club Fundadores** (mini-CMS del club).
- **giapura-club**: la página premium a la que llega el consumidor por **QR**. No tiene base
  propia: lee el contenido del ERP y postea los mails de "novedades" al ERP.
- **giapura-landing**: landing de lanzamiento (evento 24h).

---

## 2. Cómo levantar el entorno en la compu nueva

1. Instalar **Node.js LTS**, **Git** y **Claude Code**.
2. Clonar los 3 repos:
   ```bash
   git clone https://github.com/fleonardi2008-debug/giapura-erp.git
   git clone https://github.com/fleonardi2008-debug/giapura-club.git
   git clone https://github.com/fleonardi2008-debug/giapura-landing.git
   ```
3. En cada carpeta: `npm install`
4. **Archivos de entorno (NO están en git — hay que copiarlos aparte):**
   - **giapura-erp** → `.env` y `.env.local`. Son los **secretos importantes**:
     `DATABASE_URL` (Neon), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `TIENDANUBE_CLIENT_ID`,
     `TIENDANUBE_CLIENT_SECRET`, `TIENDANUBE_TOKEN_ENCRYPTION_KEY`, `CRON_SECRET`,
     `PREVENTA_SKU_CODIGO`, `PREVENTA_OBJETIVO`, `PREVENTA_INICIO`, `PREVENTA_FIN`.
     👉 Copialos por USB/nube desde la compu vieja, **o** recuperá los valores desde
     **Vercel → giapura-erp → Settings → Environment Variables** y armá el `.env` a mano.
   - **giapura-club** → `.env.local` (no es secreto, lo recreás así):
     ```
     ERP_URL=http://localhost:3000
     NEXT_PUBLIC_ERP_URL=http://localhost:3000
     ```
   - **giapura-landing** → revisá si tiene un `.env` con variables `NEXT_PUBLIC_*` y copialo igual.
5. En el ERP: `npx prisma generate` (genera el cliente Prisma).
6. Correr en dev (puertos): ERP `npm run dev` → 3000 · club `npm run dev -- --port 3002` ·
   landing → 3001.

> Nota: cambiar de compu **no afecta** producción ni los dominios (eso vive en Vercel/GitHub/Neon).
> El QR sigue apuntando a `https://club.giapura.com.ar`.

---

## 3. ⚠️ PENDIENTE #1 — lo que quedó trabado (empezar por acá)

El último commit del club **`9e7b549`** ("copy final aprobado + negrita") **NO se ve en
producción**. `club.giapura.com.ar` sigue mostrando el código anterior:
- Los `**` aparecen **literales** (sin negrita).
- Falta el título de sección **"No te pierdas lo que viene."** y el botón
  **"Avisame cuando haya algo nuevo"**.

Datos del diagnóstico:
- El build **local pasa sin errores** (`npm run build` OK en giapura-club).
- El commit **está pusheado** a `origin/main`.
- Conclusión: el deploy en **Vercel** de ese commit falló o quedó trabado.

**Acción para resolver:**
1. Vercel → proyecto **giapura-club** → pestaña **Deployments**.
2. Mirar el deploy de más arriba (mensaje "copy final aprobado + negrita en textos").
3. Si dice **Error/Failed** → abrir **Build Logs** y ver la causa. Si dice **Ready** pero igual
   no se ve, hay caché/otra cosa: probar **Redeploy**.
4. Si hace falta, **Redeploy** desde Vercel o pushear un commit nuevo para re-disparar.

> El copy que viene de la **base** (título "¿Qué significa ser Fundador?", textos, footer) YA se
> ve, porque lo sirve el ERP. Lo que falta es solo lo que viene del **código** del club
> (la negrita, el título de novedades y el texto del botón).

---

## 4. Pendientes #2 (contenido / opcional)

- **Cargar contenido real** desde `giapura-erp.vercel.app → Club Fundadores`:
  - Video de bienvenida: subirlo a YouTube como **"No listado"** y pegar el link en el campo del Hero.
  - Bloque de descuento (tipo *Descuento*) con el campo **Código** (ej. `FUNDADOR15`).
  - Historial de hitos.
- **(Opcional, ya decidido) Apuntar la raíz `giapura.com.ar` a la landing:**
  - Vercel → proyecto **giapura-landing** → Domains → agregar `giapura.com.ar` (y `www`).
  - Don Web → zona DNS de giapura.com.ar → agregar **A** con Nombre `@` → `76.76.21.21`.
  - (El club queda igual; la raíz es independiente y cambiable cuando quieras.)

---

## 5. Decisiones ya tomadas (para no re-preguntar)

- **Sin número de Fundador** en ningún lado.
- El **"CRM" es el propio ERP** (tabla `Fundador`, con export CSV desde el backoffice).
- **Voz del copy:** Fran en primera persona, foco en **exclusividad**, minimal, **sin** historia de origen.
- **Tipografías:** Clash Display + General Sans (Fontshare), iguales a la landing.
- **Contenido editable sin código** desde el ERP (mini-CMS guardado en Neon). La URL del QR nunca cambia.
- **Copy final aprobado** ya cargado (en el código del club y en la config de la base).
- **Dominio del club:** `club.giapura.com.ar`, conectado vía registro **A → 76.76.21.21** en Don Web (SSL OK).

## 6. Cosas físicas en la compu vieja (llevar si querés)

- **QR listos para imprimir** (en `Descargas`): `QR-club-giapura.svg` (mejor para imprenta),
  `QR-club-giapura.png`, `QR-club-giapura-ByN.png`. Apuntan a `https://club.giapura.com.ar`.
  (Si los perdés, se regeneran en segundos.)

---

## 7. Mensaje para pegar en la sesión NUEVA de Claude Code

> Abrí Claude Code en la carpeta del proyecto (idealmente `giapura-club` o el ERP) y pegá esto:

```
Estoy continuando el proyecto "Giapura · Club Fundadores" desde otra computadora.
Leé el archivo CONTINUACION-GIAPURA.md para el contexto completo.

Resumen: son 3 proyectos Next.js (giapura-erp, giapura-club, giapura-landing) que
deployan en Vercel. La página del club vive en https://club.giapura.com.ar y lee el
contenido del ERP (backoffice). El copy y el diseño ya están aprobados.

Lo que quedó PENDIENTE y por lo que hay que empezar: el deploy del commit 9e7b549 del
proyecto giapura-club NO se ve en producción (el build local pasa OK y está pusheado,
pero club.giapura.com.ar sigue mostrando el código anterior: los ** salen literales,
falta el título "No te pierdas lo que viene." y el botón "Avisame cuando haya algo
nuevo"). Ayudame a diagnosticar por qué Vercel no lo deployó y a resolverlo.
```
