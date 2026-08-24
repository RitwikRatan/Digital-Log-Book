from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GasReadingCreate(BaseModel):
    sensor_id: int
    device_name: str
    gas_type: str
    value: Optional[float] = None
    unit: str
    status: str

class GasReadingResponse(GasReadingCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
