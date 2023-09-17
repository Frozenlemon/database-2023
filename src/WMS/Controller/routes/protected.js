const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();

const {
	authenticateTokenService,
} = require('../../Service/AuthenticationService');

const {
	getAllWarehouseService,
	updateWarehouseService,
	deleteWarehouseService,
	insertWarehouseService,
	getInventoryService,
	transferInventoryService,
	getAllProductService,
	createPOService,
	getParentCateService,
	getChildCateService,
} = require('../../Service/WMSService');

router.get('/', authenticateTokenService, async (req, res) => {
	res.render('warehouseManagement.ejs');
});

router.post('/', authenticateTokenService, async (req, res) => {
	try {
		let response;
		if (req.body.search) {
			response = await getAllWarehouseService(
				req.userRole,
				req.body.search
			);
		} else {
			response = await getAllWarehouseService(req.userRole);
		}
		await res.send(response.message);
	} catch (e) {
		console.error(e.message);
	}
});

router.post('/updatewarehouse', authenticateTokenService, async (req, res) => {
	try {
		const response = await updateWarehouseService(
			req.userRole,
			req.body.warehouse
		);
		if (!response.err) {
			res.send(200);
		}
	} catch (e) {
		console.error(e.message);
	}
});

router.post('/deletewarehouse', authenticateTokenService, async (req, res) => {
	try {
		const response = await deleteWarehouseService(req.userRole, {
			id: req.body.id,
		});
		if (!response.err) {
			res.send(200);
		} else {
			res.send(400);
		}
	} catch (e) {
		console.log(e.message);
	}
});

router.post('/createwarehouse', authenticateTokenService, async (req, res) => {
	try {
		const response = await insertWarehouseService(
			req.userRole,
			req.body.warehouse
		);
		if (response.err) {
			res.send(500);
		} else {
			res.send(200);
		}
	} catch (e) {
		console.log(e.message);
	}
});

router.get('/inventoryManagement', authenticateTokenService, (req, res) => {
	res.render('inventoryManagement.ejs');
});

router.post('/displayInvent', authenticateTokenService, async (req, res) => {
	try {
		const response = await getInventoryService({ user: req.userRole });
		res.send(response);
	} catch (e) {
		console.log(e.message);
	}
});

router.post('/transfer', authenticateTokenService, async (req, res) => {
	try {
		const response = await transferInventoryService(req.userRole, {
			id: req.body.product,
			fromWhId: req.body.from,
			toWhId: req.body.to,
			qty: req.body.quantity,
		});
		if (!response.err) {
			res.send(200);
		}
	} catch (e) {
		console.log(e.message);
	}
});

router.get('/getproducts', authenticateTokenService, async (req, res) => {
	try {
		const response = await getAllProductService(req.userRole);
		if (!response.err) {
			res.send(response.message);
		}
	} catch (e) {
		console.log(e.message);
	}
});

router.post('/createpo', authenticateTokenService, async (req, res) => {
	try {
		const response = await createPOService(req.userRole, {
			id: req.body.product,
			qty: req.body.quantity,
		});
		if (!response.err) {
			res.send(200);
		}
	} catch (e) {
		console.log(e.message);
	}
});

router.get('/getparentcate', authenticateTokenService, async (req, res) => {
	try {
		const response = await getParentCateService(req.userRole);
		if (!response.err) {
			res.send(response);
		}
	} catch (e) {
		console.log(e.message);
	}
});

module.exports = router;
