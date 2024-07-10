const express = require("express");
const emailRouter = express.Router();

const emailHandlingController = require("../controllers/emailHandleController");

emailRouter.post("/", emailHandlingController.emailHandler);

module.exports = emailRouter;
