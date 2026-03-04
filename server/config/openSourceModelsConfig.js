/**
 * 🦙 Open-Source Models Configuration
 * 
 * Configuration pour modèles open-source:
 * - LLaMA (Meta)
 * - Mistral (Mistral AI)
 * - Phi (Microsoft)
 * - Zephyr (HuggingFace)
 * - Neural-Chat (Intel)
 * - CodeLLaMA
 * - etc.
 */

module.exports = {
  // ═══════════════════════════════════════════════════════════════
  // LLAMA FAMILY (Meta)
  // ═══════════════════════════════════════════════════════════════

  llama: {
    provider: 'ollama', // or huggingface, azure, etc.
    models: {
      'llama2': {
        name: 'Llama 2 7B',
        size: '3.8GB',
        capabilities: {
          language: true,
          code: true,
          multimodal: false,
          streaming: true,
          tools: false
        },
        performance: {
          speed: 'medium',
          quality: 'good',
          memory: 'low'
        },
        costTier: 'free', // if self-hosted
        setup: {
          command: 'ollama pull llama2',
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
        }
      },
      'llama2-13b': {
        name: 'Llama 2 13B',
        size: '7.3GB',
        capabilities: {
          language: true,
          code: true,
          multimodal: false,
          streaming: true,
          tools: false
        },
        performance: {
          speed: 'medium',
          quality: 'excellent',
          memory: 'medium'
        },
        costTier: 'free',
        setup: {
          command: 'ollama pull llama2:13b',
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
        }
      },
      'llama2-70b': {
        name: 'Llama 2 70B',
        size: '39GB',
        capabilities: {
          language: true,
          code: true,
          multimodal: false,
          streaming: true,
          tools: false
        },
        performance: {
          speed: 'slow',
          quality: 'excellent',
          memory: 'high'
        },
        costTier: 'free',
        setup: {
          command: 'ollama pull llama2:70b',
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
          requirements: 'GPU recommended, 80GB+ VRAM'
        }
      },
      'codellama': {
        name: 'Code Llama 7B',
        size: '3.6GB',
        specialization: 'code',
        capabilities: {
          language: true,
          code: true,
          multimodal: false,
          streaming: true,
          tools: false
        },
        performance: {
          speed: 'medium',
          quality: 'excellent-code',
          memory: 'low'
        },
        costTier: 'free',
        setup: {
          command: 'ollama pull codellama',
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
        }
      },
      'codellama-34b': {
        name: 'Code Llama 34B',
        size: '19GB',
        specialization: 'code',
        capabilities: {
          language: true,
          code: true,
          multimodal: false,
          streaming: true,
          tools: false
        },
        costTier: 'free',
        setup: {
          command: 'ollama pull codellama:34b',
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // MISTRAL FAMILY (Mistral AI)
  // ═══════════════════════════════════════════════════════════════

  mistral: {
    provider: 'ollama',
    models: {
      'mistral': {
        name: 'Mistral 7B',
        size: '4GB',
        capabilities: {
          language: true,
          code: true,
          multimodal: false,
          streaming: true,
          tools: false
        },
        performance: {
          speed: 'very-fast',
          quality: 'very-good',
          memory: 'low'
        },
        costTier: 'free',
        highlights: [
          'Très rapide',
          'Léger',
          'Excellent ratio qual/perf',
          'Support streaming',
          'Bon pour production'
        ],
        setup: {
          command: 'ollama pull mistral',
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
          recommendation: 'HIGHLY RECOMMENDED for production'
        }
      },
      'mistral-7b-instruct': {
        name: 'Mistral 7B Instruct',
        size: '4GB',
        fine_tuning: 'instruction-tuned',
        capabilities: {
          language: true,
          code: true,
          multimodal: false,
          streaming: true,
          tools: true,
          functionCalling: true
        },
        performance: {
          speed: 'very-fast',
          quality: 'excellent',
          memory: 'low',
          temperature: 0.7
        },
        costTier: 'free',
        highlights: [
          'Optimisé pour instructions',
          'Function calling support',
          'Peut utiliser tools',
          'Structured output support'
        ],
        setup: {
          command: 'ollama pull mistral:instruct',
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
        }
      },
      'mistral-medium': {
        name: 'Mistral Medium',
        size: 'API-based',
        capabilities: {
          language: true,
          code: true,
          multimodal: false,
          streaming: true,
          tools: true
        },
        costTier: 'low-cost',
        setup: {
          apiEndpoint: 'https://api.mistral.ai/v1/chat/completions',
          apiKey: process.env.MISTRAL_API_KEY,
          model: 'mistral-medium'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // PHI FAMILY (Microsoft)
  // ═══════════════════════════════════════════════════════════════

  phi: {
    provider: 'ollama',
    models: {
      'phi': {
        name: 'Phi 2.7B',
        size: '1.6GB',
        capabilities: {
          language: true,
          code: true,
          multimodal: false,
          streaming: true,
          tools: false
        },
        performance: {
          speed: 'extremely-fast',
          quality: 'good', // surprisingly good for size
          memory: 'extremely-low'
        },
        costTier: 'free',
        highlights: [
          'Très petit (1.6GB)',
          'Ultra-léger',
          'Idéal pour edge devices',
          'Peut tourner sur Raspberry Pi',
          'Très rapide'
        ],
        setup: {
          command: 'ollama pull phi',
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
          recommendation: 'BEST for edge/embedded devices'
        }
      },
      'phi-2': {
        name: 'Phi 2 (3B)',
        size: '1.8GB',
        capabilities: {
          language: true,
          code: true,
          multimodal: false,
          streaming: true,
          tools: false
        },
        performance: {
          speed: 'extremely-fast',
          quality: 'excellent',
          memory: 'extremely-low'
        },
        costTier: 'free',
        highlights: [
          'Meilleur rapport taille/qualité',
          'Bon pour production légère',
          'Recommandé par Microsoft'
        ],
        setup: {
          command: 'ollama pull phi:2',
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // ZEPHYR FAMILY (HuggingFace)
  // ═══════════════════════════════════════════════════════════════

  zephyr: {
    provider: 'ollama',
    models: {
      'zephyr': {
        name: 'Zephyr 7B Beta',
        size: '4GB',
        baseModel: 'Mistral 7B',
        fine_tuning: 'chat-optimized',
        capabilities: {
          language: true,
          code: true,
          multimodal: false,
          streaming: true,
          tools: false,
          chatExcellence: true // Specialized for chat
        },
        performance: {
          speed: 'very-fast',
          quality: 'excellent',
          memory: 'low',
          chatQuality: 'outstanding'
        },
        costTier: 'free',
        highlights: [
          'Optimisé pour chat',
          'Excellentes réponses conversationnelles',
          'Basé sur Mistral',
          'Très conversationnel'
        ],
        setup: {
          command: 'ollama pull zephyr',
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // NEURAL-CHAT (Intel)
  // ═══════════════════════════════════════════════════════════════

  neural_chat: {
    provider: 'ollama',
    models: {
      'neural-chat': {
        name: 'Neural Chat 7B',
        size: '4GB',
        optimizedBy: 'Intel',
        capabilities: {
          language: true,
          code: true,
          multimodal: false,
          streaming: true,
          tools: false,
          chatOptimized: true
        },
        performance: {
          speed: 'fast',
          quality: 'excellent',
          memory: 'low',
          intelOptimization: 'yes'
        },
        costTier: 'free',
        highlights: [
          'Optimisé par Intel',
          'Bon pour chat',
          'Bon support français',
          'Production-ready'
        ],
        setup: {
          command: 'ollama pull neural-chat',
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
          recommendation: 'DEFAULT RECOMMENDATION'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // DOLPHIN FAMILY (Eric Hartford)
  // ═══════════════════════════════════════════════════════════════

  dolphin: {
    provider: 'ollama',
    models: {
      'dolphin-mixtral': {
        name: 'Dolphin Mixtral 8x7B',
        size: '26GB',
        baseModel: 'Mixtral 8x7B',
        specialization: 'uncensored-reasoning',
        capabilities: {
          language: true,
          code: true,
          multimodal: false,
          streaming: true,
          tools: true,
          reasoning: true
        },
        performance: {
          speed: 'medium',
          quality: 'outstanding',
          memory: 'high'
        },
        costTier: 'free',
        highlights: [
          'Très intelligent',
          'Bon reasoning',
          'Moins filtré',
          'Excellent qualité'
        ],
        setup: {
          command: 'ollama pull dolphin-mixtral',
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
          requirements: '32GB+ VRAM recommended'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // SELECTION HELPER
  // ═══════════════════════════════════════════════════════════════

  selectModel(requirements = {}) {
    const {
      speed = 'medium', // fast, medium, slow
      intelligence = 'good', // good, excellent, outstanding
      memory = 'medium', // low, medium, high
      specialization = 'general', // general, chat, code
      local = true // true/false
    } = requirements;

    const recommendations = [];

    // Recommandations par cas d'usage
    if (memory === 'low' && speed === 'very-fast') {
      recommendations.push('phi', 'phi-2'); // Best for low mem + speed
    }

    if (specialization === 'chat') {
      recommendations.push('zephyr', 'neural-chat'); // Chat optimized
    }

    if (specialization === 'code') {
      recommendations.push('codellama', 'codellama-34b'); // Code specialized
    }

    if (intelligence === 'outstanding' && memory === 'high') {
      recommendations.push('dolphin-mixtral', 'llama2-70b'); // Maximum intelligence
    }

    if (intelligence === 'excellent' && memory === 'medium') {
      recommendations.push('mistral', 'llama2-13b', 'zephyr'); // Good balance
    }

    // Default: Production recommendation
    if (recommendations.length === 0) {
      recommendations.push('mistral', 'neural-chat', 'zephyr');
    }

    return {
      topRecommendation: recommendations[0],
      allRecommendations: recommendations,
      reasoning: `Selected for: speed=${speed}, intelligence=${intelligence}, memory=${memory}`
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // SETUP GUIDE
  // ═══════════════════════════════════════════════════════════════

  setupGuide: {
    quickStart: [
      '1. Install Ollama: https://ollama.ai',
      '2. Run: ollama serve',
      '3. In another terminal: ollama pull mistral (or model of choice)',
      '4. Verify: curl http://localhost:11434/api/tags',
      '5. Ready to use!'
    ],
    modelRecommendations: {
      production: ['mistral', 'neural-chat', 'zephyr'],
      lowMemory: ['phi', 'phi-2'],
      bestChat: ['zephyr', 'neural-chat'],
      bestCode: ['codellama', 'codellama-34b'],
      bestQuality: ['dolphin-mixtral', 'llama2-70b']
    },
    performanceComparison: {
      'phi-2': { memory: 'Very Low', speed: 'Very Fast', quality: '3/5' },
      'mistral': { memory: 'Low', speed: 'Very Fast', quality: '4.5/5' },
      'neural-chat': { memory: 'Low', speed: 'Fast', quality: '4/5' },
      'zephyr': { memory: 'Low', speed: 'Fast', quality: '4.5/5' },
      'llama2-13b': { memory: 'Medium', speed: 'Medium', quality: '4.5/5' },
      'dolphin-mixtral': { memory: 'High', speed: 'Medium', quality: '5/5' },
      'llama2-70b': { memory: 'Very High', speed: 'Slow', quality: '5/5' }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // INTEGRATION TEMPLATE
  // ═══════════════════════════════════════════════════════════════

  integrationTemplate: {
    // How to use in advancedAIService.js
    callOpenSourceModel: `
      async callOpenSourceModel(messages, model = 'mistral') {
        const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        
        const response = await axios.post(
          baseUrl + '/api/generate',
          {
            model: model,
            prompt: messages[messages.length - 1].content,
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            stream: false
          }
        );

        return response.data.response;
      }
    `,
    
    // Environment configuration
    env: {
      'OLLAMA_BASE_URL': 'http://localhost:11434',
      'OPEN_SOURCE_MODEL': 'mistral',
      'ENABLE_OPEN_SOURCE': 'true'
    }
  }
};
