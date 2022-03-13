var request = require('request');

function alert(message) {
    if (!process.env.WEBHOOK_URL) {
        console.log("No webhook URL set, printing alert to console instead:");
        console.log(message);
        return;
    }
    request.post(
        process.env.WEBHOOK_URL,
        { json: { username: process.env.WEBHOOK_USER, content: message } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        }
    );
}

// add the code below
module.exports = { alert };
