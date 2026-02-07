const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const { randomCode } = require("../utils/generateCode");

const router = express.Router();

// user registration
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, nationalId, phone, referrerCode, password } =
      req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !nationalId ||
      !phone ||
      !referrerCode ||
      !password
    ) {
      return res.status(400).json({ error: "تمام فیلدها الزامی هستند" });
    }

    // Validate referrer code format
    if (!/^[a-zA-Z0-9]{6}$/.test(referrerCode)) {
      return res
        .status(400)
        .json({ error: "کد معرف باید 6 کاراکتر انگلیسی و عدد باشد" });
    }

    // Check if referrer code exists
    const referrer = await User.findOne({
      myCode: referrerCode,
      status: "approved",
    });
    if (!referrer) {
      return res.status(400).json({ error: "کد معرف معتبر نیست" });
    }

    // Check if national ID already exists
    const existingUser = await User.findOne({ nationalId });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "کاربری با این کد ملی قبلاً ثبت نام کرده است" });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res
        .status(400)
        .json({ error: "کاربری با این شماره تلفن قبلاً ثبت نام کرده است" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      nationalId,
      phone,
      referrerCode,
      myCode: randomCode(),
      passwordHash,
      status: "pending",
    });
    res.json({ message: "Registered. Await approval.", id: user._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// user login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // nationalId or myCode
    const user = await User.findOne({
      $or: [{ nationalId: identifier }, { myCode: identifier }],
    });
    if (!user || user.status !== "approved")
      return res.status(401).json({ error: "Unauthorized" });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Unauthorized" });
    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET || "secret"
    );
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        myCode: user.myCode,
        phone: user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// admin login
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: "Unauthorized" });
    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) return res.status(401).json({ error: "Unauthorized" });
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET || "secret"
    );
    res.json({ token, admin: { id: admin._id, username: admin.username } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", async (req, res) => {
  try {
    // decrypt token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        myCode: user.myCode,
        phone: user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve user" });
  }
});

module.exports = router;
