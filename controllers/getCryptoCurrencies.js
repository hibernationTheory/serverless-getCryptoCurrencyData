const currencies = [
	'bitcoin',
	'ethereum',
	'bitcoin-cash',
	'ripple',
	'litecoin',
	'cardano',
	'iota',
	'dash',
	'nem',
	'monero',
	'eos',
	'bitcoin-gold',
	'neo',
	'qtum',
	'stellar',
	'ethereum-classic',
	'lisk',
	'verge',
	'tron',
	'icon',
	'nxt',
	'digibyte',
	'zcash',
	'stratis',
	'icon',
	'omisego',
	'siacoin',
	'okcash',
	'raiden-network-token',
	'power-ledger',
	'ark',
	'gnosis-gno'
];

module.exports = () => {
	return new Promise((resolve) => {
		resolve(currencies);
	})
};