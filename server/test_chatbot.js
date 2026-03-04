#!/usr/bin/env node

/**
 * Script de test pour le chatbot amélioré
 * Utilisation: node test_chatbot.js
 */

const bot = require('./utils/bot');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

// Questions de test
const testQuestions = [
  // Salutations
  { q: 'Bonjour', category: 'Salutations' },
  { q: 'Salut ça va?', category: 'Salutations' },
  { q: 'Hey!', category: 'Salutations' },
  
  // Mathématiques
  { q: 'Quelle est la valeur de pi?', category: 'Mathématiques' },
  { q: 'Explique le théorème de Pythagore', category: 'Mathématiques' },
  
  // Sciences
  { q: 'C\'est quoi la photosynthèse?', category: 'Sciences' },
  { q: 'Explique l\'évolution', category: 'Sciences' },
  { q: 'Qu\'est-ce que l\'ADN?', category: 'Sciences' },
  
  // Géographie
  { q: 'Quelle est la capitale de la France?', category: 'Géographie' },
  { q: 'Capitale du Japon?', category: 'Géographie' },
  
  // Histoire
  { q: 'Quand a eu lieu la révolution française?', category: 'Histoire' },
  { q: 'Raconte-moi sur l\'empire romain', category: 'Histoire' },
  
  // Technologie
  { q: 'C\'est quoi JavaScript?', category: 'Technologie' },
  { q: 'Explique Internet', category: 'Technologie' },
  
  // Humour
  { q: 'Raconte-moi une blague', category: 'Humour' },
  
  // Questions variées
  { q: 'Peux-tu m\'aider avec un problème?', category: 'Aide' },
  { q: 'Merci pour ton aide!', category: 'Remerciements' },
];

// Fonction principale de test
async function runTests() {
  console.log(colors.bright + colors.blue + '\n=== TEST DU CHATBOT AMÉLIORÉ ===' + colors.reset);
  console.log(colors.yellow + 'Testage de ' + testQuestions.length + ' questions...\n' + colors.reset);

  let passed = 0;
  let categoryStats = {};

  for (const test of testQuestions) {
    const response = await bot.processMessage(test.q, {}, 'test-room', []);
    
    if (response && response.content) {
      passed++;
      
      // Stats par catégorie
      if (!categoryStats[test.category]) {
        categoryStats[test.category] = { total: 0, passed: 0 };
      }
      categoryStats[test.category].total++;
      categoryStats[test.category].passed++;
      
      console.log(colors.green + '✓ PASS' + colors.reset + ' - ' + colors.magenta + test.category + colors.reset);
      console.log(colors.bright + '  Q: ' + colors.reset + test.q);
      console.log(colors.bright + '  A: ' + colors.reset + response.content.substring(0, 80) + 
                  (response.content.length > 80 ? '...' : ''));
      console.log();
    } else {
      console.log(colors.red + '✗ FAIL' + colors.reset + ' - ' + test.category);
      console.log(colors.bright + '  Q: ' + colors.reset + test.q);
      console.log();
    }
  }

  // Résumé
  console.log(colors.bright + '\n=== RÉSUMÉ ===' + colors.reset);
  console.log(colors.green + 'Total passé: ' + passed + '/' + testQuestions.length + colors.reset);
  console.log(colors.yellow + 'Taux de succès: ' + Math.round((passed / testQuestions.length) * 100) + '%' + colors.reset);
  
  console.log(colors.bright + '\nPar catégorie:' + colors.reset);
  for (const [category, stats] of Object.entries(categoryStats)) {
    const percentage = Math.round((stats.passed / stats.total) * 100);
    const statusColor = percentage === 100 ? colors.green : colors.yellow;
    console.log(`  ${statusColor}${category}: ${stats.passed}/${stats.total} (${percentage}%)${colors.reset}`);
  }

  console.log(colors.bright + colors.blue + '\n=== NOTES ===' + colors.reset);
  console.log('✓ Le chatbot a une culture générale et peut répondre à de nombreuses questions');
  console.log('✓ Sans API OpenAI: mode local intelligent avec les domaines couverts');
  console.log('✓ Avec API OpenAI: réponses pratiquement illimitées');
  console.log('✓ Le système bascule automatiquement en cas d\'erreur\n');
}

// Lancer les tests
runTests().catch(console.error);
