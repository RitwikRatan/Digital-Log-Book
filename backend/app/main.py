from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Union, Dict, Any
from . import models, schemas
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gas Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    print(f"\n--- 422 VALIDATION ERROR ---")
    print(f"Request body: {body}")
    print(f"Validation errors: {exc.errors()}")
    print(f"----------------------------\n")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": body.decode("utf-8") if body else ""},
    )

@app.post("/readings/")
def create_reading(payload: Union[schemas.GasReadingCreate, Dict[str, List[schemas.GasReadingCreate]]], db: Session = Depends(get_db)):
    if isinstance(payload, dict) and "readings" in payload:
        created_readings = []
        for r in payload["readings"]:
            db_reading = models.GasReading(
                sensor_id=r.sensor_id,
                device_name=r.device_name,
                gas_type=r.gas_type,
                value=r.value,
                unit=r.unit,
                status=r.status
            )
            if r.timestamp:
                db_reading.timestamp = r.timestamp
            db.add(db_reading)
            created_readings.append(db_reading)
        db.commit()
        for r in created_readings:
            db.refresh(r)
        return {"status": "success", "count": len(created_readings)}
    else:
        reading = payload
        db_reading = models.GasReading(
            sensor_id=reading.sensor_id,
            device_name=reading.device_name,
            gas_type=reading.gas_type,
            value=reading.value,
            unit=reading.unit,
            status=reading.status
        )
        if reading.timestamp:
            db_reading.timestamp = reading.timestamp
        db.add(db_reading)
        db.commit()
        db.refresh(db_reading)
        return db_reading

@app.get("/readings/", response_model=List[schemas.GasReadingResponse])
def get_readings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    readings = db.query(models.GasReading).order_by(models.GasReading.timestamp.desc()).offset(skip).limit(limit).all()
    return readings

@app.get("/")
def read_root():
    return {"message": "Welcome to Gas Analyzer API. Visit /docs for API documentation."}
