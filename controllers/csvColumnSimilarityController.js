const csv = require("csv-parser");
const stringSimilarity = require("string-similarity");
const { Readable } = require("stream");

const ColumnSimilarity = (req, res) => {
  try {
    const {
      csvContent,
      targetString,
      columnName,
      similarityThreshold = 0.3,
    } = req.body;

    if (!csvContent || !targetString || !columnName) {
      return res
        .status(400)
        .send("CSV content, target string, and column name are required.");
    }

    const results = [];
    const stream = Readable.from(csvContent);

    stream
      .pipe(csv())
      .on("data", (data) => {
        // Create a new object with trimmed and cleaned keys
        const cleanedData = {};
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            let cleanedKey = key.trim();
            // Remove surrounding quotes if present
            cleanedKey = cleanedKey.replace(/^["']|["']$/g, "");
            cleanedData[cleanedKey] = data[key];
          }
        }

        if (cleanedData.hasOwnProperty(columnName)) {
          const similarity = stringSimilarity.compareTwoStrings(
            targetString.toLowerCase(),
            cleanedData[columnName].toLowerCase()
          );
          console.log(similarity);
          if (similarity > similarityThreshold) {
            // You can adjust the similarity threshold here
            results.push(cleanedData);
          }
        }
      })
      .on("end", () => {
        res.json(results);
        console.log(results);
      })
      .on("error", (err) => {
        res.status(500).send("Error processing CSV content.");
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  ColumnSimilarity,
};
