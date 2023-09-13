const params = new URLSearchParams(window.location.search);
const productId = params.get('productId');

async function fetchProduct() {
	try {
		const requestOptions = {
			method: 'GET',
		};
		const res = await fetch(
			`/protected/product/${productId}`,
			requestOptions
		);
		const result = await res.json();
		return result.product;
	} catch (error) {
		console.error('Error sending POST request:', error);
	}
}

function renderDetail(productData) {
	console.log(productData);
	const img_showcase = document.getElementById('img-showcase');

	const img = document.createElement('img');
	img.src = `${productData.image}`;
	img_showcase.appendChild(img);

	const productTitle = document.getElementById('product-title');
	productTitle.innerHTML = `${productData.name}`;

	const price = document.getElementById('price');
	price.innerHTML = `Price: <span>$${productData.price}</span>`;

	let productAttributesHTML = '';
	for (const attributeName in productData.attribute) {
		if (productData.attribute.hasOwnProperty(attributeName)) {
			const attributeValue = productData.attribute[attributeName];
			productAttributesHTML += `<span style='font-weight: bold; margin-left: 20px;'>${attributeName}: </span><span>${attributeValue}</span><br/>`;
		}
	}
	for (const attributeName in productData.pAttribute) {
		if (productData.pAttribute.hasOwnProperty(attributeName)) {
			const attributeValue = productData.pAttribute[attributeName];
			productAttributesHTML += `<span style='font-weight: bold; margin-left: 20px;'>${attributeName}: </span><span>${attributeValue}</span><br/>`;
		}
	}

	const productDetailList = document.getElementById('product-detail-list');
	const productDetailHTML = `
		<li>Brand: <span>${productData.brand}</span></li>
		<li>Color: <span>${productData.color}</span></li>
		<li>Dimension: <span>Width: ${productData.dimension.width}m\tHeight: ${productData.dimension.height}m\tLength: ${productData.dimension.length}m</span></li>
		<li>Category: <span>${productData.category.name}</span></li>
		<li>Attributes:<br>${productAttributesHTML}</li>
`;
	let productDetail = document.createElement('li');
	productDetail.innerHTML = productDetailHTML;
	productDetailList.appendChild(productDetail);
}

async function addToCart(url, req) {
	try {
		const requestOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(req),
		};
		const response = await fetch(url, requestOptions);
	} catch (e) {
		console.error(e.message);
	}
}

$(document).ready(async () => {
	try {
		const data = await fetchProduct();
		renderDetail(data);
		document
			.getElementById('add-cart-button')
			.addEventListener('click', async (event) => {
				event.preventDefault();
			});
	} catch (e) {
		console.error(e);
	}
});
