-- ZANNOO INTERNATIONAL SCHOOL - STAGE 1 DATABASE
-- Paste all of this in Supabase > SQL Editor > New query > Run.

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('Admission enquiry','Website message')),
  parent_name text not null check (char_length(parent_name) between 1 and 120),
  phone text not null check (char_length(phone) between 5 and 40),
  email text not null check (char_length(email) between 3 and 160),
  child_name text check (char_length(child_name) <= 120),
  grade text check (char_length(grade) <= 40),
  message text check (char_length(message) <= 2000),
  status text not null default 'New' check (status in ('New','Contacted','Toured','Offered','Enrolled','Closed')),
  notes text check (char_length(notes) <= 4000)
);

create table public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text
);

alter table public.enquiries enable row level security;
alter table public.staff enable row level security;

grant insert on public.enquiries to anon;
grant select, update on public.enquiries to authenticated;
grant select on public.staff to authenticated;

-- Anyone on the website may SUBMIT an enquiry, but cannot read, change or delete any.
create policy "public can submit" on public.enquiries
  for insert to anon with check (status = 'New' and notes is null);

-- Only logged-in people listed in the staff table can read and update enquiries.
create policy "staff can read" on public.enquiries
  for select to authenticated
  using (exists (select 1 from public.staff s where s.user_id = auth.uid()));

create policy "staff can update" on public.enquiries
  for update to authenticated
  using (exists (select 1 from public.staff s where s.user_id = auth.uid()))
  with check (exists (select 1 from public.staff s where s.user_id = auth.uid()));

create policy "staff can see own row" on public.staff
  for select to authenticated using (user_id = auth.uid());

-- AFTER creating a staff user in Authentication > Users, run this once per person:
-- insert into public.staff (user_id, full_name)
--   select id, 'Full Name' from auth.users where email = 'staff@example.com';
