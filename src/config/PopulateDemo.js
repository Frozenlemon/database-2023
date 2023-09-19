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
			name: 'warehouse 1',
			address: '123 test address',
			city: 'Ho Chi Minh',
			province: 'Vietnam',
			volume: 5000,
		});
		warehouses.push(result.message);
		result = await insertWarehouseService('whadmin', {
			name: 'warehouse 2',
			address: '456 test address',
			city: 'Ha Noi',
			province: 'Vietnam',
			volume: 3000,
		});
		warehouses.push(result.message);
		result = await insertWarehouseService('whadmin', {
			name: 'warehouse 3',
			address: '789 test address',
			city: 'Hue',
			province: 'Vietnam',
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
			name: 'Book',
			parentId: null,
			attribute: [{ name: 'author' }],
		});
		categories.push(result.message.toString());
		result = await insertCategoryService('whadmin', {
			name: 'Electronics',
			parentId: null,
			attribute: [{ name: 'Specification' }, { name: 'Model' }],
		});
		categories.push(result.message.toString());
		result = await insertCategoryService('whadmin', {
			name: 'Novel',
			parentId: categories[0],
			attribute: [{ name: 'Picture book' }],
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
			name: 'Iphone 15',
			brand: 'apple',
			price: 20000000,
			dimension: { width: 1, height: 1, length: 1 },
			color: 'silver',
			category: categories[1],
			attribute: [
				{
					name: 'Specification',
					value: 'fast',
				},
				{ name: 'Model', value: '15' },
			],
			pAttribute: null,
		});
		products.push(result.message);
		result = await insertProductService('staff', {
			name: 'The Winds of Winter',
			brand: 'Bantam Spectra',
			price: 1000000,
			dimension: { width: 1, height: 2, length: 1 },
			color: 'black',
			category: categories[2],
			attribute: [
				{
					name: 'author',
					value: 'George R.R Martin',
				},
			],
			pAttribute: [{ name: 'Picture Book', value: 'No' }],
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
			qty: 1000,
		});
		poStatus.push(result.message);
		result = await createPOService('staff', {
			id: products[1],
			qty: 2000,
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

// insertProductService('whadmin', {
// 	name: 'test product name 4',
// 	brand: 'test brand 1',
// 	price: 18000,
// 	dimension: { width: 2, height: 1, length: 3 },
// 	color: 'red',
// 	category: '65094c6b9d905dda5acab3a3',
// 	attribute: [
// 		{
// 			name: 'attribute 2',
// 			value: 'test attribute 2 value',
// 		},
// 		{ name: 'attribute 3', value: 'test attribute 3 value' },
// 	],
// 	pAttribute: null,
// }).then((e) => {
// 	console.log(e.message);
// });
