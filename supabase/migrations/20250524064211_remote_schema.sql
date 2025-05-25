alter table "public"."amazon_links" enable row level security;

alter table "public"."city" enable row level security;

alter table "public"."court" enable row level security;

alter table "public"."favorite" enable row level security;

alter table "public"."hoop" enable row level security;

alter table "public"."park" enable row level security;

alter table "public"."park_hoop" enable row level security;

alter table "public"."player_activity_schedule" enable row level security;

alter table "public"."prefecture" enable row level security;

alter table "public"."profiles" enable row level security;

CREATE UNIQUE INDEX unique_constraint_url ON public.amazon_links USING btree (url);

alter table "public"."amazon_links" add constraint "unique_constraint_url" UNIQUE using index "unique_constraint_url";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_display_parks_by_search(param_prefecture_id bigint DEFAULT NULL::bigint, param_city_id bigint DEFAULT NULL::bigint, param_park_name character varying DEFAULT NULL::character varying)
 RETURNS TABLE(park_id bigint, park_name character varying, court_type integer, court_name character varying, is_free boolean, available_time character varying, city_id bigint, city_name character varying, address character varying, tell character varying, web_page character varying, image_url character varying, memo character varying, latitude numeric, longitude numeric, request_deletion boolean, is_delete boolean, created_at timestamp without time zone, update_at timestamp without time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
        SELECT
            prk.park_id,
            prk.park_name,
            prk.court_type,
            c.court_name,
            prk.is_free,
            prk.available_time,
            prk.city_id,
            pre_cty.city_name,
            prk.address,
            prk.tell,
            prk.web_page,
            prk.image_url,
            prk.memo,
            prk.latitude,
            prk.longitude,
            prk.request_deletion,
            prk.is_delete,
            prk.created_at,
            prk.update_at
        FROM park AS prk
                 LEFT JOIN (
            SELECT p.prefecture_name,
                   prefecture_name_kana,
                   prefecture_name_eng,
                   city.*
            FROM city
                     INNER JOIN prefecture p
                                ON city.prefecture_id = p.prefecture_id
        ) AS pre_cty
                           ON prk.city_id = pre_cty.city_id
                 LEFT JOIN court c
                           ON c.court_type = prk.court_type
        WHERE
            ((param_prefecture_id = 0 AND pre_cty.prefecture_id != param_prefecture_id) OR (param_prefecture_id != 0 AND pre_cty.prefecture_id = param_prefecture_id))
          AND ((param_city_id = 0 AND pre_cty.city_id != param_city_id) OR (param_city_id != 0 AND pre_cty.city_id = param_city_id))
          AND ((param_park_name IS NULL AND prk.park_name IS NOT NULL) OR (param_park_name IS NOT NULL AND prk.park_name like '%' || param_park_name || '%'))
        ORDER BY
            park_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_profile_by_park(param_park_ids bigint[] DEFAULT NULL::bigint[])
 RETURNS TABLE(uid uuid, user_name character varying, email character varying, avatar_url character varying, gender character varying, age integer, height numeric, weight numeric, hometown_prefecture_id bigint, hometown_city_id bigint, self_introduction character varying, twitter character varying, instagram character varying, facebook character varying, tiktok character varying, other_sns character varying, "position" character varying, fcm_token character varying, is_private boolean, created_at timestamp without time zone, updated_at timestamp without time zone, positions character varying[], active_weekdays integer[])
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
        SELECT DISTINCT
            p.uid,
            p.user_name,
            p.email,
            p.avatar_url,
            p.gender,
            p.age,
            p.height,
            p.weight,
            p.hometown_prefecture_id,
            p.hometown_city_id,
            p.self_introduction,
            p.twitter,
            p.instagram,
            p.facebook,
            p.tiktok,
            p.other_sns,
            p.position,
            p.fcm_token,
            p.is_private,
            p.created_at,
            p.updated_at,
            p.positions,
            p.active_weekdays
        FROM profiles AS p
        INNER JOIN favorite AS fav
            ON p.uid = fav.uid
        WHERE
            fav.park_id = any(param_park_ids)
            AND p.is_private = false
        ORDER BY
            created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_profile_by_prefecture(param_prefecture_id bigint DEFAULT NULL::bigint)
 RETURNS TABLE(uid uuid, user_name character varying, email character varying, avatar_url character varying, gender character varying, age integer, height numeric, weight numeric, hometown_prefecture_id bigint, hometown_city_id bigint, self_introduction character varying, twitter character varying, instagram character varying, facebook character varying, tiktok character varying, other_sns character varying, "position" character varying, fcm_token character varying, is_private boolean, created_at timestamp without time zone, updated_at timestamp without time zone, positions character varying[], active_weekdays integer[])
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
        SELECT DISTINCT
            p.uid,
            p.user_name,
            p.email,
            p.avatar_url,
            p.gender,
            p.age,
            p.height,
            p.weight,
            p.hometown_prefecture_id,
            p.hometown_city_id,
            p.self_introduction,
            p.twitter,
            p.instagram,
            p.facebook,
            p.tiktok,
            p.other_sns,
            p.position,
            p.fcm_token,
            p.is_private,
            p.created_at,
            p.updated_at,
            p.positions,
            p.active_weekdays
        FROM profiles AS p
        INNER JOIN prefecture AS pref
            ON p.hometown_prefecture_id = pref.prefecture_id
        WHERE
            (pref.prefecture_id = param_prefecture_id)
            AND p.is_private = false
        ORDER BY
            created_at DESC
        LIMIT 100; -- 100件まで
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_profile_by_search_condition(param_user_name character varying DEFAULT NULL::character varying, param_prefecture_id bigint DEFAULT NULL::bigint, param_city_id bigint DEFAULT NULL::bigint, param_genders character varying[] DEFAULT NULL::character varying[], param_from_age integer DEFAULT NULL::integer, param_to_age integer DEFAULT NULL::integer, param_positions character varying[] DEFAULT ARRAY[]::character varying[], param_active_weekdays integer[] DEFAULT ARRAY[]::integer[])
 RETURNS TABLE(uid uuid, user_name character varying, email character varying, avatar_url character varying, gender character varying, age integer, height numeric, weight numeric, hometown_prefecture_id bigint, hometown_city_id bigint, self_introduction character varying, twitter character varying, instagram character varying, facebook character varying, tiktok character varying, other_sns character varying, "position" character varying, fcm_token character varying, is_private boolean, created_at timestamp without time zone, updated_at timestamp without time zone, positions character varying[], active_weekdays integer[])
 LANGUAGE plpgsql
AS $function$

DECLARE
    param_position_filter_uids uuid[];
    param_active_weekdays_filter_uids uuid[];
BEGIN
    -- パラメータが空の場合は、全てのユーザーを取得する(パフォーマンスが悪くなりそうなので、そのうち修正)
    IF array_length(param_positions,1) > 0 THEN
        SELECT
            array_agg(distinct p.uid)
        INTO param_position_filter_uids
        FROM profiles AS p
                 CROSS JOIN LATERAL UNNEST(p.positions) AS position
        WHERE position.position = any(param_positions);
    ELSE
        SELECT
            array_agg(distinct p.uid)
        INTO param_position_filter_uids
        FROM profiles AS p;
    END IF;

    -- パラメータが空の場合は、全てのユーザーを取得する(パフォーマンスが悪くなりそうなので、そのうち修正)
    IF array_length(param_active_weekdays,1) > 0 THEN
        SELECT
            array_agg(distinct p.uid)
        INTO param_active_weekdays_filter_uids
        FROM profiles AS p
                 CROSS JOIN LATERAL UNNEST(p.active_weekdays) AS position
        WHERE position.position = any(param_active_weekdays);
    ELSE
        SELECT
            array_agg(distinct p.uid)
        INTO param_active_weekdays_filter_uids
        FROM profiles AS p;
    END IF;

    RETURN QUERY
        SELECT
            p.uid,
            p.user_name,
            p.email,
            p.avatar_url,
            p.gender,
            p.age,
            p.height,
            p.weight,
            p.hometown_prefecture_id,
            p.hometown_city_id,
            p.self_introduction,
            p.twitter,
            p.instagram,
            p.facebook,
            p.tiktok,
            p.other_sns,
            p.position,
            p.fcm_token,
            p.is_private,
            p.created_at,
            p.updated_at,
            p.positions,
            p.active_weekdays
        FROM profiles AS p

        WHERE
            ((param_user_name IS NULL AND p.user_name IS NOT NULL) OR (param_user_name IS NOT NULL AND p.user_name like '%' || param_user_name || '%'))
            AND ((param_prefecture_id = 0 AND (p.hometown_prefecture_id IS NOT NULL OR p.hometown_prefecture_id IS NULL)) OR (param_prefecture_id != 0 AND p.hometown_prefecture_id = param_prefecture_id))
            AND ((param_city_id = 0 AND (p.hometown_city_id IS NOT NULL OR p.hometown_city_id IS NULL)) OR (param_city_id != 0 AND p.hometown_city_id = param_city_id))
            AND ((param_genders IS NULL AND (p.gender IS NOT NULL OR p.gender IS NULL)) OR (param_genders IS NOT NULL AND p.gender = any(param_genders)))
            AND ((param_from_age IS NULL AND (p.age IS NOT NULL OR p.age IS NULL)) OR (param_from_age IS NOT NULL AND p.age >= param_from_age))
            AND ((param_to_age IS NULL AND (p.age IS NOT NULL OR p.age IS NULL)) OR (param_to_age IS NOT NULL AND p.age <= param_to_age))
            AND (p.uid = any(param_position_filter_uids))
            AND (p.uid = any(param_active_weekdays_filter_uids))
            AND p.is_private = false
        ORDER BY
            created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.nearby_parks(lat double precision, long double precision)
 RETURNS SETOF record
 LANGUAGE sql
AS $function$
  select *
  from public.park
  order by location <-> st_point(long, lat)::geography;
$function$
;

CREATE OR REPLACE FUNCTION public.parks_in_view(min_lat double precision, min_long double precision, max_lat double precision, max_long double precision)
 RETURNS TABLE(park_id bigint, park_name character varying, court_type integer, is_free boolean, available_time character varying, city_id bigint, address character varying, tell character varying, web_page character varying, image_url character varying, memo character varying, latitude numeric, longitude numeric, request_deletion boolean, is_delete boolean, created_at timestamp without time zone, update_at timestamp without time zone)
 LANGUAGE sql
AS $function$
select park_id,
 park_name,
 court_type,
 is_free,
 available_time,
 city_id,
 address,
 tell,
 web_page,
 image_url,
 memo,
 latitude,
 longitude,
 request_deletion,
 is_delete,
 created_at,
 update_at
from public.park
where location && ST_SetSRID(ST_MakeBox2D(ST_Point(min_long, min_lat), ST_Point(max_long, max_lat)),4326)
$function$
;

create policy "Public amazon_links are visible to everyone."
on "public"."amazon_links"
as permissive
for select
to anon
using (true);


create policy "Public cities are visible to everyone."
on "public"."city"
as permissive
for select
to anon, authenticated
using (true);


create policy "Public court are visible to everyone."
on "public"."court"
as permissive
for select
to anon, authenticated
using (true);


create policy "Public favaorites are visible to everyone."
on "public"."favorite"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = uid));


create policy "User can update their own favorite only."
on "public"."favorite"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = uid));


create policy "Users can delete a favorite."
on "public"."favorite"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = uid));


create policy "Public hoop are visible to everyone."
on "public"."hoop"
as permissive
for select
to anon, authenticated
using (true);


create policy "Public park are visible to everyone."
on "public"."park"
as permissive
for select
to anon, authenticated
using (true);


create policy "Users can create a park."
on "public"."park"
as permissive
for insert
to anon, authenticated
with check (true);


create policy "Public park_hoop are visible to everyone."
on "public"."park_hoop"
as permissive
for select
to anon, authenticated
using (true);


create policy "Users can update a park_hoop."
on "public"."park_hoop"
as permissive
for insert
to anon, authenticated
with check (true);


create policy "Public prefecture are visible to everyone."
on "public"."prefecture"
as permissive
for select
to anon, authenticated
using (true);


create policy "Public profiles are viewable only by authenticated users"
on "public"."profiles"
as permissive
for select
to authenticated
using (true);


create policy "Users can create a profile."
on "public"."profiles"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = uid));


create policy "Users can update their own profile."
on "public"."profiles"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = uid))
with check ((( SELECT auth.uid() AS uid) = uid));



