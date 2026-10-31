# College Bus Tracker: Nine-Week DevOps Laboratory

All nine experiments use this repository's existing React/Vite frontend,
Express/Socket.IO backend, and SQLite database. No separate registration
application is created. The live server is `backend/server.js`; the separate
`api/` directory is a serverless copy and is not used by these labs.

Run the commands from the directory containing this guide and the root
`package.json`. Commands and expected results are written for Windows
PowerShell unless noted. Replace example GitHub URLs and credentials with your
own; never commit `.env` files, JWT secrets, or database backups.

## Week 1 — Existing College Bus Tracker

### Application map

- `frontend/src/pages/`: login, signup, admin, driver, and student dashboards.
- `frontend/src/services/`: browser geolocation and Socket.IO client.
- `backend/routes/`: role-protected auth, admin, driver, student, and setup APIs.
- `backend/services/database.service.js`: SQLite connection; the default file
  remains `backend/database/bus_tracker.db`. Set `DB_PATH` to use another file.
- `backend/server.js`: Express API, static build hosting, and Socket.IO location
  updates.

The admin dashboard can monitor the fleet, create buses, assign/unassign
registered drivers, change a bus's route, view logs, and see analytics. Active
trips cannot be reassigned. Registration/login, role checks, route/stop
selection, trip start, and live bus-location updates are exercised by
`backend/test/integration.test.js`. The integration test seeds only a temporary
database under the operating system's temp directory; it never writes to the
project's SQLite database.

### Install, test, and run locally

```powershell
node --version
npm --prefix backend ci
npm --prefix frontend ci
npm test
npm --prefix frontend run build
```

Expected: Node.js 20 or newer; the test reports one passing integration test;
Vite reports a successful production build.

Start the backend and frontend in separate terminals:

```powershell
npm --prefix backend run dev
```

```powershell
npm --prefix frontend run dev
```

Expected: the backend listens on port `5000`; Vite prints a local URL (normally
`http://localhost:5173`). Open the Vite URL. Its `/api` and `/socket.io`
requests proxy to the backend. Set `JWT_SECRET` in `backend/.env` or the
backend process environment before using the app; do not use a public or
committed secret. The backend uses the existing SQLite file unless `DB_PATH`
is set. To proxy the frontend to a non-default backend port, set
`VITE_API_PROXY_TARGET` before starting Vite (for example,
`$env:VITE_API_PROXY_TARGET = 'http://localhost:5500'`); the default remains
`http://localhost:5000`.

Do not run `npm run seed` against a database containing real records. The
database initialization script uses `CREATE TABLE IF NOT EXISTS`, so it can
create missing schema without deleting records. Signup permits student and
driver accounts; admin accounts are not self-registered.

### Functional walkthrough

1. Sign in with an existing admin account and open **Buses**.
2. Create a bus using an existing active route and an unassigned driver, or
   change an existing bus's route/driver. The update is persisted in SQLite.
3. Sign in as that driver, start a trip, and allow browser location permission.
4. Sign in as a passenger/student, select a route stop if needed, and confirm
   the bus location updates on the map while the driver shares GPS.
5. Sign out and confirm each role is redirected to its own dashboard.

The live integration test checks the backend/API/Socket.IO flow against an
isolated test database. Perform the browser walkthrough with your existing
records before recording the lab demonstration.

## Week 2 — Git and GitHub Commands

Run these commands in the same project repository:

```powershell
git status
git log --oneline --decorate -10
git diff
git remote -v
git branch --all
git add DEVOPS_LAB_GUIDE.md Jenkinsfile Dockerfile.backend Dockerfile.frontend docker-compose.yml k8s
git diff --cached
git commit -m "docs: add bus tracker DevOps lab"
git push -u origin HEAD
```

Expected: status/diff show the working tree and staged changes; the commit
records only the selected files; push publishes the current branch to the
configured GitHub remote. Review `git diff --cached` before committing and do
not stage local `.env`, SQLite files, or backups.

## Week 3 — GitHub Source Code Management

Create and publish an experiment branch:

```powershell
git switch -c lab/week-03
git status
git add Jenkinsfile DEVOPS_LAB_GUIDE.md
git commit -m "docs: record week 3 source management"
git push -u origin lab/week-03
```

Open a pull request from `lab/week-03` to the repository's default branch.
After review, merge it through GitHub or locally:

```powershell
git switch main
git pull --ff-only
git merge --no-ff lab/week-03
git push origin main
```

If Git reports a conflict, inspect `git status`, edit only the marked conflict
in the affected file, run the relevant tests, then `git add <file>` and
`git commit`. Do not discard other contributors' changes to resolve a conflict.
Use the repository's actual default branch name if it is not `main`.

## Week 4 — Jenkins Installation and Setup

1. Install Git, Node.js 20+, and Jenkins LTS on the Jenkins controller/agent.
   Jenkins requires a supported Java runtime (Java 17+ for current LTS).
2. Confirm Jenkins can run `git --version`, `node --version`, and
   `npm --version` in its build environment. Install/configure the Jenkins
   Pipeline and Git plugins.
3. In Jenkins, create **New Item → Pipeline**, then select **Pipeline script
   from SCM → Git** and enter this repository's GitHub clone URL and branch.
   Add a Jenkins credential for a private repository; do not put a token in the
   Jenkinsfile or repository.
4. Set the script path to `Jenkinsfile`, save, and choose **Build Now**.
   Configure a GitHub webhook to trigger builds on pushes/PRs if the Jenkins
   server is reachable by GitHub.

The Jenkinsfile checks out this repository, installs both lockfile-based
dependency sets, runs the backend integration test, and builds the React
frontend. There is currently no standalone frontend test script; the Vite
production build is the frontend check.

## Week 5 — Continuous Integration with Jenkins

The pipeline stages are:

1. **Checkout** — Jenkins SCM configuration retrieves this Bus Tracker
   repository.
2. **Install dependencies** — `npm --prefix backend ci` and
   `npm --prefix frontend ci`.
3. **Backend integration tests** — the test starts an isolated backend and
   checks registration, role authorization, admin bus/driver assignment,
   SQLite persistence/backup, and Socket.IO location delivery.
4. **Frontend tests** — reports that no independent frontend test command is
   configured.
5. **Frontend production build** — `npm --prefix frontend run build`.

Expected on success: Jenkins marks the build **SUCCESS** and archives
`frontend/dist/**`. A failing command fails the stage/build; Jenkins prints a
failure message and the failed command output in the console log.

## Week 6 — Explore Docker Commands

First verify Docker Desktop is running:

```powershell
docker version
docker info
```

Build and inspect the actual application images:

```powershell
docker build -f Dockerfile.backend -t college-bus-tracker-backend:local .
docker build -f Dockerfile.frontend -t college-bus-tracker-frontend:local .
docker image ls college-bus-tracker-backend
docker image inspect college-bus-tracker-backend:local
```

Container commands:

```powershell
docker ps -a
docker logs <container-name>
docker inspect <container-name>
docker stop <container-name>
docker rm <container-name>
```

Network commands:

```powershell
docker network ls
docker network create bus-tracker-lab
docker network inspect bus-tracker-lab
docker network rm bus-tracker-lab
```

Volume commands:

```powershell
docker volume ls
docker volume create bus-tracker-lab
docker volume inspect bus-tracker-lab
docker volume rm bus-tracker-lab
```

Expected: `docker image ls` shows the two local tags; `docker ps` lists
containers; inspect commands print their configuration; `docker network ls`
and `docker volume ls` show the named resources. Docker commands require a
running Docker daemon. The application uses a bind mount of its existing
SQLite directory in Compose; do not remove that database or run `docker
compose down -v`.

## Week 7 — Containerize the Existing Application

`Dockerfile.backend` installs the existing backend dependencies;
`Dockerfile.frontend` builds the existing Vite app and serves it with Nginx.
Nginx forwards `/api` and `/socket.io` to the `backend` service, including
WebSocket upgrades. Compose mounts `backend/database` at `/data`, so SQLite
records persist outside the containers. The app image does not include `.env`
files or database files.

In PowerShell, set a private JWT secret for this terminal and start the stack:

```powershell
$env:JWT_SECRET = [guid]::NewGuid().ToString("N")
docker compose up --build -d
docker compose ps
docker compose logs backend
Invoke-RestMethod http://localhost:8080/api/health
```

Expected: both services become healthy; `/api/health` returns JSON with
`"success": true`. Open `http://localhost:8080` and repeat the Week 1
registration/login, admin bus assignment, driver trip, and passenger live-map
walkthrough using the mounted database. Ensure the local backend is stopped
before starting the container so both processes do not write to the same
SQLite file concurrently.

Stop without deleting the database:

```powershell
docker compose down
```

## Week 8 — Kubernetes and Docker Integration

The `k8s/` manifests define a namespace, a SQLite PersistentVolumeClaim, a
single backend replica and ClusterIP service, and a frontend Deployment and
NodePort service. The backend's init container runs the idempotent database
schema initializer against the same PVC. One backend replica is intentional:
SQLite is a single-node database and is not suitable for multiple concurrent
writer replicas.

Build images into the active cluster's image store. For Minikube:

```powershell
minikube start
minikube image build -t college-bus-tracker-backend:local -f Dockerfile.backend .
minikube image build -t college-bus-tracker-frontend:local -f Dockerfile.frontend .
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/storage.yaml
kubectl kustomize k8s
```

For Docker Desktop Kubernetes, enable its cluster and build both images with
the Week 6 `docker build` commands. Create a Kubernetes secret once (use a
unique secret and keep it out of YAML/Git):

```powershell
$env:JWT_SECRET = [guid]::NewGuid().ToString("N")
kubectl create secret generic bus-tracker-secrets -n bus-tracker --from-literal="JWT_SECRET=$env:JWT_SECRET"
```

### Load the existing SQLite records into the Kubernetes volume

Do this before deploying the backend. It creates a consistent SQLite backup,
including any committed WAL data, without changing the source database:

```powershell
kubectl apply -f k8s/database-importer.yaml
kubectl wait --for=condition=Ready pod/bus-tracker-db-import -n bus-tracker --timeout=120s
Set-Location backend
npm run backup-db
Set-Location ..
kubectl cp .\backend\database\bus_tracker.backup.db bus-tracker-db-import:/data/bus_tracker.db -n bus-tracker
kubectl delete -f k8s/database-importer.yaml
```

Keep the backup local; it is ignored by Git. If the PVC already contains the
database, do not import over it. If the cluster is deliberately using a new,
empty PVC, skip the import; the initializer creates the schema but does not
seed accounts or replace application data.

## Week 9 — Deploy and Verify on Kubernetes

Apply the application after the namespace, PVC, secret, and optional database
import are ready:

```powershell
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl rollout status deployment/bus-tracker-backend -n bus-tracker --timeout=180s
kubectl rollout status deployment/bus-tracker-frontend -n bus-tracker --timeout=180s
kubectl get pods,services,pvc -n bus-tracker
kubectl logs deployment/bus-tracker-backend -n bus-tracker
```

Expected: both Deployments report available pods, `backend` is ClusterIP,
`frontend` exposes NodePort `30080`, and the PVC is `Bound`. Open
`http://localhost:30080` for Docker Desktop Kubernetes. For Minikube, use
`minikube service frontend -n bus-tracker --url` and open its printed URL.
`/api/health` should return `"success": true`.

Use the existing admin/student/driver accounts from the imported SQLite
database. Repeat the Week 1 bus assignment and live tracking walkthrough.
Then verify persistence:

```powershell
kubectl delete pod -n bus-tracker -l app=bus-tracker-backend
kubectl rollout status deployment/bus-tracker-backend -n bus-tracker --timeout=180s
kubectl get pods,pvc -n bus-tracker
```

Expected: Kubernetes creates a replacement backend pod, the claim remains
`Bound`, and the same users, buses, assignments, and trip records are still
visible in the app. Do not delete the PVC to restart the application.

## What this checkout can validate

The backend integration test and frontend production build run locally without
Docker or Kubernetes. Docker Desktop's daemon and a running Kubernetes cluster
are required to execute Weeks 6–9; installing/configuring Jenkins requires a
Jenkins server and GitHub access. A successful local build does not by itself
prove those external services have been deployed.
