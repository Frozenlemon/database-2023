const { InsertProductDTO, UpdateProductDTO } = require('../../DTO/Product');
const {
	insertProductMongo,
	insertCategoryMongo,
	updateCategoryMongo,
	updateProductMongo,
	deleteCategoryMongo,
	getAllProductMongo,
	getParentCateMongo,
	getChildCateMongo,
} = require('../../Repository/MongodbRepo');
const {
	insertProductMySql,
	insertWareHouseMySql,
	updateWareHouseMySql,
	deleteWarehouseMySql,
	updateProductMySql,
	getAllWarehouse,
	updateInventoryMySql,
	transferInventMySql,
	getInventory,
} = require('../../Repository/MySqlRepo');
const {
	InsertWarehouseDTO,
	UpdateWarehouseDTO,
	DeleteWarehouseDTO,
} = require('../../DTO/Warehouse');
const {
	InsertCateDTO,
	UpdateCateDTO,
	DeleteCateDTO,
} = require('../../DTO/Category');
const { UpdateInventoryDTO, TransferDTO } = require('../../DTO/Inventory');
const { InventoryDTO } = require('../ReturnDTO/InventoryDTO');

async function insertProductService(user, mapObject) {
	try {
		const insertDTO = new InsertProductDTO(
			mapObject.name,
			mapObject.brand,
			mapObject.price,
			mapObject.dimension,
			mapObject.color,
			mapObject.category,
			mapObject.attribute,
			mapObject.pAttribute
		);
		const mongoResult = await insertProductMongo(user, insertDTO);

		if (mongoResult.err) {
			return { err: true, message: mongoResult.message };
		}

		const id = mongoResult.message.toString();

		const sqlResult = await insertProductMySql(
			user,
			insertDTO.getInsertMySqlDTO(id)
		);
		if (sqlResult.err) {
			return { err: true, message: sqlResult.message };
		}

		return { err: false, message: id };
	} catch (e) {
		return { err: true, message: e.message };
	}
}

async function updateProductService(user, mapObject) {
	try {
		const updateDTO = new UpdateProductDTO(
			mapObject.id,
			mapObject.name,
			mapObject.brand,
			mapObject.price,
			mapObject.dimension,
			mapObject.color,
			mapObject.category,
			mapObject.attribute,
			mapObject.pAttribute
		);
		const sqlDTO = await updateProductMySql(user, updateDTO);
		if (sqlDTO.err) {
			return { err: true, message: sqlDTO.message };
		}

		const mongoDTO = await updateProductMongo(user, updateDTO);
		if (mongoDTO.err) {
			return { err: true, message: mongoDTO.message };
		}
		return { err: false, message: mongoDTO.id };
	} catch (e) {
		return { err: true, message: e.message };
	}
}

async function createPOService(user, mapObject) {
	try {
		const updateDTO = new UpdateInventoryDTO(mapObject.id, mapObject.qty);
		console.log(updateDTO);
		const sqlReturn = await updateInventoryMySql(user, updateDTO);
		return { err: sqlReturn.err, message: sqlReturn.message };
	} catch (e) {
		return { err: true, message: e.message };
	}
}

async function transferInventoryService(user, mapObject) {
	try {
		const transferDTO = new TransferDTO(
			mapObject.id,
			mapObject.fromWhId,
			mapObject.toWhId,
			mapObject.qty
		);
		const sqlReturn = await transferInventMySql(user, transferDTO);
		return { err: sqlReturn.err, message: sqlReturn.message };
	} catch (e) {
		return { err: true, message: e.message };
	}
}

async function getAllProductService(user) {
	try {
		const mongoReturn = await getAllProductMongo(user, []);
		if (mongoReturn.err) {
			return { err: true, message: mongoReturn.message };
		}
		//need to get quantity from sql server
		return { err: false, message: mongoReturn.message };
	} catch (e) {
		return { err: true, message: e.message };
	}
}

async function insertWarehouseService(user, mapObject) {
	try {
		const insertDTO = new InsertWarehouseDTO(
			mapObject.name,
			mapObject.address,
			mapObject.city,
			mapObject.province,
			mapObject.volume
		);
		const sqlReturn = await insertWareHouseMySql(user, insertDTO);
		if (sqlReturn.err) {
			return { err: true, message: sqlReturn.message };
		}
		return { err: false, message: sqlReturn.id };
	} catch (e) {
		return { err: true, message: e.message };
	}
}

async function updateWarehouseService(user, mapObject) {
	try {
		const updateDTO = new UpdateWarehouseDTO(
			mapObject.id,
			mapObject.name,
			mapObject.address,
			mapObject.city,
			mapObject.province,
			mapObject.volume
		);
		const sqlReturn = await updateWareHouseMySql(user, updateDTO);
		if (sqlReturn.err) {
			return { err: true, message: sqlReturn.message };
		}
		return { err: false, message: sqlReturn.id };
	} catch (e) {
		return { err: true, message: e.message };
	}
}

async function deleteWarehouseService(user, mapObject) {
	try {
		const deleteDTO = new DeleteWarehouseDTO(mapObject.id);
		const sqlReturn = await deleteWarehouseMySql(user, deleteDTO);
		if (sqlReturn.err) {
			return { err: true, message: sqlReturn.message };
		}
		return { err: false, message: sqlReturn.message };
	} catch (e) {
		return { err: true, message: e.message };
	}
}

async function getAllWarehouseService(user, searchString = null) {
	try {
		const sqlReturn = await getAllWarehouse(user, searchString);
		if (sqlReturn.err) {
			return { err: true, message: sqlReturn.message };
		}
		return { err: false, message: sqlReturn.message };
	} catch (e) {
		return { err: true, message: e.message };
	}
}

async function insertCategoryService(user, mapObject) {
	try {
		const insertDTO = new InsertCateDTO(
			mapObject.name,
			mapObject.parentId,
			mapObject.attribute
		);
		const mongoReturn = await insertCategoryMongo(user, insertDTO);
		if (mongoReturn.err) {
			return { err: true, message: mongoReturn.message };
		}
		return { err: false, message: mongoReturn.message };
	} catch (e) {
		return { err: true, message: e.message };
	}
}

async function updateCategoryService(user, mapObject) {
	try {
		const updateDTO = new UpdateCateDTO(
			mapObject.id,
			mapObject.name,
			mapObject.parentId,
			mapObject.attribute
		);
		const mongoReturn = await updateCategoryMongo(user, updateDTO);
		if (mongoReturn.err) {
			return { err: true, message: mongoReturn.message };
		}
		return { err: false, message: mongoReturn.id };
	} catch (e) {
		return { err: true, message: e.message };
	}
}

async function deleteCategoryService(user, mapObject) {
	try {
		const deleteDTO = new DeleteCateDTO(mapObject.id);
		const mongoReturn = await deleteCategoryMongo(user, deleteDTO);
		if (mongoReturn.err) {
			return { err: true, message: mongoReturn.message };
		}
		return { err: false, message: mongoReturn.message };
	} catch (e) {
		return { err: true, message: e.message };
	}
}

async function getInventoryService(mapObject) {
	try {
		const warehouseReturn = await getAllWarehouseService(mapObject.user);
		const inventoryReturn = await getInventory(mapObject.user);
		let listProductIds = [];
		inventoryReturn.message.forEach((inventory) => {
			listProductIds.push(inventory.productId);
		});
		const productReturn = await getAllProductMongo(
			mapObject.user,
			listProductIds
		);
		const returnDTO = new InventoryDTO(
			warehouseReturn.message,
			inventoryReturn.message,
			productReturn.message
		);
		return returnDTO.outputData();
	} catch (e) {
		return { err: true, message: e.message };
	}
}

async function getParentCateService(user) {
	try {
		const cateReturn = await getParentCateMongo(user);
		if (!cateReturn.err) {
			return cateReturn.message;
		}
	} catch (e) {
		return { err: true, message: e.message };
	}
}

async function getChildCateService(user) {
	try {
		const cateReturn = await getChildCateMongo(user);
		if (!cateReturn.err) {
			return cateReturn.message;
		}
	} catch (e) {
		return { err: true, message: e.message };
	}
}

module.exports = {
	insertProductService: insertProductService,
	updateProductDTOService: updateProductService,
	createPOService: createPOService,
	transferInventoryService: transferInventoryService,
	getAllProductService: getAllProductService,
	insertWarehouseService: insertWarehouseService,
	updateWarehouseService: updateWarehouseService,
	deleteWarehouseService: deleteWarehouseService,
	getAllWarehouseService: getAllWarehouseService,
	insertCategoryService: insertCategoryService,
	updateCategoryService: updateCategoryService,
	deleteCategoryService: deleteCategoryService,
	getInventoryService: getInventoryService,
	getParentCateService: getParentCateService,
	getChildCateService: getChildCateService,
};
