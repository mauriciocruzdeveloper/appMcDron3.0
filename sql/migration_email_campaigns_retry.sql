-- Limite por hora, reintentos y finalizacion manual de corridas.
-- Ejecutar en el SQL Editor del proyecto Supabase (ya con migration_add_email_campaigns.sql aplicada).

ALTER TABLE email_campaign_run DROP CONSTRAINT IF EXISTS email_campaign_run_status_check;
ALTER TABLE email_campaign_run
  ADD CONSTRAINT email_campaign_run_status_check
  CHECK (status IN ('success', 'partial', 'failed', 'finalized'));

ALTER TABLE email_campaign_run_recipient DROP CONSTRAINT IF EXISTS email_campaign_run_recipient_status_check;
ALTER TABLE email_campaign_run_recipient
  ADD CONSTRAINT email_campaign_run_recipient_status_check
  CHECK (status IN ('sent', 'failed', 'pending'));

CREATE INDEX IF NOT EXISTS idx_email_campaign_run_recipient_status
  ON email_campaign_run_recipient(run_id, status);

-- Realtime para el modal de progreso en vivo (falla si ya esta agregada; en ese caso ignorar el error).
ALTER PUBLICATION supabase_realtime ADD TABLE email_campaign_run_recipient;
