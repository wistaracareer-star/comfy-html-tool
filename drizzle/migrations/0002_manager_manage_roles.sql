GRANT UPDATE ON public.user_roles TO authenticated;
CREATE POLICY "Manager updates roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.is_manager()) WITH CHECK (public.is_manager());
