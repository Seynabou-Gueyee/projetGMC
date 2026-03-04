/**
 * Service de Base de Données Vectorielle
 * Fournit des capacités de recherche sémantique pour améliorer le RAG
 * 
 * Utilise des embeddings pour une recherche plus intelligente
 * Supporte Pinecone, Faiss local, ou autre store vectoriel
 * 
 * WAVE 3 - Amélioration de la recherche sémantique
 */

const fs = require('fs');
const path = require('path');

/**
 * Classe: ServiceBaseDonnéesVectorielle
 * Gère les embeddings et la recherche sémantique
 */
class ServiceBaseDonnéesVectorielle {
  constructor() {
    this.embeddingsIndexés = new Map(); // docId -> {vecteur, contenu, métadonnées}
    this.stockageVecteurs = new Map(); // stockage local des vecteurs
    this.documentIndex = new Map(); // indexation rapide par ID
    this.configurationVecteurs = {
      tailleEmbedding: 1536, // OpenAI par défaut
      modèleEmbedding: 'text-embedding-3-small',
      seuilSimilarité: 0.7,
      tailleMaxVecteurs: 10000
    };
    this.fournisseurVecteurs = 'local'; // 'pinecone', 'milvus', 'local'
    this.servicePrêt = false;
    this.journal = require('../utils/logger');
  }

  /**
   * Initialise le service de base de données vectorielle
   */
  async initialiserService() {
    try {
      this.journal?.info('⏳ Initialisation de la base de données vectorielle...');
      
      // Charger vecteurs existants du disque
      this.chargerVecteursDédisque();
      
      this.servicePrêt = true;
      this.journal?.info('✅ Base de données vectorielle prête');
      
      return {
        succès: true,
        message: 'Service vectoriel initialisé',
        stats: this.obtiendrStatistiques()
      };
    } catch (erreur) {
      this.journal?.erreur('Erreur initialisation:', erreur);
      return { succès: false, erreur: erreur.message };
    }
  }

  /**
   * Crée une représentation vectorielle approximative d'un texte
   * En production: utiliser OpenAI API, Hugging Face, ou autre
   */
  créerVecteurDuTexte(texte) {
    // Approximation de hachage pour démo
    // En production: appeler une API d'embedding
    const mots = texte.toLowerCase().split(/\s+/);
    const vecteur = new Array(this.configurationVecteurs.tailleEmbedding).fill(0);
    
    // Simuler un embedding en utilisant les mots clés
    mots.forEach((mot, index) => {
      const hachage = mot.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      vecteur[index % vecteur.length] += hachage / 100;
    });
    
    // Normaliser le vecteur
    const norme = Math.sqrt(vecteur.reduce((acc, val) => acc + val * val, 0));
    return vecteur.map(val => norme > 0 ? val / norme : 0);
  }

  /**
   * Ajoute un document avec son embedding vectoriel
   */
  async ajouterDocumentVectorisé(docId, contenu, métadonnées = {}) {
    try {
      const vecteur = this.créerVecteurDuTexte(contenu);
      
      this.embeddingsIndexés.set(docId, {
        id: docId,
        vecteur: vecteur,
        contenu: contenu,
        métadonnées: métadonnées,
        dateAjout: new Date(),
        tailleVecteur: this.configurationVecteurs.tailleEmbedding
      });
      
      this.documentIndex.set(docId, {
        contenuRésumé: contenu.substring(0, 100),
        longueur: contenu.length,
        nombreMots: contenu.split(/\s+/).length
      });
      
      this.journal?.debug(`Vecteur créé pour: ${docId}`);
      return { succès: true, docId };
    } catch (erreur) {
      this.journal?.erreur(`Erreur création vecteur: ${erreur.message}`);
      return { succès: false, erreur: erreur.message };
    }
  }

  /**
   * Calcule la similarité cosinus entre deux vecteurs
   */
  calculerSimilarité(vecteur1, vecteur2) {
    if (vecteur1.length !== vecteur2.length) {
      return 0;
    }

    let produitScalaire = 0;
    let norme1 = 0;
    let norme2 = 0;

    for (let i = 0; i < vecteur1.length; i++) {
      produitScalaire += vecteur1[i] * vecteur2[i];
      norme1 += vecteur1[i] * vecteur1[i];
      norme2 += vecteur2[i] * vecteur2[i];
    }

    if (norme1 === 0 || norme2 === 0) {
      return 0;
    }

    return produitScalaire / (Math.sqrt(norme1) * Math.sqrt(norme2));
  }

  /**
   * Recherche sémantique: trouve les documents les plus similaires
   */
  rechercherSémantique(requête, nombreRésultats = 5) {
    if (!this.servicePrêt || this.embeddingsIndexés.size === 0) {
      return [];
    }

    // Créer le vecteur de la requête
    const vecteurRequête = this.créerVecteurDuTexte(requête);

    // Calculer la similarité avec tous les documents
    const résultats = [];
    for (const [docId, données] of this.embeddingsIndexés.entries()) {
      const similarité = this.calculerSimilarité(
        vecteurRequête,
        données.vecteur
      );

      if (similarité > this.configurationVecteurs.seuilSimilarité) {
        résultats.push({
          docId: docId,
          contenu: données.contenu,
          similarité: parseFloat(similarité.toFixed(4)),
          métadonnées: données.métadonnées
        });
      }
    }

    // Trier par similarité décroissante
    résultats.sort((a, b) => b.similarité - a.similarité);

    // Retourner les top N résultats
    return résultats.slice(0, nombreRésultats);
  }

  /**
   * Recherche hybride: combine recherche par mots-clés et sémantique
   */
  rechercherHybride(requête, motsClésPrécédents = [], nombreRésultats = 5) {
    // 1. Recherche sémantique
    const résultatsVectoriels = this.rechercherSémantique(requête, nombreRésultats * 2);

    // 2. Recherche par mots-clés si disponible
    const motsCléRequête = requête.toLowerCase().split(/\s+/);
    const tousMotsCés = [...motsClésPrécédents, ...motsCléRequête];

    // 3. Fusionner les résultats avec score combiné
    const résultatsFusionnés = new Map();

    résultatsVectoriels.forEach(résultat => {
      const scoreVectoriel = résultat.similarité * 0.7; // 70% du poids
      
      // Bonus de score si mots-clés correspondent
      let scoreMotsCés = 0;
      tousMotsCés.forEach(motClé => {
        if (résultat.contenu.toLowerCase().includes(motClé)) {
          scoreMotsCés += 0.05;
        }
      });
      scoreMotsCés = Math.min(scoreMotsCés, 0.3); // 30% du poids max

      const scoreTotal = scoreVectoriel + scoreMotsCés;

      résultatsFusionnés.set(résultat.docId, {
        ...résultat,
        scoreVectoriel,
        scoreMotsCés,
        scoreTotal: parseFloat(scoreTotal.toFixed(4))
      });
    });

    // Convertir en array et trier
    const résultatsTriés = Array.from(résultatsFusionnés.values())
      .sort((a, b) => b.scoreTotal - a.scoreTotal)
      .slice(0, nombreRésultats);

    return résultatsTriés;
  }

  /**
   * Améliore le contexte RAG avec la recherche vectorielle
   */
  enrichirContexteAvecVecteurs(question, contexteConversation = []) {
    const mots = question.toLowerCase().split(/\s+/);
    
    // Recherche sémantique
    const documentsVectoriels = this.rechercherSémantique(question, 3);
    
    // Recherche hybride pour meilleur résultat
    const documentsHybrides = this.rechercherHybride(question, mots, 5);

    return {
      requête: question,
      documentsVectoriels: documentsVectoriels.map(d => ({
        ...d,
        typeRecherche: 'vectoriel'
      })),
      documentsHybrides: documentsHybrides.map(d => ({
        ...d,
        typeRecherche: 'hybride'
      })),
      scoresVectoriels: documentsVectoriels.length > 0 
        ? {
            min: documentsVectoriels[documentsVectoriels.length - 1].similarité,
            max: documentsVectoriels[0].similarité,
            moyen: documentsVectoriels.reduce((a, d) => a + d.similarité, 0) / documentsVectoriels.length
          }
        : null,
      contexteConversationUtilisé: contexteConversation.length
    };
  }

  /**
   * Met fin à un document (supprime ses vecteurs)
   */
  supprimerDocument(docId) {
    const supprimé = {
      vecteurs: this.embeddingsIndexés.delete(docId),
      index: this.documentIndex.delete(docId)
    };
    return supprimé.vecteurs || supprimé.index;
  }

  /**
   * Organise les documents par similarité (regroupement)
   */
  regrouperDocumentsParSimilarité(seuilSimilarité = 0.8) {
    const groupes = [];
    const docTraités = new Set();

    for (const [docId1, données1] of this.embeddingsIndexés.entries()) {
      if (docTraités.has(docId1)) continue;

      const groupe = [docId1];
      docTraités.add(docId1);

      for (const [docId2, données2] of this.embeddingsIndexés.entries()) {
        if (docTraités.has(docId2)) continue;

        const similarité = this.calculerSimilarité(
          données1.vecteur,
          données2.vecteur
        );

        if (similarité >= seuilSimilarité) {
          groupe.push(docId2);
          docTraités.add(docId2);
        }
      }

      if (groupe.length > 0) {
        groupes.push({
          groupe,
          taille: groupe.length,
          documentsReprés: groupe.map(id => 
            this.embeddingsIndexés.get(id)?.métadonnées.source || id
          )
        });
      }
    }

    return groupes;
  }

  /**
   * Exporte les vecteurs pour utilisation externe
   */
  exporterVecteurs(format = 'json') {
    const résultats = [];
    
    for (const [docId, données] of this.embeddingsIndexés.entries()) {
      résultats.push({
        id: docId,
        vecteur: données.vecteur,
        contenuRésumé: données.contenu.substring(0, 200),
        métadonnées: données.métadonnées,
        tailleVecteur: données.tailleVecteur
      });
    }

    return résultats;
  }

  /**
   * Persiste les vecteurs sur disque
   */
  sauvegarderVecteurs() {
    try {
      const cheminFichier = path.join(__dirname, '..', 'vecteurs_cache.json');
      const données = this.exporterVecteurs();
      fs.writeFileSync(cheminFichier, JSON.stringify(données, null, 2));
      this.journal?.info(`✅ Vecteurs sauvegardés: ${données.length} documents`);
      return { succès: true, nombre: données.length };
    } catch (erreur) {
      this.journal?.erreur('Erreur sauvegarde vecteurs:', erreur);
      return { succès: false, erreur: erreur.message };
    }
  }

  /**
   * Charge les vecteurs depuis le disque
   */
  chargerVecteursDédisque() {
    try {
      const cheminFichier = path.join(__dirname, '..', 'vecteurs_cache.json');
      if (fs.existsSync(cheminFichier)) {
        const données = JSON.parse(fs.readFileSync(cheminFichier, 'utf8'));
        
        données.forEach(doc => {
          this.embeddingsIndexés.set(doc.id, {
            id: doc.id,
            vecteur: doc.vecteur,
            contenu: doc.contenuRésumé,
            métadonnées: doc.métadonnées,
            tailleVecteur: doc.tailleVecteur
          });
        });
        
        this.journal?.info(`✅ ${données.length} vecteurs chargés`);
      }
    } catch (erreur) {
      this.journal?.erreur('Erreur chargement vecteurs:', erreur);
    }
  }

  /**
   * Obtendrdes statistiques
   */
  obtiendrStatistiques() {
    const tousVecteurs = Array.from(this.embeddingsIndexés.values());
    
    return {
      nombreDocuments: this.embeddingsIndexés.size,
      nombreIndexés: tousVecteurs.filter(d => d.vecteur).length,
      tailleMaxVecteurs: this.configurationVecteurs.tailleMaxVecteurs,
      tauxOccupation: ((this.embeddingsIndexés.size / this.configurationVecteurs.tailleMaxVecteurs) * 100).toFixed(2) + '%',
      tailleEmbedding: this.configurationVecteurs.tailleEmbedding,
      fournisseur: this.fournisseurVecteurs,
      dernièreMiseÀJour: new Date()
    };
  }

  /**
   * Obtenir des recommandations basées sur un document
   */
  obtenirDocumentsRecommandés(docIdCible, nombreRecommandations = 5) {
    const docCible = this.embeddingsIndexés.get(docIdCible);
    if (!docCible) return [];

    const recommandations = [];
    
    for (const [docId, données] of this.embeddingsIndexés.entries()) {
      if (docId === docIdCible) continue;

      const similarité = this.calculerSimilarité(
        docCible.vecteur,
        données.vecteur
      );

      recommandations.push({
        docId,
        similarité: parseFloat(similarité.toFixed(4)),
        titre: données.métadonnées.titre || docId,
        source: données.métadonnées.source
      });
    }

    return recommandations
      .sort((a, b) => b.similarité - a.similarité)
      .slice(0, nombreRecommandations);
  }

  /**
   * Configurer le fournisseur de vecteurs
   */
  configurerFournisseur(fournisseur, configBase) {
    this.fournisseurVecteurs = fournisseur;
    
    if (fournisseur === 'pinecone') {
      this.configurationVecteurs.modeAPI = true;
      this.configurationVecteurs.cleAPI = configBase?.cleAPI;
      this.configurationVecteurs.environnement = configBase?.environnement || 'production';
    } else if (fournisseur === 'local') {
      this.configurationVecteurs.modeAPI = false;
    } else if (fournisseur === 'milvus') {
      this.configurationVecteurs.urlHôte = configBase?.urlHôte || 'localhost:19530';
    }

    this.journal?.info(`✅ Fournisseur vectoriel configuré: ${fournisseur}`);
  }
}

// Exporter comme singleton
module.exports = new ServiceBaseDonnéesVectorielle();
