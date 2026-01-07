# Configuration Git Authentification

## ✅ Configuration Appliquée

Git a été configuré avec les paramètres suivants :

### Utilisateur Git
```bash
git config --global user.name "Lyes35"
git config --global user.email "50424922+Lyes35@users.noreply.github.com"
```

### Fournisseur d'Authentification
```bash
git config --global credential.helper "/usr/bin/gh auth git-credential"
git config --global credential.helper store
```

## 🔐 Méthodes d'Authentification Disponibles

### 1. GitHub CLI (Recommandé)
Si vous avez GitHub CLI installé :
```bash
gh auth login
```
Cela configurera automatiquement l'authentification pour Git.

### 2. Personal Access Token
1. Allez sur https://github.com/settings/tokens
2. Générez un "Personal Access Token" avec les scopes `repo`
3. Lors du premier push, entrez :
   - Username: `Lyes35`
   - Password: `votre_token_personnel`

### 3. SSH (Alternative)
```bash
# Générer une clé SSH
ssh-keygen -t ed25519 -C "50424922+Lyes35@users.noreply.github.com"

# Ajouter au ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copier la clé publique et l'ajouter à GitHub
cat ~/.ssh/id_ed25519.pub

# Changer l'URL du remote
git remote set-url origin git@github.com:Lyes35/djm-vision.vercel.app.git
```

## 🧪 Test de l'Authentification

Pour tester si l'authentification fonctionne :
```bash
git fetch origin
# ou
git push origin main
```

Si demandé, entrez vos credentials GitHub.

## 📋 Statut Actuel

- ✅ GitHub CLI détecté : `/usr/bin/gh`
- ✅ Configuration utilisateur : Lyes35
- ✅ Remote configuré : HTTPS
- ✅ Credential helper : GitHub CLI + store

L'authentification Git est maintenant configurée et prête à être utilisée ! 🚀