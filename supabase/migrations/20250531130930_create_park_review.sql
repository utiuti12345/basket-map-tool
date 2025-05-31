CREATE TABLE IF NOT EXISTS public.park_review (
    review_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    park_id bigint NOT NULL REFERENCES public.park(park_id),
    rating numeric,
    user_ratings_total integer,
    json jsonb,
    created_at timestamp without time zone DEFAULT now()
);

alter table "public"."park_review" enable row level security;

create policy "Enable select for all users"
on "public"."park_review"
as permissive
for select
to anon
using (true);

create policy "Enable insert for all users"
on "public"."park_review"
as permissive
for insert
to anon
with check (true);

create policy "Enable update for all users"
on "public"."park_review"
as permissive
for update
to anon
with check (true);
