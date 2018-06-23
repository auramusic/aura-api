const homedir = require("os").homedir()
const fs      = require("fs")
const appdir  = homedir + "/.auramusic"
const auraDb  = require("aura.db")

module.exports = {
	confapp: () => {
		console.log(homedir)
		if (!fs.existsSync(appdir)){
			fs.mkdirSync(appdir)
			auraDb.createdb(appdir)
		}
	},
}
