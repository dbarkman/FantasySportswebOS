function OauthTestAssistant() {
}

OauthTestAssistant.prototype.setup = function() {

    //setup the step 1 button widget
    this.controller.setupWidget("step1",
        this.attributes = {
            type: Mojo.Widget.activityButton
        },
        this.model = {
            label : "Step 1",
            disabled: false
        }
    );

    //Step 1
    this.handleStep1Binder = this.handleStep1Press.bind(this);
    Mojo.Event.listen(this.controller.get('step1'),Mojo.Event.tap, this.handleStep1Binder);

    //setup the yahoo code textfield widget
    this.controller.setupWidget("code",
        this.attributes = {
            hintText: ("enter Yahoo! code after step 1"),
            modelProperty: "code",
            textCase: Mojo.Widget.steModeLowerCase
        },
        this.codeModel = {
            "code": "",
            disabled: false
        }
    );

    //setup the step 2 button widget
    this.controller.setupWidget("step2",
        this.attributes = {
            type: Mojo.Widget.activityButton
        },
        this.model = {
            label : "Step 2",
            disabled: false
        }
    );

    //Step 2
    this.handleStep2Binder = this.handleStep2Press.bind(this);
    Mojo.Event.listen(this.controller.get('step2'),Mojo.Event.tap, this.handleStep2Binder);

    //setup the refresh button widget
    this.controller.setupWidget("refresh",
        this.attributes = {
            type: Mojo.Widget.activityButton
        },
        this.model = {
            label : "Refersh Token",
            disabled: false
        }
    );

    //Refresh
    this.handleRefreshBinder = this.handleRefreshPress.bind(this);
    Mojo.Event.listen(this.controller.get('refresh'),Mojo.Event.tap, this.handleRefreshBinder);

    //setup the get data button widget
    this.controller.setupWidget("getData",
        this.attributes = {
            type: Mojo.Widget.activityButton
        },
        this.model = {
            label : "Get Data",
            disabled: false
        }
    );

    //Get Data
    this.handleGetDataBinder = this.handleGetDataPress.bind(this);
    Mojo.Event.listen(this.controller.get('getData'),Mojo.Event.tap, this.handleGetDataBinder);
};

OauthTestAssistant.prototype.handleStep1Press = function(){

    var method = "req";
    var baseURL = "https://api.login.yahoo.com/oauth/v2/get_request_token";
    var http_method = "GET";

    var paramObj = new GenParams;
    var params = paramObj.getParams(method, baseURL, null, null, null, null, null, http_method);

    var url = baseURL + "?" + params;

    //ajax request Yahoo! Oauth
    var request = new Ajax.Request(url,
    {
        method: 'GET',
        onSuccess: this.gtrSuccess.bind(this),
        onFailure: this.gtrFailure.bind(this)
    });
};

OauthTestAssistant.prototype.gtrSuccess = function(response){

    //stop the activity button
    $("step1").mojo.deactivate();

    //parse the response
    var requestToken = response.responseText;

    this.oauth_token = ((requestToken.split("&"))[0].split("="))[1];
    this.oauth_token_secret = ((requestToken.split("&"))[1].split("="))[1];

    Mojo.Log.error("Get Token Request Successful!");

    this.controller.serviceRequest("palm://com.palm.applicationManager", {
        method: "open",
        parameters: {
            id: 'com.palm.app.browser',
            params: {
                target: "https://api.login.yahoo.com/oauth/v2/request_auth?oauth_token=" + this.oauth_token
            }
        }
    });
};

OauthTestAssistant.prototype.gtrFailure = function(response) {

    //stop the activity button
    $("step1").mojo.deactivate();

    this.controller.showAlertDialog({
        title: ('Get_Token_Request Error'),
        message: ('The Get_Token_Request call failed.'),
        choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
    });
};

OauthTestAssistant.prototype.handleStep2Press = function(){

    var oauth_verifier = this.codeModel.code;

    if (oauth_verifier == '') {
        this.controller.showAlertDialog({
            onChoose: function() {$("step2").mojo.deactivate();},
            title: ('Input Error'),
            message: ('Please enter the Yahoo! code from the authorization web page. If you need a code, click the "Step 1" button.'),
            choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
        });
    } else {
        var method = "auth";
        var baseURL = "https://api.login.yahoo.com/oauth/v2/get_token";
        var oauth_token_secret = this.oauth_token_secret;
        var oauth_token = this.oauth_token;
        var http_method = "GET";

        var paramObj = new GenParams;
        var params = paramObj.getParams(method, baseURL, oauth_token_secret, oauth_token, oauth_verifier, null, null, http_method);

        var url = baseURL + "?" + params;

        //ajax request Yahoo! Oauth
        var request = new Ajax.Request(url,
        {
            method: 'GET',
            onSuccess: this.gtSuccess.bind(this),
            onFailure: this.gtFailure.bind(this)
        });
    }
};

OauthTestAssistant.prototype.gtSuccess = function(response){

    //stop the activity button
    $("step2").mojo.deactivate();

    //parse the response
    var requestToken = response.responseText;

    var oauth_token = ((requestToken.split("&"))[0].split("="))[1];
    var oauth_token_secret = ((requestToken.split("&"))[1].split("="))[1];
    var oauth_session_handle = ((requestToken.split("&"))[3].split("="))[1];
    var xoauth_yahoo_guid = ((requestToken.split("&"))[5].split("="))[1];

    Mojo.Log.error("Get Token Successful!");

    //store the token info
    var oauth_tokenCookie = new Mojo.Model.Cookie("oauth_token");
    oauth_tokenCookie.put(oauth_token);
    var oauth_token_secretCookie = new Mojo.Model.Cookie("oauth_token_secret");
    oauth_token_secretCookie.put(oauth_token_secret);
    var oauth_session_handleCookie = new Mojo.Model.Cookie("oauth_session_handle");
    oauth_session_handleCookie.put(oauth_session_handle);
};

OauthTestAssistant.prototype.gtFailure = function(response) {

    //stop the activity button
    $("step2").mojo.deactivate();

    this.controller.showAlertDialog({
        title: ('Get_Token Error'),
        message: ('The Get_Token call failed.'),
        choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
    });
};

OauthTestAssistant.prototype.handleRefreshPress = function(){

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
        onSuccess: this.rSuccess.bind(this),
        onFailure: this.rFailure.bind(this)
    });
};

OauthTestAssistant.prototype.rSuccess = function(response){

    //stop the activity button
    $("refresh").mojo.deactivate();

    //parse the response
    var requestToken = response.responseText;

    var oauth_token = ((requestToken.split("&"))[0].split("="))[1];
    var oauth_token_secret = ((requestToken.split("&"))[1].split("="))[1];
    var oauth_session_handle = ((requestToken.split("&"))[3].split("="))[1];
    var xoauth_yahoo_guid = ((requestToken.split("&"))[5].split("="))[1];

    Mojo.Log.error("Refresh Successful!!!");

    var oauth_tokenCookie = new Mojo.Model.Cookie("oauth_token");
    oauth_tokenCookie.put(oauth_token);
    var oauth_token_secretCookie = new Mojo.Model.Cookie("oauth_token_secret");
    oauth_token_secretCookie.put(oauth_token_secret);
    var oauth_session_handleCookie = new Mojo.Model.Cookie("oauth_session_handle");
    oauth_session_handleCookie.put(oauth_session_handle);
};

OauthTestAssistant.prototype.rFailure = function(response) {

    //stop the activity button
    $("refresh").mojo.deactivate();

    this.controller.showAlertDialog({
        title: ('Get_Token Refresh Error'),
        message: ('The Get_Token refresh call failed.'),
        choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
    });
};

OauthTestAssistant.prototype.handleGetDataPress = function(response) {

    //get the token info
    var oauth_tokenCookie = new Mojo.Model.Cookie("oauth_token");
    var oauth_token = oauth_tokenCookie.get();
    var oauth_token_secretCookie = new Mojo.Model.Cookie("oauth_token_secret");
    var oauth_token_secret = oauth_token_secretCookie.get();

    var method = "data";
    var baseURL = "http://fantasysports.yahooapis.com/fantasy/v2/game/222";
    var format = "json";
    var http_method = "GET";

    var paramObj = new GenParams;
    var params = paramObj.getParams(method, baseURL, oauth_token_secret, oauth_token, null, null, format, http_method);

    var url = baseURL + "?" + params;

    //ajax request Yahoo! Oauth
    var request = new Ajax.Request(url,
    {
        method: 'GET',
        onSuccess: this.gdSuccess.bind(this),
        onFailure: this.gdFailure.bind(this)
    });
};

OauthTestAssistant.prototype.gdSuccess = function(transport){

    //stop the activity button
    $("getData").mojo.deactivate();

    //parse the response
    var list = transport.responseJSON.fantasy_content;
    Mojo.Log.error("time: " + list.time)
};

OauthTestAssistant.prototype.gdFailure = function(response) {

    //stop the activity button
    $("getData").mojo.deactivate();

    this.controller.showAlertDialog({
        title: ('Get Data Error'),
        message: ('The Get Data call failed.'),
        choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
    });
};

OauthTestAssistant.prototype.activate = function(event) {
};

OauthTestAssistant.prototype.deactivate = function(event) {
};

OauthTestAssistant.prototype.cleanup = function(event) {
    //stop listening to the Step 1 button
    Mojo.Event.stopListening(this.controller.get('step1'), Mojo.Event.tap, this.handleStep1Binder);
    //stop listening to the Step 2 button
    Mojo.Event.stopListening(this.controller.get('step2'), Mojo.Event.tap, this.handleStep2Binder);
    //stop listening to the Refresh button
    Mojo.Event.stopListening(this.controller.get('refresh'), Mojo.Event.tap, this.handleRefreshBinder);
    //stop listening to the Get Data button
    Mojo.Event.stopListening(this.controller.get('getData'), Mojo.Event.tap, this.handleGetDataBinder);
};
