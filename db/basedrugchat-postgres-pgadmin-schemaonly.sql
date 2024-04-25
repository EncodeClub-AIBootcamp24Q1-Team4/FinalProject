--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

-- Started on 2024-04-25 09:17:08

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

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3423 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 49378)
-- Name: dexs; Type: TABLE; Schema: public; Owner: basedrugchat_owner
--

CREATE TABLE public.dexs (
    id integer NOT NULL,
    token_id integer,
    liquidity_type character varying(255) DEFAULT ''::character varying,
    name character varying(255) DEFAULT ''::character varying,
    liquidity numeric DEFAULT 0,
    pair character varying(42) DEFAULT ''::character varying
);


ALTER TABLE public.dexs OWNER TO basedrugchat_owner;

--
-- TOC entry 219 (class 1259 OID 49377)
-- Name: dexs_id_seq; Type: SEQUENCE; Schema: public; Owner: basedrugchat_owner
--

CREATE SEQUENCE public.dexs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dexs_id_seq OWNER TO basedrugchat_owner;

--
-- TOC entry 3424 (class 0 OID 0)
-- Dependencies: 219
-- Name: dexs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: basedrugchat_owner
--

ALTER SEQUENCE public.dexs_id_seq OWNED BY public.dexs.id;


--
-- TOC entry 222 (class 1259 OID 49396)
-- Name: holders; Type: TABLE; Schema: public; Owner: basedrugchat_owner
--

CREATE TABLE public.holders (
    id integer NOT NULL,
    token_id integer,
    holder_address character varying(42) DEFAULT ''::character varying,
    tag character varying(255) DEFAULT ''::character varying,
    is_contract smallint DEFAULT 0,
    balance numeric DEFAULT 0,
    percent numeric DEFAULT 0,
    is_locked smallint DEFAULT 0
);


ALTER TABLE public.holders OWNER TO basedrugchat_owner;

--
-- TOC entry 221 (class 1259 OID 49395)
-- Name: holders_id_seq; Type: SEQUENCE; Schema: public; Owner: basedrugchat_owner
--

CREATE SEQUENCE public.holders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.holders_id_seq OWNER TO basedrugchat_owner;

--
-- TOC entry 3425 (class 0 OID 0)
-- Dependencies: 221
-- Name: holders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: basedrugchat_owner
--

ALTER SEQUENCE public.holders_id_seq OWNED BY public.holders.id;


--
-- TOC entry 224 (class 1259 OID 49416)
-- Name: lp_holders; Type: TABLE; Schema: public; Owner: basedrugchat_owner
--

CREATE TABLE public.lp_holders (
    id integer NOT NULL,
    token_id integer,
    lp_address character varying(42) DEFAULT ''::character varying,
    tag character varying(255) DEFAULT ''::character varying,
    value numeric DEFAULT 0,
    is_contract smallint DEFAULT 0,
    balance numeric DEFAULT 0,
    percent numeric DEFAULT 0,
    nft_list text DEFAULT ''::text,
    is_locked smallint DEFAULT 0
);


ALTER TABLE public.lp_holders OWNER TO basedrugchat_owner;

--
-- TOC entry 223 (class 1259 OID 49415)
-- Name: lp_holders_id_seq; Type: SEQUENCE; Schema: public; Owner: basedrugchat_owner
--

CREATE SEQUENCE public.lp_holders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lp_holders_id_seq OWNER TO basedrugchat_owner;

--
-- TOC entry 3426 (class 0 OID 0)
-- Dependencies: 223
-- Name: lp_holders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: basedrugchat_owner
--

ALTER SEQUENCE public.lp_holders_id_seq OWNED BY public.lp_holders.id;


--
-- TOC entry 216 (class 1259 OID 49323)
-- Name: pools; Type: TABLE; Schema: public; Owner: basedrugchat_owner
--

CREATE TABLE public.pools (
    id integer NOT NULL,
    pool character varying(42) NOT NULL,
    token0 character varying(42) NOT NULL,
    token1 character varying(42) NOT NULL
);


ALTER TABLE public.pools OWNER TO basedrugchat_owner;

--
-- TOC entry 215 (class 1259 OID 49322)
-- Name: pools_id_seq; Type: SEQUENCE; Schema: public; Owner: basedrugchat_owner
--

CREATE SEQUENCE public.pools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pools_id_seq OWNER TO basedrugchat_owner;

--
-- TOC entry 3427 (class 0 OID 0)
-- Dependencies: 215
-- Name: pools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: basedrugchat_owner
--

ALTER SEQUENCE public.pools_id_seq OWNED BY public.pools.id;


--
-- TOC entry 218 (class 1259 OID 49332)
-- Name: tokens; Type: TABLE; Schema: public; Owner: basedrugchat_owner
--

CREATE TABLE public.tokens (
    id integer NOT NULL,
    token_address character varying(42) NOT NULL,
    anti_whale_modifiable smallint DEFAULT 0,
    buy_tax numeric DEFAULT 0,
    can_take_back_ownership smallint DEFAULT 0,
    cannot_buy smallint DEFAULT 0,
    cannot_sell_all smallint DEFAULT 0,
    creator_address character varying(42) DEFAULT ''::character varying,
    creator_balance numeric DEFAULT 0,
    creator_percent numeric DEFAULT 0,
    external_call smallint DEFAULT 0,
    hidden_owner smallint DEFAULT 0,
    holder_count bigint DEFAULT 0,
    honeypot_with_same_creator smallint DEFAULT 0,
    is_anti_whale smallint DEFAULT 0,
    is_blacklisted smallint DEFAULT 0,
    is_honeypot smallint DEFAULT 0,
    is_in_dex smallint DEFAULT 0,
    is_mintable smallint DEFAULT 0,
    is_open_source smallint DEFAULT 0,
    is_proxy smallint DEFAULT 0,
    is_whitelisted smallint DEFAULT 0,
    lp_holder_count integer DEFAULT 0,
    lp_total_supply numeric DEFAULT 0,
    owner_address character varying(42) DEFAULT ''::character varying,
    owner_balance numeric DEFAULT 0,
    owner_change_balance numeric DEFAULT 0,
    owner_percent numeric DEFAULT 0,
    personal_slippage_modifiable smallint DEFAULT 0,
    selfdestruct smallint DEFAULT 0,
    sell_tax numeric DEFAULT 0,
    slippage_modifiable smallint DEFAULT 0,
    token_name character varying(255) DEFAULT ''::character varying,
    token_symbol character varying(255) DEFAULT ''::character varying,
    total_supply numeric DEFAULT 0,
    trading_cooldown integer DEFAULT 0,
    transfer_pausable smallint DEFAULT 0
);


ALTER TABLE public.tokens OWNER TO basedrugchat_owner;

--
-- TOC entry 217 (class 1259 OID 49331)
-- Name: tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: basedrugchat_owner
--

CREATE SEQUENCE public.tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tokens_id_seq OWNER TO basedrugchat_owner;

--
-- TOC entry 3428 (class 0 OID 0)
-- Dependencies: 217
-- Name: tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: basedrugchat_owner
--

ALTER SEQUENCE public.tokens_id_seq OWNED BY public.tokens.id;


--
-- TOC entry 3237 (class 2604 OID 49381)
-- Name: dexs id; Type: DEFAULT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.dexs ALTER COLUMN id SET DEFAULT nextval('public.dexs_id_seq'::regclass);


--
-- TOC entry 3242 (class 2604 OID 49399)
-- Name: holders id; Type: DEFAULT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.holders ALTER COLUMN id SET DEFAULT nextval('public.holders_id_seq'::regclass);


--
-- TOC entry 3249 (class 2604 OID 49419)
-- Name: lp_holders id; Type: DEFAULT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.lp_holders ALTER COLUMN id SET DEFAULT nextval('public.lp_holders_id_seq'::regclass);


--
-- TOC entry 3200 (class 2604 OID 49326)
-- Name: pools id; Type: DEFAULT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.pools ALTER COLUMN id SET DEFAULT nextval('public.pools_id_seq'::regclass);


--
-- TOC entry 3201 (class 2604 OID 49335)
-- Name: tokens id; Type: DEFAULT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.tokens ALTER COLUMN id SET DEFAULT nextval('public.tokens_id_seq'::regclass);


--
-- TOC entry 3267 (class 2606 OID 49389)
-- Name: dexs dexs_pkey; Type: CONSTRAINT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.dexs
    ADD CONSTRAINT dexs_pkey PRIMARY KEY (id);


--
-- TOC entry 3269 (class 2606 OID 49409)
-- Name: holders holders_pkey; Type: CONSTRAINT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.holders
    ADD CONSTRAINT holders_pkey PRIMARY KEY (id);


--
-- TOC entry 3271 (class 2606 OID 49431)
-- Name: lp_holders lp_holders_pkey; Type: CONSTRAINT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.lp_holders
    ADD CONSTRAINT lp_holders_pkey PRIMARY KEY (id);


--
-- TOC entry 3259 (class 2606 OID 49328)
-- Name: pools pools_pkey; Type: CONSTRAINT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.pools
    ADD CONSTRAINT pools_pkey PRIMARY KEY (id);


--
-- TOC entry 3261 (class 2606 OID 49330)
-- Name: pools pools_pool_key; Type: CONSTRAINT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.pools
    ADD CONSTRAINT pools_pool_key UNIQUE (pool);


--
-- TOC entry 3263 (class 2606 OID 49374)
-- Name: tokens tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3265 (class 2606 OID 49376)
-- Name: tokens tokens_token_address_key; Type: CONSTRAINT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_token_address_key UNIQUE (token_address);


--
-- TOC entry 3272 (class 2606 OID 49390)
-- Name: dexs dexs_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.dexs
    ADD CONSTRAINT dexs_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id);


--
-- TOC entry 3273 (class 2606 OID 49410)
-- Name: holders holders_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.holders
    ADD CONSTRAINT holders_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id);


--
-- TOC entry 3274 (class 2606 OID 49432)
-- Name: lp_holders lp_holders_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: basedrugchat_owner
--

ALTER TABLE ONLY public.lp_holders
    ADD CONSTRAINT lp_holders_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id);


--
-- TOC entry 2059 (class 826 OID 49321)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2058 (class 826 OID 49320)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2024-04-25 09:17:09

--
-- PostgreSQL database dump complete
--

