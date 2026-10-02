grant select on table public.poems to authenticated;

create policy "Users can view their own poems"
on public.poems
for select
to authenticated
using ((select auth.uid()) = user_id);