CREATE POLICY "SIGAP docs read" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'documents' AND (public.is_manager() OR (storage.foldername(name))[1] = public.my_division() OR owner = auth.uid()));
CREATE POLICY "SIGAP docs upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'documents' AND (storage.foldername(name))[1] = public.my_division() AND (storage.foldername(name))[2] = auth.uid()::text);
CREATE POLICY "SIGAP docs delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'documents' AND (owner = auth.uid() OR public.is_manager() OR public.is_spv_of((storage.foldername(name))[1])));
