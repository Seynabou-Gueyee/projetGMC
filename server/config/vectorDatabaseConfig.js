/**
 * Configuration Base de Données Vectorielle - WAVE 3
 * Améliore la recherche RAG avec embeddings sémantiques
 * 
 * Supporte Pinecone, Milvus, FAISS, ou autre solution vectorielle
 */

const configurationVecteurs = {
  // ═══════════════════════════════════════════════════════════════════════
  // 📊 CONFIGURATION PRINCIPALE
  // ═══════════════════════════════════════════════════════════════════════

  general: {
    nom: 'Service Base de Données Vectorielle WAVE 3',
    description: 'Recherche sémantique avec embeddings pour amélioration du RAG',
    version: '1.0.0',
    activée: true,
    modePrésentation: 'hybride' // 'vectoriel' | 'hybride' | 'motsCles'
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🔧 CONFIGURATION TECHNIQUE
  // ═══════════════════════════════════════════════════════════════════════

  embeddings: {
    modèle: 'text-embedding-3-small',
    fournisseur: 'openai', // 'openai' | 'huggingface' | 'anthropic' | 'local'
    tailleVecteur: 1536, // dimension de l'embedding
    normalisationVecteurs: true,
    cacheEmbeddings: true,
    tailleMaxCache: 10000,
    
    // Options OpenAI
    openai: {
      modèleParDéfaut: 'text-embedding-3-small',
      modèlesDisponibles: [
        {
          nom: 'text-embedding-3-small',
          dimension: 1536,
          vitesse: 'rapide',
          coût: 'bas',
          recommandé: true,
          description: '⭐ Recommandé - Bon équilibre vitesse/qualité'
        },
        {
          nom: 'text-embedding-3-large',
          dimension: 3072,
          vitesse: 'lent',
          coût: 'moyen',
          qualité: 'excellente',
          description: '🔥 Meilleure qualité - Plus lent et coûteux'
        }
      ]
    },

    // Options HuggingFace (local)
    huggingface: {
      modèleParDéfaut: 'sentence-transformers/all-MiniLM-L6-v2',
      typesModèles: {
        léger: {
          nom: 'all-MiniLM-L6-v2',
          dimension: 384,
          vitesse: 'très-rapide',
          mémoire: 'faible',
          description: 'Ultra-léger, fonctionne sur CPU'
        },
        équilibré: {
          nom: 'all-mpnet-base-v2',
          dimension: 768,
          vitesse: 'rapide',
          mémoire: 'moyen',
          description: 'Bon équilibre qualité/vitesse'
        },
        avancé: {
          nom: 'all-DPR-ctx_encoder-xlm-base-fr',
          dimension: 768,
          vitesse: 'rapide',
          langue: 'français',
          description: 'Spécialisé pour français'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🗄️ FOURNISSEURS DE STOCKAGE VECTORIEL
  // ═══════════════════════════════════════════════════════════════════════

  fournisseurs: {
    // Option 1: Local (FAISS) - Gratuit, hors-ligne
    local: {
      type: 'faiss',
      description: 'Stockage vectoriel local (gratuit, hors-ligne)',
      avantages: [
        '✅ Gratuit',
        '✅ Fonctionne hors-ligne',
        '✅ Aucune limite de requêtes',
        '✅ Données restent locales'
      ],
      inconvénients: [
        '❌ Pas d\'évolutivité distribuée',
        '❌ Recherche plus lente à très grande échelle'
      ],
      installation: 'npm install faiss-node',
      modePrésentation: 'production',
      capacité: '100K+ vecteurs',
      coûtMensuel: 0
    },

    // Option 2: Pinecone - Spécialisé, scalable
    pinecone: {
      type: 'pinecone-api',
      description: 'Base vectorielle cloud premium (scalable)',
      url: 'https://api.pinecone.io',
      avantages: [
        '✅ Très scalable',
        '✅ Interface complète',
        '✅ Support excellent',
        '✅ Recherche ultra-rapide'
      ],
      inconvénients: [
        '❌ Coûteux',
        '❌ Requiert connectivité cloud',
        '❌ Dépendance externe'
      ],
      installation: 'npm install @pinecone-database/pinecone',
      pricingParGrade: {
        starter: {
          coût: 12,
          capacité: '1 million vecteurs',
          requêtesParSec: 1,
          dimension: 1536
        },
        pro: {
          coût: 70,
          capacité: '10 millions vecteurs',
          requêtesParSec: 10,
          dimension: 1536
        },
        enterprise: {
          coût: 'personnalisé',
          capacité: 'illimitée',
          requêtesParSec: 100,
          dimension: 'variable'
        }
      },
      recommended: 'starter pour démarrer'
    },

    // Option 3: Milvus - Source ouvert, puissant
    milvus: {
      type: 'milvus',
      description: 'Stockage vectoriel source ouvert haute performance',
      url: 'localhost:19530',
      avantages: [
        '✅ Source ouvert',
        '✅ Très performant',
        '✅ Scalable',
        '✅ Gratuit'
      ],
      inconvénients: [
        '❌ Infrastructure à maintenir',
        '❌ Courbe apprentissage'
      ],
      installation: 'docker run -d --name milvus milvusdb/milvus',
      capacité: 'illimitée',
      coûtMensuel: 0
    },

    // Option 4: Weaviate - GraphQL, flexible
    weaviate: {
      type: 'weaviate',
      url: 'http://localhost:8080',
      description: 'Base vectorielle GraphQL avec schéma flexible',
      avantages: [
        '✅ Interface GraphQL',
        '✅ Très flexible',
        '✅ Schéma personnalisable'
      ],
      inconvénients: [
        '❌ Courbe apprentissage'
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🎯 PARAMÈTRES DE RECHERCHE
  // ═══════════════════════════════════════════════════════════════════════

  recherche: {
    seuilSimilaritéParDéfaut: 0.7,
    nombreRésultatsParDéfaut: 5,
    nombreRésultatsMax: 20,
    
    // Recherche sémantique pure
    sémantique: {
      activée: true,
      poidsSimilarité: 0.7,
      filtresDisponibles: [
        'source',
        'catégorie',
        'date',
        'langue'
      ],
      champs_indexés: [
        'contenu',
        'titre',
        'résumé',
        'mots-clés'
      ]
    },

    // Recherche hybride (vectoriel + mots-clés)
    hybride: {
      activée: true,
      poidsSémantique: 0.7,
      poidsMotsCles: 0.3,
      boosteursMotsCles: {
        activé: true,
        bonusExactMatch: 0.2,
        bonusPartialMatch: 0.1
      }
    },

    // Paramètres avancés
    avancés: {
      rééchelonnagemontages: true,
      diversificationRésultats: true,
      clustering: {
        activé: true,
        seuilSimilarité: 0.8,
        nombreGroupes: 'auto'
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 📈 INTÉGRATION AVEC RAG
  // ═══════════════════════════════════════════════════════════════════════

  intégrationRAG: {
    activée: true,
    enrichissementContexte: {
      type: 'vectoriel', // 'vectoriel' | 'hybride' | 'pondéré'
      
      // Pondération des sources
      pondérations: {
        rechercheVectorielle: 0.6,
        rechercheMotsCles: 0.2,
        contextConversation: 0.2
      },

      // Fusion des résultats
      fusion: {
        stratégie: 'score-combiné',
        méthode: 'rrf', // Reciprocal Rank Fusion
        normalisation: true
      }
    },

    // Apprentissage des requêtes
    apprentissageRequêtes: {
      activé: true,
      enregistrementRequêtes: true,
      détectionRequêtesRépétées: true,
      optimisationAutomat: true
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ⚡ PERFORMANCE
  // ═══════════════════════════════════════════════════════════════════════

  performance: {
    cachingRequêtes: {
      activé: true,
      ttl: 3600, // 1 heure
      tailleMax: 1000
    },

    batchProcessing: {
      activé: true,
      taillelot: 100,
      délaiTraitement: 1000 // ms
    },

    indexing: {
      typeIndexing: 'hnsw', // Hierarchical Navigable Small World
      efConstruct: 200,
      efSearch: 200,
      M: 16
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🔐 SÉCURITÉ & CONFORMITÉ
  // ═══════════════════════════════════════════════════════════════════════

  sécurité: {
    chiffrementTransit: true,
    chiffrementAuRepos: false, // Configurer si nécessaire
    authenticationAPI: true,
    limitationVitesse: {
      activée: true,
      requêtesParMinute: 100
    },
    conformité: {
      gdpr: {
        activée: true,
        rétentionDonnées: 90, // jours
        suppressionDroitÀLoubli: true
      },
      pii: {
        détectionDonnéesSensibles: true,
        masquagePII: true,
        chiffrementPII: true
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 📊 MONITORING & LOGS
  // ═══════════════════════════════════════════════════════════════════════

  monitoring: {
    activé: true,
    saveupervisionSanté: true,
    métriquesCollectées: [
      'latenceRecherche',
      'tauxSuccès',
      'tauxErreur',
      'utilisationMémoire',
      'nombreDocsIndexés'
    ],
    alertes: {
      latenceMaxAcceptable: 1000, // ms
      tauxErreurMaxAcceptable: 5, // %
      utilisationMémoireMax: 80 // %
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🚀 DÉPLOIEMENT RECOMMANDÉ
  // ═══════════════════════════════════════════════════════════════════════

  recommandationsParUseCase: {
    startup: {
      fournisseur: 'local',
      embedding: 'huggingface all-MiniLM-L6-v2',
      raison: 'Gratuit, hors-ligne, suffisant pour démarrage',
      setup: '< 5 minutes'
    },

    pmeProduction: {
      fournisseur: 'milvus',
      embedding: 'openai text-embedding-3-small',
      raison: 'Scalable, gratuit, embeddings de qualité',
      setup: '< 30 minutes'
    },

    enterpriseProfessionnel: {
      fournisseur: 'pinecone',
      embedding: 'openai text-embedding-3-small',
      raison: 'Gestion infrastructure par Pinecone, support premium',
      setup: '< 10 minutes'
    },

    applicationMobile: {
      fournisseur: 'local',
      embedding: 'huggingface léger',
      raison: 'Aucune dépendance externe, faible mémoire',
      setup: '< 5 minutes'
    }
  }
};

// Helpers pour configuration
const helpers = {
  /**
   * Recommande un setup basé sur les besoins
   */
  recommanderSetup: (besoins) => {
    const { échelle, budget, latence, conformité } = besoins;

    if (budget < 50 && conformité.gdpr) {
      return configurationVecteurs.recommandationsParUseCase.startup;
    }
    if (budget < 100 && échelle === 'petit') {
      return configurationVecteurs.recommandationsParUseCase.pmeProduction;
    }
    return configurationVecteurs.recommandationsParUseCase.enterpriseProfessionnel;
  },

  /**
   * Valide la configuration
   */
  validerConfiguration: (config) => {
    const erreurs = [];
    
    if (!config.embeddings.fournisseur) {
      erreurs.push('Fournisseur embedding requis');
    }
    if (!config.fournisseurs[config.embeddings.fournisseur]) {
      erreurs.push(`Fournisseur inconnu: ${config.embeddings.fournisseur}`);
    }
    if (config.recherche.seuilSimilaritéParDéfaut < 0 || config.recherche.seuilSimilaritéParDéfaut > 1) {
      erreurs.push('Seuil similarité doit être entre 0 et 1');
    }

    return {
      valide: erreurs.length === 0,
      erreurs
    };
  },

  /**
   * Affiche un guide de déploiement
   */
  afficherGuidesDéploiement: () => {
    return Object.entries(configurationVecteurs.recommandationsParUseCase)
      .map(([useCase, config]) => ({
        useCase,
        ...config
      }));
  }
};

module.exports = {
  configurationVecteurs,
  helpers
};
