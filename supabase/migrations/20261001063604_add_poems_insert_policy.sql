create policy "Users can insert their own poems"
on public.poems
for insert
to authenticated
with check (auth.uid() = user_id);