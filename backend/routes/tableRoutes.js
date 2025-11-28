import express from "express";
import Table from "../models/Table.js";
import { io } from "../server.js";
import { updateTableStatus } from "../controllers/tableController.js";

const router = express.Router();

// Get all tables
router.get("/", async (req, res) => {
  const tables = await Table.find().sort("tableNumber");
  res.json(tables);
});

// Lock a table (when waiter takes order)
router.put("/lock/:id", async (req, res) => {
  const table = await Table.findByIdAndUpdate(
    req.params.id,
    { status: "occupied" },
    { new: true }
  );

  io.emit("tableUpdated", table); // Real-time update
  res.json(table);
});

// Unlock a table (when order completed)
router.put("/unlock/:id", async (req, res) => {
  const table = await Table.findByIdAndUpdate(
    req.params.id,
    { status: "available" },
    { new: true }
  );

  io.emit("tableUpdated", table);
  res.json(table);
});

router.put("/:tableNumber/status",updateTableStatus);

export default router;
