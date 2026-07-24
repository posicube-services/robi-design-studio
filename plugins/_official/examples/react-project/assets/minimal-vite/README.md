# react-project-minimal

A curated, buildable **Vite + React + MUI** seed derived from the MUI "minimal"
template. It keeps minimal's full theme, the dashboard + auth layouts, and a
useful curated set of components, while excluding the heavy niche feature areas
(maps, rich-text editor, lightbox, org chart, fullcalendar, carousel, pdf) and
all backend SDKs (firebase, amplify, supabase, auth0).

## Getting started

```bash
npm install
npm run dev      # start the Vite dev server
npm run build    # tsc --noEmit && vite build  -> dist/
npm run preview  # preview the production build
```

## Notes

- Imports use `src/...` absolute paths (`baseUrl: "."`), resolved in Vite via a
  `src` alias in `vite.config.ts`.
- The framework router has been re-implemented on top of `react-router-dom` v6
  in `src/routes/` (Link + `useParams` / `usePathname` / `useRouter` /
  `useSearchParams`).
- `src/styles/tokens.css` is an additive, neutral token file where the Open
  Design design system tokens are pasted later. It does not override the MUI
  theme.
- A few runtime assets (navbar SVG icons, workspace/avatar images) are loaded
  from `CONFIG.assetsDir`; drop them under `public/assets/...` or point
  `assetsDir` at a CDN if you want them rendered.
