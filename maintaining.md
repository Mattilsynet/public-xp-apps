### Do once
#### Setup app-source remote
```bash
git remote add app-source git@github.com:Mattilsynet/mattilsynet-web.git
```
---

### Updating an app
checkout main
```bash
git subtree pull -P wizard app-source wizard-upstream
```
`wizard-upstram` should be the branch in `mattilsynet-web` that you want to pull from.

---

### Adding a new public app
```
git subtree add -P APP_NAME app-source APP_NAME-upstream
```
