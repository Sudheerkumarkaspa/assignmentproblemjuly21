var express = require("express");
var constants = require('../helpers/constants');
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res) {
	res.render("index", { title: "Express" });
});

module.exports = router;
