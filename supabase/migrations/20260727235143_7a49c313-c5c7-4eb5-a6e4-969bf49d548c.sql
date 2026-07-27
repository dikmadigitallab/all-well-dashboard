CREATE POLICY "users_no_direct_client_access"
ON public.users
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);