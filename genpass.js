const crypto = require('crypto')
const readline = require('readline');

function pbkdf(keyStr, saltStr, iterations, keyLen, digestAlgo = "SHA-512") {
	return new Promise( (resolve, reject) => {
		crypto.pbkdf2(keyStr, saltStr, iterations, keyLen, digestAlgo.replace(/-/g, '').toLowerCase(), (err, key) => {
			if (err) {
				reject(err)
			} else {
				resolve(key)
			}
		})
	})
}

async function generatePass(masterPassword, salt, version = 0, len = 40, alphabet, purpose) {
	const buffer = await pbkdf(purpose + version + masterPassword, salt, 800000, len, "SHA-512")
	return Array.from(new Uint8Array(buffer)).map((x) => alphabet.charAt(Math.floor((x / 256) * alphabet.length))).join("")
}


let [node, script, purpose = null, masterPass = null, salt = 'salt', version = 0, length = 40, alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-%$#.!@^&*()"] = process.argv

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

let tasks = [ done ]

function nextTask() {
	tasks.shift()()
}

function done() {
	rl.close();
	generatePass(masterPass, salt, version, length, alphabet, purpose).then((generatedPassword) => console.log(generatedPassword))
}

function getPurpose() {
	rl.question('Purpose:', (answer) => {
		purpose = answer
		nextTask()
	})
}

function getPassword() {
	rl.question('Password:', (answer) => {
		masterPass = answer
		nextTask()
	})
}

if (masterPass === null) {
	tasks.unshift(getPassword)
}
if (purpose === null) {
	tasks.unshift(getPurpose)
}

nextTask()
