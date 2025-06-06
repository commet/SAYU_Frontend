const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const sampleArtworks = [
  {
    title: "The Starry Night",
    artist: "Vincent van Gogh",
    year: 1889,
    medium: "Oil on canvas",
    description: "A swirling night sky over a quiet town",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    emotionalTags: ["dreamy", "turbulent", "contemplative", "mystical"],
    movement: "Post-Impressionism"
  },
  {
    title: "The Great Wave off Kanagawa",
    artist: "Katsushika Hokusai",
    year: 1831,
    medium: "Woodblock print",
    description: "Iconic wave threatening boats near Mount Fuji",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/1280px-The_Great_Wave_off_Kanagawa.jpg",
    emotionalTags: ["powerful", "dynamic", "threatening", "majestic"],
    movement: "Ukiyo-e"
  },
  {
    title: "Girl with a Pearl Earring",
    artist: "Johannes Vermeer",
    year: 1665,
    medium: "Oil on canvas",
    description: "Mysterious portrait of a girl with a pearl earring",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg",
    emotionalTags: ["mysterious", "intimate", "serene", "captivating"],
    movement: "Dutch Golden Age"
  }
];

async function seedData() {
  console.log('🌱 Starting data seeding...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Create demo user
    console.log('👤 Creating demo user...');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const userId = uuidv4();
    
    await client.query(`
      INSERT INTO users (
        id, email, password_hash, nickname, age, location,
        personal_manifesto, agency_level, aesthetic_journey_stage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) DO NOTHING
    `, [
      userId,
      'demo@sayu.art',
      hashedPassword,
      'Art Explorer',
      25,
      JSON.stringify({ city: 'Tokyo', country: 'Japan' }),
      'I seek beauty in the unexpected and find meaning in the abstract',
      'explorer',
      'discovering'
    ]);
    
    console.log('✅ Demo user created (email: demo@sayu.art, password: demo123)');
    
    // Create artworks table if it doesn't exist
    console.log('🎨 Setting up artworks...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS artworks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        year INTEGER,
        medium VARCHAR(255),
        description TEXT,
        image_url TEXT,
        emotional_tags TEXT[],
        movement VARCHAR(100),
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Insert sample artworks
    for (const artwork of sampleArtworks) {
      await client.query(`
        INSERT INTO artworks (
          title, artist, year, medium, description, 
          image_url, emotional_tags, movement
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING
      `, [
        artwork.title,
        artwork.artist,
        artwork.year,
        artwork.medium,
        artwork.description,
        artwork.imageUrl,
        artwork.emotionalTags,
        artwork.movement
      ]);
    }
    
    console.log('✅ Sample artworks added');
    
    // Create additional tables that might be needed
    console.log('📊 Creating additional tables...');
    
    // User interactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        interaction_type VARCHAR(50),
        entity_type VARCHAR(50),
        entity_id UUID,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Reflections table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reflections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        emotional_state VARCHAR(50),
        artwork_ids UUID[],
        tags TEXT[],
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Recommendations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS recommendations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        artwork_id UUID,
        recommendation_type VARCHAR(50),
        score FLOAT,
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    console.log('✅ Additional tables created');
    
    client.release();
    console.log('🎉 Data seeding complete!');
    
  } catch (error) {
    console.error('❌ Data seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedData;