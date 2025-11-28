import Order from "../models/Order.js";
import Table from "../models/Table.js";
import { io } from "../server.js"; // this is enough

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { tableNumber, items, waiter } = req.body;
    const statuses = ["Pending", "Preparing", "Ready", "Served"];

    let order = await Order.findOne({ tableNumber, status: { $in: statuses } });
   // console.log("order is ",order);
    if (order) {
      // Append new items to existing order
      console.log("hi");
      order.items.push(...items);

      // Recalculate totals
      order.subtotal = order.items.reduce((sum, i) => sum + i.total, 0);
      order.gst = order.subtotal * 0.05;
      order.grandTotal = order.subtotal + order.gst;

      // Optionally update waiter
      if (waiter) order.waiter = waiter;

      await order.save();

      io.emit("updateOrder", order);

      return res.json({ message: "Order updated with new items", order });
    } else {
      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const gst = subtotal * 0.05;
      const grandTotal = subtotal + gst;

      const order = await Order.create({
        tableNumber,
        items,
        subtotal,
        gst,
        grandTotal,
        waiter,
        status: "Pending",
      });

      // Send new KOT order to kitchen
      io.emit("newOrder", order);

      res.status(201).json(order);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (kitchen/admin)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    // Auto unlock table when finished
    if (status === "Finished") {
      const table = await Table.findOneAndUpdate(
        { tableNumber: order.tableNumber },
        { status: "available" },
        { new: true }
      );

      io.emit("tableUpdated", table);
    }

    io.emit("updateOrder", order);

    res.json({ message: "Status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update one item in an order
export const updateOrderItem = async (req, res) => {
  const { orderId, itemId } = req.params;
  const { qty, price, total } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (qty !== undefined) item.qty = qty;
    if (price !== undefined) item.price = price;
    if (total !== undefined) item.total = total;

    // Recalculate totals
    order.subtotal = order.items.reduce((sum, item) => sum + item.total, 0);
    order.gst = order.subtotal * 0.05;
    order.grandTotal = order.subtotal + order.gst;

    await order.save();

    io.emit("updateOrder", order);

    res.json({ message: "Item updated", order });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get active order for table
export const getOrderByTable = async (req, res) => {

  const statuses = ["Pending", "Preparing", "Ready", "Served"];

   // let order = await Order.findOne({ tableNumber, status: { $in: statuses } });
  try {
    const { tableNumber } = req.params;
    const order = await Order.findOne({
      tableNumber: Number(tableNumber),
      status: { $in: statuses },
    });

    res.json(order || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Finalize order (bill print)
export const finalizeOrder = async (req, res) => {
  const { orderId } = req.params;

  console.log("orderid is",orderId);

  try {

    const order = await Order.findById(orderId);
    console.log("finalize order is test",order); //getting order detail full
    if (!order) return res.status(404).json({ message: "Order not found" });

   // order.subtotal = order.items.reduce((sum, item) => sum + item.total, 0);
   // order.gst = order.subtotal * 0.05;
    //order.grandTotal = order.subtotal + order.gst;
   // order.status = "Completed";
    order.set('status',"Completed")
    await order.save();//i think here is not updated
     

    // unlock table
    await Table.findOneAndUpdate(
      { tableNumber: order.tableNumber },
      { status: "available" }
    );

    io.emit("orderFinalized", order);

    res.json({ message: "Order finalized", order });
  } catch (err) {
    console.log("finalize error issss:",err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ADD NEW ITEMS TO EXISTING ORDER
export const addItemsToOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { items, waiter } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items to add" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Add new items to the KOT list (not touching previous items)
    order.items.push(...items);

    // Update waiter (optional)
    if (waiter) order.waiter = waiter;

    await order.save();

    return res.json({
      message: "Items added successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
