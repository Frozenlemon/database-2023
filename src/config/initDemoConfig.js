const { initMongoDB, enableAccess } = require('./mongodb/config');
const { populateData } = require('./PopulateDemo');
async function main() {
	try {
		await initMongoDB();
		await populateData();
		await enableAccess();
	} catch (e) {
		console.error('Error occured', e);
	}
}

main();
