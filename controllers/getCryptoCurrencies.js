const currencies = [
	'bitcoin',
	'ethereum',
	'bitcoin-cash',
	'ripple',
	'litecoin',
	'cardano',
	// 'iota', // debunked by mit
	'dash',
	'nem', // nem looks pro in the website, not great on the code end of things, price looks awe
	'monero',
	'eos', // dan lerimer
	'bitcoin-gold',
	'neo', // chinese ethereum
	'qtum',
	'stellar',
	'ethereum-classic',
	// 'lisk', // written in js?
	'verge',
	// 'tron', // not in english, ridiculous name
	'icon',
	// 'nxt', // defunct at this point
	// 'digibyte',
	'zcash',
	'stratis', // team doesn't look great. but hold on to your position.
	'icon',
	'omisego', // vitalik backing
	'siacoin',
	// 'okcash', // looks terrible, stale
	'raiden-network-token',
	'power-ledger',
	// 'ark', // don't quite understand it
	// 'gnosis-gno', // prediction market?
	'0x',
	// 'chainlink' // ico token. sold it out.
];

module.exports = () => {
	return new Promise((resolve) => {
		resolve(currencies);
	})
};