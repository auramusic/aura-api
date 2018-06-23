const homedir = require("os").homedir()
const fs      = require("fs")
const appdir  = homedir + "/.auramusic"
const auraDb  = require("aura.db")

module.exports = {
  getDataStore: () => {
    var data = auraDb.getdb(appdir + "/datastore.db")
    return data
  },
  getRecentPlayed: () => {
    var data = auraDb.getdb(appdir + "/recentplayed.db")
    return data
  },
  getPlaylists: () => {
    var data = auraDb.getdb(appdir + "/playlists.db")
    return data
  },
  getCollections: () => {
    var data = auraDb.getdb(appdir + "/collections.db")
    return data
  },
  getLiked: () => {
    var data = auraDb.getdb(appdir + "/liked.db")
    return data
  },
  getPlays: () => {
    var data = auraDb.getdb(appdir + "/plays.db")
    return data
  },
  getFollowing: () => {
    var data = auraDb.getdb(appdir + "/following.db")
    return data
  },
  getFollowers: () => {
    var data = auraDb.getdb(appdir + "/followers.db")
    return data
  }
}
