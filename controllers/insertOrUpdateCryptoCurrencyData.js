const miscUtils = require('../utils/misc');
const { 
	percentDifferenceBeyondThreshold,
	percentDifferenceWithinThreshold
} = miscUtils;

function checkIfCurrentPriceIsNearHighOrLow(data) {
	// see if the current price in the vicinity of the high and low price from
	// last 7 and 30 days.
	if (
		percentDifferenceWithinThreshold(
			data.highLow.day7.high,
			data.price,
			20
		)
	) {
		data.flags.day7HighFlag = true;
	}

	if (
		percentDifferenceWithinThreshold(
			data.highLow.day7.low,
			data.price,
			30
		)
	) {
		data.flags.day7LowFlag = true;
	}

	if (
		percentDifferenceWithinThreshold(
			data.highLow.day30.high,
			data.price,
			20
		)
	) {
		data.flags.day30HighFlag = true;
	}

	if (
		percentDifferenceWithinThreshold(
			data.highLow.day30.low,
			data.price,
			30
		)
	) {
		data.flags.day30LowFlag = true;
	}

	return data;
}

function insertCryptoCurrencyData(collection, data) {
	let defaultData = {
		symbol: data.symbol,
		lastUpdated: Date.now(),
		milestonePrice: data.price,
		milestonePreviousPrice: data.price,
		milestonePriceDate: Date.now(),
		milestoneVolume: data.volume24h,
		milestonePreviousVolume: data.volume24h,
		milestoneVolumeDate: Date.now(),
		flags: {
			priceFlag: false,
			volumeFlag: false,
			day7HighFlag: false,
			day7LowFlag: false,
			day30HighFlag: false,
			day30LowFlag: false,
		},
	};
	let createData = Object.assign({}, defaultData, data);

	return collection.insert(createData);
}

function insertOrUpdateCryptoCurrencyData(collection, data) {
	return collection.findOne({ symbol: data.symbol })
		.then((result) => {
			if (!result) {
				return insertCryptoCurrencyData(collection, data);
			}

			let updateData = Object.assign({}, result, data);
			updateData.lastUpdated = Date.now();
			// set all the flags to false;
			Object.keys(updateData.flags).forEach((key) => {
				updateData.flags[key] = false;
			});
		
			if (
				percentDifferenceBeyondThreshold(
					updateData.milestonePrice,
					updateData.price,
					5
				)
			) {
				updateData.milestonePreviousPrice = updateData.milestonePrice;
				updateData.milestonePrice = data.price;
				updateData.milestonePriceDate = Date.now();
				updateData.flags.priceFlag = true;
			}

			if (
				percentDifferenceBeyondThreshold(
					updateData.milestoneVolume,
					updateData.volume24h,
					10
				)
			) {
				updateData.milestonePreviousVolume = updateData.milestoneVolume;
				updateData.milestoneVolume = data.volume24h;
				updateData.milestoneVolumeDate = Date.now();
				updateData.flags.volumeFlag = true;
			}

			// for backwards compatibility. if the data didn't have milestonePrevious from before
			if (!updateData.milestonePreviousVolume) {
				updateData.milestonePreviousVolume = data.price;
			}
			if (!updateData.milestonePreviousPrice) {
				updateData.milestonePreviousVolume = data.volume24h;
			}

			updateData = checkIfCurrentPriceIsNearHighOrLow(updateData);

			return collection.update({ symbol: data.symbol }, updateData);
		});
}

module.exports = insertOrUpdateCryptoCurrencyData;