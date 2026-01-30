# GitHub Actions Secrets (Heady)

## Review & Extract

- **Secret scopes**
  - **Repository secrets** apply to all workflows in the repo.
  - **Environment secrets** apply only to jobs that declare `environment: <name>`.
  - **Organization secrets** can be shared across repos (subject to org plan + access policy).
- **Heady usage**
  - **Render deploy hooks** are consumed as GitHub Actions secrets by `.github/workflows/deploy-render.yml`.
  - **Runtime secrets** like `DATABASE_URL` and `HEADY_API_KEY` are managed by Render via `render.yaml` env groups, and typically do **not** need to be GitHub Actions secrets unless CI needs them.
- **Workflow rules**
  - **Use secrets via env** (`env:`) and reference in scripts as environment variables.
  - **Avoid printing secrets**. Mask any sensitive value that isn’t already a GitHub secret using `::add-mask::`.
  - **Don’t use secrets in `if:`** directly; assign to env first if you need conditional behavior.

## Quiz Questions

- **Q (open)** When should you prefer an environment secret over a repository secret?
- **Q (open)** Why are secrets usually unavailable to workflows triggered from forks?
- **Q (open)** What is the safe pattern to pass a secret into a shell command?
- **Q (boolean)** Can you reference `secrets.MY_SECRET` directly inside an `if:` expression?
- **Q (multiple choice)** Which scope requires additional CLI auth scope `admin:org`?
  - **A** Repository
  - **B** Environment
  - **C** Organization

## Flashcards

### Scopes & Access

- **Card** Q: What’s the difference between repository secrets and environment secrets?
  - **A:** Repository secrets are available to workflows across the repo; environment secrets are only available to jobs that set `environment: <name>`.

- **Card** Q: Who can create organization-level secrets?
  - **A:** Organization owners (and you may need `gh auth login --scopes "admin:org"` to manage them via CLI).

- **Card** Q: Are secrets passed to workflows triggered from forks?
  - **A:** Generally no (except `GITHUB_TOKEN`), to prevent exfiltration.

### GitHub CLI (gh) Commands

- **Card** Q: How do you set a repository secret via GitHub CLI?
  - **A:** `gh secret set SECRET_NAME` (or `gh secret set SECRET_NAME < secret.txt`).

- **Card** Q: How do you set an environment secret via GitHub CLI?
  - **A:** `gh secret set --env ENV_NAME SECRET_NAME`.

- **Card** Q: How do you set an organization secret via GitHub CLI?
  - **A:** `gh secret set --org ORG_NAME SECRET_NAME` (optionally add `--visibility all` or `--repos ...`).

### Workflow Usage & Safety

- **Card** Q: What’s the safe way to pass a secret into a command in GitHub Actions?
  - **A:** Put it in `env:` and reference it with proper quoting (example: `"$MY_SECRET"`).

- **Card** Q: Can you reference secrets directly in `if:` expressions?
  - **A:** No; set them to job-level env vars first, then reference `env.VAR_NAME`.

- **Card** Q: How do you mask a sensitive value that is not a GitHub secret?
  - **A:** Print `::add-mask::VALUE` before any logging that could reveal it.

## Heady: What to Configure

### GitHub Environments

- **Environment name** `production`
- **Environment name** `staging`

### Required Secret(s)

- **Secret name** `RENDER_DEPLOY_HOOK_URL`
  - **Where** Set this as an *environment secret* in both `production` and `staging` (recommended), or as a repository secret if you don’t need per-environment values.
  - **Used by** `.github/workflows/deploy-render.yml`

### Quick CLI Setup Examples

- **Repo-level secret**
  - **Command** `gh secret set RENDER_DEPLOY_HOOK_URL`

- **Environment-level secrets**
  - **Command** `gh secret set --env production RENDER_DEPLOY_HOOK_URL`
  - **Command** `gh secret set --env staging RENDER_DEPLOY_HOOK_URL`
