const express = require('express');
const router = express.Router();
const DownloadController = require("../controller/download.controller");

router.post('/download', DownloadController.download);

module.exports = router;
