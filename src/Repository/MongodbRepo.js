const getMongoConn = require('../config/mongodb/connector');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

async function insertCategory(user, insertCateDTO) {
	let conn;
	try {
		conn = await getMongoConn(user);
		let pId;
		if (insertCateDTO.getParentId() != null) {
			pId = new mongoose.Types.ObjectId(insertCateDTO.getParentId());
		} else {
			pId = null;
		}

		const vResult = await conn.cate.validateUpdate(
			insertCateDTO,
			conn.product
		);
		if (!vResult.valid) {
			return {
				err: true,
				message: 'categories contain products',
				id: vResult.id,
			};
		}
		const category = new conn.cate({
			_id: new mongoose.Types.ObjectId(),
			name: insertCateDTO.getName(),
			parentCate: pId,
			attribute: insertCateDTO.getAttribute(),
		});

		await category.save();
		return { err: false, message: category._id };
	} catch (e) {
		return { err: true, message: e.message };
	} finally {
		if (!!conn) {
			await conn.conn.close();
		}
	}
}

async function updateCategory(user, updateCateDTO) {
	let conn;

	try {
		conn = await getMongoConn(user);
		const vResult = await conn.cate.validateUpdate(
			updateCateDTO,
			conn.product
		);
		if (!vResult.valid) {
			return {
				err: true,
				message: 'categories contain products',
				id: vResult.id,
			};
		}

		const result = await conn.cate
			.findOneAndUpdate(
				{ _id: updateCateDTO.getId() },
				{
					name: updateCateDTO.getName(),
					parentCate: updateCateDTO.getParentId(),
					attribute: updateCateDTO.getAttribute(),
				},
				{ upsert: true, new: true }
			)
			.lean()
			.exec();
		return { err: false, message: result._id };
	} catch (e) {
		return { err: true, message: e.message };
	} finally {
		if (!!conn) {
			await conn.conn.close();
		}
	}
}

async function deleteCategory(user, updateCateDTO) {
	let conn;
	try {
		conn = await getMongoConn(user);
		const vResult = await conn.cate.validateDelete(
			updateCateDTO.getId(),
			conn.product
		);
		if (!vResult.valid && vResult.id == null) {
			return { err: true, message: 'category not found' };
		} else if (!vResult.valid && vResult.id != null) {
			return {
				err: true,
				message: 'this category contain child category',
			};
		} else {
			const result = await conn.cate
				.deleteOne({ _id: vResult.id })
				.lean()
				.exec();
			return { err: false, message: result.deletedCount };
		}
	} catch (e) {
		return { err: true, message: e.message };
	} finally {
		if (!!conn) {
			await conn.conn.close();
		}
	}
}

async function getAllCate(user) {
	let conn;

	try {
		conn = await getMongoConn(user);
		const popObject = {
			path: 'parentCate',
			model: conn.cate,
			select: '_id name',
		};
		const result = await conn.cate
			.find()
			.populate(popObject)
			.sort({ name: 1 })
			.lean()
			.exec();
		return { message: result, err: false };
	} catch (e) {
		return { err: true, message: e.message };
	} finally {
		if (!!conn) {
			await conn.conn.close();
		}
	}
}

async function getCate(user, categoryId) {
	let conn;
	try {
		conn = await getMongoConn(user);
		const result = await conn.cate
			.find({ _id: categoryId }, 'name')
			.sort({ name: 1 })
			.lean()
			.exec();
		return { message: result[0], err: false };
	} catch (e) {
		return { err: true, message: e.message };
	} finally {
		if (!!conn) {
			await conn.conn.close();
		}
	}
}

async function getAllProduct(user, listId, categoryId, searchString) {
	let conn;
	try {
		conn = await getMongoConn(user);
		const popObject = {
			path: 'category',
			model: conn.cate,
			options: { sort: { position: -1 } },
			select: '_id name',
			populate: {
				path: 'parentCate',
				model: conn.cate,
				select: '_id name',
			},
		};
		let query = {};
		if (listId.length > 0) {
			query._id = { $in: listId };
		}
		if (searchString) {
			query.$or = [
				{ name: { $regex: searchString, $options: 'i' } },
				{ brand: { $regex: searchString, $options: 'i' } },
				{ color: { $regex: searchString, $options: 'i' } },
			];
		}
		const result = await conn.product
			.find(query)
			.populate(popObject)
			.sort({ name: 1 })
			.lean()
			.exec();

		if (categoryId) {
			const filteredResult = result.filter((product) => {
				return (
					categoryId === product.category._id.toString() ||
					(!!product.category.parentCate &&
						product.category.parentCate._id.toString() ===
							categoryId)
				);
			});
			return { err: false, message: filteredResult };
		}
		return { err: false, message: result };
	} catch (e) {
		throw Error(e.message);
	} finally {
		if (!!conn) {
			await conn.conn.close();
		}
	}
}

async function getCartProduct(listId, user = 'customer') {
	let conn;
	try {
		conn = await getMongoConn(user);
		const popObject = {
			path: 'category',
			model: conn.cate,
			options: { sort: { position: -1 } },
			select: 'name',
		};
		const result = await conn.product
			.find({ _id: { $in: listId } })
			.populate(popObject)
			.sort({ _id: 1 })
			.lean()
			.exec();
		return { err: false, message: result };
	} catch (e) {
		throw Error(e.message);
	} finally {
		if (!!conn) {
			await conn.conn.close();
		}
	}
}

async function getProduct(user, id) {
	let conn;
	try {
		conn = await getMongoConn(user);
		const popObject = {
			path: 'category',
			model: conn.cate,
			options: { sort: { position: -1 } },
			select: '_id name',
			populate: {
				path: 'parentCate',
				model: conn.cate,
				select: '_id name',
			},
		};
		const result = await conn.product
			.findOne({ _id: id })
			.populate(popObject)
			.lean()
			.exec();
		return { err: false, message: result };
	} catch (e) {
		throw Error(e.message);
	} finally {
		if (!!conn) {
			await conn.conn.close();
		}
	}
}

async function insertProduct(user, insertProdDTO) {
	let conn;

	try {
		conn = await getMongoConn(user);
		const valid = await conn.product.validateInsert(
			insertProdDTO,
			conn.cate
		);
		if (!valid) {
			return {
				err: true,
				message: 'product attribute not match with category',
			};
		}

		const product = new conn.product({
			_id: new mongoose.Types.ObjectId(),
			name: insertProdDTO.getName(),
			brand: insertProdDTO.getBrand(),
			price: insertProdDTO.getPrice(),
			dimension: insertProdDTO.getDimension(),
			color: insertProdDTO.getColor(),
			category: new mongoose.Types.ObjectId(insertProdDTO.getCategory()),
			attribute: insertProdDTO.getAttribute(),
			pAttribute: insertProdDTO.getParentAttribute(),
		});

		await product.save();
		return { err: false, message: product._id };
	} catch (e) {
		return { err: true, message: e.message };
	} finally {
		if (!!conn) {
			await conn.conn.close();
		}
	}
}

async function UpdateProduct(user, updateProdDTO) {
	let conn;

	try {
		conn = await getMongoConn(user);
		const valid = await conn.product.validateInsert(
			updateProdDTO,
			conn.cate
		);
		if (!valid) {
			return {
				err: true,
				message: 'product attribute not match with category',
			};
		}

		const result = await conn.product
			.findOneAndUpdate(
				{ _id: updateProdDTO.getId() },
				{
					name: updateProdDTO.getName(),
					brand: updateProdDTO.getBrand(),
					price: updateProdDTO.getPrice(),
					dimension: updateProdDTO.getDimension(),
					color: updateProdDTO.getColor(),
					category: updateProdDTO.getCategory(),
					attribute: updateProdDTO.getAttribute(),
					pAttribute: updateProdDTO.getParentAttribute(),
				},
				{ upsert: true, new: true }
			)
			.lean()
			.exec();

		return { message: result._id, err: false };
	} catch (e) {
		return { err: true, message: e.message };
	} finally {
		if (!!conn) {
			await conn.conn.close();
		}
	}
}

async function getParentCate(user) {
	let conn;

	try {
		conn = await getMongoConn(user);
		const result = await conn.cate
			.find({ parentCate: null })
			.sort({ name: 1 })
			.lean()
			.exec();
		return { message: result, err: false };
	} catch (e) {
		return { err: true, message: e.message };
	} finally {
		if (!!conn) {
			await conn.conn.close();
		}
	}
}

async function getChildCate(user) {
	let conn;

	try {
		conn = await getMongoConn(user);
		const popObject = {
			path: 'parentCate',
			model: conn.cate,
			options: { sort: { position: -1 } },
			select: '_id name attribute',
		};
		const result = await conn.cate
			.find({ parentCate: { $ne: null } })
			.populate(popObject)
			.sort({ name: 1 })
			.lean()
			.exec();
		return { message: result, err: false };
	} catch (e) {
		return { err: true, message: e.message };
	} finally {
		if (!!conn) {
			await conn.conn.close();
		}
	}
}

module.exports = {
	getAllProductMongo: getAllProduct,
	updateProductMongo: UpdateProduct,
	insertProductMongo: insertProduct,
	getAllCateMongo: getAllCate,
	deleteCategoryMongo: deleteCategory,
	updateCategoryMongo: updateCategory,
	insertCategoryMongo: insertCategory,
	getProduct: getProduct,
	getCartProduct: getCartProduct,
	getCateMongo: getCate,
	getParentCateMongo: getParentCate,
	getChildCateMongo: getChildCate,
};
