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

- Data lives in the browser's `localStorage` (the current gateway implementation), so it is not stored in the container and survives rebuilds.
- The build fails if the core tests fail.
