/**
 * 각 성격 유형별 큐레이션된 작품 이미지 URL
 * 모든 이미지는 Wikimedia Commons에서 가져온 Public Domain 작품들
 */

export const CURATED_ARTWORK_URLS: Record<string, string[]> = {
  // SREF 유형 - 따뜻한 인간관계와 공동체 (르누아르, 카사트, 모리소, 드가, 마네)
  'SREF': [
    // 르누아르 - 사회적 모임과 즐거움 (3개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Pierre-Auguste_Renoir%2C_Le_Moulin_de_la_Galette.jpg/1280px-Pierre-Auguste_Renoir%2C_Le_Moulin_de_la_Galette.jpg', // 물랭 드 라 갈레트
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg/1280px-Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg', // 보트 파티 점심
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Auguste_Renoir_-_Young_Girls_at_the_Piano_-_Google_Art_Project.jpg/800px-Auguste_Renoir_-_Young_Girls_at_the_Piano_-_Google_Art_Project.jpg', // 피아노 치는 소녀들

    // 카사트 - 모성애와 가족 관계 (3개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Mary_Cassatt_-_The_Child%27s_Bath_-_Google_Art_Project.jpg/800px-Mary_Cassatt_-_The_Child%27s_Bath_-_Google_Art_Project.jpg', // 아이 목욕
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Mary_Cassatt_-_The_Boating_Party_-_Google_Art_Project.jpg/1280px-Mary_Cassatt_-_The_Boating_Party_-_Google_Art_Project.jpg', // 보트 나들이
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Mary_Cassatt_-_Mother_and_Child_%28The_Oval_Mirror%29.jpg/800px-Mary_Cassatt_-_Mother_and_Child_%28The_Oval_Mirror%29.jpg', // 어머니와 아이

    // 드가 - 일상적 친밀감 (3개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Edgar_Degas_-_The_Dance_Class_-_Google_Art_Project.jpg/1280px-Edgar_Degas_-_The_Dance_Class_-_Google_Art_Project.jpg', // 발레 수업
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Edgar_Degas_-_In_a_Caf%C3%A9_-_Google_Art_Project_2.jpg/1024px-Edgar_Degas_-_In_a_Caf%C3%A9_-_Google_Art_Project_2.jpg', // 카페에서
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Edgar_Degas_-_Women_Combing_Their_Hair_-_Google_Art_Project.jpg/800px-Edgar_Degas_-_Women_Combing_Their_Hair_-_Google_Art_Project.jpg', // 머리 빗는 여인들

    // 마네 - 사회적 상호작용 (2개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Edouard_Manet_-_Luncheon_on_the_Grass_-_Google_Art_Project.jpg/1280px-Edouard_Manet_-_Luncheon_on_the_Grass_-_Google_Art_Project.jpg', // 풀밭 위의 점심
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Manet%2C_Edouard_-_Bar_at_the_Folies-Berg%C3%A8re_%28Courtauld_Institute%29.jpg/1280px-Manet%2C_Edouard_-_Bar_at_the_Folies-Berg%C3%A8re_%28Courtauld_Institute%29.jpg', // 폴리 베르제르의 바

    // 베르메르 - 조용한 일상의 친밀감 (1개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Jan_Vermeer_van_Delft_014.jpg/800px-Jan_Vermeer_van_Delft_014.jpg' // 우유 따르는 여인
  ],

  // SAMC 유형 - 강렬한 감정 표현과 개성적 스타일 (반 고흐, 뭉크, 고갱, 툴루즈-로트렉, 세잔)
  'SAMC': [
    // 반 고흐 - 열정적 색채와 감정 (3개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg', // 별이 빛나는 밤
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg/800px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg', // 자화상
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Vincent_Willem_van_Gogh_128.jpg/800px-Vincent_Willem_van_Gogh_128.jpg', // 해바라기

    // 뭉크 - 내적 감정의 표현 (3개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg', // 절규
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/The_Scream.jpg/800px-The_Scream.jpg', // 절규 (다른 버전)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Edvard_Munch_-_The_Kiss_-_Google_Art_Project.jpg/800px-Edvard_Munch_-_The_Kiss_-_Google_Art_Project.jpg', // 키스

    // 고갱 - 원시적이고 강렬한 색감 (2개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Paul_Gauguin_-_When_Will_You_Marry_-_Google_Art_Project.jpg/1280px-Paul_Gauguin_-_When_Will_You_Marry_-_Google_Art_Project.jpg', // 언제 결혼할래?
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Paul_Gauguin_-_Vision_After_the_Sermon_%28Jacob_Wrestling_with_the_Angel%29_-_Google_Art_Project.jpg/1280px-Paul_Gauguin_-_Vision_After_the_Sermon_%28Jacob_Wrestling_with_the_Angel%29_-_Google_Art_Project.jpg', // 설교 후의 환상

    // 툴루즈-로트렉 - 생동감 있는 표현 (2개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Henri_de_Toulouse-Lautrec_-_At_the_Moulin_Rouge_-_Google_Art_Project.jpg/1280px-Henri_de_Toulouse-Lautrec_-_At_the_Moulin_Rouge_-_Google_Art_Project.jpg', // 물랭 루즈에서
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Lautrec_moulin_rouge%2C_la_goulue_%28poster%29_1891.jpg/800px-Lautrec_moulin_rouge%2C_la_goulue_%28poster%29_1891.jpg', // 물랭 루즈 포스터

    // 세잔 - 구조적 혁신과 개성 (2개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Paul_C%C3%A9zanne_-_The_Card_Players_-_Google_Art_Project.jpg/1280px-Paul_C%C3%A9zanne_-_The_Card_Players_-_Google_Art_Project.jpg', // 카드 놀이하는 사람들
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Paul_C%C3%A9zanne_-_Mont_Sainte-Victoire_-_Google_Art_Project.jpg/1280px-Paul_C%C3%A9zanne_-_Mont_Sainte-Victoire_-_Google_Art_Project.jpg' // 생트 빅투아르 산
  ],

  // LRMC 유형 - 평온한 자연과 조화로운 풍경 (모네, 르누아르, 시슬레, 피사로, 코로)
  'LRMC': [
    // 모네 - 자연의 순간 포착 (3개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg', // 수련
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/1280px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg', // 인상, 해돋이
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Claude_Monet_-_Woman_with_a_Parasol_-_Madame_Monet_and_Her_Son_-_Google_Art_Project.jpg/800px-Claude_Monet_-_Woman_with_a_Parasol_-_Madame_Monet_and_Her_Son_-_Google_Art_Project.jpg', // 양산을 든 여인

    // 르누아르 - 자연 속 평온함 (3개)  
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pierre-Auguste_Renoir_-_Two_Sisters_%28On_the_Terrace%29.jpg/800px-Pierre-Auguste_Renoir_-_Two_Sisters_%28On_the_Terrace%29.jpg', // 테라스의 두 자매
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Renoir_-_La_Balan%C3%A7oire.jpg/800px-Renoir_-_La_Balan%C3%A7oire.jpg', // 그네
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Pierre-Auguste_Renoir_-_Path_Leading_Through_Tall_Grass_-_Google_Art_Project.jpg/1280px-Pierre-Auguste_Renoir_-_Path_Leading_Through_Tall_Grass_-_Google_Art_Project.jpg', // 긴 풀 사이의 길

    // 시슬레 - 고요한 풍경 (2개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Alfred_Sisley_-_Snow_at_Louveciennes_-_Google_Art_Project.jpg/1280px-Alfred_Sisley_-_Snow_at_Louveciennes_-_Google_Art_Project.jpg', // 루브시엔의 눈
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Alfred_Sisley_-_The_Bridge_at_Villeneuve-la-Garenne_-_Google_Art_Project.jpg/1280px-Alfred_Sisley_-_The_Bridge_at_Villeneuve-la-Garenne_-_Google_Art_Project.jpg', // 빌뢰브 라 가렌의 다리

    // 피사로 - 전원 생활의 평화 (2개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Camille_Pissarro_-_The_Hay_Harvest%2C_Eragny_-_Google_Art_Project.jpg/1280px-Camille_Pissarro_-_The_Hay_Harvest%2C_Eragny_-_Google_Art_Project.jpg', // 건초 수확
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camille_Pissarro_-_Apple_Harvest_-_Google_Art_Project.jpg/1280px-Camille_Pissarro_-_Apple_Harvest_-_Google_Art_Project.jpg', // 사과 수확

    // 코로 - 목가적 자연 (2개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Jean-Baptiste-Camille_Corot_-_The_Bridge_at_Narni_-_Google_Art_Project.jpg/1280px-Jean-Baptiste-Camille_Corot_-_The_Bridge_at_Narni_-_Google_Art_Project.jpg', // 나르니의 다리
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Jean-Baptiste-Camille_Corot_-_Ville-d%27Avray_-_Google_Art_Project.jpg/1280px-Jean-Baptiste-Camille_Corot_-_Ville-d%27Avray_-_Google_Art_Project.jpg' // 빌 다브레
  ],

  // LAEF 유형 - 창의적 탐구와 독창적 표현 (세라, 다빈치, 베르메르, 호쿠사이, 피카소)
  'LAEF': [
    // 세라 - 점묘법의 혁신 (3개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/1280px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg', // 그랑드자트 섬의 일요일 오후
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Georges_Seurat_-_Bathers_at_Asni%C3%A8res_-_Google_Art_Project.jpg/1280px-Georges_Seurat_-_Bathers_at_Asni%C3%A8res_-_Google_Art_Project.jpg', // 아스니에르에서의 목욕
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Georges_Seurat_-_The_Circus_-_Google_Art_Project.jpg/800px-Georges_Seurat_-_The_Circus_-_Google_Art_Project.jpg', // 서커스

    // 다빈치 - 르네상스의 천재성 (2개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg', // 모나리자
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Leonardo_da_Vinci_-_Salvator_Mundi_-_Google_Art_Project.jpg/800px-Leonardo_da_Vinci_-_Salvator_Mundi_-_Google_Art_Project.jpg', // 살바토르 문디

    // 베르메르 - 빛의 마술사 (2개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg', // 진주 귀걸이를 한 소녀
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Jan_Vermeer_van_Delft_014.jpg/800px-Jan_Vermeer_van_Delft_014.jpg', // 우유 따르는 여인

    // 호쿠사이 - 동양적 독창성 (2개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/The_Great_Wave_off_Kanagawa.jpg/1280px-The_Great_Wave_off_Kanagawa.jpg', // 가나가와 앞바다의 거대한 파도
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Hokusai-fuji-2.jpg/1280px-Hokusai-fuji-2.jpg', // 후지산 36경

    // 피카소 - 큐비즘의 혁신 (2개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Les_Demoiselles_d%27Avignon.jpg/1024px-Les_Demoiselles_d%27Avignon.jpg', // 아비뇽의 처녀들
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Pablo_Picasso%2C_1907%2C_Self-Portrait.jpg/800px-Pablo_Picasso%2C_1907%2C_Self-Portrait.jpg', // 자화상

    // 보티첼리 - 고전적 아름다움의 재해석 (1개)
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg' // 비너스의 탄생
  ],

  // 나머지 유형들은 위 4개 유형의 이미지를 재사용
  'WRPY': [], // SAMC로 매핑
  'WRFT': [], // SAMC로 매핑  
  'WRFU': [], // SAMC로 매핑
  'DRCU': [], // LRMC로 매핑
  'DRCY': [], // LRMC로 매핑
  'DRFT': [], // LRMC로 매핑
  'LNFT': [], // LAEF로 매핑
  'LNFU': [], // LAEF로 매핑
  'LNPY': [], // LAEF로 매핑
  'LNCU': [], // LAEF로 매핑
  'SFPY': [], // SREF로 매핑
  'SRFT': [], // SREF로 매핑
  'SRPY': [], // SREF로 매핑
  'WREU': [], // SAMC로 매핑
  'DRPU': []  // LRMC로 매핑
};

// 유형별 이미지 가져오기 함수
export function getCuratedArtworkUrls(userType: string): string[] {
  // APT 타입을 SAYU 타입으로 매핑
  const APT_TO_SAYU_MAPPING: Record<string, string> = {
    'SREF': 'SREF',
    'SRFT': 'SREF',
    'SRPY': 'SREF',
    'SFPY': 'SREF',
    'WRPY': 'SAMC',
    'WRFT': 'SAMC',
    'WRFU': 'SAMC',
    'WREU': 'SAMC',
    'DRCU': 'LRMC',
    'DRCY': 'LRMC',
    'DRFT': 'LRMC',
    'DRPU': 'LRMC',
    'LNFT': 'LAEF',
    'LNFU': 'LAEF',
    'LNPY': 'LAEF',
    'LNCU': 'LAEF'
  };

  const sayuType = APT_TO_SAYU_MAPPING[userType] || 'SREF';
  return CURATED_ARTWORK_URLS[sayuType] || CURATED_ARTWORK_URLS['SREF'];
}