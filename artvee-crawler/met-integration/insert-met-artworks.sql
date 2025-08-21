-- SAYU MET Chicago 컬렉션 삽입
-- 발견된 4개 MET 작품을 artwork 테이블에 추가

INSERT INTO artwork (
  id,
  title,
  artist,
  year,
  medium,
  description,
  source,
  source_url,
  is_public_domain,
  full,
  sayu_type,
  met_object_id,
  department,
  classification,
  culture,
  period,
  credit_line,
  accession_number,
  tags,
  created_at,
  updated_at,
  is_active
) VALUES
    (
      'met-chicago-205641',
      'Scapin',
      'Bow Porcelain Factory',
      1750,
      'Soft-paste porcelain',
      'Scapin',
      'Metropolitan Museum of Art',
      'https://www.metmuseum.org/art/collection/search/205641',
      true,
      '{"url":"https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752840033/sayu/met-artworks/met-chicago-205641.jpg","width":null,"height":null}',
      'SAEF',
      205641,
      'European Sculpture and Decorative Arts',
      'Ceramics-Porcelain',
      NULL,
      NULL,
      'Bequest of Irwin Untermyer, 1973',
      '1974.28.138',
      '["Masks","Men"]',
      NOW(),
      NOW(),
      true
    ),
    (
      'met-chicago-57854',
      'The Mrawing manual: The Evergreens (Ehon Tokiwagusa) 絵本常盤草',
      'Nishikawa Sukenobu 西川祐信',
      1731,
      'One volume, black and white, twenty-five double-page sheets; ink on paper',
      'The Mrawing manual: The Evergreens (Ehon Tokiwagusa) 絵本常盤草',
      'Metropolitan Museum of Art',
      'https://www.metmuseum.org/art/collection/search/57854',
      true,
      '{"url":"https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752840033/sayu/met-artworks/met-chicago-57854.jpg","width":null,"height":null}',
      'SAEF',
      57854,
      'Asian Art',
      'Illustrated Books',
      'Japan',
      'Edo period (1615–1868)',
      'Gift of Mrs. Henry J. Bernheim, 1945',
      'JIB163',
      '["Women"]',
      NOW(),
      NOW(),
      true
    );

-- 삽입 확인 쿼리
SELECT 
  id, 
  title, 
  artist, 
  year,
  source,
  sayu_type,
  met_object_id
FROM artwork 
WHERE source = 'Metropolitan Museum of Art'
ORDER BY met_object_id;