-- Cross-app realtime: expose only the event streams required by each app.
-- Existing row-level security remains the authorization boundary.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'cms_content', 'reviews', 'reports', 'support_tickets', 'profiles',
    'roommate_profiles', 'roommate_connections', 'admin_notifications',
    'audit_logs', 'platform_settings', 'user_roles'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END
$$;

DROP POLICY IF EXISTS cms_content_admin_realtime_read ON public.cms_content;
CREATE POLICY cms_content_admin_realtime_read ON public.cms_content
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS support_tickets_admin_realtime_read ON public.support_tickets;
CREATE POLICY support_tickets_admin_realtime_read ON public.support_tickets
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS admin_notifications_admin_realtime_read ON public.admin_notifications;
CREATE POLICY admin_notifications_admin_realtime_read ON public.admin_notifications
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS audit_logs_admin_realtime_read ON public.audit_logs;
CREATE POLICY audit_logs_admin_realtime_read ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS platform_settings_admin_realtime_read ON public.platform_settings;
CREATE POLICY platform_settings_admin_realtime_read ON public.platform_settings
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS user_roles_admin_realtime_read ON public.user_roles;
CREATE POLICY user_roles_admin_realtime_read ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_admin());
