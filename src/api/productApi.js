import axios from "axios";

const API_URL = "http://localhost:5000/api/products";

// CREATE product
export const createProduct = async (productData) => {
  try {
    const res = await axios.post(API_URL, productData);
    return res.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};

// GET all products
export const getAllProducts = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};

// UPDATE product
export const updateProduct = async (id, productData) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, productData);
    return res.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};

// DELETE product
export const deleteProduct = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};
