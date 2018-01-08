var Promise = require('bluebird');
const axios = require('axios');

const miscUtils = require('../utils/misc');
const {
	writeFile
} = miscUtils;

const cryptoCurrencyNameList = require('./cryptoCurrencyNameList')();

function getSymbolsForCoinMarketCapName(coinMarketCapId) {
	const base = `https://api.coinmarketcap.com`;
	const url = `${base}/v1/ticker/${coinMarketCapId}`;

	return axios.get(url)
		.then(function (response) {
			// get the data from the api

			if (response.status !== 200) {
				throw new Error(response.statusText);
			}

			return response.data[0];
		})
		.then((data) => {
			return {
				name: coinMarketCapId,
				symbol: data.symbol,
			};
		})
		.catch((error) => {
			console.log('error getting coinmarketcap data for', coinMarketCapId);
			console.log(error.message);

			return {
				error: error.message,
			};
		});
}

function getCryptoCompareCoinList() {
	const url = 'https://www.cryptocompare.com/api/data/coinlist/';

	return axios.get(url)
		.then(function (response) {
			if (response.status !== 200) {
				throw new Error(response.statusText);
			}

			return response.data;
		})
}

function main() {
	let cryptoCompareCoinList;

	return getCryptoCompareCoinList()
		.then((listData) => {
			cryptoCompareCoinList = listData.Data;

			return Promise.map(cryptoCurrencyNameList, (currencyName) => {
				return getSymbolsForCoinMarketCapName(currencyName);
			},
			{
				concurrency: 1,
			})
		})
		.then((currencyData) => {
			return currencyData.map((item) => {
				const cryptoCompareData = cryptoCompareCoinList[item.symbol];
				item.cryptoCompareData = cryptoCompareData;

				return item;
			});
		})
		.then((augmentedData) => {
			return writeFile(__dirname + '/cryptoCurrencyList.json', JSON.stringify(augmentedData, null, 2));
		})
		.catch((err) => {
			return err;
		});
};

main()
	.then((result) => { console.log(result) });
