# Build specific apps
pnpm build:api
pnpm build:web
```
### Manual Docker Build

```bash
# Build API image
docker build -f docker/Dockerfile.api -t pricing-tool-api:latest .

# Build Web image
docker build -f docker/Dockerfile.web -t pricing-tool-web:latest .

# Save images as tar files
docker save pricing-tool-api:latest -o pricing-tool-api.tar
docker save pricing-tool-web:latest -o pricing-tool-web.tar
```

