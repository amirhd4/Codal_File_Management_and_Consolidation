from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api import funds, workflow

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(funds.router, prefix=settings.API_V1_STR)
app.include_router(workflow.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Codal Fund Aggregator API is running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "ok"}