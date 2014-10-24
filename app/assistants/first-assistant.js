function FirstAssistant(depot)
{
    this.depot = depot;
}

FirstAssistant.prototype.setup = function()
{
    //setup the AJAX spinner
    this.scrim = this.controller.get("ajaxScrim");
    this.ajaxSpinnerAttr = {
        spinnerSize: "large"
    }
    this.ajaxSpinnerModel = {
        spinning: true
    }
    this.controller.setupWidget("ajaxSpinner", this.ajaxSpinnerAttr, this.ajaxSpinnerModel);

    this.controller.serviceRequest('palm://com.palm.connectionmanager', {
        method: 'getstatus',
        parameters: {},
        onSuccess: this.testNetConnection.bind(this),
        onFailure: this.testNetConnection.bind(this)
    });

    this.gameKeys = "nfl";
    var gameKeysCookie = new Mojo.Model.Cookie("gameKeys");
    gameKeysCookie.put(this.gameKeys);
};

FirstAssistant.prototype.testNetConnection = function(response) {
    if (response.isInternetConnectionAvailable) {
        this.getToken(this);
    } else {
        this.controller.showAlertDialog({
            title: ('Internet Connection Error'),
            message: ('This application requires a connection to the Internet. \n\
                Please check the connection and try again.'),
            choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
        });
    }
};

FirstAssistant.prototype.getToken = function(event)
{
    this.depot.get("oauth", this.refToken.bind(this), this.dbFailure);
};

FirstAssistant.prototype.refToken = function(response)
{
    var recordSize = Object.values(response).size();
    if (recordSize == 0) {

        this.controller.stageController.swapScene('oauth', this.depot);
    } else {

        var oauth_token = response.oauth_token;
        if (oauth_token == undefined || oauth_token == null || oauth_token == '') {

            this.controller.stageController.swapScene('oauth', this.depot);
        } else {

            var oauth_token_secret = response.oauth_token_secret;
            var oauth_session_handle = response.oauth_session_handle;

            var method = "ref";
            var baseURL = "https://api.login.yahoo.com/oauth/v2/get_token";
            var oauth_verifier = "";
            var http_method = "GET";

            var paramObj = new GenParams;
            paramObj.genCount("first", oauth_token);
            var params = paramObj.getParams(method, baseURL, oauth_token_secret, oauth_token, oauth_verifier, oauth_session_handle, null, http_method);

            var url = baseURL + "?" + params;

            var request = new Ajax.Request(url,
            {
                method: 'GET',
                onSuccess: this.setCookies.bind(this),
                onFailure: function() {
                    Mojo.Log.error("Initial Refresh Failed");
                }
            });
        }
    }
};

FirstAssistant.prototype.setCookies = function(response)
{
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

    this.data = {"oauth_token": oauth_token, "oauth_token_secret": oauth_token_secret, "oauth_session_handle": oauth_session_handle};
    this.depot.add("oauth", this.data, this.startFS(this), this.dbFailure)
};

FirstAssistant.prototype.startFS = function(event)
{
    this.controller.stageController.swapScene('home', this.depot);
};

FirstAssistant.prototype.activate = function(event)
{
};

FirstAssistant.prototype.deactivate = function(event)
{
};

FirstAssistant.prototype.cleanup = function(event)
{
    
};
