import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "123",
    role: "admin",
  },
  {
    name: "Waiter One",
    email: "w1@example.com",
    password: "123",
    role: "waiter",
  },
  {
    name: "Waiter two",
    email: "w2@example.com",
    password: "123",
    role: "waiter",
  },
  {
    name: "Waiter three",
    email: "w3@example.com",
    password: "123",
    role: "waiter",
  },
  {
    name: "Kitchen Staff",
    email: "k@example.com",
    password: "123",
    role: "kitchen",
  },
];

const seedUsers = async () => {
  try {


    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB Connected");

    // Delete existing
    await User.deleteMany();
    console.log("Old users deleted");

    // Create each user using save() → triggers pre('save')
    for (const u of users) {
      const user = new User(u);
      await user.save(); // <--- HASHES PASSWORD
    }

    console.log("Users seeded successfully!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedUsers();
