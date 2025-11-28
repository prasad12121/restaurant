import dotenv from "dotenv";
dotenv.config(); // <-- REQUIRED for seed scripts

import mongoose from "mongoose";
import Table from "../models/Table.js";

const seedTables = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    await Table.deleteMany({});
    
    const tables = [
      { tableNumber: 1, status: "available" },
      { tableNumber: 2, status: "available" },
      { tableNumber: 3, status: "available" },
      { tableNumber: 4, status: "available" },
      { tableNumber: 5, status: "available" },
      { tableNumber: 6, status: "available" },
    ];

    await Table.insertMany(tables);

    console.log("Tables seeded successfully");
    process.exit();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

seedTables();
