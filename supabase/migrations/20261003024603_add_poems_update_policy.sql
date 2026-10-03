grant update on table public.poems to authenticated;

create policy "Users can update their own poems"
on public.poems
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);