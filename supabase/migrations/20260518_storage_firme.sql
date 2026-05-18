-- Bucket pubblico per le firme dei rapporti
insert into storage.buckets (id, name, public)
values ('report-firme', 'report-firme', true)
on conflict (id) do nothing;

-- Upload firme da parte dell'app collaboratori (anon key)
drop policy if exists "anon upload firme" on storage.objects;
create policy "anon upload firme"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'report-firme');

-- Lettura pubblica delle firme (necessaria perché l'app legge le firme via URL pubblico)
drop policy if exists "public read firme" on storage.objects;
create policy "public read firme"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'report-firme');
