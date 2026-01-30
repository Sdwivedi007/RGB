# API Contract (Minimal Required)

## Auth
- `POST /auth/login`
- `GET /me`

## Clients/Grounds
- `POST /clients`
- `GET /clients`
- `POST /clients/{clientId}/grounds`
- `GET /clients/{clientId}/grounds`
- `GET /grounds/{groundId}`

## Ortho
- `POST /grounds/{groundId}/ortho/upload-url`
- `POST /grounds/{groundId}/ortho/ingest`
- `GET /ortho/{orthoAssetId}`

## Tiles
- `GET /tiles/ortho/{groundId}/{z}/{x}/{y}.png`
- `GET /tiles/index/{groundId}/{indexName}/{z}/{x}/{y}.png`

## AOI/Analysis
- `POST /grounds/{groundId}/aois`
- `GET /grounds/{groundId}/aois`
- `POST /grounds/{groundId}/analyze`
- `GET /analyses/{analysisId}`

## Exports
- `POST /analyses/{analysisId}/exports`
- `GET /exports/{exportId}`

## Pointcloud/Potree
- `POST /grounds/{groundId}/pointcloud/upload-url`
- `POST /grounds/{groundId}/pointcloud/convert`
- `GET /grounds/{groundId}/pointcloud`

