# Add the portfolio to your GitHub account

This folder is ready to publish. Pick whichever method suits you.

---

## Method 1 — GitHub website (no Git installation needed)

1. Go to <https://github.com/new> and sign in.
2. Repository name: `ayomide-portfolio` — or, if you want a free site at `https://<username>.github.io`, name it exactly `<username>.github.io`.
3. Description: *"Personal portfolio — hand-built with HTML, CSS and JavaScript."*
4. Choose **Public**.
5. **Do not** tick "Add a README file" — this project already has one.
6. Click **Create repository**.
7. On the setup page, click **"uploading an existing file"**.
8. Select these files from the `portfolio` folder:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `demos/` (whole folder — the two live builds; drag the folder in)
   - `README.md`
   - `SETUP_GITHUB.md`
   - `LICENSE`
   - `.gitignore` (hidden file — choose it from the file picker rather than dragging)
   - `setup-git.ps1` (optional, useful if you install Git later)
9. Click **Commit changes**.

### Turn on GitHub Pages

1. In the repository, open **Settings → Pages**.
2. Under *Build and deployment*, set **Source** to `Deploy from a branch`.
3. Set **Branch** to `main` and folder `/ (root)`, then **Save**.
4. Wait about a minute. The site appears at:
   - `https://<username>.github.io` if you named the repo `<username>.github.io`
   - `https://<username>.github.io/ayomide-portfolio` otherwise

---

## Method 2 — Git + GitHub CLI (recommended if you code often)

1. Install Git: <https://git-scm.com/download/win>
2. Install GitHub CLI: <https://cli.github.com>
3. Open PowerShell inside the `portfolio` folder.
4. Run the included setup script to create the local commit:
   ```powershell
   .\setup-git.ps1
   ```
5. Sign in to GitHub:
   ```powershell
   gh auth login
   ```
6. Create the remote repository and push in one command:
   ```powershell
   gh repo create ayomide-portfolio --public --source=. --remote=origin --push
   ```

---

## Method 3 — Git only

1. Install Git from <https://git-scm.com/download/win>.
2. Open PowerShell inside the `portfolio` folder and run:
   ```powershell
   .\setup-git.ps1
   ```
3. Create an empty repository on <https://github.com/new> (no README, no license — we already have both).
4. Copy the repository URL it gives you, then run:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/ayomide-portfolio.git
   git push -u origin main
   ```

---

## Notes

- `setup-git.ps1` is already configured with **AYOMIDE ISIAKA** and `isiakaayomide24@gmail.com` as the commit author. Nothing needs editing.
- The site has no build step, so GitHub Pages serves it directly from the repository root.
- The contact form uses the visitor's mail app. No server, keys, or secrets are in this repo.
- To publish later changes: `git add .` → `git commit -m "your message"` → `git push`.
