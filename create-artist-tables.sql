-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  nationality VARCHAR(100),
  birth_year INTEGER,
  death_year INTEGER,
  era VARCHAR(100),
  copyright_status VARCHAR(50) CHECK (copyright_status IN ('public_domain', 'licensed', 'contemporary', 'verified_artist')),
  profile_image_url TEXT,
  portfolio_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  follow_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create artist_follows table
CREATE TABLE IF NOT EXISTS artist_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  notification_settings JSONB DEFAULT '{"newExhibitions": true, "mediaUpdates": true, "socialUpdates": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, artist_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artists_copyright_status ON artists(copyright_status);
CREATE INDEX IF NOT EXISTS idx_artists_nationality ON artists(nationality);
CREATE INDEX IF NOT EXISTS idx_artists_era ON artists(era);
CREATE INDEX IF NOT EXISTS idx_artists_follow_count ON artists(follow_count DESC);
CREATE INDEX IF NOT EXISTS idx_artist_follows_user_id ON artist_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_follows_artist_id ON artist_follows(artist_id);

-- Insert sample artists data
INSERT INTO artists (name, bio, nationality, birth_year, death_year, era, copyright_status, profile_image_url, follow_count)
VALUES 
  ('Vincent van Gogh', 'Dutch Post-Impressionist painter who is among the most famous and influential figures in the history of Western art.', 'Dutch', 1853, 1890, 'Post-Impressionism', 'public_domain', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg/800px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg', 0),
  ('Claude Monet', 'French painter and founder of impressionist painting who is seen as a key precursor to modernism.', 'French', 1840, 1926, 'Impressionism', 'public_domain', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Claude_Monet_1899_Nadar_crop.jpg/800px-Claude_Monet_1899_Nadar_crop.jpg', 0),
  ('Pablo Picasso', 'Spanish painter, sculptor, printmaker, ceramicist and theatre designer who spent most of his adult life in France.', 'Spanish', 1881, 1973, 'Cubism', 'licensed', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Pablo_picasso_1.jpg/800px-Pablo_picasso_1.jpg', 0),
  ('Frida Kahlo', 'Mexican painter known for her many portraits, self-portraits, and works inspired by the nature and artifacts of Mexico.', 'Mexican', 1907, 1954, 'Surrealism', 'licensed', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg/800px-Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg', 0),
  ('Leonardo da Vinci', 'Italian polymath of the High Renaissance who was active as a painter, draughtsman, engineer, scientist, theorist, sculptor and architect.', 'Italian', 1452, 1519, 'Renaissance', 'public_domain', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Francesco_Melzi_-_Portrait_of_Leonardo.png/800px-Francesco_Melzi_-_Portrait_of_Leonardo.png', 0),
  ('Rembrandt van Rijn', 'Dutch Baroque Period painter and printmaker. One of the greatest visual artists in the history of art.', 'Dutch', 1606, 1669, 'Baroque', 'public_domain', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg/800px-Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg', 0),
  ('Johannes Vermeer', 'Dutch Baroque Period painter who specialized in domestic interior scenes of middle-class life.', 'Dutch', 1632, 1675, 'Baroque', 'public_domain', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Cropped_version_of_Jan_Vermeer_van_Delft_002.jpg/800px-Cropped_version_of_Jan_Vermeer_van_Delft_002.jpg', 0),
  ('Edvard Munch', 'Norwegian painter. His best known work, The Scream, has become one of the iconic images of world art.', 'Norwegian', 1863, 1944, 'Expressionism', 'public_domain', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Edvard_Munch_1912.jpg/800px-Edvard_Munch_1912.jpg', 0),
  ('Gustav Klimt', 'Austrian symbolist painter and one of the most prominent members of the Vienna Secession movement.', 'Austrian', 1862, 1918, 'Art Nouveau', 'public_domain', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Klimt.jpg/800px-Klimt.jpg', 0),
  ('Salvador Dalí', 'Spanish surrealist artist renowned for his technical skill, precise draftsmanship and the striking and bizarre images.', 'Spanish', 1904, 1989, 'Surrealism', 'licensed', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Salvador_Dal%C3%AD_1939.jpg/800px-Salvador_Dal%C3%AD_1939.jpg', 0)
ON CONFLICT DO NOTHING;