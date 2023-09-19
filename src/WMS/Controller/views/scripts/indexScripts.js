document.addEventListener('DOMContentLoaded', async () => {
	const urlParam = new URLSearchParams(window.location.search);
	const token = urlParam.get('token');
	await renderDisplay(token);

	document
		.getElementById('search-button')
		.addEventListener('click', async (event) => {
			event.preventDefault();
			clearTableDisplay();
			await renderDisplay(token, $('#search-value').val());
		});

	const createModal = document.getElementById('createModal');
	const commitButton = document.getElementById('commit-create');
	commitButton.addEventListener('click', async () => {
		try {
			const requestOptions = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					warehouse: {
						name: createModal.querySelector('#create-name').value,
						address:
							createModal.querySelector('#create-address').value,
						city: createModal.querySelector('#create-city').value,
						province:
							createModal.querySelector('#create-province').value,
						volume: createModal.querySelector('#create-volume')
							.value,
					},
				}),
			};
			const res = await fetch(
				`/protected/createwarehouse?token=${token}`,
				requestOptions
			);
			const response = await res;
			if (response.ok) {
				clearTableDisplay();
				await renderDisplay(token);
				createModal.querySelector('#createModalLabel').textContent =
					'Create warehouse success';
			} else {
				createModal.querySelector('#createModalLabel').textContent =
					'Create unsuccessful. User doesnt have permission to create warehouse';
			}
		} catch (e) {
			console.error(e.message);
		}
	});

	const deleteButtons = document.querySelectorAll('.delete-warehouse');
	deleteButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const modal = document.getElementById('deleteModal');
			modal.querySelector('#deleteModalLabel').textContent =
				'Confirm delete warehouse';
			const id = button.getAttribute('data-id');
			const fillVolume = button.getAttribute('data-fill');
			const commitButton = document.getElementById('commit-delete');
			commitButton.addEventListener('click', async () => {
				try {
					const requestOptions = {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							id: id,
						}),
					};
					if (fillVolume > 0) {
						console.log(fillVolume);
						modal.querySelector('#deleteModalLabel').textContent =
							'Delete warehouse fail, warehouse not empty';
					} else {
						const res = await fetch(
							`/protected/deletewarehouse?token=${token}`,
							requestOptions
						);
						if (await res.ok) {
							clearTableDisplay();
							await renderDisplay(token);
							modal.querySelector(
								'#deleteModalLabel'
							).textContent = 'delete warehouse success';
						} else {
							modal.querySelector(
								'#deleteModalLabel'
							).textContent =
								'User doesnt have permission to delete';
						}
					}
				} catch (e) {
					console.error(e.message);
				}
			});
		});
	});

	const updateButtons = document.querySelectorAll('.update-warehouse');

	updateButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const modal = document.getElementById('updateModal');
			modal.querySelector('#updateModalLabel').textContent =
				'Update warehouse';
			const name = button.getAttribute('data-name');
			const address = button.getAttribute('data-address');
			const province = button.getAttribute('data-province');
			const city = button.getAttribute('data-city');
			const id = button.getAttribute('data-id');
			const volume = button.getAttribute('data-volume');

			modal.querySelector('#edit-name').value = name;
			modal.querySelector('#edit-address').value = address;
			modal.querySelector('#edit-province').value = province;
			modal.querySelector('#edit-city').value = city;

			const commitButton = document.getElementById('commit-update');
			commitButton.addEventListener('click', async () => {
				try {
					const requestOptions = {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							warehouse: {
								name: modal.querySelector('#edit-name').value,
								address:
									modal.querySelector('#edit-address').value,
								city: modal.querySelector('#edit-city').value,
								province:
									modal.querySelector('#edit-province').value,
								volume: volume,
								id: id,
							},
						}),
					};
					const res = await fetch(
						`/protected/updatewarehouse?token=${token}`,
						requestOptions
					);
					if (await res.ok) {
						clearTableDisplay();
						await renderDisplay(token);
						modal.querySelector('#updateModalLabel').textContent =
							'Update warehouse sucess';
					} else {
						modal.querySelector('#updateModalLabel').textContent =
							'user doesnt have permission to edit warehouse';
					}
				} catch (e) {
					console.error(e.message);
				}
			});
		});
	});
});

async function getWarehouse(token, searchDetail) {
	try {
		const requestOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ search: searchDetail }),
		};
		const res = await fetch(`/protected/?token=${token}`, requestOptions);
		return await res.json();
	} catch (e) {}
}

function clearTableDisplay() {
	const table = document.getElementById('myTable');
	while (table.firstChild) {
		table.removeChild(table.firstChild);
	}
}

async function renderDisplay(token, searchDetail = null) {
	const whData = await getWarehouse(token, searchDetail);
	const table = document.getElementById('myTable');
	const tableHeader = document.createElement('tr');
	tableHeader.classList.add('header');
	const headers = ['Name', 'Address', 'City', 'Province', 'Volume', 'Action'];
	for (const i in 3) {
		const column = document.createElement('col');
		column.setAttribute('width', '20%');
		tableHeader.appendChild(column);
	}
	for (const i in 3) {
		const column = document.createElement('col');
		column.setAttribute('width', '20px');
		tableHeader.appendChild(column);
	}

	headers.forEach((header) => {
		const h = document.createElement('th');
		h.textContent = header;
		tableHeader.appendChild(h);
	});

	table.appendChild(tableHeader);

	whData.forEach((warehouse) => {
		const table_row = document.createElement('tr');
		table_row.id = `${warehouse.id}`;

		const whName = document.createElement('td');
		whName.innerText = `${warehouse.name}`;

		const whAddress = document.createElement('td');
		whAddress.innerText = `${warehouse.address}`;

		const whCity = document.createElement('td');
		whCity.innerText = `${warehouse.city}`;

		const whProvince = document.createElement('td');
		whProvince.innerText = `${warehouse.province}`;

		const whVolume = document.createElement('td');
		whVolume.innerText = `${warehouse.fillVolume}/${warehouse.volume}`;

		const whModify = document.createElement('td');
		whModify.innerHTML += `<button type="button" class="btn btn-primary btn-sm update-warehouse" data-toggle="modal" data-target="#updateModal" data-id="${warehouse.id}" data-name="${warehouse.name}" data-address=" ${warehouse.address}" data-city=" ${warehouse.city}" data-province=" ${warehouse.province}" data-volume ="${warehouse.volume}">Update</button>`;

		whModify.innerHTML += `<button type="button" class="btn btn-primary btn-sm btn-danger delete-warehouse" data-toggle="modal" data-target="#deleteModal" data-id="${warehouse.id}" data-fill="${warehouse.fillVolume}">Delete</button>`;

		table_row.append(
			whName,
			whAddress,
			whCity,
			whProvince,
			whVolume,
			whModify
		);
		table.appendChild(table_row);
	});
}
