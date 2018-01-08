var Promise = require('bluebird');
const MongoClient = require('mongodb').MongoClient;

const getCryptoCurrencies = require('./controllers/getCryptoCurrencies');
const getCryptoCurrencyDataForMultiple = require('./controllers/getCryptoCurrencyData').getCryptoCurrencyDataForMultiple;
const insertOrUpdateCryptoCurrencyData = require('./controllers/insertOrUpdateCryptoCurrencyData');
const miscUtils = require('./utils/misc');
const { 
	getResponse
} = miscUtils;

// eslint-disable-next-line import/prefer-default-export
export const updateDatabase = (event, context, cb) => {
	let client;
	let collection;

	const MONGODB_URL = process.env.MONGODB_URL;

	const result = MongoClient.connect(MONGODB_URL)
		.then((_client) => {
			client = _client;
			const db = _client.db('project-webtask-cryptocurrency');
			return db.createCollection('cryptocurrencies');
		})
		.then((_collection) => {
			collection = _collection;
			return getCryptoCurrencies();
		})
		.then((currencies) => {
			return getCryptoCurrencyDataForMultiple(currencies);
		})
		.then((allCurrenciesData) => {
			return Promise.map(allCurrenciesData, (data) => {
				if (!data) {
					return null;
				}

				return insertOrUpdateCryptoCurrencyData(collection, data);
			}, 
			{
				concurrency: 1
			})
		})
		.then((result) => {
			client.close();
			return result;
		})
		.catch((err) => {
			return err;
		})

	result
		.then((data) => cb(null, getResponse(data, event)) )
		.catch(e => cb(e));
};
