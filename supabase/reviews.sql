-- Reviews schema for Hihya Care
-- Adjust appointment_id type to match appointments.id if needed.

create extension if not exists "pgcrypto";

alter table appointments
  add column if not exists patient_id uuid references auth.users(id);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  doctor_id text not null references doctors(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  appointment_id text not null,
  patient_name text,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create unique index if not exists reviews_appointment_patient_unique
  on reviews (appointment_id, patient_id);

create index if not exists reviews_doctor_id_idx on reviews (doctor_id);
create index if not exists reviews_created_at_idx on reviews (created_at desc);

alter table reviews enable row level security;

create policy "reviews read access"
  on reviews for select
  using (true);

create policy "patients can insert completed reviews"
  on reviews for insert
  with check (
    exists (
      select 1
      from appointments
      where appointments.id::text = reviews.appointment_id
        and appointments.doctor_id::text = reviews.doctor_id
        and appointments.status = 'Completed'
        and appointments.patient_id = auth.uid()
    )
  );

create or replace view doctor_rating_summary as
select
  doctor_id,
  round(avg(rating)::numeric, 2) as average_rating,
  count(*) as review_count,
  count(*) filter (where rating = 5) as rating_5,
  count(*) filter (where rating = 4) as rating_4,
  count(*) filter (where rating = 3) as rating_3,
  count(*) filter (where rating = 2) as rating_2,
  count(*) filter (where rating = 1) as rating_1
from reviews
group by doctor_id;
