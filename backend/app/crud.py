from sqlalchemy.orm import Session
from app import models, schemas

def create_employee(db: Session, emp: schemas.EmployeeCreate):
    new_emp = models.Employee(
        name=emp.name,
        role=emp.role,
        address=emp.address,
        tech_stack=emp.tech_stack,
        experience=emp.experience,
        year_of_joining=emp.year_of_joining,
        resignation_date=emp.resignation_date,
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return new_emp

def get_employees(db: Session):
    return db.query(models.Employee).all()

def get_employee_by_id(db: Session, emp_id: int):
    return db.query(models.Employee).filter(models.Employee.id == emp_id).first()

def search_employees(db: Session, name: str):
    return db.query(models.Employee).filter(
        models.Employee.name.ilike(f"%{name}%")
    ).all()

def update_employee_data(db: Session, emp_id: int, data: schemas.EmployeeUpdate):
    emp = get_employee_by_id(db, emp_id)
    if not emp:
        return None

    update_data = data.dict(exclude_unset=True)
    update_data = {k: v for k, v in update_data.items() if v is not None}

    for key, value in update_data.items():
        setattr(emp, key, value)

    db.commit()
    db.refresh(emp)
    return emp

def delete_employee(db: Session, emp_id: int):
    emp = get_employee_by_id(db, emp_id)
    if not emp:
        return None

    db.delete(emp)
    db.commit()
    return emp
