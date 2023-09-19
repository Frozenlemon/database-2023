const {
	insertWarehouseService,
	insertCategoryService,
	insertProductService,
	createPOService,
	transferInventoryService,
} = require('../WMS/Service/WMSService');
const getMySqlConn = require('./sql/connector');
let fs = require('fs');

async function main() {
	let warehouses = [];
	let products = [];
	let categories = [];
	let poStatus = [];
	let transferStatus = [];
	try {
		await initSQL();
		warehouses = await populateWarehouse();
		categories = await populateCategory();
		products = await populateProduct(categories);
		poStatus = await populateInventory(products);
		transferStatus = await transferProduct(products, warehouses);

		console.log(
			`Warehouse added: ${warehouses}\nCategories added: ${categories}\nProduct added: ${products}\nPO completed: ${poStatus}\nTransfer completed: ${transferStatus}`
		);
	} catch (e) {
		console.error('Error occured', e);
	}
}

async function populateWarehouse() {
	let warehouses = [];
	try {
		let result = await insertWarehouseService('whadmin', {
			name: 'test warehouse 1',
			address: '123 test address',
			city: 'test city',
			province: 'test province',
			volume: 5000,
		});
		warehouses.push(result.message);
		result = await insertWarehouseService('whadmin', {
			name: 'test warehouse 2',
			address: '456 test address',
			city: 'test city 2',
			province: 'test province 2',
			volume: 3000,
		});
		warehouses.push(result.message);
		result = await insertWarehouseService('whadmin', {
			name: 'test warehouse 3',
			address: '789 test address',
			city: 'test city 3',
			province: 'test province 3',
			volume: 2000,
		});
		warehouses.push(result.message);
		return warehouses;
	} catch (e) {
		console.log('Error occured', e);
	}
}

async function populateCategory() {
	let categories = [];
	try {
		let result = await insertCategoryService('whadmin', {
			name: 'test cate 1',
			parentId: null,
			attribute: [{ name: 'attribute 1' }],
		});
		categories.push(result.message.toString());
		result = await insertCategoryService('whadmin', {
			name: 'test cate 2',
			parentId: null,
			attribute: [{ name: 'attribute 2' }, { name: 'attribute 3' }],
		});
		categories.push(result.message.toString());
		result = await insertCategoryService('whadmin', {
			name: 'test cate 3',
			parentId: categories[0],
			attribute: [{ name: 'attribute 2' }],
		});
		categories.push(result.message.toString());
		return categories;
	} catch (e) {
		console.log('Error occured', e);
	}
}

async function populateProduct(categories) {
	let products = [];
	try {
		let result = await insertProductService('staff', {
			name: 'test product name 1',
			brand: 'test brand 1',
			price: 18000,
			dimension: { width: 2, height: 1, length: 3 },
			color: 'red',
			category: categories[1],
			attribute: [
				{
					name: 'attribute 2',
					value: 'test attribute 2 value',
				},
				{ name: 'attribute 3', value: 'test attribute 3 value' },
			],
			pAttribute: null,
		});
		products.push(result.message);
		result = await insertProductService('staff', {
			name: 'test product name 2',
			brand: 'test brand 2',
			price: 35000,
			dimension: { width: 1, height: 2, length: 1 },
			color: 'blue',
			category: categories[2],
			attribute: [
				{
					name: 'attribute 2',
					value: 'test attribute 2 value',
				},
			],
			pAttribute: [
				{ name: 'attribute 1', value: 'test attribute 1 value' },
			],
		});
		products.push(result.message);
		return products;
	} catch (e) {
		console.error('Error occured', e);
	}
}

async function populateInventory(products) {
	let poStatus = [];
	try {
		let result = await createPOService('staff', {
			id: products[0],
			qty: 100,
		});
		poStatus.push(result.message);
		result = await createPOService('staff', {
			id: products[1],
			qty: 200,
		});
		poStatus.push(result.message);

		return poStatus;
	} catch (e) {
		console.error('Error occured', e);
	}
}

async function transferProduct(products, warehouses) {
	let transferStatus = [];
	try {
		const result = await transferInventoryService('staff', {
			id: products[0],
			fromWhId: warehouses[0],
			toWhId: warehouses[2],
			qty: 10,
		});
		transferStatus.push(result.message);
		return transferStatus;
	} catch (e) {
		console.error('Error occured', e);
	}
}

async function initSQL() {
	let conn;
	try {
		conn = await getMySqlConn('root');
		const sqlScript = fs.readFileSync(__dirname + '/sql/asm3.sql', 'utf-8');

		const sqls = sqlScript
			.split(/--.*(?:\r\n|\r|\n|$)/)
			.filter((statement) => {
				return statement.trim();
			});

		for (const sql of sqls) {
			try {
				await conn.query(sql);
			} catch (e) {
				console.error(`Error executing SQL statement: ${sql}`);
				console.error(e.message);
			}
		}
		console.log('Complete init sql server');
	} catch (e) {
		console.error(`Error: ${e.message}`);
	} finally {
		if (!!conn) {
			await conn.end();
		}
	}
}

module.exports = { populateData: main };
