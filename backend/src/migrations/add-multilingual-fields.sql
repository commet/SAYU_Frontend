-- 다국어 지원을 위한 global_venues 테이블 확장
-- 모든 텍스트 필드에 한글/영어 버전 추가

-- Step 1: 한글 필드 추가 (해외 데이터용)
ALTER TABLE global_venues
ADD COLUMN IF NOT EXISTS name_ko VARCHAR(255),
ADD COLUMN IF NOT EXISTS city_ko VARCHAR(100),
ADD COLUMN IF NOT EXISTS address_ko TEXT,
ADD COLUMN IF NOT EXISTS description_ko TEXT,
ADD COLUMN IF NOT EXISTS admission_info_ko TEXT;

-- Step 2: 영어 필드 보완 (이미 일부 존재)
ALTER TABLE global_venues
ADD COLUMN IF NOT EXISTS address_en TEXT,
ADD COLUMN IF NOT EXISTS admission_info_en TEXT;

-- Step 3: 도시명 번역 테이블 생성
CREATE TABLE IF NOT EXISTS city_translations (
    id SERIAL PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    city_original VARCHAR(100) NOT NULL,
    city_ko VARCHAR(100),
    city_en VARCHAR(100),
    city_ja VARCHAR(100), -- 일본어 (선택)
    city_zh VARCHAR(100), -- 중국어 (선택)
    province VARCHAR(100), -- 도/주
    province_ko VARCHAR(100),
    province_en VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country, city_original)
);

-- Step 4: 주요 도시 번역 데이터 삽입
INSERT INTO city_translations (country, city_original, city_ko, city_en, province, province_ko, province_en) VALUES
-- 한국 도시
('South Korea', '서울', '서울', 'Seoul', NULL, NULL, NULL),
('South Korea', '부산', '부산', 'Busan', NULL, NULL, NULL),
('South Korea', '대구', '대구', 'Daegu', NULL, NULL, NULL),
('South Korea', '인천', '인천', 'Incheon', NULL, NULL, NULL),
('South Korea', '광주', '광주', 'Gwangju', NULL, NULL, NULL),
('South Korea', '대전', '대전', 'Daejeon', NULL, NULL, NULL),
('South Korea', '울산', '울산', 'Ulsan', NULL, NULL, NULL),
('South Korea', '제주', '제주', 'Jeju', '제주도', '제주도', 'Jeju Island'),
('South Korea', '수원', '수원', 'Suwon', '경기도', '경기도', 'Gyeonggi-do'),
('South Korea', '성남', '성남', 'Seongnam', '경기도', '경기도', 'Gyeonggi-do'),
('South Korea', '용인', '용인', 'Yongin', '경기도', '경기도', 'Gyeonggi-do'),
('South Korea', '고양', '고양', 'Goyang', '경기도', '경기도', 'Gyeonggi-do'),
('South Korea', '창원', '창원', 'Changwon', '경상남도', '경상남도', 'Gyeongsangnam-do'),
('South Korea', '청주', '청주', 'Cheongju', '충청북도', '충청북도', 'Chungcheongbuk-do'),
('South Korea', '전주', '전주', 'Jeonju', '전라북도', '전라북도', 'Jeollabuk-do'),
('South Korea', '천안', '천안', 'Cheonan', '충청남도', '충청남도', 'Chungcheongnam-do'),
('South Korea', '포항', '포항', 'Pohang', '경상북도', '경상북도', 'Gyeongsangbuk-do'),
('South Korea', '김해', '김해', 'Gimhae', '경상남도', '경상남도', 'Gyeongsangnam-do'),
('South Korea', '원주', '원주', 'Wonju', '강원도', '강원도', 'Gangwon-do'),
('South Korea', '춘천', '춘천', 'Chuncheon', '강원도', '강원도', 'Gangwon-do'),
('South Korea', '강릉', '강릉', 'Gangneung', '강원도', '강원도', 'Gangwon-do'),
('South Korea', '여수', '여수', 'Yeosu', '전라남도', '전라남도', 'Jeollanam-do'),
('South Korea', '순천', '순천', 'Suncheon', '전라남도', '전라남도', 'Jeollanam-do'),
('South Korea', '목포', '목포', 'Mokpo', '전라남도', '전라남도', 'Jeollanam-do'),

-- 미국 도시
('United States', 'New York', '뉴욕', 'New York', 'New York', '뉴욕주', 'New York'),
('United States', 'Los Angeles', '로스앤젤레스', 'Los Angeles', 'California', '캘리포니아주', 'California'),
('United States', 'Chicago', '시카고', 'Chicago', 'Illinois', '일리노이주', 'Illinois'),
('United States', 'Houston', '휴스턴', 'Houston', 'Texas', '텍사스주', 'Texas'),
('United States', 'Philadelphia', '필라델피아', 'Philadelphia', 'Pennsylvania', '펜실베이니아주', 'Pennsylvania'),
('United States', 'San Francisco', '샌프란시스코', 'San Francisco', 'California', '캘리포니아주', 'California'),
('United States', 'Boston', '보스턴', 'Boston', 'Massachusetts', '매사추세츠주', 'Massachusetts'),
('United States', 'Seattle', '시애틀', 'Seattle', 'Washington', '워싱턴주', 'Washington'),
('United States', 'Miami', '마이애미', 'Miami', 'Florida', '플로리다주', 'Florida'),
('United States', 'Washington', '워싱턴 D.C.', 'Washington D.C.', NULL, NULL, NULL),

-- 일본 도시
('Japan', 'Tokyo', '도쿄', 'Tokyo', NULL, NULL, NULL),
('Japan', 'Osaka', '오사카', 'Osaka', NULL, NULL, NULL),
('Japan', 'Kyoto', '교토', 'Kyoto', NULL, NULL, NULL),
('Japan', 'Yokohama', '요코하마', 'Yokohama', 'Kanagawa', '가나가와현', 'Kanagawa'),
('Japan', 'Nagoya', '나고야', 'Nagoya', 'Aichi', '아이치현', 'Aichi'),
('Japan', 'Kobe', '고베', 'Kobe', 'Hyogo', '효고현', 'Hyogo'),
('Japan', 'Fukuoka', '후쿠오카', 'Fukuoka', NULL, NULL, NULL),
('Japan', 'Sapporo', '삿포로', 'Sapporo', 'Hokkaido', '홋카이도', 'Hokkaido'),

-- 중국 도시
('China', 'Beijing', '베이징', 'Beijing', NULL, NULL, NULL),
('China', 'Shanghai', '상하이', 'Shanghai', NULL, NULL, NULL),
('China', 'Guangzhou', '광저우', 'Guangzhou', 'Guangdong', '광둥성', 'Guangdong'),
('China', 'Shenzhen', '선전', 'Shenzhen', 'Guangdong', '광둥성', 'Guangdong'),
('China', 'Chengdu', '청두', 'Chengdu', 'Sichuan', '쓰촨성', 'Sichuan'),
('China', 'Hangzhou', '항저우', 'Hangzhou', 'Zhejiang', '저장성', 'Zhejiang'),
('China', 'Wuhan', '우한', 'Wuhan', 'Hubei', '후베이성', 'Hubei'),
('China', 'Xian', '시안', 'Xian', 'Shaanxi', '산시성', 'Shaanxi'),

-- 유럽 도시
('United Kingdom', 'London', '런던', 'London', 'England', '잉글랜드', 'England'),
('United Kingdom', 'Manchester', '맨체스터', 'Manchester', 'England', '잉글랜드', 'England'),
('United Kingdom', 'Birmingham', '버밍엄', 'Birmingham', 'England', '잉글랜드', 'England'),
('United Kingdom', 'Edinburgh', '에든버러', 'Edinburgh', 'Scotland', '스코틀랜드', 'Scotland'),
('United Kingdom', 'Glasgow', '글래스고', 'Glasgow', 'Scotland', '스코틀랜드', 'Scotland'),

('France', 'Paris', '파리', 'Paris', 'Île-de-France', '일드프랑스', 'Île-de-France'),
('France', 'Lyon', '리옹', 'Lyon', 'Auvergne-Rhône-Alpes', '오베르뉴론알프', 'Auvergne-Rhône-Alpes'),
('France', 'Marseille', '마르세유', 'Marseille', 'Provence-Alpes-Côte d''Azur', '프로방스알프코트다쥐르', 'Provence-Alpes-Côte d''Azur'),
('France', 'Nice', '니스', 'Nice', 'Provence-Alpes-Côte d''Azur', '프로방스알프코트다쥐르', 'Provence-Alpes-Côte d''Azur'),

('Germany', 'Berlin', '베를린', 'Berlin', NULL, NULL, NULL),
('Germany', 'Munich', '뮌헨', 'Munich', 'Bavaria', '바이에른주', 'Bavaria'),
('Germany', 'Frankfurt', '프랑크푸르트', 'Frankfurt', 'Hesse', '헤센주', 'Hesse'),
('Germany', 'Hamburg', '함부르크', 'Hamburg', NULL, NULL, NULL),
('Germany', 'Cologne', '쾰른', 'Cologne', 'North Rhine-Westphalia', '노르트라인베스트팔렌주', 'North Rhine-Westphalia'),

('Italy', 'Rome', '로마', 'Rome', 'Lazio', '라치오주', 'Lazio'),
('Italy', 'Milan', '밀라노', 'Milan', 'Lombardy', '롬바르디아주', 'Lombardy'),
('Italy', 'Venice', '베네치아', 'Venice', 'Veneto', '베네토주', 'Veneto'),
('Italy', 'Florence', '피렌체', 'Florence', 'Tuscany', '토스카나주', 'Tuscany'),
('Italy', 'Naples', '나폴리', 'Naples', 'Campania', '캄파니아주', 'Campania'),

('Spain', 'Madrid', '마드리드', 'Madrid', NULL, NULL, NULL),
('Spain', 'Barcelona', '바르셀로나', 'Barcelona', 'Catalonia', '카탈루냐', 'Catalonia'),
('Spain', 'Valencia', '발렌시아', 'Valencia', NULL, NULL, NULL),
('Spain', 'Seville', '세비야', 'Seville', 'Andalusia', '안달루시아', 'Andalusia'),
('Spain', 'Bilbao', '빌바오', 'Bilbao', 'Basque Country', '바스크', 'Basque Country'),

('Netherlands', 'Amsterdam', '암스테르담', 'Amsterdam', 'North Holland', '북홀란드', 'North Holland'),
('Netherlands', 'Rotterdam', '로테르담', 'Rotterdam', 'South Holland', '남홀란드', 'South Holland'),
('Netherlands', 'The Hague', '헤이그', 'The Hague', 'South Holland', '남홀란드', 'South Holland'),
('Netherlands', 'Utrecht', '위트레흐트', 'Utrecht', NULL, NULL, NULL),

-- 아시아 기타
('Hong Kong', 'Hong Kong', '홍콩', 'Hong Kong', NULL, NULL, NULL),
('Singapore', 'Singapore', '싱가포르', 'Singapore', NULL, NULL, NULL),
('Thailand', 'Bangkok', '방콕', 'Bangkok', NULL, NULL, NULL),
('India', 'New Delhi', '뉴델리', 'New Delhi', NULL, NULL, NULL),
('India', 'Mumbai', '뭄바이', 'Mumbai', 'Maharashtra', '마하라슈트라', 'Maharashtra'),

-- 기타 주요 도시
('Australia', 'Sydney', '시드니', 'Sydney', 'New South Wales', '뉴사우스웨일스', 'New South Wales'),
('Australia', 'Melbourne', '멜버른', 'Melbourne', 'Victoria', '빅토리아', 'Victoria'),
('Canada', 'Toronto', '토론토', 'Toronto', 'Ontario', '온타리오', 'Ontario'),
('Canada', 'Vancouver', '밴쿠버', 'Vancouver', 'British Columbia', '브리티시컬럼비아', 'British Columbia'),
('Brazil', 'São Paulo', '상파울루', 'São Paulo', NULL, NULL, NULL),
('Brazil', 'Rio de Janeiro', '리우데자네이루', 'Rio de Janeiro', NULL, NULL, NULL),
('Mexico', 'Mexico City', '멕시코시티', 'Mexico City', NULL, NULL, NULL),
('Russia', 'Moscow', '모스크바', 'Moscow', NULL, NULL, NULL),
('Russia', 'St. Petersburg', '상트페테르부르크', 'St. Petersburg', NULL, NULL, NULL)
ON CONFLICT (country, city_original) DO UPDATE
SET city_ko = EXCLUDED.city_ko,
    city_en = EXCLUDED.city_en,
    province = EXCLUDED.province,
    province_ko = EXCLUDED.province_ko,
    province_en = EXCLUDED.province_en,
    updated_at = CURRENT_TIMESTAMP;

-- Step 5: 기존 데이터 업데이트 함수
CREATE OR REPLACE FUNCTION update_venue_translations() RETURNS void AS $$
BEGIN
    -- 한국 venue의 영어 도시명 업데이트
    UPDATE global_venues v
    SET city_en = ct.city_en,
        city_ko = ct.city_ko
    FROM city_translations ct
    WHERE v.country = ct.country 
    AND v.city = ct.city_original;
    
    -- 해외 venue의 한글 도시명 업데이트
    UPDATE global_venues v
    SET city_ko = ct.city_ko
    FROM city_translations ct
    WHERE v.country = ct.country 
    AND v.city = ct.city_en;
    
    -- 한국 venue의 영어 이름이 없는 경우 name을 복사
    UPDATE global_venues
    SET name_en = name
    WHERE country = 'South Korea' 
    AND name_en IS NULL;
    
    -- 해외 venue의 기본 이름을 영어로 간주하고 name_en에 복사
    UPDATE global_venues
    SET name_en = name
    WHERE country != 'South Korea' 
    AND name_en IS NULL;
    
    RAISE NOTICE '번역 데이터 업데이트 완료';
END;
$$ LANGUAGE plpgsql;

-- 함수 실행
SELECT update_venue_translations();

-- Step 6: 번역 상태 확인 뷰
CREATE OR REPLACE VIEW venue_translation_status AS
SELECT 
    country,
    COUNT(*) as total_venues,
    COUNT(name_en) as has_name_en,
    COUNT(name_ko) as has_name_ko,
    COUNT(city_en) as has_city_en,
    COUNT(city_ko) as has_city_ko,
    ROUND(COUNT(name_en)::numeric / COUNT(*)::numeric * 100, 2) as name_en_coverage,
    ROUND(COUNT(name_ko)::numeric / COUNT(*)::numeric * 100, 2) as name_ko_coverage
FROM global_venues
GROUP BY country
ORDER BY total_venues DESC;

-- Step 7: 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_global_venues_city_ko ON global_venues(city_ko);
CREATE INDEX IF NOT EXISTS idx_global_venues_city_en ON global_venues(city_en);
CREATE INDEX IF NOT EXISTS idx_global_venues_name_ko ON global_venues(name_ko);

-- 확인
SELECT * FROM venue_translation_status LIMIT 10;