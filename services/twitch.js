var twitchIRC = require('tmi.js');
var request = require('request-promise');

function Twitch(config) {
    if(!(this instanceof Twitch)) {
        return new Twitch(config);
    }
    this.config = config;
}

Twitch.prototype.start = function() {
    tmiOptions = this.config.tmi.options

    reqOptions =  {
        uri: 'https://api.twitch.tv/kraken/streams?limit=50',
        json: true
    }

    request(reqOptions)
        .then(function(json) {
            var channels = [];
            json.streams.forEach(function(stream) {
                channels.push("#" + stream.channel.name);
            });
            tmiOptions.channels = channels;
        })
        .then(function() {
            new twitchIRC.client(tmiOptions).connect();
        })
        .catch(function(err) {
            console.error(err);
        });
}


module.exports = Twitch;
