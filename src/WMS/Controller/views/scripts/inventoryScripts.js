document.addEventListener('DOMContentLoaded', async () => {
	const urlParam = new URLSearchParams(window.location.search);
	const token = urlParam.get('token');

	let data = await renderDisplay(token);

	const transferButton = document.getElementById('transfer-button');
	transferButton.addEventListener('click', () => {
		renderTransferModalDropdown(data);
	});

	const commitPo = document.getElementById('commit-po');
	commitPo.addEventListener('click', async () => {
		try {
			const productId = document.getElementById('po-product-dropdown')
				.dataset.id;
			const quantity = document.getElementById(
				'product-po-quantity'
			).value;

			const requestOptions = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					product: productId,
					quantity: quantity,
				}),
			};

			const res = await fetch(
				`/protected/createpo?token=${token}`,
				requestOptions
			);

			if (res.ok) {
				window.location.href = `/protected/inventoryManagement?token=${token}`;
			}

			if (!response.ok) {
				throw new Error('Error fetching product data');
			}
		} catch (e) {
			console.error(e.message);
		}
	});

	const poButton = document.getElementById('po-button');
	poButton.addEventListener('click', async () => {
		try {
			const requestOptions = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			};
			const res = await fetch(
				`/protected/getproducts?token=${token}`,
				requestOptions
			);
			const products = await res.json();
			renderPOModalDropdown(products);

			if (!response.ok) {
				throw new Error('Error fetching product data');
			}
		} catch (e) {
			console.error(e.message);
		}
	});

	const commitTransferButton = document.getElementById('commit-transfer');
	commitTransferButton.addEventListener('click', async () => {
		try {
			const fromWhId = document.getElementById('from-warehouse-dropdown')
				.dataset.id;
			const toWhId = document.getElementById('to-warehouse-dropdown')
				.dataset.id;
			const productId =
				document.getElementById('product-dropdown').dataset.id;
			const quantity = document.getElementById(
				'product-transfer-quantity'
			).value;

			const requestOptions = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					from: fromWhId,
					to: toWhId,
					product: productId,
					quantity: quantity,
				}),
			};

			const res = await fetch(
				`/protected/transfer?token=${token}`,
				requestOptions
			);

			if (res.ok) {
				window.location.href = `/protected/inventoryManagement?token=${token}`;
			}

			if (!response.ok) {
				throw new Error('Error fetching product data');
			}
		} catch (e) {
			console.error(e.message);
		}
	});
});

function renderPOModalDropdown(data) {
	const poDropDown = document.getElementById('po-product-dropdown');
	poDropDown.textContent = 'Select product';
	const poDropDownMenu = poDropDown.nextElementSibling;
	poDropDownMenu.innerHTML = '';

	data.forEach((entry) => {
		console.log(entry);
		const dropdownItem = document.createElement('a');
		dropdownItem.className = 'dropdown-item';
		dropdownItem.href = '#';
		dropdownItem.dataset.id = entry._id;
		dropdownItem.textContent = `Name: ${entry.name} Brand: ${entry.brand} Category: ${entry.category.name}`;
		poDropDownMenu.appendChild(dropdownItem);
	});

	setButtonListener();
}

function renderTransferModalDropdown(data) {
	const fromWarehouseDropdown = document.getElementById(
		'from-warehouse-dropdown'
	);
	fromWarehouseDropdown.textContent = 'Select warehouse';
	const fromWarehouseMenu = fromWarehouseDropdown.nextElementSibling;
	fromWarehouseMenu.innerHTML = '';
	const toWarehouseDropdown = document.getElementById(
		'to-warehouse-dropdown'
	);
	toWarehouseDropdown.textContent = 'Select warehouse';
	const toWarehouseMenu = toWarehouseDropdown.nextElementSibling;
	toWarehouseMenu.innerHTML = '';
	const productDropdown = document.getElementById('product-dropdown');
	productDropdown.textContent = 'Select product';
	const productMenu = productDropdown.nextElementSibling;
	productMenu.innerHTML = '';
	const quantity = document.getElementById('product-transfer-quantity');
	quantity.setAttribute('min', '0');
	quantity.setAttribute('max', '0');
	quantity.setAttribute('value', '0');
	document.getElementById('quantity-label').textContent = 'Quantity';

	data.forEach((entry) => {
		const dropdownItem = document.createElement('a');
		dropdownItem.className = 'dropdown-item';
		dropdownItem.href = '#';
		dropdownItem.dataset.id = entry.id;
		dropdownItem.textContent = entry.name;
		fromWarehouseMenu.appendChild(dropdownItem);
	});

	setButtonListener();

	fromWarehouseMenu.querySelectorAll('a.dropdown-item').forEach((item) => {
		item.addEventListener('click', () => {
			const selectFromWarehouseId = item.dataset.id;
			toWarehouseMenu.innerHTML = '';
			productMenu.innerHTML = '';
			quantity.setAttribute('min', '0');
			quantity.setAttribute('max', '0');
			quantity.setAttribute('value', '0');
			document.getElementById('quantity-label').textContent = 'Quantity';

			data.forEach((toWarehouse) => {
				if (toWarehouse.id != selectFromWarehouseId) {
					const dropdownItem = document.createElement('a');
					dropdownItem.className = 'dropdown-item';
					dropdownItem.href = '#';
					dropdownItem.dataset.id = toWarehouse.id;
					dropdownItem.textContent = toWarehouse.name;
					toWarehouseMenu.appendChild(dropdownItem);
				}
			});

			const selectedFromWarehouse = data.find((item) => {
				return item.id == selectFromWarehouseId;
			});

			if (selectedFromWarehouse) {
				selectedFromWarehouse.inventory.forEach((product) => {
					const dropdownItem = document.createElement('a');
					dropdownItem.className = 'dropdown-item';
					dropdownItem.href = '#';
					dropdownItem.dataset.id = product.productId;
					dropdownItem.textContent = product.productName;
					productMenu.appendChild(dropdownItem);

					dropdownItem.addEventListener('click', () => {
						document.getElementById(
							'quantity-label'
						).textContent = `Quantity (Max: ${product.quantity})`;
						quantity.setAttribute('max', product.quantity);
					});
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

async function getwhInvent(token, searchString) {
	try {
		const requestOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ search: searchString }),
		};
		const res = await fetch(
			`/protected/displayInvent?token=${token}`,
			requestOptions
		);
		return await res.json();

		if (!response.ok) {
			throw new Error('Error fetching product data');
		}
	} catch (e) {}
}

async function renderDisplay(token, searchString = null) {
	const whInventList = await getwhInvent(token, searchString);
	const inventoryContainer = document.getElementById('inventory-container');

	whInventList.forEach((warehouse) => {
		const inventory = warehouse.inventory;

		const warehouseRow = document.createElement('tr');
		warehouseRow.classList.add('inventory-row');
		warehouseRow.innerHTML = `<td>${warehouse.name}</td><td>${warehouse.address}</td><td>${warehouse.fillVolume}</td><td>${warehouse.volume}</td>`;
		inventoryContainer.appendChild(warehouseRow);

		const hiddenRow = createHiddenContainer(inventory);

		inventoryContainer.appendChild(hiddenRow);
	});
	const inventoryRows = document.querySelectorAll('.inventory-row');
	inventoryRows.forEach((row) => {
		row.addEventListener('click', () => {
			const hiddenRow = row.nextElementSibling;
			hiddenRow.classList.toggle('hidden-row');
		});
	});
	return whInventList;
}

function createHiddenContainer(inventory) {
	const hiddenRow = document.createElement('tr');
	hiddenRow.classList.add('hidden-row');

	const hiddenCell = document.createElement('td');
	hiddenCell.setAttribute('colspan', '5');

	const inventoryTable = document.createElement('table');
	inventoryTable.classList.add('table', 'table-hover');

	const headerContainer = document.createElement('thread');
	headerContainer.classList.add('hidden-header');
	const headerRow = createHiddenHeader();
	headerContainer.appendChild(headerRow);

	const bodyRow = document.createElement('tbody');

	inventory.forEach((product) => {
		const productRow = document.createElement('tr');
		productRow.innerHTML = `<td>${product.productName}</td><td>${product.category}</td><td>W: ${product.size.width}, H: ${product.size.height}, L: ${product.size.length}</td><td>${product.quantity}</td>`;
		bodyRow.appendChild(productRow);
	});
	inventoryTable.appendChild(headerContainer);
	inventoryTable.appendChild(bodyRow);
	hiddenCell.appendChild(inventoryTable);
	hiddenRow.appendChild(hiddenCell);
	return hiddenRow;
}

function createHiddenHeader() {
	const headerRow = document.createElement('tr');
	headerRow.classList.add('header');
	headerRow.innerHTML =
		'<th>Product Name</th><th>Product category</th><th>Product Size</th><th>Quantity</th>';

	return headerRow;
}
