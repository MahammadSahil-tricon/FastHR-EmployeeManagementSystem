from sqlalchemy import Column, Integer, String
from app.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    address = Column(String)
    tech_stack = Column(String)
    experience = Column(Integer)
    year_of_joining = Column(String)
    resignation_date = Column(String, nullable=True)
