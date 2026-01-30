CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN','CLIENT_ADMIN','ANALYST','VIEWER')),
  client_id UUID NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE grounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  boundary_geom GEOMETRY(POLYGON, 4326),
  centroid GEOMETRY(POINT, 4326),
  epsg INT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX grounds_client_id_idx ON grounds(client_id);
CREATE INDEX grounds_boundary_gix ON grounds USING GIST(boundary_geom);
CREATE INDEX grounds_centroid_gix ON grounds USING GIST(centroid);

CREATE TABLE ortho_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ground_id UUID NOT NULL REFERENCES grounds(id) ON DELETE CASCADE,
  original_path TEXT NOT NULL,
  cog_path TEXT,
  status TEXT NOT NULL DEFAULT 'UPLOADED' CHECK (status IN ('UPLOADED','COGIFYING','READY','FAILED')),
  epsg INT,
  bounds JSONB,
  pixel_size JSONB,
  band_count INT,
  band_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  nodata DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ortho_assets_ground_id_idx ON ortho_assets(ground_id);

CREATE TABLE pointcloud_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ground_id UUID NOT NULL REFERENCES grounds(id) ON DELETE CASCADE,
  original_path TEXT NOT NULL,
  potree_path TEXT,
  status TEXT NOT NULL DEFAULT 'UPLOADED' CHECK (status IN ('UPLOADED','CONVERTING','READY','FAILED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pointcloud_assets_ground_id_idx ON pointcloud_assets(ground_id);

CREATE TABLE aois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ground_id UUID NOT NULL REFERENCES grounds(id) ON DELETE CASCADE,
  name TEXT,
  geom GEOMETRY(POLYGON, 4326) NOT NULL,
  created_by UUID REFERENCES users(id),
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX aois_ground_id_idx ON aois(ground_id);
CREATE INDEX aois_geom_gix ON aois USING GIST(geom);

CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ground_id UUID NOT NULL REFERENCES grounds(id) ON DELETE CASCADE,
  aoi_id UUID REFERENCES aois(id) ON DELETE SET NULL,
  requested_indices TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED','RUNNING','DONE','FAILED')),
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  raster_outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
CREATE INDEX analyses_ground_id_idx ON analyses(ground_id);
CREATE INDEX analyses_aoi_id_idx ON analyses(aoi_id);
CREATE INDEX analyses_status_idx ON analyses(status);

CREATE TABLE exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('PDF','CSV','GEOJSON','PNG')),
  status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED','RUNNING','READY','FAILED')),
  file_path TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ready_at TIMESTAMPTZ
);
CREATE INDEX exports_analysis_id_idx ON exports(analysis_id);
CREATE INDEX exports_status_idx ON exports(status);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  client_id UUID REFERENCES clients(id),
  ground_id UUID REFERENCES grounds(id),
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_actor_idx ON audit_logs(actor_id);
CREATE INDEX audit_logs_action_idx ON audit_logs(action);
