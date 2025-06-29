// Stable image URLs using public domain and CC0 licensed images
// These are more reliable than Unsplash for production use

export const stableImages = {
  backgrounds: {
    // Stage 1: 도시에서 미술관 선택
    'city-view': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/1920px-New_york_times_square-terabass.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2016/01/19/17/48/woman-1149911_1280.jpg',
      description: 'City view with museums'
    },
    
    // Stage 2: 미술관 입구/로비
    'museum-entrance': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Louvre_Museum_Wikimedia_Commons.jpg/1920px-Louvre_Museum_Wikimedia_Commons.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2019/04/06/19/48/museum-4107739_1280.jpg',
      description: 'Museum entrance lobby'
    },
    
    // Stage 3: 갤러리 공간
    'gallery-space': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Art_Institute_of_Chicago_Modern_Wing.JPG/1920px-Art_Institute_of_Chicago_Modern_Wing.JPG',
      fallback: 'https://cdn.pixabay.com/photo/2017/03/27/13/17/exhibition-2178778_1280.jpg',
      description: 'White gallery space'
    },
    
    // Stage 4: 작품 감상 중인 사람들
    'viewing-art': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/People_looking_at_Botticelli%27s_famous_%22Birth_of_Venus%22_painting%2C_Uffizi_Gallery%2C_Florence%2C_Italy.jpg/1920px-People_looking_at_Botticelli%27s_famous_%22Birth_of_Venus%22_painting%2C_Uffizi_Gallery%2C_Florence%2C_Italy.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2016/11/29/13/24/art-1869827_1280.jpg',
      description: 'People viewing artwork'
    },
    
    // Stage 5: 특별한 순간
    'special-moment': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Woman_looking_at_artwork_%E2%80%93_Cleveland_Museum_of_Art.jpg/1920px-Woman_looking_at_artwork_%E2%80%93_Cleveland_Museum_of_Art.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2017/08/01/11/48/woman-2564660_1280.jpg',
      description: 'Contemplative moment with art'
    },
    
    // Stage 6: 미술관 카페
    'museum-cafe': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Caf%C3%A9_del_Museo_Nacional_de_Bellas_Artes.jpg/1920px-Caf%C3%A9_del_Museo_Nacional_de_Bellas_Artes.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2016/11/18/22/21/restaurant-1837150_1280.jpg',
      description: 'Museum cafe'
    },
    
    // Stage 7: 아트샵
    'museum-shop': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Museum_gift_shop.jpg/1920px-Museum_gift_shop.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2017/08/05/00/30/gift-shop-2581581_1280.jpg',
      description: 'Museum gift shop'
    },
    
    // Stage 8: 석양의 거리
    'sunset-street': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Times_Square_at_sunset.jpg/1920px-Times_Square_at_sunset.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2016/11/29/05/29/buildings-1867611_1280.jpg',
      description: 'City street at sunset'
    }
  },
  
  choices: {
    // Stage 1: 현대미술관 (MoMA 스타일)
    'modern-museum': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/MoMa_NY_USA_1.jpg/800px-MoMa_NY_USA_1.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2019/12/14/19/52/new-york-4695485_960_720.jpg',
      description: 'Modern art museum like MoMA'
    },
    
    // Stage 1: 고전미술관 (Met 스타일)
    'classical-museum': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Metropolitan_Museum_of_Art_%28The_Met%29_-_Central_Park%2C_NYC.jpg/800px-Metropolitan_Museum_of_Art_%28The_Met%29_-_Central_Park%2C_NYC.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2017/01/28/02/24/japan-2014619_960_720.jpg',
      description: 'Classical museum like The Met'
    },
    
    // Stage 2: 혼자서 감상
    'alone-viewing': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Visitor_looking_at_a_painting_MET.jpg/800px-Visitor_looking_at_a_painting_MET.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2016/11/23/00/39/art-1851485_960_720.jpg',
      description: 'Solo art viewing'
    },
    
    // Stage 2: 도슨트 투어
    'docent-tour': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Docent_tour_at_Museum_of_Modern_Art.jpg/800px-Docent_tour_at_Museum_of_Modern_Art.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2019/11/07/20/48/museum-4609639_960_720.jpg',
      description: 'Museum docent tour'
    },
    
    // Stage 3: 감정적 반응
    'emotional-response': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Woman_contemplating_artwork.jpg/800px-Woman_contemplating_artwork.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2016/11/22/19/17/art-1850130_960_720.jpg',
      description: 'Emotional response to art'
    },
    
    // Stage 3: 분석적 반응
    'analytical-response': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Studying_artwork_at_museum.jpg/800px-Studying_artwork_at_museum.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2017/08/01/11/48/blue-2564660_960_720.jpg',
      description: 'Analytical study of art'
    },
    
    // Stage 4: 자유로운 흐름
    'flow-viewing': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/People_walking_through_gallery.jpg/800px-People_walking_through_gallery.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2016/11/22/19/17/gallery-1850129_960_720.jpg',
      description: 'Casual gallery stroll'
    },
    
    // Stage 4: 작품 설명 읽기
    'reading-labels': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Reading_museum_label.jpg/800px-Reading_museum_label.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2020/02/16/20/29/new-york-4854718_960_720.jpg',
      description: 'Reading artwork labels'
    },
    
    // Stage 5: 추상 미술
    'abstract-art': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Vassily_Kandinsky%2C_1913_-_Color_Study%2C_Squares_with_Concentric_Circles.jpg/800px-Vassily_Kandinsky%2C_1913_-_Color_Study%2C_Squares_with_Concentric_Circles.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2696947_960_720.jpg',
      description: 'Abstract artwork'
    },
    
    // Stage 5: 인물화
    'portrait-art': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/600px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2016/02/17/19/08/art-1205518_960_720.jpg',
      description: 'Classical portrait'
    },
    
    // Stage 6: 일기 쓰기
    'writing-journal': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Writing_in_notebook_at_cafe.jpg/800px-Writing_in_notebook_at_cafe.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_960_720.jpg',
      description: 'Writing in journal'
    },
    
    // Stage 6: 폰으로 공유
    'sharing-phone': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Taking_photo_of_artwork.jpg/800px-Taking_photo_of_artwork.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2016/11/29/06/17/art-1867948_960_720.jpg',
      description: 'Sharing on phone'
    },
    
    // Stage 7: 아트 엽서
    'art-postcard': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Museum_postcards_display.jpg/800px-Museum_postcards_display.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2017/08/07/09/42/postcard-2601956_960_720.jpg',
      description: 'Art postcards'
    },
    
    // Stage 7: 전시 도록
    'art-book': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Art_books_in_museum_shop.jpg/800px-Art_books_in_museum_shop.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2016/09/10/17/18/book-1659717_960_720.jpg',
      description: 'Exhibition catalogs'
    },
    
    // Stage 8: 감동의 기억
    'emotional-memory': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Sunset_reflection.jpg/800px-Sunset_reflection.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2015/12/01/20/28/road-1072823_960_720.jpg',
      description: 'Emotional memory'
    },
    
    // Stage 8: 새로운 시각
    'new-perspective': {
      primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Light_through_window.jpg/800px-Light_through_window.jpg',
      fallback: 'https://cdn.pixabay.com/photo/2016/11/18/17/20/art-1835783_960_720.jpg',
      description: 'New perspective gained'
    }
  }
};