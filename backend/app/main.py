import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.connection import engine, Base, SessionLocal
from .database.models import Airport
from .api.routes import router
from .seed.seed_data import seed_database

app = FastAPI(
    title="MoSPI Real-Time Airfare Price Index API",
    description="Statistical Intelligence & Price Index Augmentation Platform for the Ministry of Statistics and Programme Implementation (SIH 2026)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def startup_event():
    # Ensure all tables exist including User and UserActivity
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        from .database.models import User
        user_count = db.query(User).count()
        if user_count == 0:
            print("Seeding initial MoSPI official users roster...")
            from .seed.seed_data import seed_database
            seed_database()
        else:
            print(f"Database online with {user_count} registered MoSPI officers.")
    except Exception as e:
        print(f"Startup check note: {e}")
        try:
            from .seed.seed_data import seed_database
            seed_database()
        except Exception as se:
            print(f"Auto-seed error: {se}")
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "system": "MoSPI Real-Time Airfare Price Index for India",
        "organization": "Ministry of Statistics and Programme Implementation (MoSPI)",
        "status": "ONLINE",
        "documentation": "/docs",
        "api_prefix": "/api"
    }


@app.get("/health")
def health():
    return {"status": "HEALTHY", "version": "1.0.0"}
