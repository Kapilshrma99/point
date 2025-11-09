import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ✅ Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, username, full_name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      email,
      password,
      username,
      full_name,
      roles: ["user"], // default role
    });

    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      email: user.email,
      username: user.username,
      roles: user.roles,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    res.json({
      _id: user._id,
      email: user.email,
      username: user.username,
      roles: user.roles,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Assign a role to user (admin only)
router.put("/assign-role/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "moderator", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.roles.includes(role)) user.roles.push(role);
    await user.save();

    res.json({ message: `Role '${role}' assigned successfully`, roles: user.roles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
