function EditRosterAssistant(list, index, position)
{
    this.list = list;
    this.index = index;
    this.newPosition = position;

    // get the game keys
    var gameKeysCookie = new Mojo.Model.Cookie("gameKeys");
    this.gameKeys = gameKeysCookie.get();
};

EditRosterAssistant.prototype.setup = function()
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

    this.league_key = this.list[this.index].league_key;
    this.team_key = this.list[this.index].team_key;
    this.current_week = this.list[this.index].league_current_week;
    this.player_key = this.list[this.index].player_key;
    this.player_name = this.list[this.index].player_full_name;

    var oauth_tokenCookie = new Mojo.Model.Cookie("oauth_token");
    this.oauth_token = oauth_tokenCookie.get();
    var oauth_token_secretCookie = new Mojo.Model.Cookie("oauth_token_secret");
    this.oauth_token_secret = oauth_token_secretCookie.get();

    var method = "data";
    var baseURL = "http://fantasysports.yahooapis.com/fantasy/v2/team/" + this.team_key + "/roster";
    var format = "xml";
    var http_method = "PUT";

    var paramObj = new GenParams;
    paramObj.genCount("put", this.oauth_token);
    var params = paramObj.getParams(method, baseURL, this.oauth_token_secret, this.oauth_token, null, null, format, http_method);

    var url = baseURL + "?" + params;

    var rosterChange =
        "<fantasy_content>" +
            "<roster>" +
                "<coverage_type>week</coverage_type>" +
                "<week>" + this.current_week + "</week>" +
                "<players>" +
                    "<player>" +
                        "<player_key>" + this.player_key + "</player_key>" +
                        "<position>" + this.newPosition + "</position>" +
                    "</player>" +
                "</players>" +
            "</roster>" +
        "</fantasy_content>";

    var xhr = new XMLHttpRequest();
    xhr.open(http_method, url, false);
    xhr.send(rosterChange);

    this.checkRoster(this);
};

EditRosterAssistant.prototype.checkRoster = function(event)
{
    var method = "data";
    var baseURL = "http://fantasysports.yahooapis.com/fantasy/v2/games;game_keys=" + this.gameKeys + "/leagues;league_keys=" + this.league_key + "/teams;team_keys=" + this.team_key + "/roster/players;player_keys=" + this.player_key;
    var format = "json";
    var http_method = "GET";

    var paramObj = new GenParams;
    paramObj.genCount("get", this.oauth_token);
    var params = paramObj.getParams(method, baseURL, this.oauth_token_secret, this.oauth_token, null, null, format, http_method);

    var url = baseURL + "?" + params;

    var request = new Ajax.Request(url,
    {
        method: http_method,
        onSuccess: this.checkPlayer.bind(this),
        onFailure: function() {
            Mojo.Log.error("Get Roster Data Call Failed");
        }
    });
};

EditRosterAssistant.prototype.checkPlayer = function(transport)
{
    var selectedPosition = transport.responseJSON.fantasy_content.games[0].game[1].leagues[0].league[1].teams[0].team[1].roster[0].players[0].player[1].selected_position[1].position;
    if (this.newPosition == selectedPosition) {
        $("ajaxSpinner").mojo.stop();
        this.scrim.hide();
        var refreshScores = true;
        var refreshScoresCookie = new Mojo.Model.Cookie("refreshScores");
        refreshScoresCookie.put(refreshScores);
	this.controller.stageController.popScene(selectedPosition);
    } else if (this.newPosition != selectedPosition && selectedPosition == "IR") {
        this.controller.showAlertDialog({
            onChoose: function() {this.controller.stageController.popScene();},
            title: ('Roster Error'),
            message: (this.player_name + ' could not be taken out of Injured Reserve. ' +
                'Please make sure there is room on the roster, since moving a player ' +
                'to IR, allows you to add another player without dropping any. ' +
                'You may need to drop another player to move ' + this.player_name +
                ' to the bench or to a starting lineup position.'),
            choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
        });
    } else {
        this.controller.showAlertDialog({
            onChoose: function() {this.controller.stageController.popScene();},
            title: ('Roster Error'),
            message: (this.player_name + ' could not be placed in the ' +
                this.newPosition + ' position. Please make sure he is not ' +
                'already playing in a live game and there is an open position ' +
                'in the list you want to move him to.'),
            choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
        });
    }
};

EditRosterAssistant.prototype.activate = function(event)
{
//    var baseURL = "http://fantasysports.yahooapis.com/fantasy/v2/league/242.l.121153/transactions";
//    var dropPlayer =
//        "<fantasy_content>" +
//            "<transaction>" +
//                "<type>drop</type>" +
//                "<player>" +
//                    "<player_key>242.p.100023</player_key>" +
//                    "<transaction_data>" +
//                        "<type>drop</type>" +
//                        "<source_team_key>242.l.121153.t.7</source_team_key>" +
//                    "</transaction_data>" +
//                "</player>" +
//            "</transaction>" +
//        "</fantasy_content>";
};

EditRosterAssistant.prototype.deactivate = function(event)
{
};

EditRosterAssistant.prototype.cleanup = function(event)
{
};
