# giapura-club — Club Fundadores

Página pública premium a la que llega el consumidor final que compró la **edición
Fundador**, escaneando el **QR** (que apunta siempre a la misma URL). El contenido se
edita desde el **ERP** (backoffice) sin tocar código y sin que cambie nunca la URL del QR.

## Cómo funciona

- Esta página **no tiene base de datos propia**. Lee el contenido del ERP:
  - `GET  {ERP_URL}/api/public/club-contenido` → hero, intro, footer, bloques e historial.
  - `POST {ERP_URL}/api/public/club-novedades` → guarda el mail de "Activar novedades"
    en la lista **Fundadores** del ERP.
- Todo se edita en el ERP → **Club Fundadores** (menú lateral).
- La página se sirve fresca en cada visita (`no-store`), así los cambios se ven al instante.

## Variables de entorno

| Variable | Para qué | Ejemplo |
|---|---|---|
| `ERP_URL` | Desde dónde lee el contenido (lado servidor) | `https://giapura-erp.vercel.app` |
| `NEXT_PUBLIC_ERP_URL` | A dónde manda el mail el formulario (lado navegador) | `https://giapura-erp.vercel.app` |

En local, `.env.local` ya apunta a `http://localhost:3000` (el ERP corriendo local).

## Desarrollo local

1. Levantá el **ERP** en el puerto 3000 (`npm run dev` en su carpeta).
2. Acá: `npm install` y `npm run dev -- --port 3002`.
3. Abrí `http://localhost:3002`.

## Deploy (Vercel)

1. Subí este proyecto a un repo de GitHub (ej. `giapura-club`) e importalo en Vercel
   (mismo flujo que `giapura-erp` y `giapura-landing`).
2. En Vercel → Environment Variables, cargá `ERP_URL` y `NEXT_PUBLIC_ERP_URL` apuntando
   a `https://giapura-erp.vercel.app`.
3. Deploy. Queda en `https://giapura-club.vercel.app`.

## Conectar el dominio y el QR (Don Web)

El QR se imprime **una sola vez** y apunta para siempre a la misma URL, así que el
dominio final tiene que estar definido **antes de imprimir**.

1. En **Vercel** (proyecto giapura-club) → Settings → Domains → agregá tu subdominio,
   ej. `club.giapura.com`.
2. En **Don Web** → DNS del dominio de Giapura → agregá el registro que te indica Vercel
   (normalmente un **CNAME** de `club` → `cname.vercel-dns.com`).
3. Esperá la propagación (minutos) y verificá en Vercel que el dominio quede "Valid".
4. Generá el **QR apuntando a `https://club.giapura.com`**. A partir de ahí, cualquier
   cambio de contenido se hace desde el ERP: **el QR no se vuelve a tocar nunca**.

> Importante: si más adelante querés cambiar el diseño, se cambia el código de este
> proyecto; el dominio y el QR siguen igual.
