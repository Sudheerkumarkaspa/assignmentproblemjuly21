var express = require("express");
const WarehouseController = require("../controllers/WarehouseController");

var router = express.Router();

router.get("/", WarehouseController.warehouseList);
router.get("/:id", WarehouseController.warehouseDetail);
router.post("/", WarehouseController.warehouseStore);
router.put("/:id", WarehouseController.warehouseUpdate);
router.delete("/:id", WarehouseController.warehouseDelete);

module.exports = router;