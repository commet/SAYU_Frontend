// Exhibition Preference Type Definitions
// Based on 4 axes creating 16 total combinations (2^4)

// Axis 1: G vs S
// 'G' = Grounded — prefers personal, individual engagement with art
// 'S' = Shared — prefers social, collaborative art experiences

// Axis 2: A vs R  
// 'A' = Abstract — drawn to conceptual, symbolic, non-representational art
// 'R' = Realistic — prefers figurative, representational, narrative art

// Axis 3: M vs E
// 'M' = Meaning — analytical, intellectual approach focusing on concepts and ideas
// 'E' = Emotion — intuitive, emotional approach focusing on feelings and atmosphere

// Axis 4: F vs C
// 'F' = Flow — prefers open, flexible, wandering exhibition experiences
// 'C' = Constructive — prefers structured, curated, organized exhibition layouts

module.exports = {
  GAEF: {
    code: 'GAEF',
    name: 'The Grounded Abstract Emotional Explorer',
    description: 'Individual visitor who emotionally connects with abstract art through free-flowing experiences',
    dimensions: { G: 1, A: 1, E: 1, F: 1 },
    traits: ['grounded', 'abstract-oriented', 'emotion-driven', 'flow-seeking']
  },
  GAEC: {
    code: 'GAEC',
    name: 'The Grounded Abstract Emotional Structuralist',
    description: 'Individual visitor who emotionally engages with abstract art in structured, curated environments',
    dimensions: { G: 1, A: 1, E: 1, C: 1 },
    traits: ['grounded', 'abstract-focused', 'emotion-based', 'structure-preferring']
  },
  GAMF: {
    code: 'GAMF',
    name: 'The Grounded Abstract Meaning Explorer',
    description: 'Individual visitor who analytically explores abstract art concepts in flexible spaces',
    dimensions: { G: 1, A: 1, M: 1, F: 1 },
    traits: ['grounded', 'abstract-analytical', 'meaning-focused', 'flow-oriented']
  },
  GAMC: {
    code: 'GAMC',
    name: 'The Grounded Abstract Meaning Constructor',
    description: 'Individual visitor who systematically analyzes abstract art in structured environments',
    dimensions: { G: 1, A: 1, M: 1, C: 1 },
    traits: ['grounded', 'abstract-systematic', 'meaning-driven', 'constructive-approach']
  },
  GREF: {
    code: 'GREF',
    name: 'The Grounded Realistic Emotional Explorer',
    description: 'Individual visitor who emotionally connects with realistic art through wandering exploration',
    dimensions: { G: 1, R: 1, E: 1, F: 1 },
    traits: ['grounded', 'realistic-oriented', 'emotion-focused', 'flow-seeking']
  },
  GREC: {
    code: 'GREC',
    name: 'The Grounded Realistic Emotional Constructor',
    description: 'Individual visitor who emotionally engages with realistic art in structured settings',
    dimensions: { G: 1, R: 1, E: 1, C: 1 },
    traits: ['grounded', 'realistic-focused', 'emotion-driven', 'constructive-preference']
  },
  GRMF: {
    code: 'GRMF',
    name: 'The Grounded Realistic Meaning Explorer',
    description: 'Individual visitor who analytically studies realistic art in flexible environments',
    dimensions: { G: 1, R: 1, M: 1, F: 1 },
    traits: ['grounded', 'realistic-analytical', 'meaning-oriented', 'flow-adaptive']
  },
  GRMC: {
    code: 'GRMC',
    name: 'The Grounded Realistic Meaning Constructor',
    description: 'Individual visitor who systematically analyzes realistic art in curated spaces',
    dimensions: { G: 1, R: 1, M: 1, C: 1 },
    traits: ['grounded', 'realistic-systematic', 'meaning-focused', 'constructive-structured']
  },
  SAEF: {
    code: 'SAEF',
    name: 'The Shared Abstract Emotional Explorer',
    description: 'Social visitor who emotionally shares abstract art experiences in free-flowing spaces',
    dimensions: { S: 1, A: 1, E: 1, F: 1 },
    traits: ['shared-experience', 'abstract-enthusiastic', 'emotion-expressive', 'flow-social']
  },
  SAEC: {
    code: 'SAEC',
    name: 'The Shared Abstract Emotional Constructor',
    description: 'Social visitor who emotionally discusses abstract art in structured environments',
    dimensions: { S: 1, A: 1, E: 1, C: 1 },
    traits: ['shared-engagement', 'abstract-emotional', 'emotion-sharing', 'constructive-social']
  },
  SAMF: {
    code: 'SAMF',
    name: 'The Shared Abstract Meaning Explorer',
    description: 'Social visitor who analytically discusses abstract art concepts in flexible spaces',
    dimensions: { S: 1, A: 1, M: 1, F: 1 },
    traits: ['shared-analysis', 'abstract-intellectual', 'meaning-collaborative', 'flow-discussion']
  },
  SAMC: {
    code: 'SAMC',
    name: 'The Shared Abstract Meaning Constructor',
    description: 'Social visitor who systematically explores abstract art in structured, curated settings',
    dimensions: { S: 1, A: 1, M: 1, C: 1 },
    traits: ['shared-systematic', 'abstract-methodical', 'meaning-structured', 'constructive-collaborative']
  },
  SREF: {
    code: 'SREF',
    name: 'The Shared Realistic Emotional Explorer',
    description: 'Social visitor who emotionally shares realistic art experiences in open, flowing spaces',
    dimensions: { S: 1, R: 1, E: 1, F: 1 },
    traits: ['shared-emotion', 'realistic-storytelling', 'emotion-communicative', 'flow-wandering']
  },
  SREC: {
    code: 'SREC',
    name: 'The Shared Realistic Emotional Constructor',
    description: 'Social visitor who emotionally appreciates realistic art in structured, guided settings',
    dimensions: { S: 1, R: 1, E: 1, C: 1 },
    traits: ['shared-traditional', 'realistic-companion', 'emotion-bonding', 'constructive-guided']
  },
  SRMF: {
    code: 'SRMF',
    name: 'The Shared Realistic Meaning Explorer',
    description: 'Social visitor who analytically discusses realistic art in flexible environments',
    dimensions: { S: 1, R: 1, M: 1, F: 1 },
    traits: ['shared-educational', 'realistic-analytical', 'meaning-discussion', 'flow-adaptive']
  },
  SRMC: {
    code: 'SRMC',
    name: 'The Shared Realistic Meaning Constructor',
    description: 'Social visitor who systematically teaches about realistic art in curated spaces',
    dimensions: { S: 1, R: 1, M: 1, C: 1 },
    traits: ['shared-cultural', 'realistic-educational', 'meaning-systematic', 'constructive-teaching']
  }
};