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
This repository currently contains **blueprint documentation only** (no runnable app yet). Once the web/API/worker apps are implemented under `apps/`, you can run the demo locally by following the Quick Start steps above and wiring the services with Docker Compose or your preferred stack.【F:README.md†L25-L29】

---

## Next Steps
- Use the detailed specs in `/docs/` to implement your MVP.
- Expand to advanced reporting and automated alerts per client.
