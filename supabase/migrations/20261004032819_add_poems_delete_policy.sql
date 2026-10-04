grant delete on table public.poems to authenticated;

create policy "Users can delete their own poems"
on public.poems
for delete
to authenticated
using ((select auth.uid()) = user_id);
