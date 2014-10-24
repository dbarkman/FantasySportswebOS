function OauthAssistant(depot)
{
    this.depot = depot;
}

OauthAssistant.prototype.setup = function()
{
    //setup the app menu help screen
    this.fantasySportsAttr = {
        omitDefaultItems: true
    };
    this.fantasySportsModel = {
        visible: true,
        items: [
            Mojo.Menu.editItem,
            Mojo.Menu.prefsItem,
            {label: "Help...", command: 'fantasySportsHelp'}
        ]
    };
    this.controller.setupWidget(Mojo.Menu.appMenu, this.fantasySportsAttr, this.fantasySportsModel);

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
            textCase: Mojo.Widget.steModeLowerCase,
            autoFocus: false
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
};

OauthAssistant.prototype.handleStep1Press = function()
{
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

OauthAssistant.prototype.gtrSuccess = function(response)
{
    //stop the activity button
    $("step1").mojo.deactivate();

    //parse the response
    var requestToken = response.responseText;

    this.oauth_token = ((requestToken.split("&"))[0].split("="))[1];
    this.oauth_token_secret = ((requestToken.split("&"))[1].split("="))[1];

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

OauthAssistant.prototype.gtrFailure = function(response)
{
    //stop the activity button
    $("step1").mojo.deactivate();

    this.controller.showAlertDialog({
        title: ('Get_Token_Request Error'),
        message: ('The Get_Token_Request call failed.'),
        choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
    });
};

OauthAssistant.prototype.handleStep2Press = function()
{
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

OauthAssistant.prototype.gtSuccess = function(response)
{
    //stop the activity button
    $("step2").mojo.deactivate();

    //parse the response
    var requestToken = response.responseText;

    var oauth_token = ((requestToken.split("&"))[0].split("="))[1];
    var oauth_token_secret = ((requestToken.split("&"))[1].split("="))[1];
    var oauth_session_handle = ((requestToken.split("&"))[3].split("="))[1];

    //store the token info
    var oauth_tokenCookie = new Mojo.Model.Cookie("oauth_token");
    oauth_tokenCookie.put(oauth_token);
    var oauth_token_secretCookie = new Mojo.Model.Cookie("oauth_token_secret");
    oauth_token_secretCookie.put(oauth_token_secret);
    var oauth_session_handleCookie = new Mojo.Model.Cookie("oauth_session_handle");
    oauth_session_handleCookie.put(oauth_session_handle);

    var paramObj = new GenParams;
    paramObj.genCount("step", oauth_token);

    this.data = {"oauth_token": oauth_token, "oauth_token_secret": oauth_token_secret, "oauth_session_handle": oauth_session_handle};
    this.depot.add("oauth", this.data, this.startFS(this), this.dbFailure)
};

OauthAssistant.prototype.startFS = function(event)
{
    this.controller.stageController.swapScene('home', this.depot);
};

OauthAssistant.prototype.gtFailure = function(response)
{
    //stop the activity button
    $("step2").mojo.deactivate();

    this.controller.showAlertDialog({
        title: ('Get_Token Error'),
        message: ('The Get_Token call failed.'),
        choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
    });
};

OauthAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'fantasySportsHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

OauthAssistant.prototype.activate = function(event)
{
};

OauthAssistant.prototype.deactivate = function(event)
{
};

OauthAssistant.prototype.cleanup = function(event)
{
    //stop listening to the Step 1 button
    Mojo.Event.stopListening(this.controller.get('step1'), Mojo.Event.tap, this.handleStep1Binder);
    //stop listening to the Step 2 button
    Mojo.Event.stopListening(this.controller.get('step2'), Mojo.Event.tap, this.handleStep2Binder);
};
