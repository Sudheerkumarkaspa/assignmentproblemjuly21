const Warehouse = require("../models/WarehouseModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
// const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Warehouse Schema
function WarehouseData(data) {
	this.id = data._id;
	this.title = data.title;
	this.price = data.description;
	this.isbn = data.isbn;
	this.createdAt = data.createdAt;
}

/**
 * Warehouse List.
 * 
 * @returns {Object}
 */
exports.warehouseList = [
	// auth,
	function (req, res) {
		try {
			Warehouse.find().then((warehouses) => {
				if (warehouses.length > 0) {
					return apiResponse.successResponseWithData(res, "Operation success", warehouses);
				} else {
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Warehouse Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.warehouseDetail = [
	// auth,
	function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Warehouse.findOne({ _id: req.params.id }, "_id title description createdAt").then((warehouse) => {
				if (warehouse !== null) {
					let warehouseData = new WarehouseData(warehouse);
					return apiResponse.successResponseWithData(res, "Operation success", warehouseData);
				} else {
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Warehouse store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.warehouseStore = [
	// auth,

	body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
	body("availableqty", "availableqty should be number").isNumeric({ min: 0 }),
	body("damagedqty", "damagedqty should be number").isNumeric({ min: 0 }),
	body("reservedqty", "reservedqty should be number").isNumeric({ min: 0 }).trim().custom((value, { req }) => {
		return Warehouse.findOne({ name : req.body.name }).then(warehouse => {
			if (warehouse) {
				return Promise.reject("Warehouse already exist with this title");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var warehouse = new Warehouse(
				{
					name: req.body.name,
					availableqty: req.body.availableqty,
					damagedqty: req.body.damagedqty,
					reservedqty: req.body.reservedqty
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save Warehouse.
				warehouse.save(function (err) {
					if (err) {
						console.log("ERROR", err)
						return apiResponse.ErrorResponse(res, err);
					}
					let warehouseData = new WarehouseData(warehouse);
					return apiResponse.successResponseWithData(res, "Warehouse add Success.", warehouseData);
				});
			}
		} catch (err) {
			console.log("ERROR", err)
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * warehouse update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.warehouseUpdate = [
	// auth,
	// body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	// body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	// body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
	// 	return Warehouse.findOne({_id: { "$ne": req.params.id }}).then(warehouse => {
	// 		if (warehouse) {
	// 			return Promise.reject("warehouse already exist with this ISBN no.");
	// 		}
	// 	});
	// }),
	sanitizeBody("*").escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			var samplewarehouse = {};
			if (req.body.name) samplewarehouse.name = req.body.name;
			if (req.body.availableqty) samplewarehouse.availableqty = req.body.availableqty;
			if (req.body.damagedqty) samplewarehouse.damagedqty = req.body.damagedqty;
			if (req.body.reservedqty) samplewarehouse.reservedqty = req.body.reservedqty;

			// var warehouses = {
			// 		title: req.body.title,
			// 		description: req.body.description,
			// 		status: req.body.status
			// 	};
			console.log("DUMMY warehouse TO BE UPDATAD", samplewarehouse);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				} else {
					let foundWarehouse = await Warehouse.findById(req.params.id);
					// , function (err, foundWarehouse) {
					if (foundWarehouse === null) {
						return apiResponse.notFoundResponse(res, "Warehouse not exists with this id");
					} else {
						{

								if (req.body.product) {
									let checkforifproductexists= await Warehouse.findOne(
										{
											'products' : {
												$eq : req.body.product
											}
										}
									)
									if(checkforifproductexists)return apiResponse.notFoundResponse(res, "Product already exists in the warehouse");
									let updateproductres = await Warehouse.findOneAndUpdate(
										req.params.id,
										{
											$push: {
												'products': req.body.product
											}
										},
										{});


									if (updateproductres) return apiResponse.successResponseWithData(res, "Warehouse update Success.", updateproductres);


								}
								
									let updateres = Warehouse.findByIdAndUpdate(req.params.id, samplewarehouse, {})
									if (updateres) return apiResponse.successResponseWithData(res, "Warehouse update Success.", updateres);
								

							}

						}
					}

				}
			
		}catch (err) {
			console.error("error", err)
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Warehouse Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.warehouseDelete = [
	// auth,
	function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Warehouse.findById(req.params.id, function (err, foundWarehouse) {
				if (foundWarehouse === null) {
					return apiResponse.notFoundResponse(res, "Warehouse not exists with this id");
				} else {
					//Check authorized user
					if (foundWarehouse.user.toString() !== req.user._id) {
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					} else {
						//delete Warehouse.
						Warehouse.findByIdAndRemove(req.params.id, function (err) {
							if (err) {
								return apiResponse.ErrorResponse(res, err);
							} else {
								return apiResponse.successResponse(res, "Warehouse delete Success.");
							}
						});
					}
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];