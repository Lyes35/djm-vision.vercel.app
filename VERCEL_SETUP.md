# Guide de Configuration Vercel pour DJM Vision

## 1. Test des Streams IPTV

### Vérification du Proxy
Le proxy `/api/index.js` est configuré pour :
- ✅ Résoudre les problèmes CORS
- ✅ Servir le contenu en HTTPS (même si la source est HTTP)
- ✅ Définir le bon Content-Type pour les streams HLS

### Test Manuel
1. Ouvrez l'application déployée
2. Essayez de lire une chaîne IPTV
3. Vérifiez la console du navigateur pour les erreurs CORS
4. Si vous voyez des erreurs "mixed content", c'est que certains streams utilisent HTTP

### Streams de Test
Pour tester, vous pouvez utiliser des streams HLS publics :
- Big Buck Bunny: `https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8`

## 2. Domaine Personnalisé

### Dans le Dashboard Vercel :
1. Allez dans votre projet DJM Vision
2. Onglet "Settings" > "Domains"
3. Cliquez "Add" et entrez votre domaine (ex: `djmvision.app`)
4. Suivez les instructions pour configurer les DNS

### Configuration DNS Requise :
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 3. Activation de Vercel Analytics

### Dans le Dashboard Vercel :
1. Allez dans votre projet DJM Vision
2. Onglet "Settings" > "Analytics"
3. Activez "Vercel Analytics"
4. Le code de tracking sera automatiquement ajouté

### Avantages :
- Suivi du nombre de visiteurs
- Pages les plus populaires
- Performance des chargements
- Erreurs JavaScript

## 4. Optimisation des Playlists

### Nouvelle API de Filtrage
Une API `/api/playlist` a été créée pour :
- Parser les M3U côté serveur
- Filtrer par catégorie
- Limiter le nombre de résultats
- Réduire la charge côté client

### Utilisation :
```javascript
// Filtrer par catégorie
const channels = await fetchFilteredPlaylist(url, 'Islamic', 50);

// Obtenir les statistiques
const stats = await getPlaylistStats(url);
```

### Bénéfices :
- ✅ Moins de données transférées au client
- ✅ Filtrage plus rapide
- ✅ Meilleure expérience utilisateur
- ✅ Réduction de la consommation de bande passante

## Variables d'Environnement

Assurez-vous que `GEMINI_API_KEY` est définie dans :
- Settings > Environment Variables
- Scope: Production
- Type: Encrypted

## Monitoring Post-Déploiement

Après activation d'Analytics, surveillez :
- Taux d'erreur des streams
- Popularité des chaînes
- Performance de chargement
- Utilisation de l'IA

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Vercel (Functions tab)
2. Testez les APIs individuellement
3. Vérifiez la configuration DNS pour le domaine personnalisé