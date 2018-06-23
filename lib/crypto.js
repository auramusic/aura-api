//usage:
//var hw = encrypt(new Buffer("hello world", "utf8"))
//outputs hello world
//console.log(decrypt(hw).toString('utf8'));
const keygen = require("keygen")
const crypto = require("crypto"),
	algorithm = "aes-256-ctr",
	password = keygen.hex(64)

module.exports = {
	encrypt: (buffer) => {
		var cipher = crypto.createCipher(algorithm,password)
		var crypted = Buffer.concat([cipher.update(buffer),cipher.final()])
    var json = {key:password, crypted:crypted}
		return json
	},
	decrypt: (buffer, pass) => {
		var decipher = crypto.createDecipher(algorithm,pass)
		var dec = Buffer.concat([decipher.update(buffer) , decipher.final()])
		return dec
	}
}
