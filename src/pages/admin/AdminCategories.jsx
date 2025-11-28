import { useState, useEffect } from "react";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "@/api/categoryApi";
import DashboardLayout from "../../components/layouts/DashboardLayout";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  const load = async () => {
    setCategories(await getCategories());
  };

  useEffect(() => {
    load();
  }, []);

  const addCategory = async (e) => {
    e.preventDefault();
    await createCategory({ name });
    setName("");
    load();
  };

  return (
    <DashboardLayout>
    <div>

      <h1 className="text-2xl font-bold">Categories</h1>

      <form onSubmit={addCategory} className="mt-4 flex gap-3">
        <input
          type="text"
          placeholder="Category Name"
          className="border p-2 rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Add
        </button>
      </form>

      <ul className="mt-6">
        {categories.map((cat) => (
          <li
            key={cat._id}
            className="flex justify-between border p-3 rounded mb-2"
          >
            <span>{cat.name}</span>
            <button
              onClick={() => deleteCategory(cat._id).then(load)}
              className="px-3 py-1 bg-red-500 text-white rounded-lg"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
    </DashboardLayout>
  );
}
