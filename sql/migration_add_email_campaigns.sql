-- =====================================================
-- MODULO CAMPANAS DE EMAIL
-- =====================================================

-- 1) Plantillas de email
CREATE TABLE IF NOT EXISTS email_template (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) Campanas de email
CREATE TABLE IF NOT EXISTS email_campaign (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  template_id BIGINT NOT NULL REFERENCES email_template(id),
  filter_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  frequency TEXT NOT NULL CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly')),
  interval_count INTEGER NOT NULL DEFAULT 1 CHECK (interval_count > 0),
  next_run_at TIMESTAMPTZ NULL,
  last_run_at TIMESTAMPTZ NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Corridas de campana
CREATE TABLE IF NOT EXISTS email_campaign_run (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT NOT NULL REFERENCES email_campaign(id),
  scheduled_for TIMESTAMPTZ NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  total_recipients INTEGER NOT NULL DEFAULT 0,
  total_sent INTEGER NOT NULL DEFAULT 0,
  total_failed INTEGER NOT NULL DEFAULT 0,
  error_summary TEXT NULL
);

-- 4) Resultado por destinatario
CREATE TABLE IF NOT EXISTS email_campaign_run_recipient (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES email_campaign_run(id) ON DELETE CASCADE,
  user_id BIGINT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message TEXT NULL,
  sent_at TIMESTAMPTZ NULL
);

-- 5) Trigger updated_at
CREATE OR REPLACE FUNCTION update_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_email_template_updated_at ON email_template;
CREATE TRIGGER trg_email_template_updated_at
BEFORE UPDATE ON email_template
FOR EACH ROW
EXECUTE FUNCTION update_email_updated_at();

DROP TRIGGER IF EXISTS trg_email_campaign_updated_at ON email_campaign;
CREATE TRIGGER trg_email_campaign_updated_at
BEFORE UPDATE ON email_campaign
FOR EACH ROW
EXECUTE FUNCTION update_email_updated_at();

-- 6) Indices utiles
CREATE INDEX IF NOT EXISTS idx_email_campaign_next_run
  ON email_campaign(next_run_at)
  WHERE deleted_at IS NULL AND is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_email_campaign_run_campaign
  ON email_campaign_run(campaign_id, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_campaign_run_recipient_run
  ON email_campaign_run_recipient(run_id);
