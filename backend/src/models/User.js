const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    nationalId: { type: String, unique: true },
    phone: String,
    referrerCode: String,
    myCode: { type: String, unique: true },
    passwordHash: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
