const axios = require('axios');

const miscUtils = require('./utils/misc');
const getTrackedCryptoCurrencyData = require('./controllers/getTrackedCryptoCurrencyData');
const { 
	getPercentDifference,
	getResponse
} = miscUtils;

/**
* parseCurrencyData parses the given api data to human readable text.
*/
function parseCurrencyData(data) {
	const { 
		error,
		flags,
		histoDay,
		milestonePreviousPrice,
		milestonePreviousVolume,
		price,
		price24h,
		symbol,
		time,
		volume24h,
	} = data;

	if (error) {
		return error;
	}

	let message = '';
	let highLowPercentDiff;
	let pricePercentDiff;
	let priceVolumeDiff;

	if (flags.priceFlag) {
		pricePercentDiff = parseInt(getPercentDifference(milestonePreviousPrice, price), 10);
		message += `Price % ${pricePercentDiff} (fr:${milestonePreviousPrice} to:${price}) |\n`
	}
	if (flags.volumeFlag) {
		priceVolumeDiff = parseInt(getPercentDifference(milestonePreviousVolume, volume24h), 10);
		message += `Volume % ${priceVolumeDiff} (fr:${milestonePreviousVolume} to:${volume24h}) |\n`
	}
	// TODO : disabling until highLow can be reliably fetched
	// if (flags.day7HighFlag) {
	// 	highLowPercentDiff = parseInt(getPercentDifference(histoDay.highLow.day7.high, price), 10);
	// 	message += `${highLowPercentDiff}% Near Day 7 High of ${histoDay.highLow.day7.high} |\n`
	// }
	// if (flags.day7LowFlag) {
	// 	highLowPercentDiff = parseInt(getPercentDifference(histoDay.highLow.day7.low, price), 10);
	// 	message += `${highLowPercentDiff}% Near Day 7 Low of ${histoDay.highLow.day7.low} |\n`
	// }
	// if (flags.day30HighFlag) {
	// 	highLowPercentDiff = parseInt(getPercentDifference(histoDay.highLow.day30.high, price), 10);
	// 	message += `${highLowPercentDiff}% Near Day 30 High of ${histoDay.highLow.day30.high} |\n`
	// }
	// if (flags.day30LowFlag) {
	// 	highLowPercentDiff = parseInt(getPercentDifference(histoDay.highLow.day30.low, price), 10);
	// 	message += `${highLowPercentDiff}% Near Day 30 Low of ${histoDay.highLow.day30.low} |\n`
	// }

	let content = `${symbol} Price: ${price} @ ${time}:\n`;
	content += '---------------------------\n';
	content += `${message}`
	content += `24h Price %: ${parseInt(getPercentDifference(price24h, price), 10)} |\n`;
	// TODO : disabling until highLow can be reliably fetched
	// content += `% from 30d High: ${parseInt(getPercentDifference(histoDay.highLow.day30.high, price), 10)} |\n`;

	let prefix = '#########################\n';
	let suffix = '#########################\n';
	content = prefix + content;
	content = content + suffix;
	
	return content;
}

function sendEmail(config) {
	const { from, to, subject, content } = config;
	const url = process.env.SEND_EMAIL_ENDPOINT;

	return axios.post(url, {
		from_email: from,
		to_email: to,
		subject,
		content,
	})
	.then(function (response) {
		// get the data from the api

		if (response.status !== 200) {
			throw new Error(response.statusText);
		}

		return response.data.content;
	})
	.catch((error) => {
		console.log(error);
	});
}

// eslint-disable-next-line import/prefer-default-export
export const sendUpdateNotification = (event, context, cb) => {
	const MONGODB_URL = process.env.MONGODB_URL;

	const result = getTrackedCryptoCurrencyData(MONGODB_URL)
		.then((collectionData) => {
			const messages = collectionData
				.filter((data) => data.flags.priceFlag || data.flags.volumeFlag )
				.map((data) => {
					return parseCurrencyData(data);
				});

			return messages;
		})
		.then((messageArray) => {
			if (messageArray.length === 0) {
				return null;
			}

			const message = messageArray.join('\n\n');
			console.log(message);

			return sendEmail({
				from: 'hibernationtheory@gmail.com',
				to: 'hibernationtheory.notify@gmail.com',
				subject: 'coin update',
				content: message,
			});
		});

	result
		.then((data) => cb(null, getResponse(data, event)) )
		.catch(e => cb(e));
};
