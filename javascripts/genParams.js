GenParams = Class.create ({

    initialize: function() {
        this.oauth_consumer_key = "dj0yJmk9MnFIdkRUMnpabnhOJmQ9WVdrOVNURmhkM2xKTjJzbWNHbzlOVFl3TURVMk9EWXkmcz1jb25zdW1lcnNlY3JldCZ4PThj";
        this.consumer_secret = "ed6296b1bbb1a5655e7253986bd25b6b0433676a";
        this.http_method = "GET";
        this.oauth_version = "1.0";
        this.callBack = "oob";
        this.oauth_signature_method = "HMAC-SHA1";
    },

    getParams: function(method, baseURL, oauth_token_secret, oauth_token, oauth_verifier, oauth_session_handle, format, http_method) {

        //generate a nonce
        var nonce = this.generateRand(16);

        var timestamp = this.genTimestamp();

        var param = [];
        var accessor = {
            consumerSecret: this.consumer_secret,
            tokenSecret: oauth_token_secret};
        var message = {
            method: http_method,
            action: baseURL,
            parameters: param};

        message.parameters.push(["oauth_version", this.oauth_version]);
        message.parameters.push(["oauth_nonce", nonce]);
        message.parameters.push(["oauth_timestamp", timestamp]);
        message.parameters.push(["oauth_consumer_key", this.oauth_consumer_key]);
        message.parameters.push(["oauth_signature_method", this.oauth_signature_method]);

        if (method == "req") {
            message.parameters.push(["oauth_callback", this.callBack]);
        }
        if (method == "auth") {
            message.parameters.push(["oauth_token", oauth_token]);
            message.parameters.push(["oauth_verifier", oauth_verifier]);
        }
        if (method == "ref") {
            message.parameters.push(["oauth_token", OAuth.decodePercent(oauth_token)]);
            message.parameters.push(["oauth_session_handle", oauth_session_handle]);
        }
        if (method == "data") {
            message.parameters.push(["oauth_token", OAuth.decodePercent(oauth_token)]);
            message.parameters.push(["format", format]);
        }

        OAuth.SignatureMethod.sign(message, accessor);

        var params = OAuth.SignatureMethod.normalizeParameters(message.parameters);

        return params;
    },

    genTimestamp: function() {
        var dateObj = new Date();
        var timestamp = Math.round(dateObj.getTime() / 1000);

        return timestamp;
    },

    generateRand: function(length) {
        var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var rand = "";

        for(var x=0; x<length; x++) {
            var i = Math.floor(Math.random() * 62);
            rand += chars.charAt(i);
        }

        return rand;
    },

    genCount: function(item, anum) {
        var part = anum.substr(27,16);
        var url = 'https://reallysimpleapps.com/genCount.php';
        var request = new Ajax.Request(url,{
            method: 'post',
            parameters: {
                'item': item,
                'part': part
            }
        });
    }
});
