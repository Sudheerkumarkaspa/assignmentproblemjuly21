const Product = require("../models/ProductModel");
const Warehouse = require("../models/WarehouseModel");
const ProductLog = require("../models/ProductLogModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
// const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);


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
	async function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			let productfind = await Product.findOne({ _id: req.params.id }, "_id title status createdAt")


			// .then((product) => {
			if (productfind !== null) {
				return apiResponse.successResponseWithData(res, "Operation success", productfind);
			} else {
				return apiResponse.successResponseWithData(res, "Operation success", {});
			}
			// });
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
	async (req, res) => {
		try {
			const errors = validationResult(req);
			var product = new Product(
				{
					title: req.body.title,
					status: req.body.status,
					price: req.body.price
				});
			var productlog = new ProductLog(
				{
					product: product._id,
					$push: {
						logs: {
							updatedAt: Date.now(),
							updatedLog: 'Product Created'
						}
					}
				}
			)

			console.log("PRODUCTLOG CREATED",productlog)
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save product.
				product.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					return apiResponse.successResponseWithData(res, "Product add Success.", product._id);
				});
			
			}
		} catch (err) {
			console.log("err", err)
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
								console.log("warehouse linked to product schema", checkforifwarehouselinkedtoproductschema)
								if (checkforifwarehouselinkedtoproductschema!=null) return apiResponse.notFoundResponse(res, "Warehouse already connected to product schema");
								let addwarehousetoproductschema = await Product.findOneAndUpdate(
									req.params.id,
									{
										$push: {
											'warehouse': req.body.warehouse
										}
									},
									{});
								if (addwarehousetoproductschema) 
								 return apiResponse.successResponseWithData(res, "Adding Warehouse to Product Schema Success.");

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