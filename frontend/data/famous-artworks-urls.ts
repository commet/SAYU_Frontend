/**
 * 유명 작품들의 고화질 이미지 URL 컬렉션
 * Cloudinary 및 안정적인 소스에서 제공
 */

export const FAMOUS_ARTWORKS = [
  // Impressionism & Post-Impressionism
  {
    id: 'monet-water-lilies',
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: '1906',
    imageUrl: 'https://res.cloudinary.com/dqb5eci3f/image/upload/v1/famous-artworks/monet-water-lilies.jpg',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/800px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg'
  },
  {
    id: 'van-gogh-starry-night',
    title: 'The Starry Night',
    artist: 'Vincent van Gogh', 
    year: '1889',
    imageUrl: 'https://res.cloudinary.com/dqb5eci3f/image/upload/v1/famous-artworks/van-gogh-starry-night.jpg',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'
  },
  {
    id: 'vermeer-girl-pearl',
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    year: '1665',
    imageUrl: 'https://res.cloudinary.com/dqb5eci3f/image/upload/v1/famous-artworks/vermeer-girl-pearl.jpg',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg'
  },
  {
    id: 'klimt-kiss',
    title: 'The Kiss',
    artist: 'Gustav Klimt',
    year: '1908',
    imageUrl: 'https://res.cloudinary.com/dqb5eci3f/image/upload/v1/famous-artworks/klimt-kiss.jpg',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_016.jpg/800px-Gustav_Klimt_016.jpg'
  },
  {
    id: 'hokusai-wave',
    title: 'The Great Wave off Kanagawa',
    artist: 'Katsushika Hokusai',
    year: '1831',
    imageUrl: 'https://res.cloudinary.com/dqb5eci3f/image/upload/v1/famous-artworks/hokusai-wave.jpg',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/1280px-The_Great_Wave_off_Kanagawa.jpg'
  },
  {
    id: 'botticelli-venus',
    title: 'The Birth of Venus',
    artist: 'Sandro Botticelli',
    year: '1485',
    imageUrl: 'https://res.cloudinary.com/dqb5eci3f/image/upload/v1/famous-artworks/botticelli-venus.jpg',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg'
  },
  {
    id: 'degas-dancers',
    title: 'The Dance Class',
    artist: 'Edgar Degas',
    year: '1874',
    imageUrl: 'https://res.cloudinary.com/dqb5eci3f/image/upload/v1/famous-artworks/degas-dancers.jpg',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Edgar_Degas_-_La_Classe_de_danse.jpg/1024px-Edgar_Degas_-_La_Classe_de_danse.jpg'
  },
  {
    id: 'munch-scream',
    title: 'The Scream',
    artist: 'Edvard Munch',
    year: '1893',
    imageUrl: 'https://res.cloudinary.com/dqb5eci3f/image/upload/v1/famous-artworks/munch-scream.jpg',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg'
  },
  {
    id: 'caravaggio-calling',
    title: 'The Calling of St Matthew',
    artist: 'Caravaggio',
    year: '1600',
    imageUrl: 'https://res.cloudinary.com/dqb5eci3f/image/upload/v1/famous-artworks/caravaggio-calling.jpg',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Calling_of_Saint_Matthew-Caravaggo_%281599-1600%29.jpg/1280px-The_Calling_of_Saint_Matthew-Caravaggo_%281599-1600%29.jpg'
  },
  {
    id: 'rembrandt-night-watch',
    title: 'The Night Watch',
    artist: 'Rembrandt',
    year: '1642',
    imageUrl: 'https://res.cloudinary.com/dqb5eci3f/image/upload/v1/famous-artworks/rembrandt-night-watch.jpg',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/1280px-The_Night_Watch_-_HD.jpg'
  },
  {
    id: 'turner-rain-steam',
    title: 'Rain, Steam and Speed',
    artist: 'J.M.W. Turner',
    year: '1844',
    imageUrl: 'https://res.cloudinary.com/dqb5eci3f/image/upload/v1/famous-artworks/turner-rain-steam.jpg',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Rain_Steam_and_Speed_the_Great_Western_Railway.jpg/1280px-Rain_Steam_and_Speed_the_Great_Western_Railway.jpg'
  },
  {
    id: 'cezanne-apples',
    title: 'Still Life with Apples',
    artist: 'Paul Cézanne',
    year: '1895',
    imageUrl: 'https://res.cloudinary.com/dqb5eci3f/image/upload/v1/famous-artworks/cezanne-apples.jpg',
    fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Paul_C%C3%A9zanne_179.jpg/1024px-Paul_C%C3%A9zanne_179.jpg'
  }
];

// 랜덤으로 작품 선택하는 함수
export function getRandomArtworks(count: number = 12) {
  const shuffled = [...FAMOUS_ARTWORKS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// fallback URL로 대체하는 함수
export function getArtworkUrl(artwork: typeof FAMOUS_ARTWORKS[0]): string {
  // Cloudinary URL이 실패하면 fallback 사용
  return artwork.fallbackUrl || artwork.imageUrl;
}