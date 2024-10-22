### Do once
#### Setup app-source remote
```bash
git remote add app-source git@github.com:Mattilsynet/mattilsynet-web.git
```
---

### Updating an app
create or update a subtree branch from the app you want to update by running `push-to-upstream.sh` in the app you want to update. `mattilsynet-web/app/x/push-to-upstream.sh`

checkout main in this project and run: (the example is only for our wizard app)
```bash
git subtree pull -P wizard ../mattilsynet-web origin/wizard-upstream
```
`wizard-upstream` should be the branch in `mattilsynet-web` that you want to pull from.

---

### Adding a new public app
```
git subtree add -P APP_NAME app-source APP_NAME-upstream
```
