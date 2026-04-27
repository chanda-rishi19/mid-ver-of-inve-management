const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const { authMiddleware } = require("../middleware/auth");

const upload = multer({ dest: "uploads/" });

router.post("/", authMiddleware, upload.single("file"), (req, res) => {
  console.log("UPLOAD HIT"); // 🔥 debug

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => {
      console.log("ROW:", data); // 🔥 debug
      results.push(data);
    })
    .on("end", async () => {
      try {
        for (let row of results) {
          await pool.query(
            "INSERT INTO items (name, quantity, category, user_id) VALUES ($1,$2,$3,$4)",
            [
              row.name,
              parseInt(row.quantity),
              row.category,
              req.user.id
            ]
          );
        }

        fs.unlinkSync(req.file.path);

        res.json({ message: "CSV Imported Successfully" });

      } catch (err) {
        console.error("UPLOAD ERROR:", err);
        res.status(500).json({ error: "Import failed" });
      }
    });
});

module.exports = router;