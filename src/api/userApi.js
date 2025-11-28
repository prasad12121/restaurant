import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

// GET all users
export const getAllUsers = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// DELETE user
export const deleteUser = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
