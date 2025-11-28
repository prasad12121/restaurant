import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["available", "occupied"],
    default: "available"
  }
});

export default mongoose.model("Table", tableSchema);
