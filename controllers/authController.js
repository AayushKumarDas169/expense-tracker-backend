const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. REGISTER NEW USER
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body; //

    if (!email || !password) { //
      return res.status(400).json({ error: "Please enter all required fields." }); //
    }

    const existingUser = await User.findOne({ email }); //
    if (existingUser) { //
      return res.status(400).json({ error: "An account with this email already exists." }); //
    }

    const salt = await bcrypt.genSalt(10); //
    const hashedPassword = await bcrypt.hash(password, salt); //

    const newUser = new User({ //
      email, //
      password: hashedPassword, //
    }); //
    await newUser.save(); //

    res.status(201).json({ message: "Registration successful! You can now log in." }); //
  } catch (err) {
    res.status(500).json({ error: err.message }); //
  }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; //

    if (!email || !password) { //
      return res.status(400).json({ error: "Please enter all required fields." }); //
    }

    const user = await User.findOne({ email }); //
    if (!user) { //
      return res.status(400).json({ error: "Invalid credentials." }); //
    }

    const isMatch = await bcrypt.compare(password, user.password); //
    if (!isMatch) { //
      return res.status(400).json({ error: "Invalid credentials." }); //
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallbackSecret", { //
      expiresIn: "24h", //
    }); //

    res.json({ //
      token, //
      user: { //
        id: user._id, //
        email: user.email, //
      }, //
    }); //
  } catch (err) {
    res.status(500).json({ error: err.message }); //
  }
};

// 3. FORGOT PASSWORD SYSTEM HANDLER
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Please enter your email address." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No account found with this email address." });
    }

    res.status(200).json({ message: "Email account verified." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. RESET PASSWORD SYSTEM HANDLER
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Missing required parameters." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User account context mismatch." });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🚀 5. GET USER PROFILE (EXPLICITLY ATTACHED TO EXPORTS FOR YOUR ROUTER)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User profile context not found." });
    }

    res.status(200).json({
      _id: user._id,
      email: user.email,
      savingsBalance: user.savingsBalance || 0
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load profile parameters: " + err.message });
  }
};