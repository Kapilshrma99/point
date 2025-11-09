import express from "express";
import Suggestion from "../models/Suggestion.js";
import Article from "../models/Article.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// 🟢 View suggestions (accessible to admins, article authors, and suggestion owners)
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Admins can view all
    if (req.user.roles.includes("admin")) {
      const allSuggestions = await Suggestion.find().populate("article user");
      return res.json(allSuggestions);
    }

    // Otherwise, filter based on ownership or authorship
    const articlesAuthored = await Article.find({ author: userId }).select("_id");
    const authoredIds = articlesAuthored.map(a => a._id);

    const suggestions = await Suggestion.find({
      $or: [{ user: userId }, { article: { $in: authoredIds } }],
    }).populate("article user");

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🟡 Create suggestion (logged-in users)
router.post("/", protect, async (req, res) => {
  try {
    const { articleId, suggestion_text } = req.body;

    const articleExists = await Article.findById(articleId);
    if (!articleExists) return res.status(404).json({ message: "Article not found" });

    const suggestion = await Suggestion.create({
      article: articleId,
      user: req.user._id,
      suggestion_text,
    });

    res.status(201).json(suggestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔵 Update suggestion (author of suggestion or admin)
router.put("/:id", protect, async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) return res.status(404).json({ message: "Suggestion not found" });

    // Allow if suggestion belongs to user or user is admin
    if (
      suggestion.user.toString() !== req.user._id.toString() &&
      !req.user.roles.includes("admin")
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    suggestion.suggestion_text = req.body.suggestion_text || suggestion.suggestion_text;
    suggestion.status = req.body.status || suggestion.status;
    await suggestion.save();

    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔴 Delete suggestion (admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const suggestion = await Suggestion.findByIdAndDelete(req.params.id);
    if (!suggestion) return res.status(404).json({ message: "Suggestion not found" });
    res.json({ message: "Suggestion deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
