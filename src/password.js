async function pbkdf(keyStr, saltStr, iterations, keyLen, digestAlgo = "SHA-512") {
	const key = await window.crypto.subtle.importKey(
		'raw',
		new TextEncoder("utf-8").encode(keyStr),
		{name: 'PBKDF2'},
		false,
		['deriveBits']
	)
	return await window.crypto.subtle.deriveBits({
			"name": "PBKDF2",
			salt: new TextEncoder("utf-8").encode(saltStr),
			iterations,
			hash: {name: digestAlgo}
		},
		key,
		keyLen * 8
	)
}

const lowerCase = "abcdefghijklmnopqrstuvwxyz"
const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const numeric = "0123456789"
const symbol = "_-%$#.!@^&*()"

const defaultAlphabet = lowerCase + upperCase + numeric + symbol
async function generatePass(masterPassword, salt, version = 0, len = 40, alphabet = defaultAlphabet, purpose = window.location.host) {
	console.log('generate with alphabet', alphabet)
	const buffer = await pbkdf(purpose + version + masterPassword, salt, 800000, len, "SHA-512")
	return Array.from(new Uint8Array(buffer)).map((x) => alphabet.charAt(Math.floor((x / 256) * alphabet.length))).join("")
}


class Settings {
	constructor(purpose, version = 0, salt = "salt", length = 40, alphabet = defaultAlphabet) {
		Object.assign(this, {purpose, version, salt, length, alphabet})
		console.log(alphabet)
	}

	password(masterPassword) {
		return generatePass(masterPassword, this.salt, this.version, this.length, this.alphabet, this.purpose)
	}

	toString() {
		return `${this.purpose}, ${this.version}, ${this.salt}, ${this.length}, ${this.alphabet}`
	}

	static fromRow(row) {
		const [purpose, version, salt, length, alphabet] = row.split(/,\s/)
		if (alphabet === undefined) {
			throw new Error("Row did not define all the settings necessary : " + row)
		}
		return new Settings(purpose, Number(version), salt, Number(length), alphabet)
	}

	static fromRows(rows = "") {
		if (rows === null || rows.length === 0) {
			return []
		}
		const result = {}
		rows.split('\n').map(Settings.fromRow).forEach((setting) =>  result[setting.purpose] = setting)
		return result
	}

	static toRows(settings = {}) {
		return Object.values(settings).map(String).join('\n')
	}
}
