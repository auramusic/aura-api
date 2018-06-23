#!/usr/bin/env nod

//test: node -e 'require("./db").init()'

require("dotenv").load()

const IPFS        = require("ipfs")
const node        = new IPFS()
const stream      = require("./lib/server")
const Promise     = require("bluebird")
const axios       = require("axios")
const encode      = require("./lib/encode")
const crypto      = require("./lib/crypto")
const conf        = require("./lib/conf")
const db          = require("./lib/db")
const fs          = require("fs")
const homedir     = require("os").homedir()
const appdir      = homedir + "/.auramusic"
const ffmetadata  = require("ffmetadata")

//Change the blockchain name for production name
const { spawn }   = require("child_process")
//const connect     = spawn("multichain-cli", ["aura-dev@12.34.56.78:8571", "-daemon"])
const getInfo     = spawn("multichain-cli", ["aura-dev", "getinfo"])
const listStreams = spawn("multichain-cli", ["aura-dev", "liststreams"])

const base_url    = "https://ipfs.io/ipfs/"

var queue  = require("./lib/streamstate")

module.exports = {
	test: () => {
		console.log("this is a test from aura interface program")
	},
	configure: () => {
		conf.confapp()
	},
	getinfo: () => {
		getInfo.stdout.on("data", (data) => {
			console.log(`node info: ${data}`)
		})
	},
	createArtistStream: (artist_name, pic_url, country_code, bio) => {
		const newStream = spawn(
			"multichain-cli",
			[
				"aura-dev",
				"create",
				"stream",
				artist_name,
				false,
				JSON.stringify({pic_url:pic_url, country_code:country_code, bio:bio})
			]
		)
		newStream.stdout.on("data", (data) =>{
			console.log(`New Stream Data: ${data}`)
		})
	},
	publishToArtistStream: (artiststream, songname, songpath, coverpath, songmetadata) => {
		let buffer = []
		var options = {
			attachments: [__dirname+coverpath],
		}
		ffmetadata.write(__dirname + songpath, JSON.parse(songmetadata), options, function(err) {
			if (err) console.error("Error writing metadata", err)
			else{
				console.log("Data written")
				// convert image to base64 encoded string
				var base64str = encode.base64_encode(__dirname + songpath)
				var binAudio = new Buffer(base64str.replace("data:audio/wav;"), "base64")
				buffer = binAudio
				//encrypt buffer and return encrypted buffer and key
				var encrypted_json = crypto.encrypt(buffer)
				console.log(encrypted_json, buffer)
				node.files.add(encrypted_json.crypted, (err, result) => { // Upload buffer to IPFS
					if(err) {
						console.error(err)
						return
					}
					let url = `https://ipfs.io/ipfs/${result[0].hash}`
					console.log(`Url --> ${url}`)
					console.log(artiststream, songname, encode.toHex(result[0].hash))
					//Url --> https://ipfs.io/ipfs/QmaLFwXsZz8rci7zR7KYJhCzAGPL5KZdRKd6WftukL24qn
					const publishSong = spawn("multichain-cli", ["aura-dev", "publish", artiststream, songname, encode.toHex(result[0].hash+"&&"+encrypted_json.key)])
					publishSong.stdout.on("data", (data) => {
						console.log(`New song added: ${data}`)

					})
				})
			}
		})
	},
	getStream: (streamname) => {
		return new Promise(function(resolve, reject) {
			const getStream = spawn("multichain-cli", ["aura-dev", "liststreamitems", streamname])
			getStream.stdout.on("data", (data) => {
				//console.log(`Streams: ${data}`)
				var d = JSON.parse(data)
				var obj = {}
				obj["stream_name"] = streamname
				obj["items"] = d
				resolve(obj)
			})
		})
	},
	getStreams: () => {
		listStreams.stdout.on("data", (data)=>{
			//write to streams.db
			var streamsDB = fs.readFileSync(appdir + "/streams.db")
			streamsDB = []
			streamsDB.push(data)
			fs.writeFileSync(appdir + "/streams.db", streamsDB)

			//write to hashes.db
			var items = []
			var  d = JSON.parse(data)
			for (var i = 0; i < d.length; i++) {
				var item = d[i]
				module.exports.getStream(item.name).then((result) => {
					console.log(i)
					items.push(result)
					if(items.length==i){
						console.log(items)
						var hashes = fs.readFileSync(appdir + "/hashes.db")
						hashes = items
						fs.writeFileSync(appdir + "/hashes.db", JSON.stringify(hashes))
						return
					}
				})
			}
		})
	},
	subscribeToStream: (streamname) => {
		const subscribe = spawn("multichain-cli", ["aura-dev", "subscribe", streamname])
		subscribe.stdout.on("data", (data) => {
			console.log(`Subscribed: ${data}`)

		})
	},
	catSong: (hash, pass) => {
		return new Promise(function(resolve, reject) {
			var hash_ = hash
			node.on("ready", () => {
				node.files.cat(hash_, function (err, stream) {
					var dec = crypto.decrypt(stream, pass)
					//console.log(dec)
					//fs.writeFileSync("song.aur", dec)
					queue.streamqueue.push({hash:hash, buffer:dec})
					resolve(dec)
				})
			})
		})
	},
	runstream:() => {
		stream.server()
		module.exports.getStreams()
	},
}
