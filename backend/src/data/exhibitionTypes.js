// Exhibition Preference Type Definitions
// Based on 4 axes creating 16 total combinations (2^4)
// CORRECTED TO MATCH SAYU APT SYSTEM

// Axis 1: L vs S
// 'L' = Lone (Individual, introspective) — prefers personal, individual engagement with art
// 'S' = Social (Interactive, collaborative) — prefers social, collaborative art experiences

// Axis 2: A vs R
// 'A' = Abstract (Atmospheric, symbolic) — drawn to conceptual, symbolic, non-representational art
// 'R' = Representational (Realistic, concrete) — prefers figurative, representational, narrative art

// Axis 3: E vs M
// 'E' = Emotional (Affective, feeling-based) — intuitive, emotional approach focusing on feelings and atmosphere
// 'M' = Meaning-driven (Analytical, rational) — analytical, intellectual approach focusing on concepts and ideas

// Axis 4: F vs C
// 'F' = Flow (Fluid, spontaneous) — prefers open, flexible, wandering exhibition experiences
// 'C' = Constructive (Structured, systematic) — prefers structured, curated, organized exhibition layouts

module.exports = {
  LAEF: {
    code: 'LAEF',
    name: 'The Lone Abstract Emotional Explorer',
    description: 'Individual visitor who emotionally connects with abstract art through free-flowing experiences',
    dimensions: { L: 1, A: 1, E: 1, F: 1 },
    traits: ['lone', 'abstract-oriented', 'emotion-driven', 'flow-seeking']
  },
  LAEC: {
    code: 'LAEC',
    name: 'The Lone Abstract Emotional Structuralist',
    description: 'Individual visitor who emotionally engages with abstract art in structured, curated environments',
    dimensions: { L: 1, A: 1, E: 1, C: 1 },
    traits: ['lone', 'abstract-focused', 'emotion-based', 'structure-preferring']
  },
  LAMF: {
    code: 'LAMF',
    name: 'The Lone Abstract Meaning Explorer',
    description: 'Individual visitor who analytically explores abstract art concepts in flexible spaces',
    dimensions: { L: 1, A: 1, M: 1, F: 1 },
    traits: ['lone', 'abstract-analytical', 'meaning-focused', 'flow-oriented']
  },
  LAMC: {
    code: 'LAMC',
    name: 'The Lone Abstract Meaning Constructor',
    description: 'Individual visitor who systematically analyzes abstract art in structured environments',
    dimensions: { L: 1, A: 1, M: 1, C: 1 },
    traits: ['lone', 'abstract-systematic', 'meaning-driven', 'constructive-approach']
  },
  LREF: {
    code: 'LREF',
    name: 'The Lone Representational Emotional Explorer',
    description: 'Individual visitor who emotionally connects with realistic art through wandering exploration',
    dimensions: { L: 1, R: 1, E: 1, F: 1 },
    traits: ['lone', 'representational-oriented', 'emotion-focused', 'flow-seeking']
  },
  LREC: {
    code: 'LREC',
    name: 'The Lone Representational Emotional Constructor',
    description: 'Individual visitor who emotionally engages with realistic art in structured settings',
    dimensions: { L: 1, R: 1, E: 1, C: 1 },
    traits: ['lone', 'representational-focused', 'emotion-driven', 'constructive-preference']
  },
  LRMF: {
    code: 'LRMF',
    name: 'The Lone Representational Meaning Explorer',
    description: 'Individual visitor who analytically studies realistic art in flexible environments',
    dimensions: { L: 1, R: 1, M: 1, F: 1 },
    traits: ['lone', 'representational-analytical', 'meaning-oriented', 'flow-adaptive']
  },
  LRMC: {
    code: 'LRMC',
    name: 'The Lone Representational Meaning Constructor',
    description: 'Individual visitor who systematically analyzes realistic art in curated spaces',
    dimensions: { L: 1, R: 1, M: 1, C: 1 },
    traits: ['lone', 'representational-systematic', 'meaning-focused', 'constructive-structured']
  },
  SAEF: {
    code: 'SAEF',
    name: 'The Social Abstract Emotional Explorer',
    description: 'Social visitor who emotionally shares abstract art experiences in free-flowing spaces',
    dimensions: { S: 1, A: 1, E: 1, F: 1 },
    traits: ['social-experience', 'abstract-enthusiastic', 'emotion-expressive', 'flow-social']
  },
  SAEC: {
    code: 'SAEC',
    name: 'The Social Abstract Emotional Constructor',
    description: 'Social visitor who emotionally discusses abstract art in structured environments',
    dimensions: { S: 1, A: 1, E: 1, C: 1 },
    traits: ['social-engagement', 'abstract-emotional', 'emotion-sharing', 'constructive-social']
  },
  SAMF: {
    code: 'SAMF',
    name: 'The Social Abstract Meaning Explorer',
    description: 'Social visitor who analytically discusses abstract art concepts in flexible spaces',
    dimensions: { S: 1, A: 1, M: 1, F: 1 },
    traits: ['social-analysis', 'abstract-intellectual', 'meaning-collaborative', 'flow-discussion']
  },
  SAMC: {
    code: 'SAMC',
    name: 'The Social Abstract Meaning Constructor',
    description: 'Social visitor who systematically explores abstract art in structured, curated settings',
    dimensions: { S: 1, A: 1, M: 1, C: 1 },
    traits: ['social-systematic', 'abstract-methodical', 'meaning-structured', 'constructive-collaborative']
  },
  SREF: {
    code: 'SREF',
    name: 'The Social Representational Emotional Explorer',
    description: 'Social visitor who emotionally shares realistic art experiences in open, flowing spaces',
    dimensions: { S: 1, R: 1, E: 1, F: 1 },
    traits: ['social-emotion', 'representational-storytelling', 'emotion-communicative', 'flow-wandering']
  },
  SREC: {
    code: 'SREC',
    name: 'The Social Representational Emotional Constructor',
    description: 'Social visitor who emotionally appreciates realistic art in structured, guided settings',
    dimensions: { S: 1, R: 1, E: 1, C: 1 },
    traits: ['social-traditional', 'representational-companion', 'emotion-bonding', 'constructive-guided']
  },
  SRMF: {
    code: 'SRMF',
    name: 'The Social Representational Meaning Explorer',
    description: 'Social visitor who analytically discusses realistic art in flexible environments',
    dimensions: { S: 1, R: 1, M: 1, F: 1 },
    traits: ['social-educational', 'representational-analytical', 'meaning-discussion', 'flow-adaptive']
  },
  SRMC: {
    code: 'SRMC',
    name: 'The Social Representational Meaning Constructor',
    description: 'Social visitor who systematically teaches about realistic art in curated spaces',
    dimensions: { S: 1, R: 1, M: 1, C: 1 },
    traits: ['social-cultural', 'representational-educational', 'meaning-systematic', 'constructive-teaching']
  }
};
