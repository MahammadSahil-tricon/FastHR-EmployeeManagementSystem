from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import employees

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastHR Backend")

# CORS → allow frontend to fetch data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "FastHR Backend Running"}

# Register Routers
app.include_router(employees.router)
