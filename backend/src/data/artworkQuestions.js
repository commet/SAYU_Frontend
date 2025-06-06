module.exports = {
  core: [
    {
      id: 'C1',
      type: 'visual',
      question: 'Which painting feels more intriguing to you?',
      options: [
        {
          id: 'A',
          image: '/images/quiz/C1_A.PNG',
          tags: ['symbolic_complexity', 'layered_narrative'],
          description: 'A symbolic scene with a layered narrative'
        },
        {
          id: 'B',
          image: '/images/quiz/C1_B.PNG',
          tags: ['clear_composition', 'sharp_lines'],
          description: 'A clear and calm composition with sharp lines'
        }
      ]
    },
    {
      id: 'C2',
      type: 'visual',
      question: 'What kind of art speaks to you most?',
      options: [
        {
          id: 'A',
          image: '/images/quiz/C2_A.PNG',
          text: 'Art that tells a story or conveys deep meaning',
          tags: ['narrative', 'conceptual']
        },
        {
          id: 'B',
          image: '/images/quiz/C2_B.PNG',
          text: 'Art that captures beauty and aesthetic harmony',
          tags: ['aesthetic', 'formal']
        }
      ]
    },
    {
      id: 'C3',
      type: 'text',
      question: 'When looking at art, you are drawn to:',
      options: [
        {
          id: 'A',
          text: 'Bold, expressive brushstrokes and textures',
          tags: ['expressive', 'gestural']
        },
        {
          id: 'B',
          text: 'Precise, refined details and craftsmanship',
          tags: ['precise', 'refined']
        }
      ]
    },
    {
      id: 'C4',
      type: 'text',
      question: 'Your ideal artwork would be:',
      options: [
        {
          id: 'A',
          text: 'Emotionally provocative and thought-provoking',
          tags: ['emotional', 'intellectual']
        },
        {
          id: 'B',
          text: 'Visually pleasing and harmonious',
          tags: ['decorative', 'harmonious']
        }
      ]
    },
    {
      id: 'C5',
      type: 'visual',
      question: 'You prefer art that:',
      options: [
        {
          id: 'A',
          image: '/images/quiz/C5_A.PNG',
          text: 'Challenges your perceptions and makes you think',
          tags: ['challenging', 'conceptual']
        },
        {
          id: 'B',
          image: '/images/quiz/C5_B.PNG',
          text: 'Provides a sense of peace and beauty',
          tags: ['peaceful', 'beautiful']
        }
      ]
    },
    {
      id: 'C6',
      type: 'text',
      question: 'In terms of color, you gravitate towards:',
      options: [
        {
          id: 'A',
          text: 'Bold contrasts and unexpected combinations',
          tags: ['bold_color', 'contrasting']
        },
        {
          id: 'B',
          text: 'Subtle gradations and harmonious palettes',
          tags: ['subtle_color', 'harmonious']
        }
      ]
    },
    {
      id: 'C7',
      type: 'text',
      question: 'The art that moves you most:',
      options: [
        {
          id: 'A',
          text: 'Breaks rules and pushes boundaries',
          tags: ['innovative', 'boundary_pushing']
        },
        {
          id: 'B',
          text: 'Masters traditional techniques and forms',
          tags: ['traditional', 'masterful']
        }
      ]
    },
    {
      id: 'C8',
      type: 'visual',
      question: 'You connect more with art that is:',
      options: [
        {
          id: 'A',
          image: '/images/quiz/C8_A.PNG',
          text: 'Abstract and open to interpretation',
          tags: ['abstract', 'interpretive']
        },
        {
          id: 'B',
          image: '/images/quiz/C8_B.PNG',
          text: 'Representational and clearly defined',
          tags: ['representational', 'clear']
        }
      ]
    }
  ],
  painting: [
    {
      id: 'P1',
      type: 'text',
      question: 'Which painting would you prefer to hang at home?',
      options: [
        {
          id: 'A',
          text: 'A rich still-life with vibrant colors and structure',
          tags: ['vibrant_color', 'structured', 'traditional']
        },
        {
          id: 'B',
          text: 'A calm flower painting with soft tones and texture',
          tags: ['soft_tones', 'textured', 'peaceful']
        }
      ]
    },
    {
      id: 'P2',
      type: 'text',
      question: 'Your preferred painting style is:',
      options: [
        {
          id: 'A',
          text: 'Impressionistic with visible brushstrokes',
          tags: ['impressionistic', 'textured']
        },
        {
          id: 'B',
          text: 'Photorealistic with smooth surfaces',
          tags: ['realistic', 'smooth']
        }
      ]
    },
    {
      id: 'P3',
      type: 'visual',
      question: 'In landscape paintings, you prefer:',
      options: [
        {
          id: 'A',
          image: '/images/quiz/P3_A.png',
          text: 'Dramatic skies and emotional atmospheres',
          tags: ['dramatic', 'atmospheric']
        },
        {
          id: 'B',
          image: '/images/quiz/P3_B.PNG',
          text: 'Serene views and balanced compositions',
          tags: ['serene', 'balanced']
        }
      ]
    },
    {
      id: 'P4',
      type: 'visual',
      question: 'Your ideal portrait would:',
      options: [
        {
          id: 'A',
          image: '/images/quiz/P4_A.PNG',
          text: 'Reveal inner psychology and emotion',
          tags: ['psychological', 'expressive']
        },
        {
          id: 'B',
          image: '/images/quiz/P4_B.PNG',
          text: 'Capture physical beauty and likeness',
          tags: ['beautiful', 'accurate']
        }
      ]
    }
  ],
  multidimensional: [
    {
      id: 'M1',
      type: 'text',
      question: 'You are most excited by:',
      options: [
        {
          id: 'A',
          text: 'Interactive installations that respond to your presence',
          tags: ['interactive', 'responsive']
        },
        {
          id: 'B',
          text: 'Video art that tells compelling stories',
          tags: ['narrative', 'video']
        }
      ]
    },
    {
      id: 'M2',
      type: 'visual',
      question: 'In contemporary art spaces, you prefer:',
      options: [
        {
          id: 'A',
          image: '/images/quiz/M2_A.PNG',
          text: 'Immersive environments that surround you',
          tags: ['immersive', 'environmental']
        },
        {
          id: 'B',
          image: '/images/quiz/M2_B.PNG',
          text: 'Focused experiences with single powerful works',
          tags: ['focused', 'singular']
        }
      ]
    },
    {
      id: 'M3',
      type: 'text',
      question: 'Sound in art should:',
      options: [
        {
          id: 'A',
          text: 'Create unexpected sensory experiences',
          tags: ['experimental', 'sensory']
        },
        {
          id: 'B',
          text: 'Enhance the visual narrative',
          tags: ['supportive', 'narrative']
        }
      ]
    },
    {
      id: 'M4',
      type: 'visual',
      question: 'Digital art appeals to you when it:',
      options: [
        {
          id: 'A',
          image: '/images/quiz/M4_A.PNG',
          text: 'Explores new possibilities beyond physical media',
          tags: ['innovative', 'digital_native']
        },
        {
          id: 'B',
          image: '/images/quiz/M4_B.PNG',
          text: 'Recreates traditional art forms digitally',
          tags: ['traditional_digital', 'familiar']
        }
      ]
    }
  ],
  mixed: [
    {
      id: 'X1',
      type: 'text',
      question: 'You appreciate art most when it:',
      options: [
        {
          id: 'A',
          text: 'Combines multiple mediums in unexpected ways',
          tags: ['multimedia', 'experimental']
        },
        {
          id: 'B',
          text: 'Masters a single medium to perfection',
          tags: ['purist', 'masterful']
        }
      ]
    },
    {
      id: 'X2',
      type: 'text',
      question: 'The best art experience includes:',
      options: [
        {
          id: 'A',
          text: 'Elements of surprise and discovery',
          tags: ['surprising', 'discovery']
        },
        {
          id: 'B',
          text: 'Clear artistic vision and execution',
          tags: ['clear_vision', 'well_executed']
        }
      ]
    },
    {
      id: 'X3',
      type: 'text',
      question: 'You prefer artworks that:',
      options: [
        {
          id: 'A',
          text: 'Evolve and change over time',
          tags: ['temporal', 'changing']
        },
        {
          id: 'B',
          text: 'Remain timeless and unchanging',
          tags: ['timeless', 'permanent']
        }
      ]
    },
    {
      id: 'X4',
      type: 'text',
      question: 'Art should primarily:',
      options: [
        {
          id: 'A',
          text: 'Question and provoke discussion',
          tags: ['questioning', 'provocative']
        },
        {
          id: 'B',
          text: 'Inspire and uplift the spirit',
          tags: ['inspiring', 'uplifting']
        }
      ]
    }
  ]
};