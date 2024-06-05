const express = require("express");
const router = express.Router();
const multer = require("multer");
const csvSimilarityController = require("../controllers/csvColumnSimilarityController");

const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  upload.single("file"),
  csvSimilarityController.ColumnSimilarity
);

module.exports = router;
