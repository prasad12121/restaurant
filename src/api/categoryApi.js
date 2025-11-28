import axios from "axios";

//const API_URL = import.meta.env.VITE_API_BASE_URL + "/categories";
const API_URL = "http://localhost:5000/api/categories";
// ⭐ Get all categories
export const getCategories = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// ⭐ Create new category
export const createCategory = async (category) => {
  const res = await axios.post(API_URL, category);
  return res.data;
};

// ⭐ Update category
export const updateCategory = async (id, updatedData) => {
  const res = await axios.put(`${API_URL}/${id}`, updatedData);
  return res.data;
};

// ⭐ Delete category
export const deleteCategory = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
