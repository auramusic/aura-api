const fs       = require("fs")
var ffmetadata = require("ffmetadata")

module.exports = {
	base64_encode : (file) =>{
		// read binary data
		var bitmap = fs.readFileSync(file)
		// convert binary data to base64 encoded string
		return new Buffer(bitmap).toString("base64")
	},
	toHex: (str) => {
		var hex = '';
		for(var i=0;i<str.length;i++) {
			hex += ''+str.charCodeAt(i).toString(16);
		}
		return hex;
	},
	hex_to_ascii: (str1) => {
		var hex  = str1.toString();
		var str = '';
		for (var n = 0; n < hex.length; n += 2) {
			str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
		}
		return str;
	 }
}
