# 🧪 Guide de Test - TalkMe

Ce guide vous aidera à tester toutes les fonctionnalités implémentées.

## 📋 Checklist de Test

### 1. ✅ **Confirmation de message envoyé**
- [ ] Envoyez un message
- [ ] Vérifiez que "✓ Livré" apparaît à côté du message
- [ ] Survolez le timestamp pour voir l'heure de livraison exacte
- [ ] Testez avec plusieurs messages

**Résultat attendu**: Badge "✓ Livré" avec timestamp

---

### 2. 👀 **Vu / Non vu**
- [ ] Ouvrez deux sessions utilisateurs différents
- [ ] Envoyez un message depuis l'utilisateur A
- [ ] Recevez-le avec l'utilisateur B
- [ ] Vérifiez que "👁️ Lu" apparaît chez A
- [ ] Chez A, survolez pour voir la liste des lecteurs
- [ ] Vérifiez le nombre de personnes qui ont lu

**Résultat attendu**: Badge de lecture avec liste des utilisateurs au survol

---

### 3. ✏️ **Modifier un message**
- [ ] Envoyez un message
- [ ] Cliquez sur ⋮ (menu)
- [ ] Cliquez sur ✏️ Éditer
- [ ] Modifiez le texte
- [ ] Cliquez "Enregistrer"
- [ ] Vérifiez que "(édité)" s'affiche
- [ ] Cliquez sur "📜 Historique" pour voir les changements
- [ ] Modifiez plusieurs fois et vérifiez l'historique complet

**Résultat attendu**: Message modifié avec historique complet des changements

---

### 4. 🗑️ **Supprimer un message**
- [ ] Envoyez un message
- [ ] Cliquez sur ⋮ (menu)
- [ ] Cliquez sur 🗑️ Supprimer
- [ ] Confirmez la suppression
- [ ] Vérifiez que "🗑️ Message supprimé (par vous)" s'affiche
- [ ] Testez avec un message des autres (pas de bouton de suppression)

**Résultat attendu**: Message remplacé par une ligne "Message supprimé"

---

### 5. 😊 **Réactions aux messages**
- [ ] Envoyez un message
- [ ] Cliquez sur 😊 pour afficher les emojis
- [ ] Les 6 emojis disponibles: 👍 ❤️ 😂 😮 😢 🔥
- [ ] Cliquez sur un emoji (ex: 👍)
- [ ] Vérifiez que le badge s'affiche avec le compteur
- [ ] Avec un autre utilisateur, ajoutez une réaction au même emoji
- [ ] Vérifiez que le compteur augmente (👍 2)
- [ ] Survolez le badge pour voir qui a réagi
- [ ] Re-cliquez sur le même emoji pour retirer votre réaction

**Résultat attendu**: Badges avec compteur et tooltip au survol

---

### 6. 🔍 **Recherche dans les messages**
- [ ] Envoyez plusieurs messages contenant des mots clés
- [ ] Cliquez sur 🔍 en haut à droite
- [ ] Tapez un mot à rechercher
- [ ] Vérifiez que les résultats s'affichent en temps réel (après 500ms)
- [ ] Les mots recherchés doivent être surlignés en jaune
- [ ] Vérifiez le nombre de résultats
- [ ] Testez une recherche sans résultats

**Résultat attendu**: Recherche en temps réel avec surlignage et compteur

---

### 7. 📌 **Message épinglé**
- [ ] Envoyez plusieurs messages
- [ ] Sur un message, cliquez ⋮ puis 📌 Épingler
- [ ] Vérifiez que le badge 📌 s'affiche sur le message
- [ ] Cliquez sur 📌 en haut à droite
- [ ] Vérifiez que le message apparaît dans le panneau des messages épinglés
- [ ] Le compteur doit afficher "1"
- [ ] Épinglez plusieurs messages
- [ ] Dépinglez un message en cliquant "Dépingler" dans le panneau
- [ ] Vérifiez que le badge et l'entrée disparaissent

**Résultat attendu**: Messages épinglés visibles dans un panneau avec option de dépinglage

---

### 8. ⬇️ **Scroll automatique vers le dernier message**
- [ ] Recevez plusieurs messages
- [ ] Vérifiez que la page scroll automatiquement au dernier message (smooth)
- [ ] Scrollez vers le haut (milieu de la conversation)
- [ ] Recevez un nouveau message
- [ ] Vérifiez que l'indicateur "⬇️ Nouveaux messages" s'affiche
- [ ] Cliquez sur le bouton
- [ ] Vérifiez que la page scroll vers le bas (smooth)
- [ ] L'indicateur doit disparaître

**Résultat attendu**: Scroll fluide avec indicateur quand des nouveaux messages arrivent

---

## 🌐 **Tests d'Intégration**

### Test 1: Flux complet
- [ ] Utilisateur A envoie un message
- [ ] Utilisateur A le modifie
- [ ] Utilisateur B le reçoit et ajoute une réaction
- [ ] Utilisateur A ajoute aussi une réaction
- [ ] Utilisateur A épingle le message
- [ ] Vérifiez tout dans le panneau des messages épinglés
- [ ] Utilisateur B recherche le mot clé du message

**Résultat attendu**: Toutes les opérations fonctionnent ensemble sans conflit

### Test 2: Performance
- [ ] Envoyez 50+ messages rapidement
- [ ] Vérifiez la réactivité de l'interface
- [ ] Effectuez une recherche sur 50+ messages
- [ ] Vérifiez que la recherche reste réactive

**Résultat attendu**: Interface fluide même avec beaucoup de messages

### Test 3: Multi-utilisateurs
- [ ] 3+ utilisateurs dans le même salon
- [ ] Chacun teste les 8 fonctionnalités
- [ ] Vérifiez que les mises à jour en temps réel sont correctes

**Résultat attendu**: Synchronisation parfaite entre tous les clients

---

## 📱 **Tests Responsive**

- [ ] Tests sur desktop (1920x1080)
- [ ] Tests sur tablet (768x1024)
- [ ] Tests sur mobile (375x667)
- [ ] Vérifiez que l'interface s'adapte bien
- [ ] Les modales (recherche, messages épinglés) restent lisibles

**Résultat attendu**: Interface adaptée à tous les écrans

---

## 🔒 **Tests de Sécurité**

- [ ] Essayez de modifier/supprimer un message d'un autre utilisateur
- [ ] Essayez de dépingler un message d'un autre utilisateur
- [ ] Vérifiez les erreurs appropriées

**Résultat attendu**: Seul le propriétaire peut modifier/supprimer ses messages

---

## 🐛 **Tests de Bugs Courants**

### Bug #1: Messages doublons
- [ ] Envoyez rapidement plusieurs messages
- [ ] Vérifiez qu'il n'y a pas de doublons

### Bug #2: Historique incomplet
- [ ] Modifiez un message 5+ fois
- [ ] Vérifiez que tout l'historique est présent

### Bug #3: Scroll stuck
- [ ] Recevez plusieurs messages très rapidement
- [ ] Vérifiez que le scroll fonctionne correctement

### Bug #4: Réaction dupliquée
- [ ] Cliquez 2x rapidement sur le même emoji
- [ ] Vérifiez qu'il n'y a pas de réaction dupliquée

### Bug #5: Recherche non responsive
- [ ] Recherchez 100+ mots différents rapidement
- [ ] Vérifiez que la UI reste réactive

---

## 📊 **Métriques de Test**

| Fonctionnalité | Status | Notes |
|---|---|---|
| Confirmation d'envoi | ✅ | |
| Vu/Non vu | ✅ | |
| Modification | ✅ | |
| Suppression | ✅ | |
| Réactions | ✅ | |
| Recherche | ✅ | |
| Messages épinglés | ✅ | |
| Scroll auto | ✅ | |

---

## 🎯 **Critères d'Acceptation**

- ✅ Toutes les 8 fonctionnalités fonctionnent
- ✅ Les mises à jour temps réel sont synchronisées
- ✅ L'interface est responsive
- ✅ Pas de console errors critiques
- ✅ Les actions non autorisées sont bloquées
- ✅ Les animations sont fluides
- ✅ Les tooltips et badges s'affichent correctement
- ✅ La recherche est rapide et réactive

---

**Test par**: _____________________  
**Date**: ___________________________  
**Résultat**: ✅ PASS / ❌ FAIL  
**Notes**: _____________________  

