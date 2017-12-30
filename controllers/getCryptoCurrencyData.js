const axios = require('axios');
const moment = require('moment-timezone');

const miscUtils = require('../utils/misc');
const {
	delay,
	findMax,
	findMin
} = miscUtils;

/**
* Calculate simple moving average.
*/
function sma(data) {
	const sum = data.reduce((acc, curr) => {
		return acc + (curr.high + curr.low)/2
	}, 0);

	return sum/data.length;
}

/**
* getCryptoCompareHistoDay gets the high and low price for last 1, 7, 30 days.
*/
function getCryptoCompareHistoDay(symbol) {
	const base = `https://min-api.cryptocompare.com/data/histoday`;
	const url = `${base}?fsym=${symbol}&tsym=USD&limit=30`;

	return axios.get(url)
		.then(function (response) {
			if (response.status !== 200) {
				throw new Error(response.statusText);
			}

			return response.data;
		})
		.then((_data) => {
			let data = _data.Data;

			const day1 = data.slice(-1);
			const day7 = data.slice(data.length-7, data.length);
			const day30 = data.slice(data.length-30, data.length);

			const highLowData = {
				day1: {
					high: findMax(day1, 'high'),
					low: findMin(day1, 'low'),
				},
				day7: {
					high: findMax(day7, 'high'),
					low: findMin(day7, 'low'),
				},
				day30: {
					high: findMax(day30, 'high'),
					low: findMin(day30, 'low')
				}
			};

			const smaData = {
				day7: sma(day7),
				day30: sma(day30),
			}

			return {
				sma: smaData,
				highLow: highLowData,
			};
		})
		.catch((error) => {
			console.log('error getting cryptocompare data for ', symbol);
			console.log(error.message);

			return {
				error: error.message,
			};
		});
}

/**
* getCoinMarketCapData gets the coinmarketcap data for the given currency id
*/
function getCoinMarketCapData(id) {
	const base = `https://api.coinmarketcap.com`;
	const url = `${base}/v1/ticker/${id}`;

	return axios.get(url)
		.then(function (response) {
			// get the data from the api

			if (response.status !== 200) {
				throw new Error(response.statusText);
			}

			return response.data[0];
		})
		.then((data) => {
			// parse the api data
			const price = parseFloat(data.price_usd);
			const percentChange1h = parseFloat(data.percent_change_1h);
			const percentChange24h = parseFloat(data.percent_change_24h);
			const percentChange7d = parseFloat(data.percent_change_7d);
			const price1h = price + (price * -(percentChange1h / 100));
			const price24h = price + (price * -(percentChange24h / 100));
			const price7d = price + (price * -(percentChange7d / 100));
			const volume24h = parseInt(data['24h_volume_usd'], 10);
			const lastUpdated = Date.now();
			const lastUpdatedApi = parseFloat(data.last_updated, 10) * 1000;
			const time = moment(lastUpdatedApi).tz('Etc/GMT+5').format('hh:mm a');

			return {
				change1h: parseFloat(percentChange1h.toFixed(2)),
				change24h: parseFloat(percentChange24h.toFixed(2)),
				change7d: parseFloat(percentChange7d.toFixed(2)),
				lastUpdated,
				lastUpdatedApi,
				price,
				price1h: parseFloat(price1h.toFixed(3)),
				price24h: parseFloat(price24h.toFixed(3)),
				price7d: parseFloat(price7d.toFixed(3)),
				symbol: data.symbol,
				time,
				volume24h,
			};
		})
		.catch((error) => {
			console.log('error getting coinmarketcap data for', id);
			console.log(error.message);

			return {
				error: error.message,
			};
		});
}

/**
* getCryptoCurrencyData gets desired data from cryptocompare and coinmarketcap
*/
function getCryptoCurrencyData(coinmarketcapId) {
	let data = {};

	return getCoinMarketCapData(coinmarketcapId)
		.then((_data) => {
			if (data.error) {
				return data;
			}

			data = _data;
			return getCryptoCompareHistoDay(data.symbol);
		})
		.then((_data) => {
			let result = Object.assign({}, data, _data);

			return result;
		})
}

function getCryptoCurrencyDataForMultiple(currencies, delayAmount, concurrency) {
	const promises = currencies.map((currency) => {
		return getCryptoCurrency(currency);
	});

	return Promise.map(
		promises, (currencyData) => {
			if (!currencyData || currencyData.error) {
				return null;
			}

			return delay(delayAmount)
				.then(() => {
					return currencyData;
				})
		},
		{
			concurrency: concurrency
		});
}

module.exports = {
	getCryptoCurrencyData,
	getCryptoCurrencyDataForMultiple
};
