var twitchIRC = require('tmi.js');
var request = require('request-promise');

function Twitch(config) {
    if(!(this instanceof Twitch)) {
        return new Twitch(config);
    }
    this.config = config;
}

var logger = {
    // Default tmi.js uses bunyan to log.
    // tmi.js hands a formatted message to info, which
    // we need to use to extract certain phrases
    info: function(msg) {
        var channelRegex = /^\[.*\]/;
        var userRegex = /\<.*\>/;
        var msgRegex = /^\[.*\] \<.*\>\: /;
        if(msg.match(channelRegex)) {
            console.log("CHANNEL " + msg.match(channelRegex)[0]);
        }
        if(msg.match(userRegex)) {
            console.log("USER " + msg.match(userRegex)[0]);
        }
        if(msg.match(msgRegex)) {
            console.log("MSG " + msg.replace(msgRegex, ''));
        }

    },
    warn: function(msg) {
        console.log(msg);
    },
    error: function(msg) {
        console.error(msg);
    }
}

Twitch.prototype.start = function() {
    tmiOptions = this.config.tmi.options

    reqOptions =  {
        uri: 'https://api.twitch.tv/kraken/streams?limit=10',
        json: true
    }

    request(reqOptions)
        .then(function(json) {
            var channels = [];
            json.streams.forEach(function(stream) {
                channels.push("#" + stream.channel.name);
            });
            tmiOptions.channels = channels;
            tmiOptions.logger = logger;
        })
        .then(function() {
            var client = new twitchIRC.client(tmiOptions).connect();
        })
        .catch(function(err) {
            console.error(err);
        });
}


module.exports = Twitch;
