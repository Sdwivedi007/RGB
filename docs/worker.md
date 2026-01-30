# Raster Worker Notes

## Responsibilities
- Convert uploaded ortho to COG
- Compute AOI statistics for selected indices
- Generate index rasters (COG) for tiles
- Produce export assets (PNG, CSV, GeoJSON, PDF)

## Suggested Pipeline
1. **Ingest**: validate bands, nodata, EPSG
2. **Clip**: mask ortho by AOI geometry
3. **Compute**: apply registry formula per index
4. **Summarize**: min/mean/max/std + hist bins
5. **Persist**: store rasters to MinIO + metadata in DB

## Tools
- rasterio + numpy + shapely
- pandas for CSV output
- reportlab/weasyprint for PDF

