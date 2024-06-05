const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const stringSimilarity = require("string-similarity");

const ColumnSimilarity = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const filePath = path.join(__dirname, "../uploads", req.file.filename);
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        let isSimilar = false;
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const similarity = stringSimilarity.compareTwoStrings(
              data[key],
              targetString
            );
            if (similarity > similarityThreshold) {
              isSimilar = true;
              break;
            }
          }
        }
        if (isSimilar) {
          results.push(data);
        }
      })
      .on("end", () => {
        // Delete the file after processing
        fs.unlinkSync(filePath);

        // Send the JSON response
        res.json(results);
      })
      .on("error", (err) => {
        res.status(500).send("Error processing file.");
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  ColumnSimilarity,
};
