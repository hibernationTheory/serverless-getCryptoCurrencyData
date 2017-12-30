const MongoClient = require('mongodb').MongoClient;

function getTrackedCryptoCurrencyData(mongoUrl) {
	let client;
	let collection;

	return result = MongoClient.connect(mongoUrl)
		.then((_client) => {
			client = _client;
			const db = _client.db('project-webtask-cryptocurrency');
			return db.createCollection('cryptocurrencies');
		})
		.then((_collection) => {
			collection = _collection;
			return collection.find({}).toArray();
		})
		.then((collectionData) => {
			client.close();

			return collectionData
				.filter((data) => !!data)
				.filter((data) => data.symbol);
		});
};

module.exports = getTrackedCryptoCurrencyData;