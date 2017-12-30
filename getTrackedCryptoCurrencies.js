const MongoClient = require('mongodb').MongoClient;

const getTrackedCryptoCurrencyData = require('./controllers/getTrackedCryptoCurrencyData');
const miscUtils = require('./utils/misc');
const { 
	getResponse
} = miscUtils;

// eslint-disable-next-line import/prefer-default-export
export const getTrackedCryptoCurrencies = (event, context, cb) => {
	let client;
	let collection;

	const MONGODB_URL = process.env.MONGODB_URL;
	
	const result = getTrackedCryptoCurrencyData(MONGODB_URL)

	result
		.then((data) => cb(null, getResponse(data, event)) )
		.catch(e => cb(e));
};
