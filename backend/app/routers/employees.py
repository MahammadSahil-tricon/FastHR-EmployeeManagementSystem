from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, crud

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.post("/", response_model=schemas.Employee)
def add_employee(emp: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    return crud.create_employee(db, emp)

@router.get("/", response_model=list[schemas.Employee])
def list_employees(db: Session = Depends(get_db)):
    return crud.get_employees(db)

@router.get("/search", response_model=list[schemas.Employee])
def search_employee(name: str, db: Session = Depends(get_db)):
    matches = crud.search_employees(db, name)
    if not matches:
        raise HTTPException(status_code=404, detail="No employee found")
    return matches

@router.patch("/{emp_id}", response_model=schemas.Employee)
def update_employee(emp_id: int, data: schemas.EmployeeUpdate, db: Session = Depends(get_db)):
    updated = crud.update_employee_data(db, emp_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Employee not found")
    return updated

@router.delete("/{emp_id}")
def delete_employee(emp_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_employee(db, emp_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted successfully"}
