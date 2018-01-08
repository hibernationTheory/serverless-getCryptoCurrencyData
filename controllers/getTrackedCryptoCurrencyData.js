const MongoClient = require('mongodb').MongoClient;

const getCryptoCurrencies = require('./getCryptoCurrencies');

function getTrackedCryptoCurrencyData(mongoUrl) {
	let client;
	let collection;
	let collectionData;

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
		.then((_collectionData) => {
			client.close();

			collectionData = _collectionData
				.filter((data) => !!data)
				.filter((data) => data.symbol);

			return getCryptoCurrencies();
		})
		// filter those that are not in the current list
		.then((cryptoCurrencies) => {
			const result = [];

			const cryptoCurrencyNames = cryptoCurrencies.map((currency) => {
				return currency.name;
			});

			collectionData.forEach((item) => {
				if (cryptoCurrencyNames.includes(item.name)) {
					result.push(item);
				}
			});

			return result;
		});
};

module.exports = getTrackedCryptoCurrencyData;