const express = require("express");
const router = express.Router();
const pool = require("../db");

const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// GET categories
router.get("/", authMiddleware, async (req, res) => {
  const result = await pool.query("SELECT * FROM categories");
  res.json(result.rows);
});

// ADD category (admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const { name } = req.body;

  const result = await pool.query(
    "INSERT INTO categories (name) VALUES ($1) RETURNING *",
    [name]
  );

  res.json(result.rows[0]);
});

module.exports = router;