from pydantic import BaseModel
from typing import Optional

class EmployeeBase(BaseModel):
    name: str
    role: str
    address: Optional[str] = None
    tech_stack: Optional[str] = None
    experience: Optional[int] = 0
    year_of_joining: Optional[str] = None
    resignation_date: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    address: Optional[str] = None
    tech_stack: Optional[str] = None
    experience: Optional[int] = None
    year_of_joining: Optional[str] = None
    resignation_date: Optional[str] = None

    class Config:
        from_attributes = True


class Employee(EmployeeBase):
    id: int
    class Config:
        from_attributes = True

