import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

export function Dashboard() {
  const { role } = useContext(AuthContext);

  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    roll_number: "",
    class_name: "",
    grade: "",
  });

  const fetchStudents = async () => {
    try {
      const res = await axios.get("/api/students", {
        withCredentials: true,
      });
      setStudents(res.data);
      setFiltered(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const onSearch = () => {
    const f = students.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll_number.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
    setPage(1);
  };

  const start = (page - 1) * limit;
  const end = start + limit;
  const current = filtered.slice(start, end);

  const hasNext = end < filtered.length;
  const hasPrev = page > 1;

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", roll_number: "", class_name: "", grade: "" });
    setOpenModal(true);
  };

  const openEdit = (s) => {
    setEditId(s.id);
    setForm({
      name: s.name,
      roll_number: s.roll_number,
      class_name: s.class_name,
      grade: s.grade,
    });
    setOpenModal(true);
  };

  const saveStudent = async () => {
    try {
      if (editId) {
        await axios.put(`/api/students/${editId}`, form, {
          withCredentials: true,
        });
      } else {
        await axios.post(`/api/students`, form, {
          withCredentials: true,
        });
      }

      setOpenModal(false);
      fetchStudents();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteStudent = async (id) => {
    try {
      await axios.delete(`/api/students/${id}`, {
        withCredentials: true,
      });
      fetchStudents();
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-xl">
        Loading students...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col justify-between items-center">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <Label>Search</Label>
          <Input
            className="w-64"
            placeholder="Search by name or roll number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={onSearch}>Search</Button>
        </div>

        {role === "admin" && (
          <Button onClick={openAdd} className="bg-blue-600 mt-4">
            Add Student
          </Button>
        )}
      </div>

      <Table>
        <TableCaption>Student Records</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Roll No.</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Grade</TableHead>
            {role === "admin" && <TableHead>Edit</TableHead>}
            {role === "admin" && <TableHead>Delete</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {current.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.roll_number}</TableCell>
              <TableCell>{s.class_name}</TableCell>
              <TableCell>{s.grade}</TableCell>

              {role === "admin" && (
                <TableCell>
                  <Button variant="secondary" onClick={() => openEdit(s)}>
                    Edit
                  </Button>
                </TableCell>
              )}

              {role === "admin" && (
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => deleteStudent(s.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between pt-4">
        <Button disabled={!hasPrev} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <div>Page {page}</div>
        <Button disabled={!hasNext} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Student" : "Add Student"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Input
              placeholder="Roll Number"
              value={form.roll_number}
              onChange={(e) =>
                setForm({ ...form, roll_number: e.target.value })
              }
            />

            <Input
              placeholder="Class"
              value={form.class_name}
              onChange={(e) => setForm({ ...form, class_name: e.target.value })}
            />

            <Input
              placeholder="Grade"
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
            />

            <Button onClick={saveStudent}>{editId ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
