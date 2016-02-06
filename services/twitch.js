var twitchIRC = require('tmi.js');
var request = require('request-promise');
// TODO: fuzzy doesn't seem to work well.
// Need to come up with a better thing probably.
var fuzzy = require('fuzzyset.js');

function Twitch(config) {
    if(!(this instanceof Twitch)) {
        return new Twitch(config);
    }
    this.config = config;

    // Holds current top pastas for each channel
    this.topPastas = [];

}



Twitch.prototype.start = function() {
    tmiOptions = this.config.tmi.options

    reqOptions =  {
        uri: 'https://api.twitch.tv/kraken/streams?limit=15',
        json: true
    }

    var _this = this;

    var logger = {
        // Default tmi.js uses bunyan to log.
        // tmi.js hands a formatted message to info, which
        // we need to use to extract certain phrases
        info: (msg) => {
            var channelRegex = /^\[.*\]/;
            var userRegex = /\<.*\>/;
            var msgRegex = /^\[.*\] \<.*\>\: /;
            var channel = undefined,
                user = undefined,
                mesg = undefined;
            if(msg.match(channelRegex)) {
                channel = msg.match(channelRegex)[0]
                                .replace('\[', '').replace('\]', '');
            }
            if(msg.match(userRegex)) {
                user = msg.match(userRegex)[0]
                            .replace('\<', '').replace('\>', '');
            }
            if(msg.match(msgRegex)) {
                mesg = msg.replace(msgRegex, '');
            }
            if(channel && user && mesg) {
                console.log(`CHANNEL ${channel}\nUSER ${user}\nMESG ${mesg}`);
                // Possible due to asynchronous call that
                // topPastas hasn't been defined yet.
                // Unlikely, but possible.
                if(_this.topPastas[channel]) {
                    console.log(_this.topPastas[channel].get(mesg));
                }
            }

        },
        warn: (msg) => {
            console.log(msg);
        },
        error: (msg) => {
            console.error(msg);
        }
    }

    request(reqOptions)
        .then((json) => {
            var channels = [];
            // json.streams.forEach((stream) => {
            //     // No var so this is local
            //     ch = "#" + stream.channel.name;
            //     channels.push(ch);
            //     // TODO: change this to set the value
            //     // to a predefined list of pastas, all with an
            //     // initial count of 0.
            //     _this.topPastas[ch] = [];
            // });

            // DEBUGGING!
            channels.push('#letipfedoramilady');
            var pastas = new fuzzy();
            require('../models/pastas').forEach((pasta) => {
                pastas.add(pasta);
            });
            _this.topPastas['#letipfedoramilady'] = pastas;
            // END DEBUGGING!

            tmiOptions.channels = channels;
            tmiOptions.logger = logger;

            _this.topChannels = channels;
        })
        .then(() => {
            var client = new twitchIRC.client(tmiOptions).connect();
        })
        .catch((err) => {
            console.error(err);
        });
}


module.exports = Twitch;
