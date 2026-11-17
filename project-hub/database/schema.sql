CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title varchar(100) NOT NULL,
  slug varchar(80) NOT NULL UNIQUE,
  category varchar(100) NOT NULL,
  description varchar(280) NOT NULL,
  long_description text NOT NULL DEFAULT '',
  tech text[] NOT NULL DEFAULT ARRAY[]::text[],
  repository_url text NOT NULL DEFAULT '',
  live_url text NOT NULL DEFAULT '',
  demo_url text NOT NULL DEFAULT '',
  documentation_url text NOT NULL DEFAULT '',
  presentation_url text NOT NULL DEFAULT '',
  media_urls text[] NOT NULL DEFAULT ARRAY[]::text[],
  thumbnail_url text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  status varchar(12) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order integer NOT NULL DEFAULT 0,
  accent varchar(16) NOT NULL DEFAULT 'citrus' CHECK (accent IN ('citrus', 'violet', 'coral', 'blue', 'lavender', 'amber', 'mint')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_public_order_idx
  ON projects (status, sort_order, featured DESC, updated_at DESC);

CREATE TABLE IF NOT EXISTS admin_login_limits (
  address_hash char(64) PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0,
  blocked_until timestamptz
);
