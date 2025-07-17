// 유명 작가 리스트 (Met Museum API에서 사용하는 정확한 이름)
const FAMOUS_ARTISTS = [
  // 인상주의
  'Claude Monet',
  'Pierre-Auguste Renoir', 
  'Edgar Degas',
  'Édouard Manet',
  'Camille Pissarro',
  'Paul Cézanne',
  'Berthe Morisot',
  'Mary Cassatt',
  
  // 후기 인상주의
  'Vincent van Gogh',
  'Paul Gauguin',
  'Georges Seurat',
  'Henri de Toulouse-Lautrec',
  
  // 르네상스
  'Leonardo da Vinci',
  'Michelangelo Buonarroti',
  'Raphael',
  'Sandro Botticelli',
  'Titian',
  'Albrecht Dürer',
  
  // 바로크
  'Rembrandt van Rijn',
  'Johannes Vermeer',
  'Peter Paul Rubens',
  'Caravaggio',
  'Diego Velázquez',
  
  // 현대 미술
  'Pablo Picasso',
  'Henri Matisse',
  'Gustav Klimt',
  'Egon Schiele',
  'Wassily Kandinsky',
  'Paul Klee',
  'Marc Chagall',
  'Joan Miró',
  'Salvador Dalí',
  
  // 미국 예술가
  'Georgia O\'Keeffe',
  'Edward Hopper',
  'Jackson Pollock',
  'Andy Warhol',
  'Jean-Michel Basquiat',
  
  // 일본 우키요에
  'Katsushika Hokusai',
  'Utagawa Hiroshige',
  'Kitagawa Utamaro',
  'Tōshūsai Sharaku',
  
  // 조각가
  'Auguste Rodin',
  'Alberto Giacometti',
  'Constantin Brâncuși',
  
  // 기타 거장들
  'Francisco Goya',
  'William Turner',
  'John Constable',
  'Eugène Delacroix',
  'Gustave Courbet',
  'Édouard Vuillard',
  'Pierre Bonnard'
];

// 부서별 우선순위 (Met Museum departments)
const PRIORITY_DEPARTMENTS = [
  'European Paintings',
  'The American Wing',
  'Modern and Contemporary Art',
  'Asian Art',
  'Photographs',
  'Drawings and Prints',
  'Egyptian Art',
  'Greek and Roman Art',
  'Islamic Art',
  'Medieval Art'
];

// 작품 유형 우선순위
const PRIORITY_CLASSIFICATIONS = [
  'Paintings',
  'Drawings',
  'Prints',
  'Photographs',
  'Sculpture',
  'Ceramics'
];

module.exports = {
  FAMOUS_ARTISTS,
  PRIORITY_DEPARTMENTS,
  PRIORITY_CLASSIFICATIONS
};