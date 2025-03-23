--
-- PostgreSQL database dump
--

-- Dumped from database version 17.3 (Debian 17.3-1.pgdg120+1)
-- Dumped by pg_dump version 17.3 (Debian 17.3-1.pgdg120+1)

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
1	1	2025-03-07
8	1	2025-03-23
\.


--
-- Data for Name: productions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productions (id, name) FROM stdin;
1	Test production
2	second test
\.


--
-- Data for Name: productions_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productions_users (production_id, user_id) FROM stdin;
1	10
1	9
2	9
1	11
2	11
1	8
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
IHO3DjzpFXovAu3zJBlhSdN7Cjz04BY8	{"cookie":{"originalMaxAge":null,"expires":null,"secure":false,"httpOnly":true,"path":"/"},"user":8}	2025-03-24 20:58:32
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, created_date, role) FROM stdin;
1	lucas	test@gmail.com	testpassword                                                                                     	2025-01-21 18:40:56.441692+00	0
7	s	s	$argon2id$v=19$m=65536,t=3,p=4$Rt/lTZYT4+FWCB9dNZ24+A$2kKdBWIUXzc2EF+JcaYXOzB25ha/A2FZ8phpcDvl/2s	2025-02-07 15:40:20.365896+00	1
9	Teacher	teacher@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$WeIG5FHLszymWfnIhsQfBA$HnBD9QR4/eoEtk27yWjeTkLoZytrAwzvtMP5INCSH44	2025-02-27 18:42:51.624184+00	0
10	Lucas	lucas@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$cKiQ8wl+5F5POyi4lPXunA$4vo2wuJVEmw1zpv4vnhsXEMjdVuxr8CuIP/8bfqnfb4	2025-03-03 17:30:05.206747+00	0
11	Student	student@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$GsExEH9aFRlwF3L8FCfIIg$lDNdfneBNAQreVNEdph3mCl65c39j+qmow9Vaysuie0	2025-03-03 17:31:47.97819+00	1
12	a	a@a.com	$argon2id$v=19$m=65536,t=3,p=4$dRTPBDilAtmSlfxGf7w1Ng$4LCoAutqqU8gDneXJNoTqLFZEYS2WQ9ykrHOwokdINk	2025-03-07 16:51:44.003471+00	1
8	test	test@test.com	$argon2id$v=19$m=65536,t=3,p=4$uTwqRYjMo5dH95PbIkPJxA$l7QNmuiqM9yttEpJu1L8xALxn/7Pz/S7FgnAqafsNzg	2025-02-19 13:21:31.996186+00	0
\.


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_id_seq"', 12, true);


--
-- Name: productions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productions_id_seq', 1, true);


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
-- PostgreSQL database dump complete
--

