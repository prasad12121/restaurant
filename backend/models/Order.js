import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

  tableNumber: { type: Number, required: true },
  items: [
    {
      name: String,
      price: Number,
      qty: Number,
      total: Number,
    },
  ],
  subtotal: Number,
  gst: Number,
  grandTotal: Number,
  status: {
    type: String,
    enum: ["Pending", "Preparing", "Ready", "Served","Completed"],
    default: "Pending",
  },
  waiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
