const download = require('./core/node_modules/download');
const fs = require('fs');
var config = require('./env.json')[process.argv[2]];
const cgref_channel = config['cgref_channel'];
const otc_channel = config['otc_channel'];
const nominations_channel = config['nominations_channel'];

fs.exists('data', function (exists) {
    if (!exists) {
        console.log("No data directory, please make one.")
    }
});


var cgref = {
    module: 'screenshot',
    channel: cgref_channel,
    preload: function () {
        var url = 'https://api.coingecko.com/api/v3/coins/list';
        download(url).then((data) => {
            fs.writeFileSync('data/cg.json', data);
        });
    },
    config: {
        url: 'https://www.coingecko.com/en/coins/{tickerurl}/tools#panel',
        css: 'coingecko-coin-price-chart-widget',
        preprocess: function (message, subcommand) {


            var cg_ticker = require('./data/cg.json');
            var chk_symbol = subcommand.toLowerCase().split(' ');
            var chk_id = subcommand.toLowerCase().split(' ');
            var ticker = [];
            var max = 5;
            var count = 0;

            for (var b = 0; b < chk_id.length; b++) {

                // Check against ticker. Moonwalk
                for (var i = 0; i < cg_ticker.length; i++) {
                    console.log(cg_ticker[i]['symbol']);
                    if (cg_ticker[i]['symbol'] == chk_symbol[b] || cg_ticker[i]['id'] == chk_id[b]) {
                        count++;
                        if (count > max) {
                            break;
                        }
                        console.log("Getting page: " + cg_ticker[i]['id'])

                        ticker.push({
                            url: 'https://www.coingecko.com/en/coins/' + cg_ticker[i]['id'] + '/tools#panel',
                            filename: 'screenshot.cg.' + cg_ticker[i]['id'] + '.png'
                        });

                        break;
                    }
                }
                if (count > max) {
                    message.channel.send("There's only " + max + " screenshots allowed at a time, gathering the first " + max + " screenshots");
                    break;
                }

            }

            // console.log(ticker);
            if (ticker.length === 0) {
                return [{
                    error: true,
                    error_msg: "Sorry, I could not find a cryptocurrency project named " + subcommand
                }]
            } else {
                return ticker;
            }

        }
    }
};

console.log("Environment: " + process.argv[2]);

module.exports = {
    cg: cgref,
    price: cgref,
    cmc: {
        module: 'screenshot',
        channel: cgref_channel,
        preload: function () {
            var url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=1500&convert=USD&CMC_PRO_API_KEY=' + config.cmcapi

            download(url).then((data) => {
                fs.writeFileSync('data/cmc.json', data);
            });
        },
        config: {
            url: 'https://coinmarketcap.com/currencies/{tickerurl}/#tools',
            css: '.coinmarketcap-currency-widget',
            preprocess: function (message, subcommand) {
                var cmc_ticker = require('./data/cmc.json').data;
                var chk_symbol = subcommand.toUpperCase().split(' ');
                var chk_id = subcommand.toLowerCase().split(' ');
                var ticker = [];
                var max = 5;
                var count = 0;

                for (var b = 0; b < chk_id.length; b++) {

                    // Check against ticker. Moonwalk
                    for (var i = 0; i < cmc_ticker.length; i++) {
                        if (cmc_ticker[i]['symbol'] == chk_symbol[b] || cmc_ticker[i]['id'] == chk_id[b]) {
                            count++;
                            if (count > max) {
                                break;
                            }
                            console.log("Getting page: " + cmc_ticker[i]['slug'])

                            ticker.push({
                                url: 'https://coinmarketcap.com/currencies/' + cmc_ticker[i]['slug'] + '/#tools',
                                filename: 'screenshot.' + cmc_ticker[i]['id'] + '.png'
                            });

                            break;
                        }
                    }
                    if (count > max) {
                        message.channel.send("There's only " + max + " screenshots allowed at a time, gathering the first " + max + " screenshots");
                        break;
                    }

                }

                // console.log(ticker);
                if (ticker.length === 0) {
                    return [{
                        error: true,
                        error_msg: "Sorry, I could not find a cryptocurrency project named " + subcommand
                    }]
                } else {
                    return ticker;
                }

            }
        }
    },
    otc: {
        module: 'otc',
        channel: otc_channel,
    },
    nominate: {
        module: 'nominations',
        channel: nominations_channel,
    }
}
