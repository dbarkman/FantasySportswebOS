Refresh = Class.create ({

    refreshToken: function() {
    //get the token info
    var oauth_tokenCookie = new Mojo.Model.Cookie("oauth_token");
    var oauth_token = oauth_tokenCookie.get();
    var oauth_token_secretCookie = new Mojo.Model.Cookie("oauth_token_secret");
    var oauth_token_secret = oauth_token_secretCookie.get();
    var oauth_session_handleCookie = new Mojo.Model.Cookie("oauth_session_handle");
    var oauth_session_handle = oauth_session_handleCookie.get();

    var method = "ref";
    var baseURL = "https://api.login.yahoo.com/oauth/v2/get_token";
    var oauth_verifier = "";
    var http_method = "GET";

    var paramObj = new GenParams;
    var params = paramObj.getParams(method, baseURL, oauth_token_secret, oauth_token, oauth_verifier, oauth_session_handle, null, http_method);

    var url = baseURL + "?" + params;

    //ajax request Yahoo! Oauth
    var request = new Ajax.Request(url,
    {
        method: 'GET',
        onSuccess: function(response) {
            //parse the response
            var requestToken = response.responseText;

            var oauth_token = ((requestToken.split("&"))[0].split("="))[1];
            var oauth_token_secret = ((requestToken.split("&"))[1].split("="))[1];
            var oauth_session_handle = ((requestToken.split("&"))[3].split("="))[1];

            var oauth_tokenCookie = new Mojo.Model.Cookie("oauth_token");
            oauth_tokenCookie.put(oauth_token);
            var oauth_token_secretCookie = new Mojo.Model.Cookie("oauth_token_secret");
            oauth_token_secretCookie.put(oauth_token_secret);
            var oauth_session_handleCookie = new Mojo.Model.Cookie("oauth_session_handle");
            oauth_session_handleCookie.put(oauth_session_handle);
        },
        onFailure: function() {
            Mojo.Log.error("Auto Response Failed");
        }
    });
    }
})
