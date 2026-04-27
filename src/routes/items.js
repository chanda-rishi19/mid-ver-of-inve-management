const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authMiddleware } = require("../middleware/auth");

// GET items (only user's items)
router.get("/", authMiddleware, async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM items WHERE user_id=$1",
    [req.user.id]
  );
  res.json(result.rows);
});

// ADD item
router.post("/", authMiddleware, async (req, res) => {
  const { name, quantity, category } = req.body;

  const result = await pool.query(
    "INSERT INTO items (name, quantity, category, user_id) VALUES ($1,$2,$3,$4) RETURNING *",
    [name, quantity, category, req.user.id]
  );

  res.json(result.rows[0]);
});

// UPDATE
router.put("/:id", authMiddleware, async (req, res) => {
  const { name, quantity } = req.body;

  await pool.query(
    "UPDATE items SET name=$1, quantity=$2 WHERE id=$3 AND user_id=$4",
    [name, quantity, req.params.id, req.user.id]
  );

  res.json({ message: "Updated" });
});

// DELETE
router.delete("/:id", authMiddleware, async (req, res) => {
  await pool.query(
    "DELETE FROM items WHERE id=$1 AND user_id=$2",
    [req.params.id, req.user.id]
  );

  res.json({ message: "Deleted" });
});

module.exports = router;