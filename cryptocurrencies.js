const getCryptoCurrencies = require('./controllers/getCryptoCurrencies');
const getCryptoCurrency = require('./controllers/getCryptoCurrencyData').getCryptoCurrencyData;
const miscUtils = require('./utils/misc');
const {
	getResponse
} = miscUtils;

// eslint-disable-next-line import/prefer-default-export
export const cryptocurrencies = (event, context, cb) => {
	let data;
	if (!event.pathParameters) {
		data = getCryptoCurrencies();
	} else {
		const id = event.pathParameters.id;
		data = getCryptoCurrency(id);
	}

	data
		.then((data) => cb(null, getResponse(data, event)) )
		.catch(e => cb(e));
};
