const rp = require('request-promise');

module.exports = {
    setprice:function(client, market) {
         const apibtcqrl = 'https://bittrex.com/api/v1.1/public/getmarketsummary?market='+market;
        const apiusdtbtc = 'https://bittrex.com/api/v1.1/public/getmarketsummary?market=usdt-btc';
        
        var btcqrl;

        rp({uri:apibtcqrl,json:true})
            .then(function(body) {
                    btcqrl=body.result[0].Last;
            })
            .then(function() { return rp({uri:apiusdtbtc,json:true}); })
            .then(function(body) {
                    var value=+(body.result[0].Last * btcqrl).toFixed(2);
                    var sat=btcqrl*100000;
                    client.user.setGame("$"+value.toFixed(2)+" | "+sat.toFixed(1)+"k Sat");
            });
    }
}