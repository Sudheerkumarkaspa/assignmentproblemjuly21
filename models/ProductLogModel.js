var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProductLogSchema = new Schema({
	// id: {type: String, : true},
	product : { type: Schema.ObjectId, ref: "Product", required: true },
	logs : [
        {
			// updatedAt : {type: Date, required: false},
			type : String , required: false
		},
    ],
}, {timestamps: true});

module.exports = mongoose.model("ProductLog", ProductLogSchema);