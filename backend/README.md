# ConvertSheet Backend Service (dockerbox)

FastAPI-powered Python microservice for heavy workloads, PDF table extraction, and massive XML parsing (>10MB).

## Architecture

```
                    ┌─────────────────────────┐
                    │  User Browser / Mobile  │
                    └────────────┬────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           │                                           │
  [Files < 5MB (80% of traffic)]             [Files > 5MB & API Calls]
           │                                           │
           ▼                                           ▼
┌───────────────────────────┐             ┌─────────────────────────┐
│ Client-Side WebAssembly   │             │ Backend FastAPI Engine  │
│ (Fast, 100% Private,      │             │ (Hosted on dockerbox    │
│  Zero Server Cost)        │             │  via Cloudflare Tunnel) │
└───────────────────────────┘             └─────────────────────────┘
```

## Quickstart (Local Development)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run development server
uvicorn app.main:app --reload --port 8000
```

API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

## Docker Deployment (on `dockerbox`)

```bash
# Build the Docker image
docker build -t convertsheet-backend:latest .

# Run the container
docker run -d \
  --name convertsheet-api \
  --restart unless-stopped \
  -p 8000:8000 \
  convertsheet-backend:latest
```

## Cloudflare Tunnel Setup (`cloudflared`)

To securely expose the service without opening any firewall ports:

```bash
# Authenticate cloudflared
cloudflared tunnel login

# Create a tunnel for convertsheet
cloudflared tunnel create convertsheet-api

# Configure tunnel in ~/.cloudflared/config.yml:
# tunnel: <Tunnel-UUID>
# credentials-file: /root/.cloudflared/<Tunnel-UUID>.json
# ingress:
#   - hostname: api.convertsheet.com
#     service: http://localhost:8000
#   - service: http_status:404

# Route DNS to tunnel
cloudflared tunnel route dns convertsheet-api api.convertsheet.com

# Run tunnel
cloudflared tunnel run convertsheet-api
```
