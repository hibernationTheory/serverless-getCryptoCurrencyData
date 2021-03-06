const fs = require('fs');


function delay(amount) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(true);
		}, amount);
	});
}

function findMax(arr, property) {
	let max = arr.reduce((acc, curr) => {
		if (!curr) {
			return 0;
		}

		if (curr[property] > acc) {
			return curr[property]
		}

		return acc;
	}, 0);

	return max;
}

function findMin(arr, property) {
	let min = arr.reduce((acc, curr) => {
		if (!curr) {
			return 0;
		}

		if (curr[property] < acc) {
			return curr[property]
		}

		return acc;
	}, 0);

	return min;
}

function getPercentDifference(prev, curr) {
	const diff = curr-prev;
	const change = diff * 100 / prev;

	return change;
}

function getResponse(data, event) {
	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin' : '*', // Required for CORS support to work
		},
		body: JSON.stringify({
			data: data,
			input: event,
		}),
	};
}

function percentDifferenceBeyondThreshold(prev, curr, threshold) {
	// checks to see if the percentile difference in between two values
	// are beyond the given threshold
	if (prev === undefined || curr === undefined) {
		return false;
	}

	const diff = Math.abs(curr-prev);
	const change = diff * 100 / prev;

	if ((change - threshold) >= 0) {
		return true;
	}

	return false;
}

function percentDifferenceWithinThreshold(prev, curr, threshold) {
	// checks to see if the percentile difference in between two values
	// are within the given threshold
	if (prev === undefined || curr === undefined) {
		return false;
	}

	const diff = Math.abs(curr-prev);
	const change = diff * 100 / prev;

	if (change <= threshold) {
		return true;
	}

	return false;
}

function writeFile(path, data) {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, data, (err) => {
			if (err) {
				throw err;
			}
			resolve(true);
		})
	})
}

module.exports = {
	delay,
	findMax,
	findMin,
	getResponse,
	getPercentDifference,
	percentDifferenceBeyondThreshold,
	percentDifferenceWithinThreshold,
	writeFile
};