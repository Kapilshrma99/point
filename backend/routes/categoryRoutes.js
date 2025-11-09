import express from "express";
import Category from "../models/Category.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// 🟢 Get all categories (public)
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🟡 Create category (admin only)
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, slug, description, icon } = req.body;
    const existing = await Category.findOne({ slug });
    if (existing) return res.status(400).json({ message: "Slug already exists" });

    const category = await Category.create({ name, slug, description, icon });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔵 Update category (admin only)
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔴 Delete category (admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
