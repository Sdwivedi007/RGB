# Architecture

## Goals
- Scalable multispectral analytics for sports grounds.
- Async AOI analysis with exportable reports.
- 2D + 3D visualization and comparison tools.

## Recommended Stack
- **Frontend:** React + TypeScript, MapLibre GL, Turf.js, Tailwind
- **Backend:** FastAPI (Python), PostGIS, Redis queue
- **Raster worker:** rasterio, numpy, shapely, expression engine for indices
- **Tiles:** TiTiler (COG → tiles)
- **Storage:** S3/MinIO (COGs, exports, potree output)
- **3D:** PotreeConverter + Potree viewer
- **Deploy:** Docker Compose + Nginx reverse proxy

## Data Flow (High Level)
1. **Upload Ortho/Pointcloud** → stored in MinIO/S3
2. **Ingest** → COG conversion + metadata stored in PostGIS
3. **Tiles** → TiTiler serves COG tiles
4. **AOI Draw** → polygon submitted to API
5. **Analysis** → worker computes indices → results stored + raster outputs
6. **Compare** → client overlays two tilesets (opacity/swipe)
7. **Export** → report generation (PDF/CSV/GeoJSON/PNG)
8. **3D View** → Potree viewer loads converted pointcloud

## Scaling Notes
- Use Redis/RQ or Celery for async tasks.
- Store all raster outputs as COGs with overviews.
- Cache tiles behind Nginx CDN rules.
- Keep indices registry JSON-driven for extensibility.

