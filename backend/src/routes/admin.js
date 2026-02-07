const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Reservation = require("../models/Reservation");
const { requireAdmin } = require("../middleware/auth");
const { randomCode } = require("../utils/generateCode");

const router = express.Router();

// list pending users
router.get("/pending-users", requireAdmin, async (req, res) => {
  const foundedUsers = await User.find({ status: "pending" }).lean();

  const users = [];
  for (const user of foundedUsers) {
    const founded = await User.findOne({ myCode: user.referrerCode }).select("firstName lastName").lean();
    const newUser = { ...user,founded };
    users.push(newUser);
  }

  res.json(users);
});

// approve user
router.post("/pending-users/:id/approve", requireAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  user.status = "approved";
  user.myCode = randomCode();
  user.messages.push({
    text: `${user.firstName} ثبت نام شما با موفقیت انجام شد.`,
  });
  await user.save();
  res.json({ message: "approved" });
});

// reject user
router.post("/pending-users/:id/reject", requireAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });

  // Delete the user from database instead of changing status
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "rejected and deleted" });
});

// list approved users
router.get("/users", requireAdmin, async (req, res) => {
  const users = await User.find({ status: "approved" });
  res.json(users);
});

// delete user
router.delete("/users/:id", requireAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "deleted" });
});

// product management
router.post("/products", requireAdmin, async (req, res) => {
  try {
    const { name, price, quantity, category } = req.body;

    // Validate required fields
    if (!name || !price || !quantity || !category) {
      return res
        .status(400)
        .json({ error: "نام، قیمت، تعداد و دسته‌بندی الزامی هستند" });
    }

    const last = await Product.findOne().sort({ productId: -1 });
    const productId = last ? last.productId + 1 : 1;

    const productData = {
      productId,
      name,
      price: Number(price),
      quantity: Number(quantity),
      category,
    };

    const product = await Product.create(productData);
    res.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "خطا در ایجاد محصول" });
  }
});

router.patch("/products/:id", requireAdmin, async (req, res) => {
  try {
    const { name, price, quantity, category } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (category !== undefined) updateData.category = category;

    const product = await Product.findOneAndUpdate(
      { productId: parseInt(req.params.id) },
      updateData,
      { new: true }
    );

    if (!product) return res.status(404).json({ error: "محصول یافت نشد" });
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "خطا در بروزرسانی محصول" });
  }
});

router.delete("/products/:id", requireAdmin, async (req, res) => {
  await Product.findOneAndDelete({ productId: parseInt(req.params.id) });
  res.json({ message: "deleted" });
});

// reservations management
router.get("/reservations", requireAdmin, async (req, res) => {
  const reservations = await Reservation.find().populate(
    "user",
    "firstName lastName phone"
  );
  res.json(reservations);
});

router.patch("/reservations/:code", requireAdmin, async (req, res) => {
  try {
    const { received, returned, paid, lateHours } = req.body;
    const reservation = await Reservation.findOne({
      trackingCode: parseInt(req.params.code),
    }).populate("user");
    if (!reservation) return res.status(404).json({ error: "Not found" });

    const user = reservation.user;
    let messagesSent = [];

    // Validation: Can't set returned or paid without received being true
    if (
      (returned && !reservation.received && received !== true) ||
      (paid && !reservation.received && received !== true)
    ) {
      return res.status(400).json({
        error:
          "نمی‌توانید وضعیت تحویل یا پرداخت را بدون تایید دریافت فعال کنید",
      });
    }

    // Handle received status change
    if (received !== undefined && received !== reservation.received) {
      reservation.received = received;
      if (received) {
        const message = ` تجهیزات مربوط به کد رزرو ${reservation.trackingCode} توسط شما دریافت شد.`;
        user.messages.push({ text: message, createdAt: new Date() });
        messagesSent.push("دریافت");
      }
    }

    // Handle returned status change
    if (returned !== undefined && returned !== reservation.returned) {
      // Only allow if received is true
      if (!reservation.received && received !== true) {
        return res.status(400).json({
          error: "ابتدا باید وضعیت دریافت را تایید کنید",
        });
      }

      if (returned && !reservation.returned) {
        // Return products to inventory
        for (const item of reservation.items) {
          const product = await Product.findOne({ productId: item.productId });
          if (product) {
            product.quantity += item.count;
            await product.save();
          }
        }

        const message = ` تجهیزات مربوط به کد رزرو ${reservation.trackingCode} توسط شما برگشت داده شد.`;
        user.messages.push({ text: message, createdAt: new Date() });
        messagesSent.push("برگشت");
      }
      reservation.returned = returned;
    }

    // Handle late hours
    if (lateHours !== undefined) {
      reservation.lateHours = lateHours;
      reservation.finalPrice =
        reservation.totalPrice + reservation.totalPrice * 0.1 * lateHours;
    }

    // Handle paid status change
    if (paid !== undefined && paid !== reservation.paid) {
      // Only allow if received is true
      if (!reservation.received && received !== true) {
        return res.status(400).json({
          error: "ابتدا باید وضعیت دریافت را تایید کنید",
        });
      }

      reservation.paid = paid;
      if (paid) {
        const message = ` لیست شما با کد رزرو ${
          reservation.trackingCode
        } تسویه حساب شد. مبلغ نهایی: ${(
          reservation.finalPrice || reservation.totalPrice
        ).toLocaleString()} تومان`;
        user.messages.push({ text: message, createdAt: new Date() });
        messagesSent.push("پرداخت");
      }
    }

    await reservation.save();
    await user.save();

    res.json({
      reservation,
      messagesSent:
        messagesSent.length > 0
          ? `پیام‌های ${messagesSent.join(" و ")} ارسال شد`
          : "هیچ پیامی ارسال نشد",
    });
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({ error: "خطا در بروزرسانی رزرو" });
  }
});

// income
router.get("/income", requireAdmin, async (req, res) => {
  const reservations = await Reservation.find({ paid: true });
  const total = reservations.reduce((sum, r) => sum + (r.finalPrice || 0), 0);
  res.json({ total });
});


module.exports = router;
