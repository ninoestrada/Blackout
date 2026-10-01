create table public.poems (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    title text,
    source_text text not null,
    blackout_data integer[] not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.poems enable row level security;

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_poems_updated_at
before update on public.poems
for each row
execute function public.update_updated_at();
