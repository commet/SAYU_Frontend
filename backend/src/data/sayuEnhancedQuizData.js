// SAYU Art Personality Quiz Data Structure
// Backend: /backend/src/data/sayuEnhancedQuizData.js

const sayuEnhancedQuizData = {
  title: "SAYU Art Personality Assessment",
  description: "Discover your unique art viewing personality through an immersive gallery journey",
  version: "2.0",
  
  // Core personality dimensions based on 4 binary axes
  dimensions: {
    "L": { 
      name: "Lone", 
      description: "Individual, introspective viewing",
      opposite: "S",
      keywords: ["solitary", "personal", "introspective", "focused"]
    },
    "S": { 
      name: "Shared", 
      description: "Social, interactive experience",
      opposite: "L",
      keywords: ["social", "collaborative", "interactive", "communicative"]
    },
    "A": { 
      name: "Atmospheric", 
      description: "Intuitive, symbolic perception",
      opposite: "R",
      keywords: ["intuitive", "emotional", "abstract", "impressionistic"]
    },
    "R": { 
      name: "Realistic", 
      description: "Concrete, figurative understanding",
      opposite: "A",
      keywords: ["concrete", "literal", "detailed", "technical"]
    },
    "E": { 
      name: "Emotional", 
      description: "Affective, immersive reflection",
      opposite: "M",
      keywords: ["feeling", "empathetic", "visceral", "experiential"]
    },
    "M": { 
      name: "Meaning-driven", 
      description: "Analytical, intentional interpretation",
      opposite: "E",
      keywords: ["analytical", "conceptual", "intellectual", "theoretical"]
    },
    "F": { 
      name: "Flow", 
      description: "Fluid, intuitive exploration",
      opposite: "C",
      keywords: ["spontaneous", "organic", "wandering", "flexible"]
    },
    "C": { 
      name: "Constructive", 
      description: "Structured, sequential exploration",
      opposite: "F",
      keywords: ["organized", "methodical", "systematic", "planned"]
    }
  },

  // Enhanced question bank with multiple types
  questions: [
    // Phase 1: Initial Impressions (Questions 1-3)
    {
      id: "q1",
      phase: 1,
      category: "first_impressions",
      type: "scenario",
      title: "You're entering a new art exhibition for the first time",
      description: "As you step through the gallery entrance, what catches your attention?",
      metadata: {
        difficulty: "easy",
        timeEstimate: 15,
        visualElements: ["gallery_entrance", "atmospheric_lighting"]
      },
      options: [
        {
          id: "q1_a",
          text: "The overall atmosphere and energy of the space",
          weights: { A: 2, F: 1 },
          traits: ["holistic", "intuitive"],
          feedback: {
            text: "You're drawn to the bigger picture and emotional atmosphere!",
            tone: "encouraging"
          }
        },
        {
          id: "q1_b",
          text: "Specific artworks and their technical details",
          weights: { R: 2, C: 1 },
          traits: ["detail-oriented", "analytical"],
          feedback: {
            text: "You appreciate concrete details and craftsmanship!",
            tone: "affirming"
          }
        }
      ]
    },

    // Phase 2: Social Preference Assessment (Questions 2-4)
    {
      id: "q2",
      phase: 2,
      category: "social_dynamics",
      type: "preference_slider",
      title: "Your ideal gallery experience",
      description: "How do you prefer to experience art?",
      sliderConfig: {
        min: 0,
        max: 100,
        defaultValue: 50,
        leftLabel: "Exploring alone at my own pace",
        rightLabel: "Discussing with companions",
        leftIcon: "single_person",
        rightIcon: "group_people"
      },
      scoring: {
        leftEnd: { L: 3 },
        rightEnd: { S: 3 },
        balanced: { L: 1, S: 1 }
      }
    },

    {
      id: "q3",
      phase: 2,
      category: "social_dynamics",
      type: "image_comparison",
      title: "Which gallery scene appeals to you more?",
      description: "Choose the environment where you'd feel most comfortable",
      images: [
        {
          id: "q3_lone",
          title: "Early morning, peaceful gallery",
          subtitle: "Few visitors, contemplative atmosphere",
          imageData: {
            type: "scene",
            elements: ["empty_gallery", "soft_lighting", "single_viewer"]
          },
          weights: { L: 3 },
          tags: ["solitary", "introspective", "focused"]
        },
        {
          id: "q3_shared",
          title: "Opening night with many visitors",
          subtitle: "Lively discussions and social energy",
          imageData: {
            type: "scene",
            elements: ["crowded_gallery", "social_groups", "conversations"]
          },
          weights: { S: 3 },
          tags: ["social", "interactive", "dynamic"]
        }
      ]
    },

    // Phase 3: Perceptual Style (Questions 4-6)
    {
      id: "q4",
      phase: 3,
      category: "perception",
      type: "artwork_reaction",
      title: "What draws you in this abstract painting?",
      artwork: {
        style: "abstract_expressionism",
        elements: {
          colors: ["deep blues", "vibrant reds", "subtle grays"],
          texture: "dynamic brushstrokes",
          composition: "asymmetrical balance"
        }
      },
      options: [
        {
          id: "q4_atmospheric",
          text: "The mood and feeling it evokes",
          description: "Colors seem to dance with emotions",
          weights: { A: 3 },
          emotionalTags: ["dreamy", "symbolic", "intuitive"]
        },
        {
          id: "q4_realistic",
          text: "The technique and composition",
          description: "Analyzing brushwork and color theory",
          weights: { R: 3 },
          analyticalTags: ["structured", "technical", "concrete"]
        }
      ]
    },

    {
      id: "q5",
      phase: 3,
      category: "perception",
      type: "style_grid",
      title: "Which artistic approach resonates with you?",
      gridSize: 2,
      options: [
        {
          id: "q5_symbolic",
          name: "Symbolic & Impressionistic",
          description: "Art that suggests rather than defines",
          examples: ["Turner's atmospheric landscapes", "Rothko's color fields", "Monet's water lilies"],
          weights: { A: 2, E: 1 },
          characteristics: ["ethereal", "suggestive", "emotional"]
        },
        {
          id: "q5_precise",
          name: "Precise & Representational",
          description: "Art that captures reality accurately",
          examples: ["Vermeer's detailed interiors", "Photorealistic paintings", "Technical drawings"],
          weights: { R: 2, M: 1 },
          characteristics: ["detailed", "accurate", "tangible"]
        }
      ]
    },

    // Phase 4: Reflection Style (Questions 6-8)
    {
      id: "q6",
      phase: 4,
      category: "reflection",
      type: "emotional_mapping",
      title: "Standing before a powerful artwork",
      scenario: "You're facing a piece that clearly moves you. What happens next?",
      emotionalMap: {
        axes: ["immediate_response", "processing_style"],
        quadrants: ["feel", "think", "sense", "analyze"]
      },
      options: [
        {
          id: "q6_emotional",
          text: "I let the feelings wash over me",
          description: "Immersing in the emotional experience",
          weights: { E: 3 },
          reflection: "affective",
          visualCue: "waves_of_color"
        },
        {
          id: "q6_meaning",
          text: "I seek to understand the artist's message",
          description: "Analyzing symbols and intentions",
          weights: { M: 3 },
          reflection: "analytical",
          visualCue: "connecting_dots"
        }
      ]
    },

    {
      id: "q7",
      phase: 4,
      category: "reflection",
      type: "interpretation_exercise",
      title: "How do you process this installation?",
      installation: {
        name: "Mirror Room",
        description: "A room filled with mirrors and changing lights",
        elements: ["infinite reflections", "color transitions", "viewer participation"],
        interactivity: "high"
      },
      approaches: [
        {
          id: "q7_immersive",
          text: "Become part of the artwork",
          action: "Moving through space, feeling the light",
          weights: { E: 2, F: 1 },
          experienceType: "embodied"
        },
        {
          id: "q7_conceptual",
          text: "Decipher the artistic concept",
          action: "Understanding the theory behind it",
          weights: { M: 2, C: 1 },
          experienceType: "intellectual"
        }
      ]
    },

    // Phase 5: Spatial Navigation (Questions 8-10)
    {
      id: "q8",
      phase: 5,
      category: "spatial_behavior",
      type: "navigation_preference",
      title: "How do you explore a large museum?",
      scenario: "You have 3 hours in a major art museum",
      mapVisualization: true,
      options: [
        {
          id: "q8_flow",
          text: "Wander freely, following my instincts",
          path: "organic",
          weights: { F: 3 },
          behavior: "intuitive_discovery",
          route: {
            type: "spontaneous",
            pattern: "curved_paths"
          }
        },
        {
          id: "q8_constructive",
          text: "Follow a planned route systematically",
          path: "structured",
          weights: { C: 3 },
          behavior: "methodical_coverage",
          route: {
            type: "sequential",
            pattern: "grid_based"
          }
        }
      ]
    },

    {
      id: "q9",
      phase: 5,
      category: "spatial_behavior",
      type: "exhibition_layout",
      title: "Your preferred exhibition design?",
      layoutComparison: true,
      layouts: [
        {
          id: "q9_fluid",
          name: "Open, flowing galleries",
          description: "Spaces that merge and blend",
          visualization: {
            type: "circular_flow",
            openness: "high",
            boundaries: "minimal"
          },
          weights: { F: 2, A: 1 },
          movement: "continuous_flow"
        },
        {
          id: "q9_structured",
          name: "Clear, defined rooms",
          description: "Organized by theme or period",
          visualization: {
            type: "grid_layout",
            openness: "medium",
            boundaries: "clear"
          },
          weights: { C: 2, R: 1 },
          movement: "logical_progression"
        }
      ]
    },

    // Phase 6: Integration Questions (Questions 10-12)
    {
      id: "q10",
      phase: 6,
      category: "integration",
      type: "complex_scenario",
      title: "Your friend wants to visit a controversial exhibition with you",
      context: "The show challenges traditional art boundaries",
      multiFactorAssessment: true,
      responses: [
        {
          id: "q10_la",
          text: "I'd prefer to see it alone first, to form my own impressions",
          weights: { L: 2, A: 1 },
          approach: "personal_interpretation",
          reasoning: "Need space for personal reflection"
        },
        {
          id: "q10_sr",
          text: "Great! We can discuss the artistic techniques together",
          weights: { S: 2, R: 1 },
          approach: "collaborative_analysis",
          reasoning: "Value shared technical insights"
        },
        {
          id: "q10_se",
          text: "Yes! Sharing emotional reactions enriches the experience",
          weights: { S: 2, E: 1 },
          approach: "collective_feeling",
          reasoning: "Emotions amplified through sharing"
        },
        {
          id: "q10_lm",
          text: "I need solitude to deeply analyze the artist's intentions",
          weights: { L: 2, M: 1 },
          approach: "focused_contemplation",
          reasoning: "Deep analysis requires concentration"
        }
      ]
    }
  ],

  // Complete personality type definitions
  personalityTypes: {
    "LAEF": {
      code: "LAEF",
      name: "The Dreaming Wanderer",
      archetype: "Intuitive Solo Explorer",
      description: "A solitary soul who flows through galleries guided by intuition and emotion, creating personal narratives from abstract impressions",
      
      characteristics: {
        primary: ["introspective", "intuitive", "emotionally responsive"],
        secondary: ["free-flowing", "imaginative", "sensitive"],
        strengths: ["deep personal connection", "unique interpretations", "emotional intelligence"],
        challenges: ["may miss factual context", "difficulty sharing insights", "overwhelming in crowded spaces"]
      },
      
      galleryBehavior: {
        entryStyle: "Quiet arrival, immediate atmospheric assessment",
        viewingPattern: "Organic wandering based on emotional pulls",
        timeSpent: "Variable - long with resonant pieces, quick with others",
        socialInteraction: "Minimal, prefers solitary contemplation",
        notesTaking: "Poetic impressions, emotional sketches"
      },
      
      visualScene: {
        environment: {
          type: "Ethereal gallery space",
          lighting: "Soft, diffused natural light with shadows",
          atmosphere: "Dreamlike, contemplative",
          soundscape: "Gentle ambient sounds, footsteps echo"
        },
        avatar: {
          appearance: "Flowing, comfortable clothing",
          movement: "Graceful, meandering",
          posture: "Relaxed, open",
          accessories: "Small notebook, perhaps headphones"
        },
        visualMotifs: [
          "Floating thought bubbles",
          "Soft color auras around artworks",
          "Blurred boundaries between spaces",
          "Emotional weather patterns"
        ]
      },
      
      preferences: {
        artStyles: ["Abstract Expressionism", "Surrealism", "Installation Art", "Light Art"],
        exhibitionTypes: ["Immersive installations", "Solo artist retrospectives", "Contemplative spaces"],
        optimalConditions: ["Quiet weekday mornings", "Minimal crowds", "Natural lighting"],
        avoidance: ["Guided tours", "Crowded openings", "Rigid timelines"]
      },
      
      recommendations: {
        museums: [
          "Dia:Beacon - spacious, contemplative",
          "Rothko Chapel - emotional immersion",
          "Storm King Art Center - nature integration"
        ],
        apps: ["Meditation apps with art", "Personal journal apps", "Mood-based playlist creators"],
        experiences: ["Artist studio visits", "Dawn gallery sessions", "Art and mindfulness workshops"]
      }
    },

    "LAEC": {
      code: "LAEC",
      name: "The Structured Empath",
      archetype: "Methodical Emotional Processor",
      description: "A methodical lone viewer who deeply feels art through organized exploration, creating systematic emotional maps of their gallery journey",
      
      characteristics: {
        primary: ["organized", "deeply feeling", "introspective"],
        secondary: ["methodical", "sensitive", "thorough"],
        strengths: ["comprehensive emotional processing", "detailed memory", "pattern recognition"],
        challenges: ["inflexibility with disruptions", "emotional exhaustion", "over-planning"]
      },
      
      galleryBehavior: {
        entryStyle: "Planned arrival, studies floor plan first",
        viewingPattern: "Systematic room-by-room progression",
        timeSpent: "Consistent per artwork, predetermined schedule",
        socialInteraction: "Polite but minimal, protective of space",
        notesTaking: "Structured emotional diary entries"
      },
      
      visualScene: {
        environment: {
          type: "Traditional gallery with clear sections",
          lighting: "Even, warm lighting throughout",
          atmosphere: "Orderly, peaceful",
          soundscape: "Quiet, controlled acoustics"
        },
        avatar: {
          appearance: "Neat, comfortable attire",
          movement: "Purposeful, measured steps",
          posture: "Attentive, slightly forward lean",
          accessories: "Structured notebook, quality pen"
        },
        visualMotifs: [
          "Geometric emotion patterns",
          "Color-coded feeling charts",
          "Sequential pathway markers",
          "Organized thought arrangements"
        ]
      },
      
      preferences: {
        artStyles: ["Romanticism", "Color Field Painting", "Narrative Art", "Emotional Realism"],
        exhibitionTypes: ["Chronological surveys", "Thematic exhibitions", "Single-room focuses"],
        optimalConditions: ["Reserved time slots", "Clear gallery maps", "Quiet environments"],
        avoidance: ["Chaotic layouts", "Surprise elements", "Time pressure"]
      },
      
      recommendations: {
        museums: ["MoMA - structured collections", "National Gallery - organized by period"],
        apps: ["Museum audio guides", "Art history apps", "Structured journal apps"],
        experiences: ["Curated tours", "Educational workshops", "Docent-led experiences"]
      }
    },

    "LAMF": {
      code: "LAMF",
      name: "The Intuitive Scholar",
      archetype: "Conceptual Free Thinker",
      description: "A solitary intellectual who seeks meaning through fluid exploration, connecting abstract concepts across seemingly unrelated artworks",
      
      characteristics: {
        primary: ["analytical", "intuitive", "independent"],
        secondary: ["curious", "theoretical", "philosophical"],
        strengths: ["conceptual connections", "original theories", "deep insights"],
        challenges: ["overthinking", "isolation", "missing emotional content"]
      },
      
      galleryBehavior: {
        entryStyle: "Curious entrance, immediately seeking patterns",
        viewingPattern: "Following conceptual threads between works",
        timeSpent: "Extended with thought-provoking pieces",
        socialInteraction: "Occasional deep discussions if prompted",
        notesTaking: "Mind maps, conceptual diagrams"
      },
      
      preferences: {
        artStyles: ["Conceptual Art", "Surrealism", "Political Art", "Video Art"],
        exhibitionTypes: ["Thematic group shows", "Concept-driven exhibitions", "Artist statement focus"],
        optimalConditions: ["Flexible timing", "Thought-provoking content", "Minimal distractions"],
        avoidance: ["Superficial decoration", "Time constraints", "Overly social settings"]
      },
      
      recommendations: {
        museums: ["Whitney Biennial", "Documenta", "Venice Biennale"],
        apps: ["Philosophy apps", "Art theory resources", "Mind mapping tools"],
        experiences: ["Artist lectures", "Theory discussions", "Academic conferences"]
      }
    },

    "LAMC": {
      code: "LAMC",
      name: "The Systematic Philosopher",
      archetype: "Structured Deep Thinker",
      description: "A lone thinker who deconstructs art through structured analysis, building comprehensive frameworks for understanding artistic meaning",
      
      characteristics: {
        primary: ["methodical", "intellectual", "independent"],
        secondary: ["precise", "thorough", "critical"],
        strengths: ["comprehensive analysis", "logical frameworks", "detailed documentation"],
        challenges: ["rigidity", "emotional disconnection", "analysis paralysis"]
      },
      
      preferences: {
        artStyles: ["Minimalism", "Constructivism", "Documentary Photography", "Conceptual Art"],
        exhibitionTypes: ["Academic surveys", "Historical retrospectives", "Critical essays"],
        optimalConditions: ["Adequate time", "Detailed documentation", "Scholarly resources"],
        avoidance: ["Rushed visits", "Emotional manipulation", "Trendy exhibitions"]
      },
      
      recommendations: {
        museums: ["MOMA - academic approach", "Guggenheim - architectural analysis"],
        apps: ["Art history databases", "Critical theory apps", "Academic journals"],
        experiences: ["Scholarly lectures", "Curatorial talks", "Academic seminars"]
      }
    },

    "LREF": {
      code: "LREF",
      name: "The Observant Drifter",
      archetype: "Detail-Focused Wanderer",
      description: "A detail-oriented solo explorer who discovers art through wandering, finding joy in technical mastery and hidden details",
      
      characteristics: {
        primary: ["observant", "independent", "detail-focused"],
        secondary: ["spontaneous", "patient", "technically minded"],
        strengths: ["noticing overlooked details", "technical appreciation", "flexible exploration"],
        challenges: ["missing bigger picture", "time management", "sharing discoveries"]
      },
      
      preferences: {
        artStyles: ["Hyperrealism", "Dutch Masters", "Nature Photography", "Technical Drawing"],
        exhibitionTypes: ["Craft exhibitions", "Technique demonstrations", "Process-focused shows"],
        optimalConditions: ["Good lighting", "Close viewing access", "Flexible timing"],
        avoidance: ["Rushed tours", "Poor lighting", "No detail access"]
      },
      
      recommendations: {
        museums: ["Frick Collection - intimate viewing", "Cooper Hewitt - design focus"],
        apps: ["Magnification tools", "Technique databases", "Artist process videos"],
        experiences: ["Studio tours", "Technique workshops", "Conservation talks"]
      }
    },

    "LREC": {
      code: "LREC",
      name: "The Emotional Realist",
      archetype: "Structured Empathetic Observer",
      description: "A solitary viewer who connects emotionally with realistic art through structured viewing, finding deep human stories in figurative works",
      
      characteristics: {
        primary: ["empathetic", "organized", "realistic"],
        secondary: ["introspective", "narrative-focused", "patient"],
        strengths: ["emotional depth with realism", "structured processing", "story recognition"],
        challenges: ["limited to figurative art", "emotional overwhelm", "slow progression"]
      },
      
      preferences: {
        artStyles: ["Portrait Galleries", "Social Realism", "Narrative Paintings", "Historical Art"],
        exhibitionTypes: ["Portrait exhibitions", "Historical narratives", "Human interest shows"],
        optimalConditions: ["Quiet contemplation time", "Human subjects", "Emotional safety"],
        avoidance: ["Abstract art", "Disturbing content", "Rushed viewing"]
      },
      
      recommendations: {
        museums: ["National Portrait Gallery", "Metropolitan Museum portraits"],
        apps: ["Historical context apps", "Portrait analysis tools", "Emotional wellness apps"],
        experiences: ["Portrait painting classes", "Historical tours", "Empathy workshops"]
      }
    },

    "LRMF": {
      code: "LRMF",
      name: "The Technical Explorer",
      archetype: "Craftsmanship Detective",
      description: "A detail-focused analyst who freely investigates artistic techniques alone, uncovering the secrets of artistic mastery",
      
      characteristics: {
        primary: ["technical", "curious", "independent"],
        secondary: ["investigative", "hands-on", "persistent"],
        strengths: ["technique analysis", "process understanding", "discovery skills"],
        challenges: ["emotional blindness", "obsessive focus", "social isolation"]
      },
      
      preferences: {
        artStyles: ["Old Master Drawings", "Technical Studies", "Process Art", "Conservation"],
        exhibitionTypes: ["Technique exhibitions", "Conservation displays", "Artist process shows"],
        optimalConditions: ["Technical access", "Process information", "Hands-on elements"],
        avoidance: ["Emotional art", "No technical info", "Conceptual-only shows"]
      },
      
      recommendations: {
        museums: ["Artist studios", "Conservation labs", "Craft museums"],
        apps: ["Technique databases", "Process videos", "Materials guides"],
        experiences: ["Technique workshops", "Conservation tours", "Artist demonstrations"]
      }
    },

    "LRMC": {
      code: "LRMC",
      name: "The Methodical Critic",
      archetype: "Systematic Art Analyst",
      description: "A systematic solo analyzer focused on technical mastery and meaning, building comprehensive critical assessments",
      
      characteristics: {
        primary: ["critical", "systematic", "technical"],
        secondary: ["independent", "thorough", "objective"],
        strengths: ["comprehensive critique", "technical expertise", "objective analysis"],
        challenges: ["harsh judgments", "emotional distance", "inflexibility"]
      },
      
      preferences: {
        artStyles: ["Academic Art", "Technical Masterpieces", "Art History Surveys", "Critical Theory"],
        exhibitionTypes: ["Academic exhibitions", "Critical surveys", "Historical analyses"],
        optimalConditions: ["Critical materials", "Technical documentation", "Scholarly context"],
        avoidance: ["Trendy art", "Emotional manipulation", "Popular culture"]
      },
      
      recommendations: {
        museums: ["Academic institutions", "Art history museums", "Critical exhibitions"],
        apps: ["Critical databases", "Academic journals", "Analysis tools"],
        experiences: ["Academic conferences", "Critical seminars", "Scholarly debates"]
      }
    },

    "SAEF": {
      code: "SAEF",
      name: "The Social Dreamweaver",
      archetype: "Collective Emotion Navigator",
      description: "A group-oriented intuitive who shares emotional art experiences fluidly, creating collective narratives and shared feelings",
      
      characteristics: {
        primary: ["social", "intuitive", "emotionally expressive"],
        secondary: ["fluid", "connective", "inspiring"],
        strengths: ["group energy creation", "emotional contagion", "inclusive interpretation"],
        challenges: ["personal boundary issues", "groupthink susceptibility", "energy depletion"]
      },
      
      preferences: {
        artStyles: ["Participatory Art", "Immersive Exhibitions", "Community Projects", "Interactive Art"],
        exhibitionTypes: ["Social engagement", "Participatory experiences", "Community events"],
        optimalConditions: ["Group experiences", "Social interaction", "Emotional safety"],
        avoidance: ["Solitary viewing", "Rigid structures", "Emotional distance"]
      },
      
      recommendations: {
        museums: ["Interactive museums", "Community art centers", "Social practice venues"],
        apps: ["Social sharing apps", "Group coordination tools", "Emotional expression apps"],
        experiences: ["Group art making", "Community projects", "Social practice workshops"]
      }
    },

    "SAEC": {
      code: "SAEC",
      name: "The Organized Empath",
      archetype: "Structured Social Facilitator",
      description: "A social viewer who shares structured emotional journeys through art, creating organized group experiences",
      
      characteristics: {
        primary: ["empathetic", "organized", "social"],
        secondary: ["structured", "facilitating", "inclusive"],
        strengths: ["group emotional guidance", "structured sharing", "inclusive planning"],
        challenges: ["over-structuring spontaneity", "emotional labor", "rigid expectations"]
      },
      
      preferences: {
        artStyles: ["Themed Exhibitions", "Emotional Journey Curation", "Group Workshops", "Educational Art"],
        exhibitionTypes: ["Structured tours", "Educational programs", "Group workshops"],
        optimalConditions: ["Group coordination", "Emotional structure", "Clear guidance"],
        avoidance: ["Chaotic experiences", "Emotional overwhelm", "Lack of structure"]
      },
      
      recommendations: {
        museums: ["Educational museums", "Structured tour programs", "Workshop venues"],
        apps: ["Group planning apps", "Educational tools", "Emotional wellness apps"],
        experiences: ["Educational tours", "Group workshops", "Facilitated discussions"]
      }
    },

    "SAMF": {
      code: "SAMF",
      name: "The Collaborative Philosopher",
      archetype: "Intellectual Community Builder",
      description: "A social thinker who explores abstract meanings through fluid group dialogue, facilitating collective understanding",
      
      characteristics: {
        primary: ["intellectual", "social", "abstract"],
        secondary: ["dynamic", "facilitating", "synthesizing"],
        strengths: ["group idea synthesis", "dynamic discussions", "collective insights"],
        challenges: ["intellectual dominance", "abstract tangents", "consensus seeking"]
      },
      
      preferences: {
        artStyles: ["Conceptual Group Shows", "Philosophy and Art", "Experimental Spaces", "Critical Theory"],
        exhibitionTypes: ["Discussion-based", "Collaborative interpretation", "Philosophical exploration"],
        optimalConditions: ["Group dialogue", "Intellectual stimulation", "Abstract concepts"],
        avoidance: ["Superficial conversation", "Authoritarian guidance", "Concrete restrictions"]
      },
      
      recommendations: {
        museums: ["Philosophy museums", "Experimental venues", "Discussion-friendly spaces"],
        apps: ["Discussion platforms", "Philosophy apps", "Collaborative thinking tools"],
        experiences: ["Philosophy cafes", "Art theory discussions", "Collaborative workshops"]
      }
    },

    "SAMC": {
      code: "SAMC",
      name: "The Structured Educator",
      archetype: "Systematic Knowledge Sharer",
      description: "A systematic social analyzer who guides groups through symbolic interpretation, building collective understanding",
      
      characteristics: {
        primary: ["educational", "systematic", "social"],
        secondary: ["analytical", "clear", "patient"],
        strengths: ["clear art education", "systematic teaching", "group learning"],
        challenges: ["inflexible methods", "over-explaining", "pace mismatches"]
      },
      
      preferences: {
        artStyles: ["Symbolic Art History", "Curated Educational Tours", "Interpretive Exhibitions", "Academic Art"],
        exhibitionTypes: ["Educational programs", "Systematic learning", "Interpretive guidance"],
        optimalConditions: ["Teaching opportunities", "Systematic approach", "Clear learning goals"],
        avoidance: ["Unstructured exploration", "No educational value", "Chaotic environments"]
      },
      
      recommendations: {
        museums: ["Educational institutions", "Teaching museums", "Interpretive centers"],
        apps: ["Educational tools", "Teaching platforms", "Learning management systems"],
        experiences: ["Teaching opportunities", "Educational conferences", "Curriculum development"]
      }
    },

    "SREF": {
      code: "SREF",
      name: "The Social Observer",
      archetype: "Detail-Sharing Enthusiast",
      description: "A detail-sharing enthusiast who explores realistic art spontaneously with others, discovering and sharing hidden treasures",
      
      characteristics: {
        primary: ["observant", "social", "spontaneous"],
        secondary: ["detail-oriented", "enthusiastic", "sharing"],
        strengths: ["contagious enthusiasm", "detail discovery", "spontaneous connections"],
        challenges: ["overwhelming others", "missing depth", "scattered attention"]
      },
      
      preferences: {
        artStyles: ["Group Sketching Sessions", "Realist Exhibitions", "Photography Walks", "Detail-Rich Art"],
        exhibitionTypes: ["Interactive discovery", "Social exploration", "Spontaneous sharing"],
        optimalConditions: ["Social interaction", "Detail access", "Sharing opportunities"],
        avoidance: ["Solitary viewing", "Abstract art", "Restricted interaction"]
      },
      
      recommendations: {
        museums: ["Interactive museums", "Photography venues", "Detail-rich collections"],
        apps: ["Sharing platforms", "Discovery tools", "Social photography apps"],
        experiences: ["Group discovery tours", "Photography walks", "Social art events"]
      }
    },

    "SREC": {
      code: "SREC",
      name: "The Emotional Docent",
      archetype: "Empathetic Tour Guide",
      description: "A structured social guide who shares emotional connections to realistic art, creating meaningful group experiences",
      
      characteristics: {
        primary: ["empathetic", "organized", "realistic"],
        secondary: ["social", "guiding", "storytelling"],
        strengths: ["emotional tour leadership", "relatable connections", "structured empathy"],
        challenges: ["emotional drain", "rigid tour structure", "projection risks"]
      },
      
      preferences: {
        artStyles: ["Figurative Art Tours", "Emotional Realism", "Portrait Galleries", "Human Stories"],
        exhibitionTypes: ["Emotional tours", "Human interest", "Guided empathy"],
        optimalConditions: ["Group guidance", "Emotional content", "Human subjects"],
        avoidance: ["Abstract art", "Impersonal content", "Unguided exploration"]
      },
      
      recommendations: {
        museums: ["Portrait galleries", "Human interest museums", "Emotional art venues"],
        apps: ["Tour guide apps", "Emotional wellness tools", "Storytelling platforms"],
        experiences: ["Tour guide training", "Empathy workshops", "Storytelling events"]
      }
    },

    "SRMF": {
      code: "SRMF",
      name: "The Technical Collaborator",
      archetype: "Technique-Sharing Explorer",
      description: "A detail-focused social explorer who shares technical discoveries freely, building collective technical knowledge",
      
      characteristics: {
        primary: ["technical", "collaborative", "explorative"],
        secondary: ["detail-focused", "sharing", "discovering"],
        strengths: ["technical knowledge sharing", "collaborative discovery", "skill building"],
        challenges: ["technical jargon overuse", "excluding non-technical people", "scattered focus"]
      },
      
      preferences: {
        artStyles: ["Technique Workshops", "Artist Demonstrations", "Collaborative Analysis", "Process Art"],
        exhibitionTypes: ["Technical exploration", "Collaborative discovery", "Skill sharing"],
        optimalConditions: ["Technical access", "Collaborative environment", "Learning opportunities"],
        avoidance: ["No technical content", "Isolated viewing", "Superficial experiences"]
      },
      
      recommendations: {
        museums: ["Technical museums", "Artist studios", "Craft centers"],
        apps: ["Technical sharing platforms", "Collaborative tools", "Skill learning apps"],
        experiences: ["Technical workshops", "Collaborative projects", "Skill sharing events"]
      }
    },

    "SRMC": {
      code: "SRMC",
      name: "The Systematic Lecturer",
      archetype: "Academic Group Educator",
      description: "A methodical social educator focused on technical analysis and meaning, delivering comprehensive art education",
      
      characteristics: {
        primary: ["educational", "systematic", "technical"],
        secondary: ["social", "authoritative", "comprehensive"],
        strengths: ["comprehensive education", "technical expertise", "structured learning"],
        challenges: ["rigid teaching style", "intimidating expertise", "pace issues"]
      },
      
      preferences: {
        artStyles: ["Academic Lectures", "Systematic Art Education", "Historical Surveys", "Technical Analysis"],
        exhibitionTypes: ["Educational lectures", "Systematic teaching", "Academic programs"],
        optimalConditions: ["Teaching environment", "Academic content", "Structured learning"],
        avoidance: ["Casual exploration", "Non-academic content", "Unstructured environments"]
      },
      
      recommendations: {
        museums: ["Academic museums", "Educational institutions", "Lecture venues"],
        apps: ["Educational platforms", "Academic tools", "Teaching resources"],
        experiences: ["Academic lectures", "Educational conferences", "Teaching opportunities"]
      }
    }
  },

  // Scoring and analysis algorithms
  scoring: {
    calculateDimensions: function(responses) {
      const dimensions = { L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 };
      
      responses.forEach(response => {
        if (response.weights) {
          Object.entries(response.weights).forEach(([dim, value]) => {
            dimensions[dim] += value;
          });
        }
      });
      
      return dimensions;
    },
    
    determineType: function(dimensions) {
      return (
        (dimensions.L > dimensions.S ? 'L' : 'S') +
        (dimensions.A > dimensions.R ? 'A' : 'R') +
        (dimensions.E > dimensions.M ? 'E' : 'M') +
        (dimensions.F > dimensions.C ? 'F' : 'C')
      );
    },
    
    calculateConfidence: function(dimensions) {
      const axes = [
        { left: 'L', right: 'S' },
        { left: 'A', right: 'R' },
        { left: 'E', right: 'M' },
        { left: 'F', right: 'C' }
      ];
      
      const confidences = axes.map(axis => {
        const total = dimensions[axis.left] + dimensions[axis.right];
        const diff = Math.abs(dimensions[axis.left] - dimensions[axis.right]);
        return total > 0 ? (diff / total) * 100 : 50;
      });
      
      return {
        overall: confidences.reduce((a, b) => a + b, 0) / 4,
        byAxis: confidences
      };
    }
  },

  // Recommendation engine
  recommendations: {
    generateRecommendations: function(personalityType) {
      const type = this.personalityTypes[personalityType];
      
      return {
        exhibitions: this.matchExhibitions(type),
        artworks: this.matchArtworks(type),
        museums: this.matchMuseums(type),
        events: this.matchEvents(type),
        apps: this.matchApps(type),
        communities: this.matchCommunities(type)
      };
    },
    
    matchExhibitions: function(type) {
      // Exhibition matching logic based on personality traits
      const exhibitionDatabase = {
        immersive: ["TeamLab Borderless", "Rain Room", "Infinity Mirrors"],
        classical: ["Old Masters", "Renaissance Redux", "Academic Salon"],
        conceptual: ["Conceptual Photography", "Text as Art", "Philosophical Objects"],
        technical: ["Process and Materials", "Conservation Revealed", "Artist Studios"],
        emotional: ["Expressionist Visions", "Color and Emotion", "Human Stories"],
        social: ["Participatory Art", "Community Projects", "Interactive Installations"]
      };
      
      // Match based on type preferences
      return type.preferences.exhibitionTypes.map(prefType => {
        const key = prefType.toLowerCase().split(' ')[0];
        return exhibitionDatabase[key] || [];
      }).flat();
    },
    
    matchArtworks: function(type) {
      // Artwork recommendation based on style preferences
      return type.preferences.artStyles.map(style => ({
        style: style,
        examples: this.getArtworkExamples(style),
        reason: this.getMatchReason(type, style)
      }));
    },
    
    getArtworkExamples: function(style) {
      const examples = {
        "Abstract Expressionism": ["Rothko's color fields", "Pollock's drip paintings"],
        "Surrealism": ["Dalí's dreamscapes", "Magritte's mysteries"],
        "Impressionism": ["Monet's water lilies", "Renoir's light studies"],
        "Realism": ["Vermeer's interiors", "Hopper's solitude"],
        "Installation Art": ["Kusama's infinity rooms", "Eliasson's weather"],
        "Conceptual Art": ["Weiner's text pieces", "Kawara's date paintings"]
      };
      
      return examples[style] || ["Various works in this style"];
    },
    
    getMatchReason: function(type, style) {
      // Generate personalized reason for recommendation
      const traits = type.characteristics.primary;
      return `This style aligns with your ${traits.join(', ')} nature`;
    }
  }
};

// Export for use in backend
module.exports = {
  sayuEnhancedQuizData,
  
  // Utility functions
  processQuizResponse: function(sessionId, questionId, answer) {
    const session = this.getSession(sessionId);
    const question = sayuEnhancedQuizData.questions.find(q => q.id === questionId);
    const selectedOption = question.options.find(opt => opt.id === answer);
    
    // Update session with response
    session.responses.push({
      questionId: questionId,
      answer: answer,
      weights: selectedOption.weights,
      timestamp: new Date().toISOString()
    });
    
    // Calculate updated dimensions
    const dimensions = sayuEnhancedQuizData.scoring.calculateDimensions(session.responses);
    
    // Determine next question or calculate result
    const isComplete = session.responses.length >= sayuEnhancedQuizData.questions.length;
    
    if (isComplete) {
      const personalityType = sayuEnhancedQuizData.scoring.determineType(dimensions);
      const confidence = sayuEnhancedQuizData.scoring.calculateConfidence(dimensions);
      
      return sayuEnhancedQuizData.formatters.resultResponse(personalityType, dimensions, confidence);
    } else {
      return sayuEnhancedQuizData.formatters.quizResponse(questionId, answer, session);
    }
  },
  
  // Session management
  createSession: function() {
    return {
      sessionId: this.generateSessionId(),
      startTime: new Date().toISOString(),
      responses: [],
      currentPhase: 1,
      dimensions: { L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 }
    };
  },
  
  generateSessionId: function() {
    return 'sayu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
};