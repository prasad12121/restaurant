import axios from "axios";
const API_URL = "http://localhost:5000/api/orders";

export const createOrder = async (orderData) => {
  try {
    const res = await axios.post(API_URL, orderData);
    return res.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};

export const getOrders = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await axios.put(`${API_URL}/${orderId}/status`, { status });

  return res.data;
};




// Update single item inside an existing order
export const updateOrderItem = async (orderId, itemId, updatedData) => {
  const res = await fetch(`${API_URL}/${orderId}/item/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });

  return await res.json();
};




export const getOrderByTable = async (tableId) => {
  try {
    const res = await axios.get(`${API_URL}/table/${tableId}`);
    return res.data;
  } catch (err) {
    console.log("getOrderByTable error:", err);
    return null;
  }
};

//Finalize order — mark as completed and generate total
export const finalizeOrder = async (orderId) => {
  try {
    const res = await axios.put(`${API_URL}/finalize/${orderId}`);
    
    return res.data;
  } catch (err) {
    console.error("finalizeOrder error:", err);
    throw err;
  }
};

// ⭐ ADD NEW ITEMS TO EXISTING ORDER
export const addItemsToOrder = async (orderId, items, waiter) => {
  try {
    const res = await axios.put(`${API_URL}/add-items/${orderId}`, {
      items,
      waiter,
    });

    return res.data.order;
  } catch (err) {
    console.error("addItemsToOrder error:", err);
    throw err;
  }
};
