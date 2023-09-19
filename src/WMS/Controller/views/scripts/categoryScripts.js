async function productButton(token) {
	// const productButton = document.getElementById('modal-product-button');
	const data = await fetchChildCategory(token);
	renderCate(data);
}

async function commitCate(token) {
	const nameValue = document.getElementById('create-cate-name').value;
	const categoryValue = document.getElementById('parent-cate-dropdown')
		.dataset.id;
	const attributesContainer = document.getElementById(
		'attribute-container-cate'
	);
	let attributes = [];
	attributesContainer.querySelectorAll('.attributes').forEach((attribute) => {
		attributes.push({ name: attribute.value });
	});

	try {
		const requestOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				data: {
					name: nameValue,
					parentId: categoryValue,
					attribute: attributes,
				},
			}),
		};

		console.log({
			name: nameValue,
			parentId: categoryValue,
			attribute: attributes,
		});

		const res = await fetch(
			`/protected/createcategory?token=${token}`,
			requestOptions
		);

		if (res.ok) {
			window.location.href = `/protected/categoryManagement?token=${token}`;
		}
		if (!res.ok) {
			throw new Error('Not authorize to create product');
		}
	} catch (e) {
		console.error(e.message);
	}
}

async function commitProduct(token) {
	const nameValue = document.getElementById('create-name').value;
	const brandValue = document.getElementById('create-brand').value;
	const colorValue = document.getElementById('create-color').value;
	const priceValue = document.getElementById('create-price').value;
	const dimension = {
		width: document.getElementById('create-width').value,
		height: document.getElementById('create-height').value,
		length: document.getElementById('create-length').value,
	};
	const categoryValue = document.getElementById('child-cate-dropdown').dataset
		.id;
	const attributeContainer = document.getElementById('attribute-container');
	let attributeValue = [];
	let pAttributeValue = [];
	attributeContainer.querySelectorAll('.attribute').forEach((attribute) => {
		const name = attribute.dataset.name;
		const value = attribute.querySelector('.attributes-value').value;

		attributeValue.push({ name: name, value: value });
	});
	attributeContainer.querySelectorAll('.pAttribute').forEach((attribute) => {
		const name = attribute.dataset.name;
		const value = attribute.querySelector('.pattributes-value').value;

		pAttributeValue.push({ name: name, value: value });
	});

	try {
		const requestOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				data: {
					name: nameValue,
					brand: brandValue,
					color: colorValue,
					price: priceValue,
					dimension: dimension,
					category: categoryValue,
					attribute: attributeValue,
					pAttribute: pAttributeValue,
				},
			}),
		};

		const res = await fetch(
			`/protected/createproduct?token=${token}`,
			requestOptions
		);

		if (res.ok) {
			window.location.href = `/protected/categoryManagement?token=${token}`;
		}
		if (!res.ok) {
			throw new Error('Not authorize to create product');
		}
	} catch (e) {
		console.error(e.message);
	}
}

async function cateButton(token) {
	const cateButton = document.getElementById('modal-cate-button');
	cateButton.dataset.count = 0;
	const attributeContainer = document.getElementById(
		'attribute-container-cate'
	);
	attributeContainer.innerHTML = '';

	const data = await fetchParentCate(token);

	const cateDropDown = document.getElementById('parent-cate-dropdown');
	cateDropDown.textContent = 'Select category';
	const cateDropDownMenu = cateDropDown.nextElementSibling;
	cateDropDownMenu.innerHTML = '';

	data.forEach((entry) => {
		const dropdownItem = document.createElement('a');
		dropdownItem.className = 'dropdown-item';
		dropdownItem.href = '#';
		dropdownItem.dataset.id = entry._id.toString();
		dropdownItem.textContent = `${entry.name}`;
		cateDropDownMenu.appendChild(dropdownItem);
	});

	setButtonListener();
}

function renderCate(data) {
	const cateDropDown = document.getElementById('child-cate-dropdown');
	cateDropDown.textContent = 'Select category';
	const cateDropDownMenu = cateDropDown.nextElementSibling;
	cateDropDownMenu.innerHTML = '';
	const attributeContainer = document.getElementById('attribute-container');
	attributeContainer.innerHTML = '';

	data.forEach((entry) => {
		const dropdownItem = document.createElement('a');
		dropdownItem.className = 'dropdown-item';
		dropdownItem.href = '#';
		dropdownItem.dataset.id = entry._id.toString();
		dropdownItem.textContent = `${entry.name}`;
		cateDropDownMenu.appendChild(dropdownItem);
	});

	setButtonListener();

	cateDropDownMenu.querySelectorAll('a.dropdown-item').forEach((item) => {
		item.addEventListener('click', () => {
			const selectCategoryId = item.dataset.id;
			cateDropDown.dataset.id = selectCategoryId;
			const category = data.filter((category) => {
				return category._id.toString() === selectCategoryId;
			});
			attributeContainer.innerHTML = '';
			category[0].attribute.forEach((attribute) => {
				const attributeRow = document.createElement('div');
				attributeRow.classList.add('attribute');
				attributeRow.dataset.name = attribute.name;
				attributeRow.setAttribute(
					'style',
					'display: flex; flex-direction: row'
				);
				attributeRow.innerHTML = `'<label for="for" class="col-sm-2 col-form-label col-form-label-sm">${attribute.name}: </label><div class="col-sm-10"><input type="text" class="form-control form-control-sm attributes-value"></div>`;
				attributeContainer.appendChild(attributeRow);
			});
			if (category[0].parentCate !== null) {
				category[0].parentCate.attribute.forEach((attribute) => {
					const attributeRow = document.createElement('div');
					attributeRow.classList.add('pAttribute');
					attributeRow.dataset.name = attribute.name;
					attributeRow.setAttribute(
						'style',
						'display: flex; flex-direction: row'
					);
					attributeRow.innerHTML = `'<label for="for" class="col-sm-2 col-form-label col-form-label-sm">${attribute.name}: </label><div class="col-sm-10"><input type="text" class="form-control form-control-sm pattributes-value"></div>`;
					attributeContainer.appendChild(attributeRow);
				});
			}
			setButtonListener();
		});
	});
}

function setButtonListener() {
	const buttons = document.querySelectorAll('.dropdown-menu a.dropdown-item');
	buttons.forEach((item) => {
		item.addEventListener('click', () => {
			const selectedItem = item;
			const selectedText = selectedItem.textContent;
			const selectedId = selectedItem.dataset.id;

			selectedItem
				.closest('.dropdown')
				.querySelector('button').textContent = selectedText;

			selectedItem
				.closest('.dropdown')
				.querySelector('button')
				.setAttribute('data-id', selectedId);
		});
	});
}

async function getProducts(token, cateId) {
	const requestOptions = {
		method: 'GET',
	};
	const products = await fetch(
		`/protected/getAllCateProduct?token=${token}&&cateId=${cateId}`,
		requestOptions
	);
	const data = await products.json();
	return data.data;
}
async function fetchProduct(token, cateId) {
	const products = await getProducts(token, cateId);
	console.log(products);
	const productsDiv = document.getElementById('products--container');
	products.innerHTML = '';
	let finalContent = '';
	products.forEach((product) => {
		finalContent += `
        <div class="product-content">
            <div>
                <img src="/views/Banana-Single.jpg" alt="">
            </div>
            <div class="product-des--container">
                <div class="name-price--container">
                    <h2>${product.name}</h2>
                    <h2>${product.price}</h2>
                </div>
                <div class="brand-cate--container">
                    <h3>${product.brand}</h3>
                    <h3>${product.category.name}</h3>
                </div>
            </div>
        </div>
    `;
	});
	productsDiv.innerHTML = finalContent;
}

async function fetchChildCategory(token) {
	const requestOptions = {
		method: 'GET',
	};
	const products = await fetch(
		`/protected/getpparentcate?token=${token}`,
		requestOptions
	);
	return await products.json();
}

async function fetchParentCate(token) {
	const requestOptions = {
		method: 'GET',
	};
	const products = await fetch(
		`/protected/getparentcate?token=${token}`,
		requestOptions
	);
	return await products.json();
}

function addAttribute() {
	const attributeContainer = document.getElementById(
		'attribute-container-cate'
	);
	const counter = document.getElementById('modal-cate-button');
	const count = parseInt(counter.dataset.count);
	const attributeRow = document.createElement('div');
	attributeRow.setAttribute('style', 'display: flex; flex-direction: row');
	attributeRow.innerHTML = `'<label for="for" class="col-sm-2 col-form-label col-form-label-sm">Attribute ${
		count + 1
	}</label><div class="col-sm-10"><input type="text" class="form-control form-control-sm attributes" id="attribute-${count}"></div>`;
	attributeContainer.appendChild(attributeRow);
	counter.dataset.count = count + 1;
}
