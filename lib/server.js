const express   = require("express")
const cors      = require("cors")
const fs        = require("fs")
const homedir   = require("os").homedir()
const appdir    = homedir + "/.auramusic"

var queue       = require("./streamstate")
var app = express()

app.use(cors())


/*interface.catSong("QmWbXeTvKunKcNsSCgPyzxqtSwEM98H6jee53rNHFZEr8Q",
"053428de1ed4e0881e8c279105513831cd5d5daef0d2b1f37ce40a5293978e54").then((result)=> {
  console.log(result)
})*/

module.exports = {
	server: () => {
		app.get("/artiststream/:artistname", (req, res) => {
			var artistname = req.params.artistname
			var artists = fs.readFileSync( appdir + "/hashes.db" )
      var stream = fs.readFileSync(appdir + "/streams.db")

      var obj = JSON.parse(artists.toString())
      var obj_= JSON.parse(stream.toString())
      var arr = []

      for (var i = 0; i < obj.length; i++) {
        var artists = obj[i]
        var artist_name = (artists.stream_name).toLowerCase()

        var streams = obj_[i]
        var stream_name = (streams.name).toLowerCase()

        if(artistname == artist_name&&artistname == stream_name){
          arr.push(streams, artists)
          res.send(arr)
        }
      }
		})

		app.get("/streams", (req, res) => {
			var streams = fs.readFileSync(appdir + "/streams.db")
			res.send(JSON.parse(streams.toString(), null, 2))
		})

		app.listen(5555, console.log("Server running at port 5555"))
	}
}
