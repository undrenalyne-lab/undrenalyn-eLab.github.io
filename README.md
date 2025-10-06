# undrenalyn-eLab

## Description
Ce projet contient le code développé par CODEX pour le laboratoire eLab.

## Instructions

### Tester localement

```bash
python -m http.server 8000
```

Ensuite rendez-vous sur <http://localhost:8000> pour vérifier le rendu.

### Mettre à jour le site en production

Le site est publié via GitHub Pages. Pour pousser les dernières modifications :

```bash
git checkout work
git pull
git status
git add .
git commit -m "Votre message de commit"
git push origin work
```

Ouvrez ensuite une pull request de `work` vers `main` puis fusionnez-la pour déclencher la mise à jour automatique du site.
