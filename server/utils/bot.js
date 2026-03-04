const logger = require('../utils/logger');
const aiService = require('./aiService');

// Commandes disponibles du bot
const BOT_COMMANDS = {
  '/help': {
    description: 'Affiche l\'aide et les commandes disponibles',
    response: 'Commandes disponibles:\n/help - Affiche cette aide\n/stats - Affiche les statistiques\n/status - Affiche votre statut\n/time - Affiche l\'heure actuelle'
  },
  '/stats': {
    description: 'Affiche les statistiques de la salle',
    response: 'Statistiques actuelles:\nMessages aujourd\'hui: En cours de chargement...\nUtilisateurs actifs: En cours de chargement...'
  },
  '/status': {
    description: 'Affiche votre statut actuel',
    response: 'Vous êtes en ligne ✓'
  },
  '/time': {
    description: 'Affiche l\'heure actuelle',
    response: 'time' // Marker spécial, sera traité différemment
  },
  '/echo': {
    description: 'Répète votre message',
    response: 'Commande: /echo [texte]'
  }
};

// Messages automatiques selon les mots-clés - SUPER COMPLET GEN Z
const AUTO_RESPONSES = {
  // SALUTATIONS BASIQUES
  'bonjour': 'Bonjour! 👋 Comment allez-vous?',
  'bjr': 'Bonjour! 👋 Comment ça va?',
  'bj': 'Coucou! 👋 Comment tu vas?',
  'salut': 'Salut! 👋 Comment ça va?',
  'slt': 'Salut! 👋 Comment ça va?',
  'slut': 'Salut! 👋 Comment ça va?',
  'hey': 'Hey! 👋 Quoi de neuf?',
  'yo': 'Yo! 🤘 Ça va?',
  'hello': 'Hello! 👋 What\'s up?',
  'hi': 'Hi there! 👋',
  'coucou': 'Coucou! 🙋 Quoi de neuf?',
  'ey': 'Ey! 🙌',
  'wesh': 'Wesh frère! Ça boume? 🔥',
  'wesh alors': 'Wesh! T\'es où toi? 🔥',
  'salaam': 'Salaam! 😊',
  'peace': 'Peace! ✌️',
  
  // ABRÉVIATIONS ÇA VA
  'sv': 'Ça va bien! Et toi?',
  'ça va': 'Ça va super! 😊',
  'ca va': 'Ça va super! 😊',
  'cv': 'Ça va! Et toi?',
  'ca va bien': 'Excellent! Je suis là pour toi! 🎯',
  'pas mal': 'Cool! Raconte-moi des trucs! 😊',
  'ouais': 'Nice! 🤘',
  
  // ABRÉVIATIONS COURANTES - NE SAIS PAS, JE SAIS PAS
  'ndk': 'Je sais pas non plus! 🤷',
  'jsp': 'Je ne sais pas! 🤷',
  'je sais pas': 'Je sais pas! 🤷',
  'sais pas': 'Bonne question! 🤔',
  'odc': 'C\'est ouf! 😲',
  'je m\'en doute pas': 'T\'es sûr? 🤨',
  'tt': 'Ouais tout ça! 100%',
  'a tt': 'À toute! À plus tard! 👋',
  'atc': 'À plus tard! À toute! 👋',
  'aplus': 'À plus tard! 👋',
  'a plus': 'À plus tard! 👋',
  'bye': 'À bientôt! 👋',
  'au revoir': 'À plus! 👋',
  
  // ARGOT GEN Z - NO CAP, CAP, BAS, BASED
  'no cap': 'Pas de blague? Clair! 😲',
  'cap': 'T\'es sérieux là? 😆',
  'pas cap': 'Vas-y! Fais-le! 💪',
  'suis pas cap': 'Vas-y alors! 💪',
  'je suis pas cap': 'T\'es sûr? Essaie! 😄',
  'based': 'C\'est une opinion solide! 💪',
  'sus': 'C\'est un peu suspect... 🤔',
  'sus pas': 'C\'est légitime ça! ✅',
  'cringe': 'Ouch! C\'est pas ouf! 😅',
  'slay': 'Yesss! Tu le fais! 💅',
  'slaying': 'Incroyable! Continue! 🔥',
  'slay queen': 'Respect à la reine! 👑',
  'slay king': 'Respect au roi! 👑',
  'queen': 'Respect à la reine! 👑',
  'king': 'Respect au roi! 👑',
  'vibe': 'J\'adore la vibe! 🎶',
  'energy': 'Belle énergie! 🔥',
  'mood': 'Je comprends le mood! 😊',
  'bet': 'Pari tenu! 🎯',
  'facts': '100% d\'accord! ✅',
  'real talk': 'Sérieusement! 🤝',
  
  // IT\'S GIVING - EXPRESSIONS TIKTOK
  'it\'s giving': 'C\'est cool ce que tu dis! 🌟',
  'periodt': 'C\'est ça! Point final! 💯',
  'period': 'Voilà! C\'est tout! 💯',
  'the way': 'Littéralement! 😂',
  'main character energy': 'T\'es la star! 🌟',
  'living rent free': 'Ça te taraude hein? 😄',
  'sheesh': 'Woah! C\'est dingue! 😲',
  'bussin': 'C\'est trop fou! 🔥',
  'ded': 'Je suis mort! 😂',
  'i\'m ded': 'C\'est trop drôle! 💀',
  'bestie': 'Mon bestie! 🤗',
  'bestfriend': 'T\'es mon meilleur ami! 💙',
  
  // RIRE ET TROUVADE DROLE
  'ouf': 'Haha, c\'est fou! 😂',
  'chelou': 'C\'est vrai que c\'est bizarre! 🤔',
  'chelou pas': 'C\'est chelou hein! 😄',
  'drôle': 'J\'adore! 😆',
  'ptdr': 'Haha c\'est trop drôle! 😆',
  'lol': 'Haha super! 😂',
  'mdr': 'Trop drôle! 😆',
  'haha': 'Haha! 😂',
  'hehe': 'Hehe! 😆',
  'xd': 'Haha! 😂',
  'xdd': 'Trop drôle! 💀',
  'mort': 'C\'est trop drôle! 💀',
  'je suis mort': 'T\'es un comique! 😂',
  'hilare': 'C\'est trop drôle! 😄',
  
  // COMPLIMENTS DIVERS
  'cool': 'C\'est cool! 😎',
  'sympa': 'Merci c\'est gentil! 🥰',
  'gentil': 'Merci! Tu es gentil aussi! 💚',
  'génial': 'C\'est génial! 🎉',
  'excellent': 'Excellent! 😊',
  't\'es fort': 'Merci! 💪',
  't\'es cool': 'Toi aussi! 😎',
  'super': 'Ouais super! 🎉',
  'awesome': 'So awesome! 🔥',
  'terrible': 'Cool! 😎',
  'mignon': 'Merci! 🥰',
  'beau': 'Merci beaucoup! 💕',
  'magnifique': 'D\'accord! 🌟',
  'fantastique': 'C\'est fantastique! ✨',
  'incroyable': 'Clairement incroyable! 🤯',
  't\'es ouf': 'Merci! 😄',
  't\'es malade': 'Haha c\'est ça! 😂',
  
  // REMERCIEMENTS
  'merci': 'De rien! 😊',
  'merci bcp': 'Pas de soucis! 😊',
  'merci beaucoup': 'De rien! C\'est un plaisir! 🤗',
  'thanks': 'You\'re welcome! 😊',
  'thank you': 'Anytime! Happy to help! 🙌',
  'thx': 'Np! 😊',
  'ty': 'Np! 😄',
  'thnk': 'Pas de prob! 😄',
  'merci mec': 'Pas de soucis mec! 🤜',
  'merci mon pote': 'De rien mon ami! 💙',
  'merci gros': 'C\'est cadeau! 😊',
  'thanks bro': 'Anytime bro! 🤜',
  'thx man': 'No problem man! 🤘',
  'merci gars': 'De rien gars! 💪',
  
  // ARGOT ET ABRÉVIATIONS EN VRAC
  'khey': 'Yo khey! Quoi de beau? 💯',
  'kheys': 'Yo kheys! 💯',
  'frérot': 'Ça va frérot? 🤜',
  'frère': 'Yo frère! 💪',
  'sœur': 'Yo sœur! 💅',
  'bro': 'Yo bro! 🙌',
  'bros': 'Yo les bros! 🙌',
  'bg': 'C\'est cool! 🎁',
  'bgs': 'Cool les gars! 🎉',
  'gars': 'Yo gars! 💪',
  'mec': 'Yo mec! 🤘',
  'mechant': 'T\'es mechant! 😎',
  'evil': 'That\'s evil! 😂',
  'oui oui': 'Exactement! 100%',
  'mais oui': 'Carrément! 😄',
  'ouais ouais': 'T\'as raison! 👍',
  'pour de vrai': 'Hein?! C\'est vrai?! 😲',
  'sérieusement': 'Pour vrai?! 😲',
  'sérieux': 'C\'est dingue! 😲',
  'franchement': 'T\'as raison! 👍',
  'honnêtement': 'Avec toi! 💯',
  'clairement': 'Tout à fait! ✅',
  'exactement': '100% d\'accord! 👍',
  
  // ÉMOTIONS POSITIVES
  'content': 'Ça me fait plaisir! 😄',
  'happy': 'Keep smiling! 😊',
  'heureux': 'Je suis heureux aussi! 🌟',
  'j\'aime': 'J\'aime aussi! ❤️',
  'love': 'Love it! 💕',
  'adorable': 'C\'est adorable! 🥰',
  'mignon': 'T\'es mignon! 🥰',
  'cute': 'So cute! 😍',
  'beautiful': 'Really beautiful! 🌟',
  'pretty': 'Very pretty! 😊',
  'magnifique': 'Vraiment magnifique! ✨',
  
  // ÉMOTIONS NÉGATIVES
  'sad': 'Aw man! I\'m here for you! 🤝',
  'triste': 'Veux-tu en parler? 🤝',
  'déprimé': 'Ça va aller! Tu vas t\'en sortir! 💪',
  'pas bien': 'Je suis là pour écouter! 👂',
  'stress': 'Respire! Tu vas y arriver! 💪',
  'anxieux': 'C\'est normal! Veux-tu parler? 😊',
  'fatigue': 'Repose-toi! Tu le mérites! 😴',
  'fatigué': 'Prends une pause! 😴',
  'exaspéré': 'Ça peut être frustrant! 😤',
  'fâché': 'Ouch! Ça va aller! 💙',
  'En colère': 'Calme-toi! Ça va passer! 😤',
  'déçu': 'C\'est dommage! Mais tu vas rebondir! 💪',
  'ne pas aimer': 'Je comprends! 🤷',
  
  // ENCOURAGEMENTS
  'peux pas': 'Tu peux le faire! 💪',
  'impossible': 'Rien est impossible! 🚀',
  'j\'y arrive pas': 'Ne lâche pas! 💯',
  'j\'abandonne': 'Non! Continue! 🏁',
  'trop difficile': 'Tu vas y arriver! 💪',
  'trop dur': 'Essaie encore! 🔥',
  'can\'t do it': 'You can do it! 💪',
  'i can\'t': 'You can! Try again! 🚀',
  'keep going': 'Yes! Keep going! 💯',
  'don\'t give up': 'Never give up! 💪',
  'tu vas y arriver': 'Ouais! Je crois en toi! 💪',
  'je crois en toi': 'Merci! 🥰',
  
  // QUESTIONS ENGAGEMENT
  'comment tu vas': 'Je vais super bien! 😊',
  'ça va': 'Ça roule! Et toi? 🌟',
  'quoi de neuf': 'Plein de trucs! Et toi? 🎯',
  'tu fais quoi': 'Je suis là pour discuter! 💬',
  'on parle': 'Bien sûr! De quoi? 👂',
  'tu es où': 'Je suis partout sur TalkMe! 🌍',
  'what\'s up': 'Yo! Not much! 🤘',
  'how are you': 'I\'m great! And you? 😊',
  'habitual ça': 'Oui assez régulier! 😄',
  
  // TIKTOK / YOUTUBE / TWITCH SLANG
  'gagner': 'Yesss! Tu fais un win! 🎮',
  'winnning': 'Let\'s go! 🏆',
  'goal': 'Yes! That\'s the goal! 🎯',
  'sus pa': 'Je pense que non! ✅',
  'let\'s go': 'Let\'s gooo! 🔥',
  'poggers': 'That\'s poggers bro! 🎮',
  'pog': 'Poggers! 🎮',
  'no way': 'No way! 😲',
  'for real': 'For real for real! 😲',
  'lowkey': 'Lowkey true! 🤫',
  'highkey': 'Highkey agree! 💯',
  'literally': 'Literally though! 😂',
  'unhinged': 'That\'s unhinged! 😂',
  'valid': 'That\'s valid! ✅',
  'not valid': 'Hmm, not valid! 🤨',
  
  // QUÉBÉCOIS
  'yo': 'Yo! Ça va? 🤘',
  'mon ami': 'Yo mon ami! 💙',
  'mon chum': 'Yo mon chum! 🤗',
  'mon gars': 'Yo mon gars! 💪',
  'tabernac': 'Woah! C\'est dingue! 😲',
  'c\'est fou': 'C\'est fou oui! 🤯',
  'ben oui': 'Exactement! 100%',
  'ben donc': 'Je sais ben! 😄',
  'vraiment': 'Vraiment vrai! ✅',
  'coudonc': 'Quoi?! 😲',
  'tabarnak': 'Wow! C\'est fou! 😲',
  'ostie': 'C\'est ouff! 😂',
  'crisse': 'C\'est fou! 🤯',
  'pas pire': 'C\'est pas pire! 😊',
  'bin': 'Ouais! 😄',
  'est ce que': 'Oui je pense! 👍',
  'tu sais': 'Je te comprends! 👌',
  
  // GAMING / ESPORTS
  'gg': 'Good game! 🎮',
  'glhf': 'Good luck! Have fun! 🎮',
  'rip': 'Ouch! Désolé! 😅',
  'game over': 'C\'est fini! 🏁',
  'respawn': 'Reviens en jeu! 💪',
  'spam': 'Stop le spam! 😂',
  'noob': 'Haha newbie! 😄',
  'pro': 'T\'es un pro! 🏆',
  'tryhard': 'Va hard! 💪',
  'lag': 'C\'est le lag! 😤',
  'dc': 'T\'as crash? 💀',
  'disconnect': 'Reconnecte-toi! 🔌',
  'ban': 'Oh non! Un ban?! 😲',
  'kick': 'T\'as été kicked?! 😤',
  
  // EXPRESSIONS ALÉATOIRES MODERNES
  'wow': 'Waouh! 🤯',
  'omg': 'Oh my god! 😲',
  'wtf': 'Quoi?! 🤯',
  'tmtc': 'Trop bien! 🎉',
  'ayy': 'Ayy! Ça part! 🎉',
  'le vibe': 'Nice vibe! 🎶',
  'la vibe': 'La vibe est bonne! 🎶',
  'bof': 'C\'est pas ouf! 🤷',
  'pff': 'Je sais! 😌',
  'ohlalà': 'C\'est fou! 😲',
  'ohla': 'Quoi?! 😲',
  'moche': 'Ouch! C\'est moche! 😅',
  'degeu': 'Berk! Dégeulass! 🤢',
  'écœurant': 'C\'est écœurant! 😤',
  'bleurgh': 'Beurk! 🤢',
  'caca': 'C\'est pas ouf! 💩',
  'poo': 'That\'s poo! 💩',
  
  // COMPLIMENTS ALÉATOIRES
  't\'es ouf': 'Merci! 😄',
  't\'es fou': 'Haha merci! 😂',
  't\'es malade': 'C\'est comme ça! 😎',
  't\'es insane': 'Thanks! 🔥',
  't\'es crazy': 'Crazy recognize crazy! 😂',
  't\'es dingue': 'Ouais! 🤪',
  't\'es bizarre': 'C\'est mon charme! 😄',
  't\'es chelou': 'Compliment accepté! 😂',
  't\'es nul': 'Ouch! Pas cool! 😅',
  't\'es chaud': 'C\'est ça! 🔥',
  't\'as la classe': 'Merci! 😎',
  't\'es stylé': 'Merci beaucoup! 👗',
  
  // CONNAISSANCE GÉNÉRALE - SCIENCES
  'pourquoi le ciel': 'Le ciel est bleu à cause de la diffusion de Rayleigh! 🌤️',
  'pourquoi la lune': 'La lune brille car elle reflète la lumière du soleil! 🌙',
  'combien de continents': 'Il y a 7 continents: Afrique, Antarctique, Asie, Europe, Amérique du Nord, Amérique du Sud, Océanie! 🌍',
  'combien de planètes': 'Il y a 8 planètes dans notre système solaire! 🪐',
  'qu\'est-ce que la photosynthèse': 'C\'est comment les plantes font de l\'énergie avec la lumière du soleil! ☀️🌿',
  'qu\'est-ce qu\'un atome': 'Un atome est la plus petite particule d\'un élément chimique! ⚛️',
  
  // CONNAISSANCE GÉNÉRALE - HISTOIRE
  'qui a découvert amérique': 'Christophe Colomb a exploré l\'Amérique en 1492! 🗺️',
  'quand première guerre mondiale': 'La Première Guerre mondiale a eu lieu de 1914 à 1918! 💔',
  'quand deuxième guerre mondiale': 'La Deuxième Guerre mondiale a eu lieu de 1939 à 1945! 💔',
  'qui était napoléon': 'Napoléon Bonaparte était un général français qui a conquis beaucoup de territoires! ⚔️',
  'quand la révolution française': 'La Révolution française a commencé en 1789! 🇫🇷',
  
  // CONNAISSANCE GÉNÉRALE - GÉOGRAPHIE
  'quel pays le plus grand': 'La Russie est le plus grand pays du monde! 🌍',
  'quel est le plus haut montagne': 'Le Mont Everest est la plus haute montagne avec 8 849 mètres! ⛰️',
  'quel fleuve plus long': 'Le Nil en Afrique est le plus long fleuve du monde! 🌊',
  'quelle est la capitale france': 'Paris est la belle capitale de la France! 🗼',
  'quelle capitale japon': 'Tokyo est la capitale du Japon! 🗾',
  'quelle capitale usa': 'Washington DC est la capitale des États-Unis! 🇺🇸',
  
  // CONNAISSANCE GÉNÉRALE - DIVERS
  'quel plus grand désert': 'Le Sahara est le plus grand désert du monde! 🏜️',
  'quel plus grand océan': 'L\'océan Pacifique est le plus grand et le plus profond! 🌊',
  'combien population monde': 'La population mondiale dépasse 8 milliards de personnes! 👥',
  'quelle vitesse lumière': 'La lumière voyage à environ 300 000 km/s! 💨',
  'c\'est quoi l\'ia': 'L\'Intelligence Artificielle c\'est quand les machines apprennent et décident toutes seules! 🤖',
  'c\'est quoi bitcoin': 'Bitcoin est une monnaie numérique sans banque! ₿',
  'c\'est quoi blockchain': 'La blockchain est une technologie de registre sécurisé utilisée par les cryptomonnaies! 🔐',
  
  // CULTURE POP
  'qui a écrit harry potter': 'J.K. Rowling a écrit la célèbre série Harry Potter! 📚✨',
  'qui a réalisé le seigneur des anneaux': 'Peter Jackson a réalisé la trilogie du Seigneur des Anneaux! 🎬',
  'quel film spider-man': 'Il y a plusieurs films Spider-Man génial! 🕷️',
  'qui est cristiano ronaldo': 'C\'est un des meilleurs footballeurs du monde! ⚽',
  'qui est messi': 'Lionel Messi est une légende du football! ⚽',
  'qui a écrit game of thrones': 'George R.R. Martin a écrit A Song of Ice and Fire! 📖',
  'disney': 'Disney crée des films et de la magie pour les enfants! 🏰✨',
  'marvel': 'Marvel crée des superhéros comme Iron Man, Spider-Man et les Avengers! 🦸',
  
  // MOTIVATION ET INSPIRATION
  'motivation': 'Tu vas réussir! Crois en toi! 💪🌟',
  'inspiration': 'Trouve ce qui te rend heureux et fais-le! ✨',
  'Je ne suis pas important': 'Chaque personne est unique et importante! 💙',
  'Je suis trop vieux': 'Il n\'est jamais trop tard pour essayer quelque chose de nouveau! 🚀',
  'Je pensé ça ne marche': 'Essaie d\'abord! Tu serais surpris! 💪',
  'J\'ai peur': 'La peur est normale, mais va de l\'avant! 🦁',
  
  // SANTÉ ET BIEN-ÊTRE
  'conseil santé': 'Fais de l\'exercice, mange bien, dors assez et sois heureux! 💪😴🥗',
  'conseil stress': 'Respire profondément, médite, fais de l\'exercice ou parle à quelqu\'un! 🧘',
  'conseil sommeil': 'Va au lit à la même heure chaque jour, éteins les écrans une heure avant! 😴',
  'conseil sport': 'Commence par 30 minutes de marche chaque jour! 🚶',
  'conseil alimentation': 'Mange des fruits, des légumes, des protéines et limite les sucres! 🥗',
  
  // QUESTIONS EXISTENTIELLES
  'quel le sens de la vie': 'Le sens de la vie est ce que tu décides qu\'il est! 🌟',
  'pourquoi on existe': 'C\'est une grande question philosophique! Profite de chaque moment! 🎯',
  'qu\'est-ce que l\'amour': 'L\'amour est le sentiment le plus beau et le plus puissant! 💕',
  'qu\'est-ce que l\'amitié': 'L\'amitié c\'est partager des moments avec des gens qu\'on aime! 👯',
  
  // TECHNOLOGIE
  'comment marche smartphone': 'Un smartphone est un ordinateur puissant dans ta poche! 📱',
  'comment marche internet': 'Internet est un réseau de milliards d\'ordinateurs connectés! 🌐',
  'c\'est quoi cloud computing': 'C\'est utiliser des ordinateurs distants pour stocker tes données! ☁️',
  'c\'est quoi cyberséqurite': 'C\'est la protection contre les attaques informatiques! 🔒',
  'c\'est quoi hacker': 'Un hacker est une personne qui trouvé les failles en informatique! 💻'
};


/**
 * Classe Bot pour gérer les interactions automatiques
 */
class ChatBot {
  constructor() {
    this.name = 'TalkMeBot';
    this.commands = BOT_COMMANDS;
    this.autoResponses = AUTO_RESPONSES;
  }

  /**
   * Traite les messages entrants pour voir si c'est une commande bot
   * ASYNC - supporte les appels API d'IA
   * @param {string} content - Contenu du message
   * @param {object} user - Utilisateur qui envoie le message
   * @param {string} room - ID de la salle
   * @param {array} conversationHistory - Historique récent du chat
   * @returns {object|null} Réponse du bot ou null
   */
  async processMessage(content, user, room, conversationHistory = []) {
    if (!content) return null;

    const trimmed = content.trim().toLowerCase();
    
    // Vérifier si c'est une commande (commence par /)
    for (const [cmd, data] of Object.entries(this.commands)) {
      if (trimmed.startsWith(cmd)) {
        return this.handleCommand(cmd, content, user, room);
      }
    }

    // Vérifier les réponses automatiques avec une logique améliorée
    for (const [keyword, response] of Object.entries(this.autoResponses)) {
      // Vérification stricte: match le mot complet ou avec espacements
      const patterns = [
        new RegExp(`\\b${keyword}\\b`, 'i'),  // Mot complet
        new RegExp(`^${keyword}\\b`, 'i'),    // Au début
        new RegExp(`\\b${keyword}$`, 'i'),    // À la fin
        new RegExp(`${keyword}`, 'i')          // N'importe où
      ];
      
      if (patterns.some(pattern => pattern.test(trimmed))) {
        return this.createBotMessage(response, user, room);
      }
    }

    // Fallback: Essayer de répondre à une question quelconque
    const questionAnswer = this.answerQuestion(content);
    if (questionAnswer) {
      return questionAnswer;
    }

    // NOUVEAU: Utiliser l'IA générale pour répondre à toute question
    try {
      // Analyser si c'est une question (contient un point d'interrogation ou patterns)
      const isQuestion = content.includes('?') || 
                        this.isLikelyQuestion(content);
      
      if (isQuestion) {
        const aiResponse = await aiService.getResponse(content, conversationHistory);
        if (aiResponse) {
          return this.createBotMessage(aiResponse, user, room);
        }
      }
    } catch (error) {
      logger.warn('AI service error in processMessage', { error: error.message });
    }

    // Dernier recours: réponse générique
    const genericResponses = [
      'C\'est une excellente question! 🤔 Peux-tu reformuler?',
      'Je vais essayer de t\'aider! 💡',
      'C\'est intéressant! Dis-moi plus! 👂'
    ];
    
    return this.createBotMessage(
      genericResponses[Math.floor(Math.random() * genericResponses.length)],
      user,
      room
    );
  }

  /**
   * Vérifie si le contenu ressemble à une question
   */
  isLikelyQuestion(content) {
    const questionPatterns = [
      'quoi', 'comment', 'pourquoi', 'qui', 'quel', 'où', 'quand',
      'what', 'how', 'why', 'who', 'which', 'where', 'when',
      'c\'est quoi', 'c\'est qui', 'peux-tu', 'peux tu', 'tu peux',
      'dis-moi', 'donne-moi', 'explique', 'raconte', 'sais-tu', 'tu sais',
      'existe-t-il', 'est-ce que', 'connais-tu', 'aide-moi'
    ];
    
    const lower = content.toLowerCase();
    return questionPatterns.some(pattern => lower.includes(pattern));
  }

  /**
   * Traite une commande spécifique
   * @param {string} command - La commande
   * @param {string} content - Contenu complet du message
   * @param {object} user - Utilisateur
   * @param {string} room - Room ID
   */
  handleCommand(command, content, user, room) {
    switch (command) {
      case '/help':
        return this.createBotMessage(this.commands['/help'].response, user, room);
      
      case '/status':
        return this.createBotMessage(this.commands['/status'].response, user, room);
      
      case '/time':
        const currentTime = new Date().toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
        return this.createBotMessage(`🕐 Heure actuelle: ${currentTime}`, user, room);
      
      case '/echo':
        const text = content.replace('/echo', '').trim();
        return this.createBotMessage(`Écho: ${text || 'Aucun texte fourni'}`, user, room);
      
      case '/stats':
        // Les stats réelles sont chargées dynamiquement par le serveur
        return this.createBotMessage('📊 Chargement des statistiques...', user, room);
      
      default:
        return null;
    }
  }

  /**
   * Crée un message du bot
   * @param {string} response - Contenu de la réponse
   * @param {object} user - Utilisateur
   * @param {string} room - Room ID
   */
  createBotMessage(response, user, room) {
    return {
      _id: `bot_${Date.now()}`,
      content: response,
      sender: 'bot',
      senderName: this.name,
      room: room,
      timestamp: new Date(),
      createdAt: new Date(),
      isBot: true,
      isDelivered: true,
      attachments: [],
      emojiReactions: [],
      readBy: []
    };
  }

  /**
   * Répond à n'importe quelle question dans diverses disciplines
   */
  answerQuestion(question) {
    const q = question.toLowerCase().trim();
    
    // BASE DE DONNÉES DE RÉPONSES PAR DISCIPLINE
    
    // MATHÉMATIQUES
    if (this.matchKeywords(q, ['pi', 'π', 'nombre pi'])) {
      return this.createBotMessage('Pi (π) est un nombre irrationnel d\'environ 3.14159. Il représente le rapport entre la circonférence et le diamètre d\'un cercle! 🥧', null, null);
    }
    if (this.matchKeywords(q, ['pythagore', 'théorème de pythagore', 'hypoténuse'])) {
      return this.createBotMessage('Le théorème de Pythagore: a² + b² = c² (où c est l\'hypoténuse). Super utile pour les triangles rectangles! 📐', null, null);
    }
    if (this.matchKeywords(q, ['variable', 'algèbre', 'équation'])) {
      return this.createBotMessage('Une variable est un symbole (x, y, etc.) qui représente une valeur inconnue. Les équations nous aident à la trouver! 🧮', null, null);
    }
    if (this.matchKeywords(q, ['dérivée', 'calcul', 'limites'])) {
      return this.createBotMessage('Une dérivée mesure le taux de changement d\'une fonction. C\'est une branche importante du calcul! 📈', null, null);
    }
    if (this.matchKeywords(q, ['probabilité', 'hasard', 'chances'])) {
      return this.createBotMessage('La probabilité mesure les chances qu\'un événement se produise, entre 0 et 1 (0% à 100%)! 🎲', null, null);
    }
    
    // SVT (SCIENCES DE LA VIE ET DE LA TERRE)
    if (this.matchKeywords(q, ['adn', 'génétique', 'acide désoxyribonucléique'])) {
      return this.createBotMessage('L\'ADN est la molécule qui contient les instructions génétiques pour la vie. C\'est notre code génétique! 🧬', null, null);
    }
    if (this.matchKeywords(q, ['photosynthèse', 'plante', 'chlorophylle'])) {
      return this.createBotMessage('La photosynthèse est le processus par lequel les plantes convertissent la lumière solaire en énergie! ☀️🌿', null, null);
    }
    if (this.matchKeywords(q, ['cellule', 'biologie', 'cellule vivante'])) {
      return this.createBotMessage('La cellule est l\'unité fondamentale de la vie. Il existe les cellules procaryotes et eucaryotes! 🔬', null, null);
    }
    if (this.matchKeywords(q, ['évolution', 'darwin', 'sélection naturelle'])) {
      return this.createBotMessage('L\'évolution est le processus de changement et d\'adaptation des espèces au fil du temps! 🦞➡️🦴', null, null);
    }
    if (this.matchKeywords(q, ['écosystème', 'chaîne alimentaire', 'biodiversité'])) {
      return this.createBotMessage('Un écosystème est un ensemble d\'organismes qui interagissent dans un environnement. La chaîne alimentaire montre qui mange qui! 🍃🦁', null, null);
    }
    
    // CHIMIE
    if (this.matchKeywords(q, ['atome', 'molécule', 'élément chimique'])) {
      return this.createBotMessage('Un atome est la plus petite unité d\'un élément. Les molécules se composent de plusieurs atomes liés! ⚛️', null, null);
    }
    if (this.matchKeywords(q, ['réaction chimique', 'combustion', 'oxydation'])) {
      return this.createBotMessage('Une réaction chimique est un processus où les substances changent de propriétés et créent de nouvelles substances! 🔥', null, null);
    }
    if (this.matchKeywords(q, ['tableau périodique', 'éléments', 'periodic table'])) {
      return this.createBotMessage('Le tableau périodique organise tous les éléments chimiques connus par leur numéro atomique et propriétés! 📊', null, null);
    }
    if (this.matchKeywords(q, ['acide', 'base', 'ph'])) {
      return this.createBotMessage('Les acides et les bases sont opposés chimiquement. Le pH mesure si une substance est acide (pH < 7) ou basique (pH > 7)! ⚗️', null, null);
    }
    
    // PHYSIQUE
    if (this.matchKeywords(q, ['gravité', 'force', 'newton', 'f = ma'])) {
      return this.createBotMessage('La gravité est une force qui attire les objets. Newton a montré que F = ma (Force = masse × accélération)! 🪨⬇️', null, null);
    }
    if (this.matchKeywords(q, ['énergie', 'kinétique', 'potentielle'])) {
      return this.createBotMessage('L\'énergie cinétique dépend du mouvement, l\'énergie potentielle de la position. L\'énergie totale se conserve! ⚡', null, null);
    }
    if (this.matchKeywords(q, ['lumière', 'onde', 'fréquence'])) {
      return this.createBotMessage('La lumière est une onde électromagnétique. Elle a une fréquence et une longueur d\'onde! 💡', null, null);
    }
    if (this.matchKeywords(q, ['relativité', 'einstein', 'e = mc²'])) {
      return this.createBotMessage('La relativité d\'Einstein montre que l\'énergie (E) et la masse (m) sont équivalentes: E = mc²! 🚀', null, null);
    }
    
    // MÉDECINE & SANTÉ
    if (this.matchKeywords(q, ['cœur', 'système cardiovasculaire', 'circulation'])) {
      return this.createBotMessage('Le cœur pompe le sang à travers le corps via des artères et des veines. C\'est un muscle vital! ❤️', null, null);
    }
    if (this.matchKeywords(q, ['poumon', 'respiration', 'oxygène'])) {
      return this.createBotMessage('Les poumons absorbent l\'oxygène de l\'air et éliminent le dioxyde de carbone. Respiration essentielle! 💨', null, null);
    }
    if (this.matchKeywords(q, ['virus', 'bactérie', 'infection'])) {
      return this.createBotMessage('Les virus et les bactéries sont des microorganismes. Les virus sont plus petits et ont besoin d\'une cellule pour survivre! 🦠', null, null);
    }
    if (this.matchKeywords(q, ['vaccin', 'immunité', 'système immunitaire'])) {
      return this.createBotMessage('Un vaccin prépare le système immunitaire à combattre une maladie. C\'est une prévention très efficace! 💉', null, null);
    }
    if (this.matchKeywords(q, ['calorie', 'nutrition', 'nourriture'])) {
      return this.createBotMessage('Une calorie mesure l\'énergie fournie par la nourriture. Une alimentation équilibrée est importante! 🥗', null, null);
    }
    
    // HISTOIRE
    if (this.matchKeywords(q, ['renaissance', 'moyen âge', 'antiquité'])) {
      return this.createBotMessage('La Renaissance (14-16e siècles) a suivi le Moyen Âge avec un renouveau artistique et culturel! 🎨', null, null);
    }
    if (this.matchKeywords(q, ['révolution française', 'révolution', '1789'])) {
      return this.createBotMessage('La Révolution française (1789) a changé la société avec des idées de liberté et d\'égalité! ⚔️', null, null);
    }
    if (this.matchKeywords(q, ['empire romain', 'rome', 'césar'])) {
      return this.createBotMessage('L\'Empire Romain fut une puissance majeure qui a façonné la civilisation occidentale! 🏛️', null, null);
    }
    if (this.matchKeywords(q, ['guerre mondiale', 'i guerre', 'ii guerre'])) {
      return this.createBotMessage('Les guerres mondiales ont transformé le 20e siècle et le monde! 💔', null, null);
    }
    if (this.matchKeywords(q, ['égypte ancienne', 'pharaon', 'pyramide'])) {
      return this.createBotMessage('L\'Égypte Ancienne était une civilisation remarquable avec une architecture impressionnante! 🔺', null, null);
    }
    
    // GÉOGRAPHIE
    if (this.matchKeywords(q, ['capitale', 'pays', 'continent'])) {
      return this.createBotMessage('La géographie étudie les lieux, les cultures et les phénomènes terrestres! Dis-moi un pays ou une région! 🗺️', null, null);
    }
    if (this.matchKeywords(q, ['climat', 'météo', 'tropique'])) {
      return this.createBotMessage('Le climat est le temps moyen d\'une région. Les tropiques sont près de l\'équateur! 🌍☀️', null, null);
    }
    if (this.matchKeywords(q, ['montagne', 'océan', 'désert'])) {
      return this.createBotMessage('Les montagnes, océans et déserts sont des caractéristiques géographiques qui façonnent la vie sur Terre! ⛰️', null, null);
    }
    if (this.matchKeywords(q, ['population', 'densité', 'démographie'])) {
      return this.createBotMessage('La démographie étudie les populations: taille, âge, croissance, distribution! 👥', null, null);
    }
    
    // LITTÉRATURE & GRAMMAIRE
    if (this.matchKeywords(q, ['grammaire', 'syntaxe', 'verbe', 'substantif'])) {
      return this.createBotMessage('La grammaire est l\'ensemble des règles d\'une langue. Les verbes expriment des actions! 📝', null, null);
    }
    if (this.matchKeywords(q, ['shakespeare', 'molière', 'dichkens'])) {
      return this.createBotMessage('Ces grands auteurs ont créé des œuvres intemporelles qui influencent encore la littérature! 📚', null, null);
    }
    if (this.matchKeywords(q, ['roman', 'poésie', 'pièce de théâtre'])) {
      return this.createBotMessage('La littérature comprend romans, poésies et pièces de théâtre - différents genres d\'expression! ✍️', null, null);
    }
    
    // INFORMATIQUE & TECHNOLOGIE
    if (this.matchKeywords(q, ['algorithme', 'code', 'programmer'])) {
      return this.createBotMessage('Un algorithme est une suite d\'instructions pour résoudre un problème. La programmation crée les logiciels! 💻', null, null);
    }
    if (this.matchKeywords(q, ['intelligence artificielle', 'ia', 'machine learning'])) {
      return this.createBotMessage('L\'IA permet aux machines d\'apprendre et de réagir comme les humains. C\'est le futur! 🤖', null, null);
    }
    if (this.matchKeywords(q, ['internet', 'web', 'serveur'])) {
      return this.createBotMessage('Internet est le réseau mondial reliant les ordinateurs. Le web s\'exécute dessus! 🌐', null, null);
    }
    if (this.matchKeywords(q, ['données', 'base de données', 'stockage'])) {
      return this.createBotMessage('Les données sont des informations. Les bases de données les stockent et les organisent efficacement! 💾', null, null);
    }
    
    // ÉCONOMIE
    if (this.matchKeywords(q, ['économie', 'marché', 'ofre et demande'])) {
      return this.createBotMessage('L\'économie gère les ressources. L\'offre et la demande déterminent les prix! 💰', null, null);
    }
    if (this.matchKeywords(q, ['inflation', 'chômage', 'pib'])) {
      return this.createBotMessage('L\'inflation monte les prix, le chômage c\'est sans emploi. Le PIB mesure la richesse d\'un pays! 📊', null, null);
    }
    
    // PSYCHOLOGIE
    if (this.matchKeywords(q, ['psychologie', 'comportement', 'esprit'])) {
      return this.createBotMessage('La psychologie étudie le comportement humain et l\'esprit! 🧠', null, null);
    }
    if (this.matchKeywords(q, ['freud', 'inconscient', 'psychanalyse'])) {
      return this.createBotMessage('Freud a développé la psychanalyse et exploré l\'inconscient humain! 💭', null, null);
    }
    
    return null; // Pas de réponse trouvée
  }

  /**
   * Vérifie si les mots-clés correspondent à la question
   */
  matchKeywords(question, keywords) {
    return keywords.some(keyword => question.includes(keyword.toLowerCase()));
  }

  /**
   * Obtient une suggestion de réponse basée sur le contexte
   * @param {string} messageContent - Le message reçu
   * @param {array} conversationHistory - L'historique récent
   */
  suggestResponse(messageContent, conversationHistory = []) {
    // Patterns simples de suggestion de réponse
    const suggestions = [];

    // Suggestions basées sur les mots-clés
    if (messageContent.toLowerCase().includes('problème') || 
        messageContent.toLowerCase().includes('erreur')) {
      suggestions.push('Je peux vous aider. Que se passe-t-il?');
      suggestions.push('Décrivez-moi le problème en détail');
    }

    if (messageContent.toLowerCase().includes('merci')) {
      suggestions.push('De rien! 😊');
      suggestions.push('Toujours heureux de vous aider');
    }

    if (messageContent.toLowerCase().includes('comment') ||
        messageContent.toLowerCase().includes('how')) {
      suggestions.push('Pouvez-vous me donner plus de détails?');
      suggestions.push('Je vais faire de mon mieux pour vous aider');
    }

    if (messageContent.toLowerCase().includes('bonjour') ||
        messageContent.toLowerCase().includes('hello')) {
      suggestions.push('Bonjour! 👋');
      suggestions.push('Salut! Comment ça va?');
    }

    // Suggestions génériques
    if (suggestions.length === 0) {
      suggestions.push('C\'est intéressant!');
      suggestions.push('Racontez-moi plus');
      suggestions.push('D\'accord, continuez');
    }

    return suggestions.slice(0, 3); // Retourner max 3 suggestions
  }

  /**
   * Obtient la liste des commandes disponibles
   */
  getCommandsList() {
    return Object.entries(this.commands).map(([cmd, data]) => ({
      command: cmd,
      description: data.description
    }));
  }
}

// Exporter une instance unique
module.exports = new ChatBot();
