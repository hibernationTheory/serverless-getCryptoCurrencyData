const axios = require('axios');
const moment = require('moment-timezone');
var Promise = require('bluebird');

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
* getCryptoCompareSocialData gets the social data for the given coin.
*/
function getCryptoCompareSocialData(id) {
	const base = `https://www.cryptocompare.com/api/data/socialstats/`;
	const url = `${base}?id=${id}`;

	return axios.get(url)
		.then(function (response) {
			if (response.status !== 200) {
				throw new Error(response.statusText);
			}

			if (response.data.Response === 'Error') {
				throw new Error(response.data.Message);
			}

			return response.data;
		})
		.then((_data) => {
			const data = _data.Data;

			const socialData = {
				socialData: {
					twitter: {
						followers: data.Twitter.followers,
					},
					reddit: {
						subscribers: data.Reddit.subscribers,
						activeUsers: data.Reddit.active_users,
					}
				}
			};

			return socialData;
		});
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

			if (response.data.Response === 'Error') {
				throw new Error(response.data.Message);
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
					high: parseFloat(findMax(day1, 'high').toFixed(3)),
					low: parseFloat(findMin(day1, 'low').toFixed(3)),
				},
				day7: {
					high: parseFloat(findMax(day7, 'high').toFixed(3)),
					low: parseFloat(findMin(day7, 'low').toFixed(3)),
				},
				day30: {
					high: parseFloat(findMax(day30, 'high').toFixed(3)),
					low: parseFloat(findMin(day30, 'low').toFixed(3))
				}
			};

			const smaData = {
				day7: parseFloat(sma(day7).toFixed(3)),
				day30: parseFloat(sma(day30).toFixed(3)),
			}

			return {
				histoDay: {
					data: data,
					sma: smaData,
					highLow: highLowData
				},
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
* getCryptoCompareHistoMinute gets the high and low price for last 24 hrs
*/
function getCryptoCompareHistoMinute(symbol) {
	const base = `https://min-api.cryptocompare.com/data/histominute`;
	const url = `${base}?fsym=${symbol}&tsym=USD`;

	return axios.get(url)
		.then(function (response) {
			if (response.status !== 200) {
				throw new Error(response.statusText);
			}

			if (response.data.Response === 'Error') {
				throw new Error(response.data.Message);
			}

			return response.data;
		})
		.then((_data) => {
			let data = _data.Data;

			const hour1 = data.slice(data.length-60, data.length);
			const hour12 = data.slice(data.length-60*12, data.length);
			const hour24 = data.slice(data.length-60*24, data.length);

			const highLowData = {
				hour1: {
					high: parseFloat(findMax(hour1, 'high').toFixed(3)),
					low: parseFloat(findMin(hour1, 'low').toFixed(3)),
				},
				hour12: {
					high: parseFloat(findMax(hour12, 'high').toFixed(3)),
					low: parseFloat(findMin(hour12, 'low').toFixed(3)),
				},
				hour24: {
					high: parseFloat(findMax(hour24, 'high').toFixed(3)),
					low: parseFloat(findMin(hour24, 'low').toFixed(3))
				}
			};

			const smaData = {
				hour1: parseFloat(sma(hour1).toFixed(3)),
				hour12: parseFloat(sma(hour12).toFixed(3)),
				hour24: parseFloat(sma(hour24).toFixed(3)),
			}

			return {
				histoMinData: {
					data: data,
					sma: smaData,
					highLow: highLowData,
				}
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
				name: id,
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
function getCryptoCurrencyData(currencyData, delayAmount = 100) {
	let data = {};

	return getCoinMarketCapData(currencyData.name)
		.then((_data) => {
			if (_data.error) {
				return _data;
			}

			data = Object.assign({}, data, _data);

			return data;
			// return getCryptoCompareHistoDay(data.symbol);
		})
		// TODO : hitting the API too much. Will find a different way of tackling these.
		// // add a bit of a delay.
		// .then((_data) => {
		// 	return delay(delayAmount)
		// 		.then(() => {
		// 			return _data;
		// 		});
		// })
		// .then((_data) => {
		// 	if (_data.error) {
		// 		return _data;
		// 	}

		// 	data = Object.assign({}, data, _data);
		// 	return getCryptoCompareHistoMinute(data.symbol);
		// })
		// // add a bit of a delay.
		// .then((_data) => {
		// 	return delay(delayAmount)
		// 		.then(() => {
		// 			return _data;
		// 		});
		// })
		// .then((_data) => {
		// 	if (_data.error) {
		// 		return _data;
		// 	}

		// 	data = Object.assign({}, data, _data);
		// 	return getCryptoCompareSocialData(currencyData.cryptoCompareData.Id);
		// })
		.then((_data) => {
			const result = Object.assign({}, data, _data);

			return result;
		});
}

function getCryptoCurrencyDataForMultiple(currencies, delayAmount=250, concurrency=1) {
	const promises = currencies.map((currency) => {
		return getCryptoCurrencyData(currency);
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