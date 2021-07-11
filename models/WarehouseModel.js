var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var WarehouseSchema = new mongoose.Schema({
	// id: {type: String, required: true},
	name: {type: String, required: true},
	availableqty: {type: Number, required: true,},
	damagedqty: {type: Number, required: true},
	reservedqty: {type: Number, required: true},
}, {timestamps: true});


module.exports = mongoose.model("Warehouse", WarehouseSchema);