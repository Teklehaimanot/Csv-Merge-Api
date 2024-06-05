const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const stringSimilarity = require("string-similarity");

const ColumnSimilarity = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json("No file uploaded.");
    }

    const { targetString, similarityThreshold = 0.3, columnName } = req.body;
    if (!targetString || !columnName) {
      return res
        .status(400)
        .send("Target string and column name are required.");
    }
    const filePath = path.join(__dirname, "../uploads", req.file.filename);
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        // Trim keys to handle extra quotes or spaces
        const trimmedData = {};
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const trimmedKey = key.trim();
            trimmedData[trimmedKey] = data[key];
          }
        }

        if (trimmedData.hasOwnProperty(columnName)) {
          const similarity = stringSimilarity.compareTwoStrings(
            trimmedData[columnName],
            targetString
          );
          if (similarity > similarityThreshold) {
            results.push(trimmedData);
          }
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

    // fs.createReadStream(filePath)
    //   .pipe(csv())
    //   .on("data", (data) => {
    //     console.log(data);
    //     if (data.hasOwnProperty("Name")) {
    //       const similarity = stringSimilarity.compareTwoStrings(
    //         data[columnName],
    //         targetString
    //       );
    //       if (similarity > similarityThreshold) {
    //         results.push(data);
    //       }
    //     }
    //   })
    //   .on("end", () => {
    //     // Delete the file after processing
    //     fs.unlinkSync(filePath);

    //     // Send the JSON response
    //     res.json(results);
    //   })
    //   .on("error", (err) => {
    //     res.status(500).send("Error processing file.");
    //   });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  ColumnSimilarity,
};
