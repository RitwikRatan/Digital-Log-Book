--
-- PostgreSQL database dump
--


-- Dumped from database version 15.19 (Debian 15.19-1.pgdg13+2)
-- Dumped by pg_dump version 15.19 (Debian 15.19-1.pgdg13+2)

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

DROP INDEX public.ix_gas_readings_timestamp;
DROP INDEX public.ix_gas_readings_sensor_id;
DROP INDEX public.ix_gas_readings_id;
ALTER TABLE ONLY public.gas_readings DROP CONSTRAINT gas_readings_pkey;
ALTER TABLE public.gas_readings ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.gas_readings_id_seq;
DROP TABLE public.gas_readings;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: gas_readings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gas_readings (
    id integer NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now(),
    sensor_id integer,
    device_name character varying,
    gas_type character varying,
    value double precision,
    unit character varying,
    status character varying
);


--
-- Name: gas_readings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gas_readings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gas_readings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gas_readings_id_seq OWNED BY public.gas_readings.id;


--
-- Name: gas_readings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gas_readings ALTER COLUMN id SET DEFAULT nextval('public.gas_readings_id_seq'::regclass);


--
-- Data for Name: gas_readings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.gas_readings (id, "timestamp", sensor_id, device_name, gas_type, value, unit, status) VALUES
(1, '2026-09-11 05:57:07+00', 1, 'Uniphos Gas Analyzer', 'CO', 0, 'PPM', 'ONLINE'),
(2, '2026-09-11 05:57:07+00', 2, 'Uniphos Gas Analyzer', 'H2S', 0, 'PPM', 'ONLINE'),
(3, '2026-09-11 05:57:12+00', 1, 'Uniphos Gas Analyzer', 'CO', 0, 'PPM', 'ONLINE'),
(4, '2026-09-11 05:57:12+00', 2, 'Uniphos Gas Analyzer', 'H2S', 0, 'PPM', 'ONLINE'),
(5, '2026-09-11 05:57:17+00', 1, 'Uniphos Gas Analyzer', 'CO', 0, 'PPM', 'ONLINE'),
(6, '2026-09-11 05:57:17+00', 2, 'Uniphos Gas Analyzer', 'H2S', 0, 'PPM', 'ONLINE'),
(7, '2026-09-11 05:57:22+00', 1, 'Uniphos Gas Analyzer', 'CO', 0, 'PPM', 'ONLINE'),
(8, '2026-09-11 05:57:22+00', 2, 'Uniphos Gas Analyzer', 'H2S', 0, 'PPM', 'ONLINE');


--
-- Name: gas_readings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.gas_readings_id_seq', 8, true);


--
-- Name: gas_readings gas_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gas_readings
    ADD CONSTRAINT gas_readings_pkey PRIMARY KEY (id);


--
-- Name: ix_gas_readings_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_gas_readings_id ON public.gas_readings USING btree (id);


--
-- Name: ix_gas_readings_sensor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_gas_readings_sensor_id ON public.gas_readings USING btree (sensor_id);


--
-- Name: ix_gas_readings_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_gas_readings_timestamp ON public.gas_readings USING btree ("timestamp");


--
-- PostgreSQL database dump complete
--


