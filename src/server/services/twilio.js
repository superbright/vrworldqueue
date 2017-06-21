var client = require('twilio')('AC635a4e202c225928ef9c2951d315a7b7', '59c48e07492fc77a07042691369413b6');
exports.sendMessage = (data) => {
    client.api.messages.create({
        from: "+19146104457"
        , to: '+1' + data.phone.replace(/[^\d]/g, '')
        , body: data.message
    }).then(function (data) {
        console.log(data);
        console.log('user notified on deck');
    }).catch(function (err) {
        console.error(err);
    });
}