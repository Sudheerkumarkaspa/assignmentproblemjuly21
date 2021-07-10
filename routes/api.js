var express = require("express");
var productRouter = require("./product");
var warehouseRouter = require("./warehouse");
var app = express();

app.use("/warehouse/", warehouseRouter);
app.use("/product/", productRouter);
module.exports = app;