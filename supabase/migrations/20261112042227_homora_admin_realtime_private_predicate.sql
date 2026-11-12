-- Move the narrowly scoped admin predicate out of the exposed public API schema.
CREATE OR REPLACE FUNCTION private.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles AS ur
    WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'admin'
  );
$function$;
GRANT USAGE ON SCHEMA private TO authenticated;
REVOKE ALL ON FUNCTION private.is_platform_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_platform_admin() TO authenticated;

DROP POLICY IF EXISTS cms_content_admin_realtime_read ON public.cms_content;
CREATE POLICY cms_content_admin_realtime_read ON public.cms_content FOR SELECT TO authenticated USING (private.is_platform_admin());
DROP POLICY IF EXISTS support_tickets_admin_realtime_read ON public.support_tickets;
CREATE POLICY support_tickets_admin_realtime_read ON public.support_tickets FOR SELECT TO authenticated USING (private.is_platform_admin());
DROP POLICY IF EXISTS admin_notifications_admin_realtime_read ON public.admin_notifications;
CREATE POLICY admin_notifications_admin_realtime_read ON public.admin_notifications FOR SELECT TO authenticated USING (private.is_platform_admin());
DROP POLICY IF EXISTS audit_logs_admin_realtime_read ON public.audit_logs;
CREATE POLICY audit_logs_admin_realtime_read ON public.audit_logs FOR SELECT TO authenticated USING (private.is_platform_admin());
DROP POLICY IF EXISTS platform_settings_admin_realtime_read ON public.platform_settings;
CREATE POLICY platform_settings_admin_realtime_read ON public.platform_settings FOR SELECT TO authenticated USING (private.is_platform_admin());
DROP POLICY IF EXISTS user_roles_admin_realtime_read ON public.user_roles;
CREATE POLICY user_roles_admin_realtime_read ON public.user_roles FOR SELECT TO authenticated USING (private.is_platform_admin());

REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC, anon, authenticated;
DROP FUNCTION IF EXISTS public.is_platform_admin();
