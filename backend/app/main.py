from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gas Analyzer API")

@app.post("/readings/", response_model=schemas.GasReadingResponse)
def create_reading(reading: schemas.GasReadingCreate, db: Session = Depends(get_db)):
    db_reading = models.GasReading(
        sensor_id=reading.sensor_id,
        device_name=reading.device_name,
        gas_type=reading.gas_type,
        value=reading.value,
        unit=reading.unit,
        status=reading.status
    )
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
