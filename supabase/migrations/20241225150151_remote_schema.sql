

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_display_parks_by_search"("param_prefecture_id" bigint DEFAULT NULL::bigint, "param_city_id" bigint DEFAULT NULL::bigint, "param_park_name" character varying DEFAULT NULL::character varying) RETURNS TABLE("park_id" bigint, "park_name" character varying, "court_type" integer, "court_name" character varying, "is_free" boolean, "available_time" character varying, "city_id" bigint, "city_name" character varying, "address" character varying, "tell" character varying, "web_page" character varying, "image_url" character varying, "memo" character varying, "latitude" numeric, "longitude" numeric, "request_deletion" boolean, "is_delete" boolean, "created_at" timestamp without time zone, "update_at" timestamp without time zone)
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_display_parks_by_search"("param_prefecture_id" bigint, "param_city_id" bigint, "param_park_name" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile_by_park"("param_park_ids" bigint[] DEFAULT NULL::bigint[]) RETURNS TABLE("uid" "uuid", "user_name" character varying, "email" character varying, "avatar_url" character varying, "gender" character varying, "age" integer, "height" numeric, "weight" numeric, "hometown_prefecture_id" bigint, "hometown_city_id" bigint, "self_introduction" character varying, "twitter" character varying, "instagram" character varying, "facebook" character varying, "tiktok" character varying, "other_sns" character varying, "position" character varying, "fcm_token" character varying, "is_private" boolean, "created_at" timestamp without time zone, "updated_at" timestamp without time zone, "positions" character varying[], "active_weekdays" integer[])
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_profile_by_park"("param_park_ids" bigint[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile_by_prefecture"("param_prefecture_id" bigint DEFAULT NULL::bigint) RETURNS TABLE("uid" "uuid", "user_name" character varying, "email" character varying, "avatar_url" character varying, "gender" character varying, "age" integer, "height" numeric, "weight" numeric, "hometown_prefecture_id" bigint, "hometown_city_id" bigint, "self_introduction" character varying, "twitter" character varying, "instagram" character varying, "facebook" character varying, "tiktok" character varying, "other_sns" character varying, "position" character varying, "fcm_token" character varying, "is_private" boolean, "created_at" timestamp without time zone, "updated_at" timestamp without time zone, "positions" character varying[], "active_weekdays" integer[])
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_profile_by_prefecture"("param_prefecture_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile_by_search_condition"("param_user_name" character varying DEFAULT NULL::character varying, "param_prefecture_id" bigint DEFAULT NULL::bigint, "param_city_id" bigint DEFAULT NULL::bigint, "param_genders" character varying[] DEFAULT NULL::character varying[], "param_from_age" integer DEFAULT NULL::integer, "param_to_age" integer DEFAULT NULL::integer, "param_positions" character varying[] DEFAULT ARRAY[]::character varying[], "param_active_weekdays" integer[] DEFAULT ARRAY[]::integer[]) RETURNS TABLE("uid" "uuid", "user_name" character varying, "email" character varying, "avatar_url" character varying, "gender" character varying, "age" integer, "height" numeric, "weight" numeric, "hometown_prefecture_id" bigint, "hometown_city_id" bigint, "self_introduction" character varying, "twitter" character varying, "instagram" character varying, "facebook" character varying, "tiktok" character varying, "other_sns" character varying, "position" character varying, "fcm_token" character varying, "is_private" boolean, "created_at" timestamp without time zone, "updated_at" timestamp without time zone, "positions" character varying[], "active_weekdays" integer[])
    LANGUAGE "plpgsql"
    AS $$

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
$$;


ALTER FUNCTION "public"."get_profile_by_search_condition"("param_user_name" character varying, "param_prefecture_id" bigint, "param_city_id" bigint, "param_genders" character varying[], "param_from_age" integer, "param_to_age" integer, "param_positions" character varying[], "param_active_weekdays" integer[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."nearby_parks"("lat" double precision, "long" double precision) RETURNS SETOF "record"
    LANGUAGE "sql"
    AS $$
select *
from public.park
order by location <-> st_point(long, lat)::geography;
$$;


ALTER FUNCTION "public"."nearby_parks"("lat" double precision, "long" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."parks_in_view"("min_lat" double precision, "min_long" double precision, "max_lat" double precision, "max_long" double precision) RETURNS TABLE("park_id" bigint, "park_name" character varying, "court_type" integer, "is_free" boolean, "available_time" character varying, "city_id" bigint, "address" character varying, "tell" character varying, "web_page" character varying, "image_url" character varying, "memo" character varying, "latitude" numeric, "longitude" numeric, "request_deletion" boolean, "is_delete" boolean, "created_at" timestamp without time zone, "update_at" timestamp without time zone)
    LANGUAGE "sql"
    AS $$
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
$$;


ALTER FUNCTION "public"."parks_in_view"("min_lat" double precision, "min_long" double precision, "max_lat" double precision, "max_long" double precision) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."city" (
                                               "city_id" bigint NOT NULL,
                                               "prefecture_id" bigint NOT NULL,
                                               "city_name" character varying(255) NOT NULL,
    "city_name_kana" character varying(255) NOT NULL
    );


ALTER TABLE "public"."city" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."court" (
                                                "court_type" integer NOT NULL,
                                                "court_name" character varying(255) NOT NULL
    );


ALTER TABLE "public"."court" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."favorite" (
                                                   "park_id" bigint NOT NULL,
                                                   "uid" "uuid" NOT NULL,
                                                   "sequence" bigint NOT NULL
);


ALTER TABLE "public"."favorite" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hoop" (
                                               "hoop_type" bigint NOT NULL,
                                               "hoop_name" character varying(255) NOT NULL
    );


ALTER TABLE "public"."hoop" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."park" (
                                               "park_id" bigint NOT NULL,
                                               "park_name" character varying(255) NOT NULL,
    "court_type" integer,
    "is_free" boolean,
    "available_time" character varying(255),
    "city_id" bigint,
    "address" character varying(255),
    "tell" character varying(50),
    "web_page" character varying(255),
    "image_url" character varying(255),
    "memo" character varying(255),
    "latitude" numeric,
    "longitude" numeric,
    "request_deletion" boolean NOT NULL,
    "is_delete" boolean NOT NULL,
    "created_at" timestamp without time zone NOT NULL,
    "update_at" timestamp without time zone,
    "location" "extensions"."geography"(Point,4326)
    );


ALTER TABLE "public"."park" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."park_hoop" (
                                                    "hoop_id" bigint NOT NULL,
                                                    "park_id" bigint NOT NULL,
                                                    "hoop_count" integer,
                                                    "hoop_type" bigint NOT NULL
);


ALTER TABLE "public"."park_hoop" OWNER TO "postgres";


ALTER TABLE "public"."park" ALTER COLUMN "park_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."park_park_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."park_times" (
                                                     "park_times_id" bigint NOT NULL,
                                                     "park_id" bigint NOT NULL,
                                                     "start_month" integer,
                                                     "end_month" integer,
                                                     "start_time" time without time zone,
                                                     "end_time" time without time zone
);


ALTER TABLE "public"."park_times" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."player_activity_schedule" (
                                                                   "player_activity_schedule_id" bigint NOT NULL,
                                                                   "uid" "uuid" NOT NULL,
                                                                   "activity_weekday" integer NOT NULL
);


ALTER TABLE "public"."player_activity_schedule" OWNER TO "postgres";


ALTER TABLE "public"."player_activity_schedule" ALTER COLUMN "player_activity_schedule_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."player_activity_schedule_player_activity_schedule_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."prefecture" (
                                                     "prefecture_id" bigint NOT NULL,
                                                     "prefecture_name" character varying(255) NOT NULL,
    "prefecture_name_kana" character varying(255) NOT NULL,
    "prefecture_name_eng" character varying(255) NOT NULL
    );


ALTER TABLE "public"."prefecture" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
                                                   "uid" "uuid" NOT NULL,
                                                   "user_name" character varying(255),
    "email" character varying(255),
    "avatar_url" character varying(255),
    "gender" character varying(255),
    "age" integer,
    "height" numeric(5,1),
    "weight" numeric(5,1),
    "hometown_prefecture_id" bigint,
    "hometown_city_id" bigint,
    "self_introduction" character varying(1048),
    "twitter" character varying(255),
    "instagram" character varying(255),
    "facebook" character varying(255),
    "tiktok" character varying(255),
    "other_sns" character varying(255),
    "position" character varying(255),
    "fcm_token" character varying(255),
    "is_private" boolean DEFAULT true NOT NULL,
    "created_at" timestamp without time zone NOT NULL,
    "updated_at" timestamp without time zone,
    "positions" character varying[] DEFAULT ARRAY[]::character varying[],
    "active_weekdays" integer[] DEFAULT ARRAY[]::integer[],
    "is_deleted" boolean DEFAULT false
    );


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."city"
    ADD CONSTRAINT "city_pk" PRIMARY KEY ("city_id");



ALTER TABLE ONLY "public"."court"
    ADD CONSTRAINT "court_type_pk" PRIMARY KEY ("court_type");



ALTER TABLE ONLY "public"."favorite"
    ADD CONSTRAINT "favorite_pkey" PRIMARY KEY ("park_id", "uid", "sequence");



ALTER TABLE ONLY "public"."hoop"
    ADD CONSTRAINT "hoop_pk" PRIMARY KEY ("hoop_type");



ALTER TABLE ONLY "public"."park_hoop"
    ADD CONSTRAINT "park_hoop_pk" PRIMARY KEY ("hoop_id", "park_id");



ALTER TABLE ONLY "public"."park"
    ADD CONSTRAINT "park_pk" PRIMARY KEY ("park_id");



ALTER TABLE ONLY "public"."park_times"
    ADD CONSTRAINT "park_times_pk" PRIMARY KEY ("park_times_id", "park_id");



ALTER TABLE ONLY "public"."player_activity_schedule"
    ADD CONSTRAINT "player_activity_schedule_id_pk" PRIMARY KEY ("player_activity_schedule_id");



ALTER TABLE ONLY "public"."prefecture"
    ADD CONSTRAINT "prefecture_pk" PRIMARY KEY ("prefecture_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "uid_pk" PRIMARY KEY ("uid");



CREATE INDEX "city_prefecture_fk" ON "public"."city" USING "btree" ("prefecture_id");



CREATE INDEX "favorite_fk" ON "public"."favorite" USING "btree" ("park_id");



CREATE INDEX "hoop_park_fk" ON "public"."park_hoop" USING "btree" ("park_id");



CREATE INDEX "hoop_type_fk" ON "public"."park_hoop" USING "btree" ("hoop_type");



CREATE INDEX "park_city_fk" ON "public"."park" USING "btree" ("city_id");



CREATE INDEX "park_court_type_fk" ON "public"."park" USING "btree" ("court_type");



CREATE INDEX "park_times_park_fk" ON "public"."park_times" USING "btree" ("park_id");



CREATE INDEX "parks_geo_index" ON "public"."park" USING "gist" ("location");



ALTER TABLE ONLY "public"."city"
    ADD CONSTRAINT "fk_13" FOREIGN KEY ("prefecture_id") REFERENCES "public"."prefecture"("prefecture_id");



ALTER TABLE ONLY "public"."park"
    ADD CONSTRAINT "fk_34" FOREIGN KEY ("city_id") REFERENCES "public"."city"("city_id");



ALTER TABLE ONLY "public"."park_hoop"
    ADD CONSTRAINT "fk_43" FOREIGN KEY ("park_id") REFERENCES "public"."park"("park_id");



ALTER TABLE ONLY "public"."park_times"
    ADD CONSTRAINT "fk_54" FOREIGN KEY ("park_id") REFERENCES "public"."park"("park_id");



ALTER TABLE ONLY "public"."park"
    ADD CONSTRAINT "fk_61" FOREIGN KEY ("court_type") REFERENCES "public"."court"("court_type");



ALTER TABLE ONLY "public"."park_hoop"
    ADD CONSTRAINT "fk_81" FOREIGN KEY ("hoop_type") REFERENCES "public"."hoop"("hoop_type");



ALTER TABLE ONLY "public"."player_activity_schedule"
    ADD CONSTRAINT "player_activity_schedule_id_uid_fk" FOREIGN KEY ("uid") REFERENCES "public"."profiles"("uid") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



















































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."get_display_parks_by_search"("param_prefecture_id" bigint, "param_city_id" bigint, "param_park_name" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_display_parks_by_search"("param_prefecture_id" bigint, "param_city_id" bigint, "param_park_name" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_display_parks_by_search"("param_prefecture_id" bigint, "param_city_id" bigint, "param_park_name" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profile_by_park"("param_park_ids" bigint[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_by_park"("param_park_ids" bigint[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_by_park"("param_park_ids" bigint[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profile_by_prefecture"("param_prefecture_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_by_prefecture"("param_prefecture_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_by_prefecture"("param_prefecture_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profile_by_search_condition"("param_user_name" character varying, "param_prefecture_id" bigint, "param_city_id" bigint, "param_genders" character varying[], "param_from_age" integer, "param_to_age" integer, "param_positions" character varying[], "param_active_weekdays" integer[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_by_search_condition"("param_user_name" character varying, "param_prefecture_id" bigint, "param_city_id" bigint, "param_genders" character varying[], "param_from_age" integer, "param_to_age" integer, "param_positions" character varying[], "param_active_weekdays" integer[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_by_search_condition"("param_user_name" character varying, "param_prefecture_id" bigint, "param_city_id" bigint, "param_genders" character varying[], "param_from_age" integer, "param_to_age" integer, "param_positions" character varying[], "param_active_weekdays" integer[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."nearby_parks"("lat" double precision, "long" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."nearby_parks"("lat" double precision, "long" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."nearby_parks"("lat" double precision, "long" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."parks_in_view"("min_lat" double precision, "min_long" double precision, "max_lat" double precision, "max_long" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."parks_in_view"("min_lat" double precision, "min_long" double precision, "max_lat" double precision, "max_long" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."parks_in_view"("min_lat" double precision, "min_long" double precision, "max_lat" double precision, "max_long" double precision) TO "service_role";































































GRANT ALL ON TABLE "public"."city" TO "anon";
GRANT ALL ON TABLE "public"."city" TO "authenticated";
GRANT ALL ON TABLE "public"."city" TO "service_role";



GRANT ALL ON TABLE "public"."court" TO "anon";
GRANT ALL ON TABLE "public"."court" TO "authenticated";
GRANT ALL ON TABLE "public"."court" TO "service_role";



GRANT ALL ON TABLE "public"."favorite" TO "anon";
GRANT ALL ON TABLE "public"."favorite" TO "authenticated";
GRANT ALL ON TABLE "public"."favorite" TO "service_role";



GRANT ALL ON TABLE "public"."hoop" TO "anon";
GRANT ALL ON TABLE "public"."hoop" TO "authenticated";
GRANT ALL ON TABLE "public"."hoop" TO "service_role";



GRANT ALL ON TABLE "public"."park" TO "anon";
GRANT ALL ON TABLE "public"."park" TO "authenticated";
GRANT ALL ON TABLE "public"."park" TO "service_role";



GRANT ALL ON TABLE "public"."park_hoop" TO "anon";
GRANT ALL ON TABLE "public"."park_hoop" TO "authenticated";
GRANT ALL ON TABLE "public"."park_hoop" TO "service_role";



GRANT ALL ON SEQUENCE "public"."park_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."park_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."park_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."park_times" TO "anon";
GRANT ALL ON TABLE "public"."park_times" TO "authenticated";
GRANT ALL ON TABLE "public"."park_times" TO "service_role";



GRANT ALL ON TABLE "public"."player_activity_schedule" TO "anon";
GRANT ALL ON TABLE "public"."player_activity_schedule" TO "authenticated";
GRANT ALL ON TABLE "public"."player_activity_schedule" TO "service_role";



GRANT ALL ON SEQUENCE "public"."player_activity_schedule_player_activity_schedule_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."player_activity_schedule_player_activity_schedule_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."player_activity_schedule_player_activity_schedule_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."prefecture" TO "anon";
GRANT ALL ON TABLE "public"."prefecture" TO "authenticated";
GRANT ALL ON TABLE "public"."prefecture" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






















RESET ALL;
