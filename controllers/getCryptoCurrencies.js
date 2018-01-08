const currencies = require('../data/cryptoCurrencyList.json');

module.exports = () => {
	return new Promise((resolve) => {
		resolve(currencies);
	})
};