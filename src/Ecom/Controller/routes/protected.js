const express = require('express');
const router = express.Router();
const {
	getAvailableProductService,
	getProductDetailService,
	addToCartService,
	getCartService,
	removeCartService,
	makePurchaseService,
} = require('../../Service/EcomService');
const {
	authenticateTokenService,
} = require('../../Service/AuthenticationService');
const ejs = require('ejs');
const path = require('path');

router.get('/', authenticateTokenService, async (req, res) => {
	try {
		const token = req.query.token;
		let mapObjet = {};
		if (!!req.query.category) {
			mapObjet.category = req.query.category;
		} else {
			mapObjet.category = null;
		}
		if (!!req.query.searchString) {
			mapObjet.searchString = req.query.searchString;
		} else {
			mapObjet.searchString = null;
		}
		let response = await getAvailableProductService(mapObjet);
		const products = response.products;
		const categories = response.categories;
		const cateSelect = response.categorySelect;
		console.log(categories);
		console.log(products);
		if (!response.err) {
			res.status(200).render('index', {
				products: products,
				categories: categories,
				token: token,
				cateSelect: cateSelect,
			});
		} else {
			res.status(500);
		}
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

router.get('/productDetail', authenticateTokenService, async (req, res) => {
	try {
		const productId = req.query.productId;
		const product = await getProductDetailService({
			id: productId,
		});
		if (!product.err) {
			res.render('product_detail', {
				token: req.query.token,
				product: product.message,
			});
		} else {
			res.status(400).send(product.message);
		}
	} catch (e) {
		console.error(e.message);
	}
	// res.render(, { product: req.product });
});

router.get('/product', authenticateTokenService, async (req, res) => {
	try {
		const productId = req.query.productId;
		const product = await getProductDetailService({
			id: productId,
		});
		if (!product.err) {
			res.send({ product: product.message });
		} else {
			res.status(400).send(product.message);
		}
	} catch (e) {
		console.error(e.message);
	}
});

router.post('/product/addCart', authenticateTokenService, async (req, res) => {
	try {
		const productId = req.body.productId;
		const quantity = parseInt(req.body.quantity, 10);
		const token = req.query.token;

		await addToCartService({
			token: token,
			productId: productId,
			quantity: quantity,
		});
	} catch (e) {
		console.error(e.message);
	}
});

router.get('/cart', authenticateTokenService, async (req, res) => {
	try {
		const token = req.query.token;
		const products = await getCartService({
			token: token,
		});
		if (!products.err) {
			res.render('cart', {
				products: products.message.array,
				token: token,
			});
		} else {
			res.status(400).send(products.message);
		}
	} catch (e) {
		console.error(e.message);
	}
});

router.get('/removeCart', authenticateTokenService, async (req, res) => {
	try {
		const result = await removeCartService({
			token: req.query.token,
			productId: req.query.productId,
		});
		if (result.err) {
			res.send({ err: true });
		} else {
			res.send({ err: false });
		}
	} catch (e) {
		console.error(e.message);
	}
});

router.post('/makepurchase', authenticateTokenService, async (req, res) => {
	try {
		const result = await makePurchaseService({
			token: req.query.token,
		});
		if (result.err) {
			res.send({ err: true });
		} else {
			res.send({ err: false });
		}
	} catch (e) {
		console.error(e.message);
	}
});

module.exports = router;
