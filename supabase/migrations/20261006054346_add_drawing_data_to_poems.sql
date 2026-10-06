alter table public.poems
add column drawing_data jsonb not null default '[]'::jsonb;