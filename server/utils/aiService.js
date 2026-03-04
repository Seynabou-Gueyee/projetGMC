const axios = require('axios');
const logger = require('./logger');

/**
 * Service d'IA pour répondre à des questions générales
 * Utilise OpenAI ou des fallbacks locaux pour générer des réponses intelligentes
 */
class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiModel = process.env.AI_MODEL || 'gpt-3.5-turbo';
    this.apiProvider = process.env.AI_PROVIDER || 'openai'; // openai, huggingface, local
    this.useLocalFallback = !this.apiKey; // Si pas de clé API, utiliser fallback local
    
    logger.info('AIService initialized', {
      provider: this.apiProvider,
      useLocalFallback: this.useLocalFallback
    });
  }

  /**
   * Obtenir une réponse intelligente à une question
   */
  async getResponse(question, conversationHistory = []) {
    try {
      // Si on a OpenAI API, l'utiliser
      if (this.apiKey && this.apiProvider === 'openai') {
        return await this.getOpenAIResponse(question, conversationHistory);
      }
      
      // Sinon, utiliser des réponses intelligentes locales
      return await this.getLocalResponse(question);
    } catch (error) {
      logger.error('AIService error', { error: error.message });
      return this.getLocalResponse(question);
    }
  }

  /**
   * Obtenir une réponse via OpenAI API
   */
  async getOpenAIResponse(question, conversationHistory = []) {
    try {
      const messages = [
        {
          role: 'system',
          content: `Tu es un assistant chatbot amical, intelligent et très serviable sur TalkMe Chat. 
Tu maîtrises plusieurs domaines: sciences, histoire, technologie, culture générale, développement, mathématiques, etc.
Tu réponds de manière claire, concise et engageante. 
Tu peux utiliser des emojis pour rendre vos réponses plus sympathiques.
Tu es capable de générer du code, d'expliquer des concepts complexes, et de donner des conseils utiles.
Si la question n'est pas claire, pose une question de clarification.`
        }
      ];

      // Ajouter l'historique
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role || (msg.isBot ? 'assistant' : 'user'),
          content: msg.content || msg.text
        });
      });

      messages.push({
        role: 'user',
        content: question
      });

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: this.apiModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content;
      }

      return this.getLocalResponse(question);
    } catch (error) {
      logger.warn('OpenAI API error, switching to local', { error: error.message });
      return this.getLocalResponse(question);
    }
  }

  /**
   * Obtenir une réponse intelligente locale basée sur des patterns
   */
  async getLocalResponse(question) {
    const q = question.toLowerCase().trim();

    // SCIENCES ET NATURE
    if (this.matchKeywords(q, ['quelle est la capitale', 'capitale de', 'capital of'])) {
      const capitals = {
        'france': 'La capitale de la France est Paris 🇫🇷',
        'suisse': 'La capitale de la Suisse est Berne 🇨🇭',
        'belgique': 'La capitale de la Belgique est Bruxelles 🇧🇪',
        'espagne': 'La capitale de l\'Espagne est Madrid 🇪🇸',
        'italie': 'La capitale de l\'Italie est Rome 🇮🇹',
        'allemagne': 'La capitale de l\'Allemagne est Berlin 🇩🇪',
        'japon': 'La capitale du Japon est Tokyo 🇯🇵',
        'usa': 'La capitale des USA est Washington DC 🇺🇸',
        'chine': 'La capitale de la Chine est Pékin 🇨🇳',
        'inde': 'La capitale de l\'Inde est New Delhi 🇮🇳'
      };
      
      for (const [pays, reponse] of Object.entries(capitals)) {
        if (q.includes(pays)) return reponse;
      }
      return 'Quelle capitale cherches-tu? Dis-moi le pays et je te le dirai! 🌍';
    }

    // MATHÉMATIQUES
    if (this.matchKeywords(q, ['combien', 'calculate', 'calcul', '=', '+', '-', '*', '/'])) {
      try {
        // Évaluer les opérations mathématiques simples
        const mathExpr = q.replace(/[^\d+\-*./ ()]/g, '').trim();
        if (mathExpr && /^[\d+\-*./ ()]+$/.test(mathExpr)) {
          const result = eval(mathExpr);
          return `Le résultat est: ${result} 🧮`;
        }
      } catch (e) {
        // Erreur de calcul
      }
      return 'Je peux t\'aider avec les mathématiques! Pose ta question plus clairement 🧮';
    }

    // HISTOIRE
    if (this.matchKeywords(q, ['histoire', 'historical', 'quand', 'when', 'année', 'year', 'date', 'siècle', 'epoch', 'période'])) {
      const history = {
        'révolution française': 'La Révolution française a commencé en 1789 et a marqué la fin de la monarchie absolue 🇫🇷',
        'chute du mur de berlin': 'Le mur de Berlin a chuté en 1989, marquant la fin de la Guerre froide 🧱',
        'première guerre mondiale': 'La Première Guerre mondiale (1914-1918) a causé des millions de morts et a redefini l\'Europe 💔',
        'deuxième guerre mondiale': 'La Deuxième Guerre mondiale (1939-1945) a été le conflit le plus meurtrier de l\'histoire 💔', 
        'indépendance usa': 'L\'indépendance américaine date de 1776 (Déclaration d\'indépendance) 🇺🇸',
        'découverte amérique': 'Christophe Colomb a découvert l\'Amérique en 1492, initiant la colonisation européenne 🗺️',
        'chute de rome': 'L\'Empire romain d\'Occident a chuté en 476 après J.C. 🏛️',
        'moyen âge': 'Le Moyen Âge (5e-15e siècles) était une période de féodalité et de chevalerie 🛡️',
        'renaissance': 'La Renaissance (14e-17e siècles) a marqué le renouveau des arts et des sciences 🎨',
        'révolution industrielle': 'La Révolution industrielle (18e-19e siècles) a transformé l\'économie mondiale ⚙️',
        'napoléon': 'Napoléon Bonaparte (1769-1821) était un général et empereur français qui a conquis une grande partie de l\'Europe ⚔️',
        'indépendance inde': 'L\'Inde a obtenu son indépendance du Royaume-Uni en 1947 sous la direction de Mahatma Gandhi 🇮🇳',
        'révolution russe': 'La Révolution russe de 1917 a établi le premier État communiste 🚩'
      };

      for (const [evt, reponse] of Object.entries(history)) {
        if (q.includes(evt)) return reponse;
      }
      return 'Quelle période historique t\'intéresse? Je connaîtrais peut-être! 📚';
    }

    // SCIENCES ET ESPACE
    if (this.matchKeywords(q, ['planète', 'planet', 'lune', 'moon', 'soleil', 'sun', 'étoile', 'star', 'espace', 'space', 'trou noir', 'galaxie', 'univers', 'atome', 'molécule'])) {
      const sciences = {
        'terre': 'La Terre est notre planète, elle orbite autour du Soleil en 365 jours 🌍',
        'mars': 'Mars est la planète rouge, à proximité de la Terre, avec deux lunes et des tempêtes de poussière 🔴',
        'vénus': 'Vénus est la planète la plus chaude du système solaire avec une température de 462°C ☀️',
        'jupiter': 'Jupiter est la plus grande planète de notre système solaire, avec une Grande Tache Rouge 🪐',
        'saturne': 'Saturne est célèbre pour ses anneaux magnifiques composés de glaçons et de poussière 💫',
        'lune': 'La Lune est le satellite naturel de la Terre, elle contrôle les marées 🌙',
        'soleil': 'Le Soleil est une étoile au centre de notre système solaire, elle contient 99,86% de sa masse ☀️',
        'vitesse lumière': 'La vitesse de la lumière est environ 300 000 km/s, la plus rapide du cosmos 💨',
        'trou noir': 'Un trou noir est une région où la gravité est si forte que rien ne peut s\'échapper, pas même la lumière ⚫',
        'galaxie': 'Une galaxie est une collection de milliards d\'étoiles, Our Voie lactée en contient 200-400 milliards 🌌',
        'univers': 'L\'univers s\'est formé il y a 13,8 milliards d\'années avec le Big Bang 🔭',
        'atome': 'Un atome est la plus petite unité de matière, composé d\'un noyau et d\'électrons ⚛️',
        'évolution': 'L\'évolution est le processus par lequel les espèces changent au fil du temps grâce à la sélection naturelle 🦎',
        'génétique': 'La génétique étude l\'hérédité et les genes (ADN) qui transmettent les caractéristiques 🧬',
        'physique quantique': 'La physique quantique étudie le comportement des particules subatomiques 🌀'
      };

      for (const [topic, reponse] of Object.entries(sciences)) {
        if (q.includes(topic)) return reponse;
      }
      return 'L\'espace et les sciences sont fascinants! Que veux-tu savoir en détail? 🚀';
    }

    // TECHNOLOGIE ET PROGRAMMATION
    if (this.matchKeywords(q, ['javascript', 'python', 'code', 'programmer', 'function', 'variable', 'node.js', 'react', 'html', 'css', 'algoritm', 'base de données', 'java', 'c++', 'sql', 'git', 'docker', 'cloud', 'ai', 'machine learning', 'blockchain', 'web3'])) {
      const tech = {
        'javascript': 'JavaScript est un langage de programmation pour le web, il fonctionne dans tous les navigateurs! 💻',
        'python': 'Python est un langage puissant pour la data science, l\'IA et l\'automatisation 🐍',
        'node.js': 'Node.js permet de faire du JavaScript côté serveur et de créer des applications backend 🚀',
        'react': 'React est une librairie JavaScript pour créer des interfaces utilisateur interactives ⚛️',
        'html': 'HTML est le langage de balisage pour structurer les pages web 🏗️',
        'css': 'CSS est utilisé pour styliser et mettre en page les pages web avec des couleurs et des dimensions 🎨',
        'base de données': 'Les bases de données stockent et gèrent les données (SQL, MongoDB, etc.) 📊',
        'api': 'Une API (Application Programming Interface) permet aux applications de communiquer entre elles 🔗',
        'java': 'Java est un langage orienté objet utilisé pour les applications d\'entreprise 🏢',
        'c++': 'C++ est un langage rapide utilisé pour les systèmes critiques et les jeux vidéo ⚡',
        'sql': 'SQL est le langage standard pour interroger et manipuler les bases de données relationnelles 🗄️',
        'git': 'Git est un système de contrôle de version qui permet de gérer les changements de code 🔀',
        'docker': 'Docker permet de containeriser les applications pour une meilleure portabilité 🐳',
        'cloud': 'Cloud Computing permet d\'utiliser l\'informatique et le stockage via internet (AWS, Azure, Google Cloud) ☁️',
        'artificial intelligence': 'L\'IA est la capacité des machines à apprendre et résoudre des problèmes 🤖',
        'machine learning': 'Machine Learning permet aux machines d\'apprendre à partir des données sans programmation explicite 📈',
        'blockchain': 'Blockchain est une technologie de registre distribué sécurisé, à la base des cryptomonnaies 🔗',
        'web3': 'Web3 ou Web 3.0 est la vision décentralisée d\'internet utilisant la blockchain et les cryptomonnaies 🌐',
        'algoritm': 'Les algorithmes sont des ensembles d\'étapes pour résoudre un problème 🔄'
      };

      for (const [tech_term, reponse] of Object.entries(tech)) {
        if (q.includes(tech_term)) return reponse;
      }
      return 'Je suis expert en technologie! Demande-moi ce que tu veux savoir sur la programmation, les langages ou les technologies 💻';
    }

    // CULTURE POP ET DIVERTISSEMENT
    if (this.matchKeywords(q, ['film', 'movie', 'série', 'serie', 'musique', 'music', 'artiste', 'chanteur', 'actor', 'acteur', 'netflix', 'play station', 'xbox', 'gaming', 'jeu vidéo', 'celebrity', 'célébrité', 'hollywood', 'bollywood'])) {
      const culturePop = {
        'film': 'J\'adore parler de cinéma! Il y a tant de grands films: Inception, Interstellar, The Matrix, Avatar, etc. 🎬',
        'série': 'Les séries sont incroyables! Breaking Bad, Game of Thrones, Stranger Things, The Crown... 📺',
        'musique': 'La musique est l\'âme de la vie! Tu préfères le pop, le hip-hop, le rock, l\'électronique? 🎵',
        'artiste': 'Il y a tellement d\'artistes talentueux dans le monde! De la musique au cinéma, c\'est magnifique 🌟',
        'netflix': 'Netflix est une plateforme de streaming avec des milliers de films et séries 🎬',
        'gaming': 'Les jeux vidéo sont un art! Elden Ring, Cyberpunk, Halo, Fortnite, Minecraft... 🎮',
        'celebrity': 'Les célébrités marquent souvent la culture populaire 📸'
      };

      for (const [topic, reponse] of Object.entries(culturePop)) {
        if (q.includes(topic)) return reponse;
      }
      return 'J\'adore parler de culture pop! Dis-moi ce que tu aimes: films, séries, musique, jeux vidéo? 🎭';
    }

    // SANTÉ ET BIEN-ÊTRE
    if (this.matchKeywords(q, ['santé', 'health', 'sport', 'exercice', 'diète', 'sommeil', 'stress', 'mental'])) {
      return 'Prendre soin de sa santé est important! Pour les questions spécifiques, consulte toujours un professionnel 🏥💪';
    }

    // CONSEILS ET MOTIVATION
    if (this.matchKeywords(q, ['conseil', 'advice', 'aide', 'help', 'problème', 'problem', 'comment', 'how to'])) {
      return 'Je suis là pour t\'aider! Explique-moi ton problème en détail et je ferai de mon mieux pour te donner les meilleures solutions 🤝';
    }

    // BLAGUES ET HUMOUR
    if (this.matchKeywords(q, ['blague', 'joke', 'drôle', 'funny', 'rire', 'laugh'])) {
      const jokes = [
        'Pourquoi les plongeurs plongent-ils toujours les derniers dans l\'eau? Parce qu\'ils sont un peu lents! 🤿😂',
        'Quel est le comble pour un électricien? De ne pas être au courant! ⚡😂',
        'Pourquoi les poissons n\'aiment pas les jeux de balles? Parce qu\'ils ont peur du filet! 🎾😂',
        'Qu\'est-ce qu\'un crocodile qui surveille la pharmacie? Un Lacoste-gard! 🐊😂',
        'Comment appelle-t-on un chat tombé dans un pot de peinture le jour de Noël? Un chaton de Noël! 🎄😂'
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // CONNAISSANCE GÉNÉRALE
    if (this.matchKeywords(q, ['qui est', 'who is', 'quel est', 'what is', 'définition', 'definition', 'qu\'est-ce', 'c\'est quoi'])) {
      const definitions = {
        'internet': 'Internet est un réseau mondial de milliards de dispositifs interconnectés permettant l\'échange de données 🌐',
        'ia': 'L\'Intelligence Artificielle est la capacité des machines à apprendre, raisonner et décider autonomement 🤖',
        'bitcoin': 'Bitcoin est une cryptomonnaie décentralisée créée en 2009 par Satoshi Nakamoto ₿',
        'nft': 'Un NFT (Non-Fungible Token) est un actif numérique unique basé sur la blockchain 🖼️',
        'cloud': 'Le Cloud Computing permet de stocker et d\'accéder à des données sur des serveurs distants via internet ☁️',
        'cryptocurrency': 'La cryptomonnaie est une monnaie numérique décentralisée basée sur la blockchain 💰',
        'dna': 'L\'ADN (acide désoxyribonucléique) est la molécule qui porte les instructions génétiques de la vie 🧬',
        'photosynthèse': 'La photosynthèse est le processus par lequel les plantes convertissent la lumière en énergie chimique 🌱',
        'économie': 'L\'économie est la science qui étudie la production, la distribution et la consommation des biens et services 💼',
        'politique': 'La politique est l\'art et la science de gouverner une société et de prendre des décisions collectives 🏛️',
        'philosophie': 'La philosophie est l\'étude des principes fondamentaux de l\'existence, de la connaissance et de la moralité 🤔',
        'psychologie': 'La psychologie est l\'étude du comportement et des processus mentaux humains 🧠',
        'sociologie': 'La sociologie est l\'étude des groupes sociaux, des institutions et des relations humaines 👥'
      };

      for (const [term, def] of Object.entries(definitions)) {
        if (q.includes(term)) return def;
      }
    }

    // GÉOGRAPHIE ET PAYS
    if (this.matchKeywords(q, ['géographie', 'geography', 'pays', 'country', 'ville', 'city', 'continent', 'continent', 'fleuve', 'river', 'montagne', 'mountain'])) {
      const geography = {
        'plus grand pays': 'La Russie est le plus grand pays du monde avec 17,1 millions de km² 🌍',
        'pays le plus peuplé': 'L\'Inde et la Chine sont les pays les plus peuplés avec plus de 1,4 milliards d\'habitants 👥',
        'plus haute montagne': 'L\'Everest (Mont Sagarmatha) est la plus haute montagne du monde avec 8 849 mètres ⛰️',
        'fleuve le plus long': 'Le Nil en Afrique est le fleuve le plus long avec 6 650 km 🌊',
        'plus grand océan': 'L\'océan Pacifique est le plus grand océan du monde 🌊',
        'plus grand désert': 'Le Sahara est le plus grand désert chaud du monde 🏜️',
        'plus grande forêt': 'L\'Amazonie en Amérique du Sud est la plus grande forêt tropicale 🌳',
        'europe': 'L\'Europe est un continent d\'environ 50 pays avec une riche histoire et culture 🇪🇺',
        'afrique': 'L\'Afrique est le deuxième plus grand continent avec 54 pays et une incroyable biodiversité 🌍',
        'asie': 'L\'Asie est le plus grand continent qui abrite 60% de la population mondiale 🌏',
        'amérique': 'Le continent américain comprend l\'Amérique du Nord, Centrale et du Sud 🌎'
      };

      for (const [geo, reponse] of Object.entries(geography)) {
        if (q.includes(geo)) return reponse;
      }
      return 'La géographie du monde est fascinante! Quel endroit t\'intéresse? 🗺️';
    }

    // LITTÉRATURE ET LIVRES
    if (this.matchKeywords(q, ['littérature', 'literature', 'livre', 'book', 'auteur', 'author', 'poésie', 'poetry', 'roman', 'novel', 'shakespeare', 'victor hugo', 'tolstoï'])) {
      const literature = {
        'livre': 'Les livres sont des portes vers d\'autres mondes et d\'autres vies 📚',
        'littérature': 'La littérature capture l\'essence de l\'expérience humaine ✍️',
        'shakespeare': 'William Shakespeare (1564-1616) est un dramaturge anglais, auteur de Hamlet, Roméo et Juliette, Macbeth 🎭',
        'victor hugo': 'Victor Hugo (1802-1885) est un écrivain français célèbre pour Les Misérables et Notre-Dame de Reims 📖',
        'tolstoï': 'Léon Tolstoï (1828-1910) a écrit Guerre et Paix, l\'un des plus grands romans jamais écrits 📕',
        'dostoïevski': 'Fiodor Dostoïevski (1821-1881) a écrit Crime et Châtiment et Les Frères Karamazov 📖',
        'jane austen': 'Jane Austen (1775-1817) a écrit Orgueil et Préjugés et Emma 💕',
        'cervantès': 'Miguel de Cervantès (1547-1616) a écrit Don Quichotte, considéré comme le premier roman moderne 🗡️',
        'poésie': 'La poésie est l\'art d\'exprimer des sentiments profonds dans un langage belle et rythme 🎵'
      };

      for (const [lit, reponse] of Object.entries(literature)) {
        if (q.includes(lit)) return reponse;
      }
      return 'La littérature est un trésor de sagesse et d\'imagination! Quel auteur ou livre t\'intéresse? 📚';
    }

    // SPORTS ET COMPÉTITIONS
    if (this.matchKeywords(q, ['sport', 'sports', 'football', 'soccer', 'basketball', 'tennis', 'olympics', 'olympiques', 'champion', 'equipe', 'monde'])) {
      const sports = {
        'football': 'Le football est le sport le plus populaire au monde avec des milliards de fans ⚽',
        'soccer': 'Le soccer (football) est aimé partout, avec des ligues majeures et une Coupe du Monde tous les 4 ans ⚽',
        'basketball': 'Le basketball est un sport passionnant inventé en 1891, avec la NBA comme la meilleure ligue 🏀',
        'tennis': 'Le tennis est un sport individuel avec des tournois prestigieux: Wimbledon, US Open, Roland Garros 🎾',
        'olympics': 'Les Jeux olympiques sont les plus grands événements sportifs au monde, organisés tous les 4 ans 🏅',
        'champion': 'Un champion est un athlète qui excelle dans son sport 🏆',
        'coupe du monde': 'La Coupe du Monde de football se joue tous les 4 ans et est regardée par plus de 3 milliards de personnes ⚽',
        'nba': 'La NBA (National Basketball Association) est la plus grande ligue de basketball au monde 🏀'
      };

      for (const [sport, reponse] of Object.entries(sports)) {
        if (q.includes(sport)) return reponse;
      }
      return 'J\'adore parler de sports! Quel sport t\'intéresse? ⚽🏀🎾';
    }

    // CUISINE ET GASTRONOMIE
    if (this.matchKeywords(q, ['cuisine', 'food', 'cuisine', 'restaurant', 'recette', 'recipe', 'gastronomie', 'chef', 'manger', 'cuisine française', 'pizza', 'sushi'])) {
      const cuisine = {
        'cuisine': 'La cuisine est l\'art de préparer les aliments de manière délicieuse et nutritive 🍳',
        'cuisine française': 'La cuisine française est célèbre pour ses sauces, ses fromages et ses techniques raffinées 🥖',
        'pizza': 'La pizza est un classique italien, peut-être l\'un des plats les plus populaires au monde! 🍕',
        'sushi': 'Les sushis sont un art culinaire japonais avec du riz assaisonné et des poissons frais 🍣',
        'la pasta': 'Les pâtes italiennes sont délicieuses et viennent en centaines de formes différentes 🍝',
        'gastronomie': 'La gastronomie est l\'étude et l\'appréciation de la haute cuisine 👨‍🍳',
        'chef': 'Un chef est un cuisinier expert qui crée des plats délicieux 👨‍🍳',
        'recette': 'Une recette est un ensemble d\'instructions pour préparer un plat 📖'
      };

      for (const [food, reponse] of Object.entries(cuisine)) {
        if (q.includes(food)) return reponse;
      }
      return 'J\'aime parler de cuisine! Quel type de nourriture préfères-tu? 🍽️';
    }

    // ÉCONOMIE ET FINANCE
    if (this.matchKeywords(q, ['économie', 'economy', 'finance', 'money', 'argent', 'bourse', 'stock market', 'investissement', 'inflation', 'banque'])) {
      const economy = {
        'économie': 'L\'économie est la science qui étudie la production, la distribution et la consommation 💼',
        'finance': 'La finance gère l\'argent, les investissements et les institutions financières 💰',
        'bourse': 'La bourse est un marché où on achète et on vend des actions d\'entreprises 📈',
        'investissement': 'L\'investissement est le fait de mettre de l\'argent pour générer des profits futurs 💵',
        'inflation': 'L\'inflation est l\'augmentation générale des prix et la réduction du pouvoir d\'achat 📊',
        'banque': 'Les banques gèrent l\'argent des gens et octroient des prêts 🏦',
        'crypto': 'Les cryptomonnaies comme Bitcoin utilisent la blockchain pour fonctionner sans intermédiaires 🔐',
        'pib': 'Le PIB (Produit Intérieur Brut) mesure la valeur totale des biens et services produits 📊'
      };

      for (const [econ, reponse] of Object.entries(economy)) {
        if (q.includes(econ)) return reponse;
      }
      return 'L\'économie et la finance sont des sujets importants! Qu\'aimerais-tu savoir? 💼';
    }

    // RÉPONSE GÉNÉRIQUE INTELLIGENTE
    const genericResponses = [
      'C\'est une excellente question! 🤔 Peux-tu me donner plus de détails pour mieux te répondre?',
      'Je vais essayer de t\'aider au mieux! 💡 Explique-moi un peu plus ce que tu cherches à savoir',
      'C\'est intéressant comme sujet! 🌟 Es-tu sûr des details de ta question?',
      'Je peux t\'aider avec presque n\'importe quoi! 🚀 Sois plus spécifique et je te donnerai une réponse détaillée',
      'C\'est une brillante enquête! 🔍 Je vais faire mon mieux pour répondre, explique simplement ta question'
    ];

    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }

  /**
   * Vérifier si le message contient certains mots-clés
   */
  matchKeywords(text, keywords) {
    return keywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
  }
}

module.exports = new AIService();
