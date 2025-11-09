import express from "express";
import Article from "../models/Article.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get all published articles
router.get("/", async (req, res) => {
  const articles = await Article.find({ status: "published" }).populate("author category");
  res.json(articles);
});

// Create article (only author or admin)
router.post("/", protect, async (req, res) => {
  const { title, slug, content, category } = req.body;
  const article = await Article.create({ title, slug, content, category, author: req.user._id });
  res.status(201).json(article);
});

// Update article
router.put("/:id", protect, async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ message: "Not found" });

  if (article.author.toString() !== req.user._id.toString() && !req.user.roles.includes("admin")) {
    return res.status(403).json({ message: "Forbidden" });
  }

  Object.assign(article, req.body);
  await article.save();
  res.json(article);
});

// Delete article (admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});

export default router;
