const Product = require("../models/ProductModel");
const Warehouse = require("../models/WarehouseModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
// const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Product Schema
function ProductData(data) {
	this.id = data._id;
	this.title = data.title;
	this.price = data.description;
	this.isbn = data.isbn;
	this.createdAt = data.createdAt;
}

/**
 * Product List.
 * 
 * @returns {Object}
 */
exports.productList = [
	// auth,
	function (req, res) {
		try {
			Product.find().then((products) => {
				if (products.length > 0) {
					return apiResponse.successResponseWithData(res, "Operation success", products);
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
 * Product Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.productDetail = [
	// auth,
	function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Product.findOne({ _id: req.params.id }, "_id title description createdAt").then((product) => {
				if (product !== null) {
					let productData = new ProductData(product);
					return apiResponse.successResponseWithData(res, "Operation success", productData);
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
 * Product store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.productStore = [
	// auth,

	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("status", "Status must not be empty.").isLength({ min: 1 }).trim(),
	body("price", "Price should be number").isNumeric({ min: 0 }).trim().custom((value, { req }) => {
		return Product.findOne({ title: req.body.title }).then(product => {
			if (product) {
				return Promise.reject("Product already exist with this title");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var product = new Product(
				{
					title: req.body.title,
					description: req.body.description,
					price: req.body.price
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save product.
				product.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let productData = new ProductData(product);
					return apiResponse.successResponseWithData(res, "Product add Success.", productData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Product update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.productUpdate = [
	// auth,
	// body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	// body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	// body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
	// 	return Product.findOne({_id: { "$ne": req.params.id }}).then(product => {
	// 		if (product) {
	// 			return Promise.reject("product already exist with this ISBN no.");
	// 		}
	// 	});
	// }),
	sanitizeBody("*").escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			var sampleproduct = {};
			if (req.body.title) sampleproduct.title = req.body.title;
			if (req.body.status) sampleproduct.status = req.body.status;
			if (req.body.price) sampleproduct.price = req.body.price;
			if (req.body.warehouse) sampleproduct.warehouse = req.body.warehouse;
			console.log("DUMMY PRODUCT TO BE UPDATAD", sampleproduct);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				} else {
					let foundProduct = await Product.findById(req.params.id);
					if (foundProduct === null) {
						return apiResponse.notFoundResponse(res, "Product not exists with this id");
					} else {
						{
							let updateres = await Product.findByIdAndUpdate(req.params.id, sampleproduct);
							if (updateres)
								return apiResponse.successResponseWithData(res, "Product update Success.", updateres);
						}

					}
				}
				// });
			}
		} catch (err) {
			console.error("error", err)
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Product update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.productAddWareHouseUpdate = [
	// auth,
	// body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	// body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	// body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
	// 	return Product.findOne({_id: { "$ne": req.params.id }}).then(product => {
	// 		if (product) {
	// 			return Promise.reject("product already exist with this ISBN no.");
	// 		}
	// 	});
	// }),
	sanitizeBody("*").escape(),
	async (req, res) => {
		console.log("IN ADD WAREHOUSE")
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				} else {
					let foundProduct = await Product.findById(req.params.id);
					// , function (err, foundProduct) {
					if (foundProduct === null) {
						return apiResponse.notFoundResponse(res, "Product not exists with this id");
					} else {
						{

							if (req.body.warehouse) {
								let checkforifwarehouselinkedtoproductschema = await Product.findOne(
									{
										'id': {
											$eq: req.params.id
										},
										'warehouse': {
											$eq: req.body.warehouse
										}
									}
								)
								console.log("warehouse linked to product schema",checkforifwarehouselinkedtoproductschema)
								if (!checkforifwarehouselinkedtoproductschema) return apiResponse.notFoundResponse(res, "Warehouse already connected to product schema");
								let addwarehousetoproductschema = await Product.findOneAndUpdate(
									req.params.id,
									{
										$push: {
											'warehouse': req.body.warehouse
										}
									},
									{});
								if (addwarehousetoproductschema) console.log("added warehouse to productschema Success");
								// if (req.body.product) {
								let checkforifproductexistsinwarehouseschema = await Warehouse.findOne(
									{
										'id': {
											$eq: req.body.warehouse
										},
										'products': {
											$eq: req.params.id
										}
									}
								)
								if (!checkforifproductexistsinwarehouseschema) return apiResponse.notFoundResponse(res, "Product already exists in the warehouse schema");
								let addproducttowarehouseschema = await Warehouse.findOneAndUpdate(
									req.body.warehouse,
									{
										$push: {
											'products': req.params.id
										}
									},
									{});
								if (addproducttowarehouseschema) return apiResponse.successResponseWithData(res, "Adding Product to Warehouse Schema Success.");

							}
						}
					}
				}
			}
		} catch (err) {
			console.error("error", err)
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
/**
 * Product Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.productDelete = [
	// auth,
	function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Product.findById(req.params.id, function (err, foundProduct) {
				if (foundProduct === null) {
					return apiResponse.notFoundResponse(res, "Product not exists with this id");
				} else {
					//Check authorized user
					if (foundProduct.user.toString() !== req.user._id) {
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					} else {
						//delete product.
						Product.findByIdAndRemove(req.params.id, function (err) {
							if (err) {
								return apiResponse.ErrorResponse(res, err);
							} else {
								return apiResponse.successResponse(res, "Product delete Success.");
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