import Table from "../models/Table.js";

// Get all tables
export const getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.status(200).json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create tables (optional, run once to seed tables)
export const createTables = async (req, res) => {
  try {
    const tablesData = Array.from({ length: 6 }, (_, i) => ({
      tableNumber: i + 1,
    }));

    const tables = await Table.insertMany(tablesData);
    res.status(201).json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update table status
export const updateTableStatus = async (req, res) => {
  try {

    const { tableNumber } = req.params;   // <-- coming from URL
    const { status } = req.body;          // <-- coming from frontend

    // Validate input
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const existing = await Table.findOne({ tableNumber: Number(tableNumber) });
    if (!existing) {
      return res.status(404).json({ message: "Table not found" });
    }

    // Find by tableNumber, NOT _id
    const table = await Table.findOneAndUpdate(
      { tableNumber: Number(tableNumber) }, 
      { status },                            
      { new: true }                        
    );

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    res.json(table);

  } catch (error) {
    console.error("updateTableStatus ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};