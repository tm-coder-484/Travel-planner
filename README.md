# Travel Planner

A fully client-side travel planning app. No backend, no build step — just open `index.html`.

**Live demo:** `https://<your-username>.github.io/<your-repo>/`

## Features

- **Multi-trip dashboard** — create and manage multiple trips, data saved in localStorage
- **Day-by-day itinerary** — schedule activities by time and category
- **Flights & Hotels** — store booking details and confirmation codes
- **Route Map** — search destinations, drop numbered pins, see your route

## Deploy to GitHub Pages

1. Create a new GitHub repo
2. Push this folder to the `main` branch
3. Go to **Settings → Pages**
4. Set source to `Deploy from a branch` → `main` → `/ (root)`
5. Your site will be live at `https://<username>.github.io/<repo>/`

## Files

```
index.html          — main app shell
tp-components.jsx   — shared UI components (buttons, modals, inputs)
tp-itinerary.jsx    — itinerary tab (day/activity builder)
tp-flights.jsx      — flights & hotels tab
tp-map.jsx          — route map tab (Leaflet + CARTO tiles)
.nojekyll           — disables Jekyll so GitHub Pages serves files as-is
```

## Notes

- All data is stored in `localStorage` — no server needed
- The map uses [Leaflet](https://leafletjs.com) + [CARTO tiles](https://carto.com/basemaps/) (free, no API key)
- Geocoding uses [Nominatim](https://nominatim.openstreetmap.org/) (free, no API key)
- JSX is transpiled in-browser via [Babel Standalone](https://babeljs.io/docs/babel-standalone)
