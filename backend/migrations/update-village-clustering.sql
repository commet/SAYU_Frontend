-- Update Village System with 4 Art Style Clusters
-- Each cluster contains 4 personality types based on art viewing preferences

-- Clear existing village data
DELETE FROM villages;

-- Insert the 4 main village clusters
INSERT INTO villages (village_code, name, korean_name, description, theme, community_features, village_perks) VALUES

-- 🏛️ Contemplative Sanctuary (명상적 성역)
('CONTEMPLATIVE', 'Contemplative Sanctuary', '명상적 성역', 
'A quiet haven for solitary art contemplation and deep reflection',
'{
  "architecture": "serene_temple",
  "ambiance": "peaceful_meditation", 
  "soundtrack": "ambient_whispers",
  "colors": ["#667eea", "#764ba2"],
  "mood": "tranquil_introspective"
}',
ARRAY[
  'Silent Meditation Gardens',
  'Individual Reflection Pods', 
  'Contemplative Art Alcoves',
  'Personal Journal Libraries',
  'Mindful Walking Paths'
],
ARRAY[
  'Access to quiet viewing hours',
  'Personal art interpretation guides',
  'Noise-free exhibition spaces',
  'Meditation session access',
  'Priority booking for solo experiences'
]),

-- 📚 Academic Forum (학술 포럼) 
('ACADEMIC', 'Academic Forum', '학술 포럼',
'A scholarly space for analytical discussion and systematic art study',
'{
  "architecture": "classical_library",
  "ambiance": "bright_scholarly",
  "soundtrack": "intellectual_discourse", 
  "colors": ["#f093fb", "#f5576c"],
  "mood": "analytical_focused"
}',
ARRAY[
  'Research Libraries & Archives',
  'Debate Halls & Lecture Rooms',
  'Analysis Workshops',
  'Peer Review Circles', 
  'Academic Conference Spaces'
],
ARRAY[
  'Early access to educational content',
  'Expert curator networks',
  'Research database access',
  'Academic partnership programs',
  'Scholarly publication opportunities'
]),

-- 🎭 Social Gallery (사교적 갤러리)
('SOCIAL', 'Social Gallery', '사교적 갤러리', 
'A vibrant community space for shared art experiences and social connection',
'{
  "architecture": "open_flowing", 
  "ambiance": "warm_communal",
  "soundtrack": "lively_conversations",
  "colors": ["#4facfe", "#00f2fe"],
  "mood": "energetic_social"
}',
ARRAY[
  'Community Lounges & Cafés',
  'Group Tour Coordination',
  'Social Event Spaces',
  'Collaboration Studios',
  'Networking Hubs'
],
ARRAY[
  'Group exhibition discounts',
  'Social event invitations', 
  'Community project access',
  'Networking event priority',
  'Group tour leadership opportunities'
]),

-- ✨ Creative Studio (창작 스튜디오)
('CREATIVE', 'Creative Studio', '창작 스튜디오',
'An inspiring workshop space for artistic experimentation and emotional expression', 
'{
  "architecture": "organic_flowing",
  "ambiance": "inspiring_creative",
  "soundtrack": "experimental_ambient",
  "colors": ["#43e97b", "#38f9d7"], 
  "mood": "imaginative_expressive"
}',
ARRAY[
  'Art Creation Workshops',
  'Experimental Studios',
  'Inspiration Galleries',
  'Creative Collaboration Spaces',
  'Artistic Expression Labs'
],
ARRAY[
  'Studio space access',
  'Art supply discounts',
  'Creative workshop priority',
  'Artist mentorship programs', 
  'Exhibition submission opportunities'
]);

-- Create mapping table for personality types to village clusters
CREATE TABLE IF NOT EXISTS personality_village_mapping (
    personality_type VARCHAR(4) PRIMARY KEY,
    village_code VARCHAR(20) REFERENCES villages(village_code),
    cluster_reason TEXT,
    art_viewing_style TEXT
);

-- Insert personality type mappings
INSERT INTO personality_village_mapping (personality_type, village_code, cluster_reason, art_viewing_style) VALUES

-- 🏛️ Contemplative Sanctuary (혼자서 깊이 사색)
('LAEF', 'CONTEMPLATIVE', 'Introverted + Emotional + Expressive + Free-flowing', 'Solitary emotional immersion'),
('LAMF', 'CONTEMPLATIVE', 'Introverted + Emotional + Methodical + Free-flowing', 'Personal structured reflection'),
('LREF', 'CONTEMPLATIVE', 'Introverted + Rational + Expressive + Free-flowing', 'Independent analytical contemplation'),
('LRMF', 'CONTEMPLATIVE', 'Introverted + Rational + Methodical + Free-flowing', 'Systematic solitary study'),

-- 📚 Academic Forum (논리와 체계로 탐구)
('LRMC', 'ACADEMIC', 'Introverted + Rational + Methodical + Structured', 'Systematic analytical study'),
('LREC', 'ACADEMIC', 'Introverted + Rational + Expressive + Structured', 'Structured individual analysis'),
('SRMC', 'ACADEMIC', 'Social + Rational + Methodical + Structured', 'Collaborative systematic research'),
('SREC', 'ACADEMIC', 'Social + Rational + Expressive + Structured', 'Academic group discussions'),

-- 🎭 Social Gallery (함께 감상하고 나눔)
('SAEF', 'SOCIAL', 'Social + Emotional + Expressive + Free-flowing', 'Enthusiastic group sharing'),
('SAEC', 'SOCIAL', 'Social + Emotional + Expressive + Structured', 'Organized social experiences'),
('SREF', 'SOCIAL', 'Social + Rational + Expressive + Free-flowing', 'Dynamic group analysis'),
('SREC', 'SOCIAL', 'Social + Rational + Expressive + Structured', 'Structured group discussions'),

-- ✨ Creative Studio (감성과 영감이 흘러넘침)
('LAMC', 'CREATIVE', 'Introverted + Emotional + Methodical + Structured', 'Personal creative methodology'),
('LAMF', 'CREATIVE', 'Introverted + Emotional + Methodical + Free-flowing', 'Intuitive personal creation'),
('SAMC', 'CREATIVE', 'Social + Emotional + Methodical + Structured', 'Collaborative creative projects'),
('SAMF', 'CREATIVE', 'Social + Emotional + Methodical + Free-flowing', 'Spontaneous group creativity');

-- Create function to get village for personality type
CREATE OR REPLACE FUNCTION get_village_for_personality(personality_type VARCHAR(4))
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN (
        SELECT village_code 
        FROM personality_village_mapping 
        WHERE personality_village_mapping.personality_type = get_village_for_personality.personality_type
    );
END;
$$ LANGUAGE plpgsql;

-- Update the existing trigger to use new village mapping
DROP TRIGGER IF EXISTS identity_change_village_update ON users;
DROP FUNCTION IF EXISTS update_village_membership();

CREATE OR REPLACE FUNCTION update_village_membership()
RETURNS TRIGGER AS $$
DECLARE
    new_village_code VARCHAR(20);
BEGIN
    -- Get the village for the new identity type
    new_village_code := get_village_for_personality(NEW.current_identity_type);
    
    -- End previous membership
    UPDATE village_memberships 
    SET status = 'alumni', left_at = NOW()
    WHERE user_id = NEW.user_id AND status = 'active';
    
    -- Create new membership
    INSERT INTO village_memberships (user_id, village_code, status)
    VALUES (NEW.user_id, new_village_code, 'active')
    ON CONFLICT (user_id, village_code, status) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER identity_change_village_update
AFTER UPDATE OF current_identity_type ON users
FOR EACH ROW
WHEN (OLD.current_identity_type IS DISTINCT FROM NEW.current_identity_type)
EXECUTE FUNCTION update_village_membership();