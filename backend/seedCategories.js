import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/Category.js";

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const categories = [
  { name: "Web Development", slug: "web-development", description: "Learn HTML, CSS, JS", icon: "💻" },
  { name: "Programming", slug: "programming", description: "Master coding languages", icon: "⚡" },
  { name: "Database", slug: "database", description: "Explore SQL, NoSQL", icon: "🗄️" },
  { name: "DevOps", slug: "devops", description: "CI/CD, Docker, Cloud", icon: "🚀" },
  { name: "Mobile Development", slug: "mobile-development", description: "Android & iOS dev", icon: "📱" },
  { name: "Data Science", slug: "data-science", description: "AI, ML, and data analysis", icon: "📊" },
];

const seed = async () => {
  try {
    await Category.deleteMany();
    await Category.insertMany(categories);
    console.log("✅ Categories inserted");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
