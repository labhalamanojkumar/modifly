# Deploying this Next.js app to Coolify (VPS)

This repository is a Next.js (App Router) project. The included Dockerfile builds the app and produces a production image that runs `next start` on port 3000. Below are step-by-step instructions and tips for deploying to Coolify or a similar VPS hosting platform.

## What I added
- `Dockerfile` — multi-stage build that installs native deps (used by `sharp` and other image libraries), runs `npm run build`, and generates a slim production image.
- `.dockerignore` — avoids copying dev artifacts into the image.

## Recommended environment variables
Set these in Coolify's application settings (Environment variables):

- `NODE_ENV=production`
- `PORT=3000` (Coolify will map external port to container port)
- `NEXT_TELEMETRY_DISABLED=1`
- `ADMIN_USER` and `ADMIN_PASS` — values for the built-in fallback admin login (e.g. `Superadmin` / `Adminuser@123`) if you don't use a database.
- `DATABASE_URL` — optional, if you want the app to use a real DB instead of `data/admin.json`.

If your app uses external services (SMTP, S3, analytics, etc.), add those secrets here as well.

## Docker / Coolify setup

1. In Coolify, create a new application and choose **Dockerfile** (or point Coolify to this repository)
2. Set the build context to the repository root where the `Dockerfile` is located.
3. Set the container port to `3000`.
4. Add the environment variables listed above under the application's Environment section.
5. Add a persistent volume for the `data` directory so admin settings and any uploads persist across deploys. In Coolify, mount a volume so that `/app/data` inside the container maps to the persistent storage.

## Running locally with Docker (test before deploying)

Build and run the image locally to validate:

```powershell
# build image
docker build -t modifly:prod .

# run container, mapping host port 3000
docker run --rm -p 3000:3000 -e ADMIN_USER=Superadmin -e ADMIN_PASS=Adminuser@123 -v ${PWD}/data:/app/data modifly:prod
```

Then open http://localhost:3000 and check `/admin` to login.

### Standalone (smaller runtime) workflow

If you'd like a smaller runtime image, the project is now configured to use Next's `standalone` output.

- The repository contains `Dockerfile.standalone` which copies the `.next/standalone` folder produced by `next build` into a slim runtime image and uses `node server.js` to start.
- This approach produces a smaller container and avoids copying the full `node_modules` into the runtime image.

Build and run the standalone image locally:

```powershell
docker build -f Dockerfile.standalone -t modifly:standalone .
docker run --rm -p 3000:3000 -e ADMIN_USER=Superadmin -e ADMIN_PASS=Adminuser@123 -v ${PWD}/data:/app/data modifly:standalone
```

Or use the included `docker-compose.prod.yml` for a one-command run:

```powershell
docker-compose -f docker-compose.prod.yml up --build
```

## Volume considerations
- Persist `data/` to keep `data/admin.json` (fallback settings and users) across deploys.
- If you later add file uploads or temporary outputs, mount folders for those as well.

## Troubleshooting notes
- If you see errors related to `sharp` or libvips at runtime, ensure the final image contains the correct libvips runtime. The Dockerfile installs common libvips packages for Debian; you can adapt package names for different base images.
- If Next complains about missing environment variables during build, add them in the build environment settings in Coolify.
- If binding to `localhost` fails in your environment, ensure Coolify's healthchecks and container port align with `PORT`.

## Next steps / optional improvements
- Use `next start -p $PORT` with a PM2 or a process manager if you want graceful restarts and monitoring.
- Consider using Next's `standalone` output for smaller runtime images (see Next.js docs); that requires `next.config.js` to set `output: 'standalone'` and a slightly different Dockerfile (copying the `standalone` folder only).
- Add automatic migration scripts or DB provisioning if you connect to an external database.

If you'd like, I can:
- Convert the Dockerfile to use Next's `standalone` output for a smaller runtime image
- Add a `docker-compose.yml` for local development with mounted volumes and environment configuration
- Wire an example `coolify.yml` if you use Coolify's CLI automation

Tell me which of the optional improvements you'd like and I'll implement them.
