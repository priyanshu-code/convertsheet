"""FastAPI Application entrypoint for ConvertSheet backend service."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import convert_router

app = FastAPI(
    title="ConvertSheet Backend API",
    description="High-throughput conversion microservice for heavy PDF table extraction and massive XML files.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://convertsheet.com",
        "https://www.convertsheet.com",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount conversion endpoints
app.include_router(convert_router, prefix="/api/v1")


@app.get("/", tags=["status"])
async def root():
    return {
        "service": "ConvertSheet Heavy Conversion Engine",
        "status": "healthy",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["status"])
async def health():
    return {"status": "ok"}
