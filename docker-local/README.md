# docker-local

Runs Faxyna in Docker as a production build: the image installs the workspace from `pnpm-lock.yaml`, runs the tests, exports the static site, and serves it with nginx.

## Run

From this folder:

```bash
docker compose up -d --build
```

Open http://localhost:47310.

Stop it with `docker compose down`.

## Ports

| What | Port |
| --- | --- |
| Docker (this compose) | `47310` |
| Local dev server (`pnpm dev`) | `47311` |

Both are uncommon on purpose to avoid conflicts with other projects. To use another host port for Docker:

```bash
FAXYNA_PORT=12345 docker compose up -d --build
```

## Notes

- Data lives in Firebase (project `faxyna-app`), not in the container, so it survives rebuilds. Sign-in only works on hosts listed in Firebase Auth's authorized domains (`localhost` is); add your LAN host there to open it from other devices.
- The build fails if the core tests fail.
