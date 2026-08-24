from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from .database import Base

class GasReading(Base):
    __tablename__ = "gas_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    sensor_id = Column(Integer, index=True)
    device_name = Column(String)
    gas_type = Column(String)
    value = Column(Float, nullable=True) # Can be None if offline
    unit = Column(String)
    status = Column(String)
