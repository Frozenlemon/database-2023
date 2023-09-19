class ProductList {
	constructor(arrayList) {
		this.array = [];
		for (const item of arrayList) {
			this.array.push({
				image: '/Banana-Single.jpg',
				id: item._id.toString(),
				name: item.name,
				brand: item.brand,
				price: item.price,
				category: item.category.name,
				parentCate: (() => {
					if (item.category.parentCate != null) {
						return item.category.parentCate.name;
					} else {
						return null;
					}
				})(),
				attribute: item.attribute,
				pAttribute: item.pAttribute,
			});
		}
	}

	getList() {
		return this.array;
	}
}

module.exports = { ProductList };
