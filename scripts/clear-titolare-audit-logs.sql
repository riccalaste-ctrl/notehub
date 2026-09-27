-- One-time cleanup requested for the Titolare audit log.
-- This removes ONLY operation/access logs. It does not remove the current
-- Titolare and does not remove titular_history.
truncate table public.titular_audit_logs;
