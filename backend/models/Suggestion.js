import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema({
  article: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  suggestion_text: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Suggestion", suggestionSchema);
