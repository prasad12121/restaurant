import express from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  updateOrderItem,
  getOrderByTable,
  finalizeOrder,
  addItemsToOrder,
} from "../controllers/orderController.js";

export default () => {
  const router = express.Router();

  router.post("/", createOrder);
  router.get("/", getOrders);
  router.get("/table/:tableNumber", getOrderByTable);

  //router.put("/:orderId/status", updateOrderStatus(io));

    // 👇 THEN DYNAMIC ROUTES
  router.put("/:orderId/item/:itemId", updateOrderItem);
  router.put("/:orderId/status", (req, res) => updateOrderStatus(req, res));
// FINALIZE ORDER (IMPORTANT)
router.put("/finalize/:orderId", finalizeOrder);

router.put("/add-items/:orderId", addItemsToOrder);

 

  return router;
};
