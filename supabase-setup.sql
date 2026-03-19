-- 1. 사용자(사업자) 정보 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  corp_num TEXT NOT NULL,
  corp_name TEXT NOT NULL,
  ceo_name TEXT NOT NULL,
  biz_type TEXT,
  biz_class TEXT,
  address TEXT,
  popbill_id TEXT,
  cert_registered BOOLEAN DEFAULT FALSE,
  preferred_input_mode TEXT DEFAULT 'card',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 거래처 목록 테이블
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  corp_name TEXT NOT NULL,
  corp_num TEXT NOT NULL,
  ceo_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 거래처 조회 성능 향상을 위한 인덱스
CREATE INDEX idx_clients_user_id ON clients(user_id);

-- 3. 발행된 세금계산서 상세 내역 테이블
CREATE TABLE taxinvoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  write_date DATE NOT NULL,
  supply_cost BIGINT NOT NULL,
  tax BIGINT NOT NULL,
  total_amount BIGINT GENERATED ALWAYS AS (supply_cost + tax) STORED,
  remark TEXT,
  receiver_corp_name TEXT NOT NULL,
  receiver_corp_num TEXT NOT NULL,
  receiver_ceo_name TEXT,
  receiver_email TEXT,
  popbill_mgtkey TEXT UNIQUE,
  nts_confirm_num TEXT,
  send_state TEXT DEFAULT '전송대기',
  send_at TIMESTAMPTZ,
  input_mode TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 발행 내역 조회 성능 향상을 위한 인덱스
CREATE INDEX idx_taxinvoices_user_date ON taxinvoices(user_id, write_date);

-- 4. 로우 레벨 보안(RLS) 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxinvoices ENABLE ROW LEVEL SECURITY;

-- 5. 보안 정책 설정 (자신의 데이터만 접근 가능)
CREATE POLICY "본인만" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "본인만" ON clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "본인만" ON taxinvoices FOR ALL USING (auth.uid() = user_id);
