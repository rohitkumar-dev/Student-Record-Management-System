from fastapi import APIRouter, Depends, HTTPException
from ..models import StudentCreate
from ..db import students_collection
from ..auth_utils import get_current_user, require_admin
from bson.objectid import ObjectId

router = APIRouter(prefix="/students", tags=["students"])

@router.post("/", dependencies=[Depends(require_admin)])
async def create_student(payload: StudentCreate, user=Depends(get_current_user)):
    doc = payload.dict()
    res = await students_collection.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return {"msg": "Student created", "student": doc}

@router.get("/")
async def list_students(q: str = None, user=Depends(get_current_user)):
    # q filter by name or roll_number
    query = {}
    if q:
        query = {"$or": [{"name": {"$regex": q, "$options": "i"}}, {"roll_number": {"$regex": q, "$options": "i"}}]}
    cursor = students_collection.find(query)
    items = []
    async for s in cursor:
        s["id"] = str(s["_id"])
        items.append({
            "id": s["id"],
            "name": s.get("name"),
            "roll_number": s.get("roll_number"),
            "class_name": s.get("class_name"),
            "grade": s.get("grade"),
        })
    return items

@router.get("/{student_id}")
async def get_student(student_id: str, user=Depends(get_current_user)):
    s = await students_collection.find_one({"_id": ObjectId(student_id)})
    if not s:
        raise HTTPException(status_code=404, detail="Student not found")
    s["id"] = str(s["_id"])
    return s

@router.put("/{student_id}", dependencies=[Depends(require_admin)])
async def update_student(student_id: str, payload: StudentCreate, user=Depends(get_current_user)):
    updated = await students_collection.update_one({"_id": ObjectId(student_id)}, {"$set": payload.dict()})
    if updated.matched_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"msg": "Student updated"}

@router.delete("/{student_id}", dependencies=[Depends(require_admin)])
async def delete_student(student_id: str, user=Depends(get_current_user)):
    res = await students_collection.delete_one({"_id": ObjectId(student_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"msg": "Student deleted"}
