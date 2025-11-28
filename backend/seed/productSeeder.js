import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

const products = [
  // ----------------- STARTERS -----------------
  {
    name: "Paneer Tikka",
    price: 180,
    category: "Starters",
    image: "/images/paneer-tikka.jpg",
  },
  {
    name: "Chicken Tandoori",
    price: 280,
    category: "Starters",
    image: "/images/chicken-tandoori.jpg",
  },
  {
    name: "Veg Manchurian Dry",
    price: 150,
    category: "Starters",
    image: "/images/veg-manchurian.jpg",
  },

  // ----------------- MAIN COURSE -----------------
  {
    name: "Paneer Butter Masala",
    price: 220,
    category: "Main Course",
    image: "/images/pbm.jpg",
  },
  {
    name: "Chicken Curry",
    price: 260,
    category: "Main Course",
    image: "/images/chicken-curry.jpg",
  },
  {
    name: "Dal Tadka",
    price: 140,
    category: "Main Course",
    image: "/images/dal-tadka.jpg",
  },

  // ----------------- INDIAN BREAD -----------------
  {
    name: "Butter Roti",
    price: 15,
    category: "Roti",
    image: "/images/butter-roti.jpg",
  },
  {
    name: "Butter Naan",
    price: 30,
    category: "Roti",
    image: "/images/butter-naan.jpg",
  },
  {
    name: "Garlic Naan",
    price: 40,
    category: "Roti",
    image: "/images/garlic-naan.jpg",
  },

  // ----------------- RICE / BIRYANI -----------------
  {
    name: "Veg Fried Rice",
    price: 160,
    category: "Rice",
    image: "/images/veg-fried-rice.jpg",
  },
  {
    name: "Chicken Biryani",
    price: 240,
    category: "Rice",
    image: "/images/chicken-biryani.jpg",
  },
  {
    name: "Veg Biryani",
    price: 180,
    category: "Rice",
    image: "/images/veg-biryani.jpg",
  },

  // ----------------- CHINESE -----------------
  {
    name: "Veg Hakka Noodles",
    price: 150,
    category: "Chinese",
    image: "/images/hakka-noodles.jpg",
  },
  {
    name: "Chicken Schezwan Noodles",
    price: 200,
    category: "Chinese",
    image: "/images/schezwan-noodles.jpg",
  },
  {
    name: "Chicken Lollipop",
    price: 220,
    category: "Chinese",
    image: "/images/lollipop.jpg",
  },

  // ----------------- BEVERAGES -----------------
  {
    name: "Cold Drink (300ml)",
    price: 40,
    category: "Beverages",
    image: "/images/cold-drink.jpg",
  },
  {
    name: "Masala Lemon Soda",
    price: 60,
    category: "Beverages",
    image: "/images/lemon-soda.jpg",
  },
  {
    name: "Mineral Water",
    price: 20,
    category: "Beverages",
    image: "/images/water.jpg",
  },

  // ----------------- DESSERTS -----------------
  {
    name: "Gulab Jamun (2 pcs)",
    price: 50,
    category: "Dessert",
    image: "/images/gulab-jamun.jpg",
  },
  {
    name: "Ice Cream (Cup)",
    price: 30,
    category: "Dessert",
    image: "/images/ice-cream.jpg",
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected");

    await Product.deleteMany();
    console.log("Old products removed");

    await Product.insertMany(products);
    console.log("Products seeded successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProducts();
