# RGB — Web-based Analytical GIS Platform

This repository is a **starter blueprint** for a multispectral GIS analytics platform for sports ground monitoring. It provides a clean monorepo layout, architecture decisions, API contract, and execution plan aligned to your requirements.

## Highlights
- **Home map** with all client grounds (MapLibre + PostGIS)
- **Ground analytics** page with multispectral ortho, AOI drawing, 17+ indices, and analytics
- **Compare/overlay** any two layers (opacity, swipe, split)
- **Measure tools**: point/line/polygon/circle + distance/area/angle
- **Exports**: PDF/CSV/GeoJSON/PNG
- **3D viewer**: Potree integration for pointclouds

## Monorepo Structure
```
apps/web           # React + TypeScript client
apps/api           # FastAPI REST API
apps/raster-worker # Raster analysis worker (rasterio/numpy)
apps/tile-server   # TiTiler COG tiles
infra/nginx        # Reverse proxy
docs               # Architecture, API, indices registry
```

> 📌 Start with the **docs** folder for implementation details.

## Quick Start (High-level)
1. Configure PostGIS + Redis + MinIO.
2. Launch API, worker, and tile server.
3. Run the web client with MapLibre + drawing tools.
4. Validate full flow: upload ortho → draw AOI → compute indices → export results.

## Demo Status
This repository now includes a **front-end demo** under `apps/web` plus a **mock backend API** under `apps/api` for login, grounds, and analysis flows. The raster worker, tile server, and production data pipelines still need full implementation.【F:README.md†L25-L29】

### Run the Demo (Front-end Only)
```bash
cd apps/web
python3 -m http.server 8080
```
Then open http://localhost:8080 in your browser.【F:README.md†L25-L35】

### Run the Demo API (Mock Backend)
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Login with `demo / demo` from the login page.【F:README.md†L25-L45】

---

## Next Steps
- Use the detailed specs in `/docs/` to implement your MVP.
- Expand to advanced reporting and automated alerts per client.
