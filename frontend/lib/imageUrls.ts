// Direct image URLs for museum simulation
// Using Unsplash and stable image sources

export const museumImages = {
  backgrounds: {
    'city-view': 'https://images.unsplash.com/photo-1569163139394-de4798aa62ea?w=1920&h=1080&fit=crop&q=80',
    'museum-entrance': 'https://images.unsplash.com/photo-1565034946487-077786996e27?w=1920&h=1080&fit=crop&q=80',
    'gallery-space': 'https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?w=1920&h=1080&fit=crop&q=80',
    'viewing-art': 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1920&h=1080&fit=crop&q=80',
    'special-moment': 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1920&h=1080&fit=crop&q=80',
    'museum-cafe': 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=1920&h=1080&fit=crop&q=80',
    'museum-shop': 'https://images.unsplash.com/photo-1569105002844-dc5012fda999?w=1920&h=1080&fit=crop&q=80',
    'sunset-street': 'https://images.unsplash.com/photo-1470219556762-1771e7f9427d?w=1920&h=1080&fit=crop&q=80'
  },
  choices: {
    'modern-museum': 'https://images.unsplash.com/photo-1575223970966-76ae61ee7838?w=800&h=600&fit=crop&q=80',
    'classical-museum': 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&h=600&fit=crop&q=80',
    'alone-viewing': 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop&q=80',
    'docent-tour': 'https://images.unsplash.com/photo-1568827999250-3f6afff96e66?w=800&h=600&fit=crop&q=80',
    'emotional-response': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80',
    'analytical-response': 'https://images.unsplash.com/photo-1565716875607-76e76a88ac71?w=800&h=600&fit=crop&q=80',
    'flow-viewing': 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=600&fit=crop&q=80',
    'reading-labels': 'https://images.unsplash.com/photo-1580847097346-72d80f164702?w=800&h=600&fit=crop&q=80',
    'abstract-art': 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=600&fit=crop&q=80',
    'portrait-art': 'https://images.unsplash.com/photo-1566132127697-4524fea60007?w=800&h=600&fit=crop&q=80',
    'writing-journal': 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=600&fit=crop&q=80',
    'sharing-phone': 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&h=600&fit=crop&q=80',
    'art-postcard': 'https://images.unsplash.com/photo-1584448141569-133f57996e00?w=800&h=600&fit=crop&q=80',
    'art-book': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&q=80',
    'emotional-memory': 'https://images.unsplash.com/photo-1576504677598-1ff6e8395b08?w=800&h=600&fit=crop&q=80',
    'new-perspective': 'https://images.unsplash.com/photo-1545989253-02cc26577f88?w=800&h=600&fit=crop&q=80'
  }
};

// Fallback to stable images if Unsplash fails
export const stableImageFallbacks = {
  backgrounds: {
    'city-view': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/1920px-New_york_times_square-terabass.jpg',
    'museum-entrance': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Louvre_Museum_Wikimedia_Commons.jpg/1920px-Louvre_Museum_Wikimedia_Commons.jpg',
    'gallery-space': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Art_Institute_of_Chicago_Modern_Wing.JPG/1920px-Art_Institute_of_Chicago_Modern_Wing.JPG',
    'viewing-art': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/People_looking_at_Botticelli%27s_famous_%22Birth_of_Venus%22_painting%2C_Uffizi_Gallery%2C_Florence%2C_Italy.jpg/1920px-People_looking_at_Botticelli%27s_famous_%22Birth_of_Venus%22_painting%2C_Uffizi_Gallery%2C_Florence%2C_Italy.jpg',
    'special-moment': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Woman_looking_at_artwork_%E2%80%93_Cleveland_Museum_of_Art.jpg/1920px-Woman_looking_at_artwork_%E2%80%93_Cleveland_Museum_of_Art.jpg',
    'museum-cafe': 'https://cdn.pixabay.com/photo/2016/11/18/22/21/restaurant-1837150_1280.jpg',
    'museum-shop': 'https://cdn.pixabay.com/photo/2017/08/05/00/30/gift-shop-2581581_1280.jpg',
    'sunset-street': 'https://cdn.pixabay.com/photo/2016/11/29/05/29/buildings-1867611_1280.jpg'
  },
  choices: {
    'modern-museum': 'https://cdn.pixabay.com/photo/2019/12/14/19/52/new-york-4695485_960_720.jpg',
    'classical-museum': 'https://cdn.pixabay.com/photo/2017/01/28/02/24/japan-2014619_960_720.jpg',
    'alone-viewing': 'https://cdn.pixabay.com/photo/2016/11/23/00/39/art-1851485_960_720.jpg',
    'docent-tour': 'https://cdn.pixabay.com/photo/2019/11/07/20/48/museum-4609639_960_720.jpg',
    'emotional-response': 'https://cdn.pixabay.com/photo/2016/11/22/19/17/art-1850130_960_720.jpg',
    'analytical-response': 'https://cdn.pixabay.com/photo/2017/08/01/11/48/blue-2564660_960_720.jpg',
    'flow-viewing': 'https://cdn.pixabay.com/photo/2016/11/22/19/17/gallery-1850129_960_720.jpg',
    'reading-labels': 'https://cdn.pixabay.com/photo/2020/02/16/20/29/new-york-4854718_960_720.jpg',
    'abstract-art': 'https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2696947_960_720.jpg',
    'portrait-art': 'https://cdn.pixabay.com/photo/2016/02/17/19/08/art-1205518_960_720.jpg',
    'writing-journal': 'https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_960_720.jpg',
    'sharing-phone': 'https://cdn.pixabay.com/photo/2016/11/29/06/17/art-1867948_960_720.jpg',
    'art-postcard': 'https://cdn.pixabay.com/photo/2017/08/07/09/42/postcard-2601956_960_720.jpg',
    'art-book': 'https://cdn.pixabay.com/photo/2016/09/10/17/18/book-1659717_960_720.jpg',
    'emotional-memory': 'https://cdn.pixabay.com/photo/2015/12/01/20/28/road-1072823_960_720.jpg',
    'new-perspective': 'https://cdn.pixabay.com/photo/2016/11/18/17/20/art-1835783_960_720.jpg'
  }
};