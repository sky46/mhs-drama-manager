--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Debian 17.2-1.pgdg120+1)
-- Dumped by pg_dump version 17.2 (Debian 17.2-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password character(97) NOT NULL,
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role smallint NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Users_id_seq" OWNER TO postgres;

--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public.users.id;


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    user_id integer NOT NULL,
    production_id integer NOT NULL,
    attendance_date date DEFAULT CURRENT_DATE NOT NULL
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: productions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productions (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.productions OWNER TO postgres;

--
-- Name: productions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productions_id_seq OWNER TO postgres;

--
-- Name: productions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productions_id_seq OWNED BY public.productions.id;


--
-- Name: productions_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productions_users (
    production_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.productions_users OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: productions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productions ALTER COLUMN id SET DEFAULT nextval('public.productions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (user_id, production_id, attendance_date) FROM stdin;
15	7	2025-04-14
\.


--
-- Data for Name: productions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productions (id, name) FROM stdin;
7	production 1
8	production 2
9	production 3
10	production 4
\.


--
-- Data for Name: productions_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productions_users (production_id, user_id) FROM stdin;
7	15
8	15
9	15
10	15
7	16
8	16
9	16
10	16
7	17
8	17
9	17
10	17
7	18
8	18
9	18
10	18
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
VUubO029itmue4M4UYBULjBkLE-kfk7b	{"cookie":{"originalMaxAge":null,"expires":null,"secure":false,"httpOnly":true,"path":"/"}}	2025-04-15 16:43:27
2johAuE8LIVrOtcXkOq1nGZD5u19PpEn	{"cookie":{"originalMaxAge":null,"expires":null,"secure":false,"httpOnly":true,"path":"/"}}	2025-04-15 16:42:38
Rqn2ppkScN5bmjEITUo49SWwcdOIWzFT	{"cookie":{"originalMaxAge":null,"expires":null,"secure":false,"httpOnly":true,"path":"/"}}	2025-04-15 16:42:59
JYbQUCRGqBIgT622SMLOwJodWvVOjhin	{"cookie":{"originalMaxAge":null,"expires":null,"secure":false,"httpOnly":true,"path":"/"},"user":16}	2025-04-15 16:47:46
AmeN0g6f0SMXJWWLcbmkbojTnrUl7AXs	{"cookie":{"originalMaxAge":null,"expires":null,"secure":false,"httpOnly":true,"path":"/"}}	2025-04-15 16:43:54
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, created_date, role) FROM stdin;
15	Student	student@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$4PXhrWtTNJMsKcHSruUPLA$bgO9MO6qh2hz2/GPDkNYNC+UHK3bmMQwrWVxTTfELaY	2025-04-14 16:42:37.829221+00	1
16	Teacher	teacher@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$ymBUXnn5weesBMMc1g225A$T1p24T1Bwa9wK8nIBsieAk+Y8uerQGhFQ/d+k7tZH7Q	2025-04-14 16:42:58.101363+00	0
17	Lucas J	kblazer20@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$Fw2Gt53IdDIaM8tqQvek+w$IyAYY5lQ4m32gUMot9KT/8G5CmkW3S6UvHgeT/QSkf0	2025-04-14 16:43:26.826813+00	1
18	teacher2	teacher2@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$EY5w0XlKBnxMRLrXjae95w$wT4aFx/+T1h23ou2SH+ImIg89mP4ZTCojwf3kQGPsSU	2025-04-14 16:43:53.787382+00	0
\.


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_id_seq"', 18, true);


--
-- Name: productions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productions_id_seq', 10, true);


--
-- Name: users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (user_id, production_id, attendance_date);


--
-- Name: productions productions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productions
    ADD CONSTRAINT productions_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: productions_users_production_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX productions_users_production_id ON public.productions_users USING btree (production_id);


--
-- Name: productions_users_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX productions_users_user_id ON public.productions_users USING btree (user_id);


--
-- Name: attendance fk_attendance_production; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_production FOREIGN KEY (production_id) REFERENCES public.productions(id) ON DELETE CASCADE;


--
-- Name: attendance fk_attendance_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: productions_users productions_users_production_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productions_users
    ADD CONSTRAINT productions_users_production_id_fkey FOREIGN KEY (production_id) REFERENCES public.productions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: productions_users productions_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productions_users
    ADD CONSTRAINT productions_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

