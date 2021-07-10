var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProductSchema = new Schema({
	// id: {type: String, : true},
	title: {type: String, required: true},
	price : {type: Number, required: true},
	status : {type : String, default: 'Available'},
	warehouse : [{ type: Schema.ObjectId, ref: "Warehouse", required: false }],
}, {timestamps: true});

module.exports = mongoose.model("Product", ProductSchema);