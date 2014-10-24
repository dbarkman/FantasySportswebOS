function ViewTeamAssistant(list, index, depot)
{
    this.list = list;
    this.index = index;
    this.depot = depot;

    // get the game keys
    var gameKeysCookie = new Mojo.Model.Cookie("gameKeys");
    this.gameKeys = gameKeysCookie.get();
};

ViewTeamAssistant.prototype.setup = function()
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

    //setup the command menu, if called from home
    if (this.list[this.index].league_scoring_type == "head" && this.list[this.index].league_current_week >= this.list[this.index].league_start_week) {
        this.cmdMenuModel = {
            visible: true,
            items: [
                {label: 'Refresh', icon: 'refresh', command:'refresh'},
                {label: 'League', command:'viewLeague'},
                {label: 'Matchups', command:'viewMatchups'}//,
//                {label: 'Players', command:'viewPlayersAvail'}
            ]
        };
    } else {
        this.cmdMenuModel = {
            visible: true,
            items: [
                {label: 'Refresh', icon: 'refresh', command:'refresh'},
                {label: 'League', command:'viewLeague'}
            ]
        };
    }
    this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, this.cmdMenuModel);

    //setup the list widget to display the starting lineup
    this.listAttr = {
        renderLimit: 20,
        itemTemplate: 'viewTeam/openLineup',
        listTemplate: 'viewTeam/openLineupList',
        itemsCallback: this.openLineup.bind(this)
    };
    this.controller.setupWidget('openLineup', this.listAttr);
    this.listWidgetOL = $('openLineup')

//    //setup the tap handler
//    this.openLineupTapBinder = this.openLineupTap.bind(this);
//    Mojo.Event.listen(this.controller.get('openLineup'),Mojo.Event.listTap, this.openLineupTapBinder);

    //setup the list widget to display the starting lineup
    this.listAttr = {
        renderLimit: 20,
        itemTemplate: 'viewTeam/startingLineup',
        listTemplate: 'viewTeam/startingLineupList',
        itemsCallback: this.setPlayers.bind(this)
    };
    this.controller.setupWidget('startingLineup', this.listAttr);
    this.listWidgetSL = $('startingLineup')

    //setup the tap handler
    this.startingLineupTapBinder = this.startingLineupTap.bind(this);
    Mojo.Event.listen(this.controller.get('startingLineup'),Mojo.Event.listTap, this.startingLineupTapBinder);

    //setup the list widget to display the benched players
    this.listAttr = {
        renderLimit: 20,
        itemTemplate: 'viewTeam/benchedPlayers',
        listTemplate: 'viewTeam/benchedPlayersList',
        itemsCallback: this.setBenchedPlayers.bind(this)
    };
    this.controller.setupWidget('benchedPlayers', this.listAttr);
    this.listWidgetBN = $('benchedPlayers');

    //setup the tap handler
    this.benchedPlayersTapBinder = this.benchedPlayersTap.bind(this);
    Mojo.Event.listen(this.controller.get('benchedPlayers'),Mojo.Event.listTap, this.benchedPlayersTapBinder);

    //setup tap handler for opponent row
    Mojo.Event.listen(this.controller.get('opponentRow'),Mojo.Event.tap, this.viewOpponent.bind(this));

    this.getSchedule(this);
    this.getTeamRefresh(this);
};

ViewTeamAssistant.prototype.viewOpponent = function(event)
{
    var statCats = this.list[this.index].league_stat_categories;
    this.controller.stageController.pushScene('otherTeam', this.otherTeam, 0, statCats, this.schedule);
};

ViewTeamAssistant.prototype.openLineupTap = function(event)
{
    var statCats = this.list[this.index].league_stat_categories;
    this.controller.stageController.pushScene('viewPlayer', this.roster, event.index, statCats, this.games, this.rosterPositions);
};

ViewTeamAssistant.prototype.startingLineupTap = function(event)
{
    var statCats = this.list[this.index].league_stat_categories;
    this.controller.stageController.pushScene('viewPlayer', this.roster, event.index, statCats, this.games, this.rosterPositions);
};

ViewTeamAssistant.prototype.benchedPlayersTap = function(event)
{
    var statCats = this.list[this.index].league_stat_categories;
    this.controller.stageController.pushScene('viewPlayer', this.benched, event.index, statCats, this.games, this.rosterPositions);
};

ViewTeamAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'viewLeague':
                var statCats = this.list[this.index].league_stat_categories;
                this.controller.stageController.pushScene('viewLeague', this.list, this.index, this.transactions, this.messages, statCats, this.schedule);
                break;
            case 'viewMatchups':
                this.controller.stageController.pushScene('viewMatchups', this.list[this.index].league_name, this.list[this.index].league_current_week, this.matchups);
                break;
            case 'refresh':
                this.refToken(this);
                break;
            case 'fantasySportsHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

ViewTeamAssistant.prototype.openLineup = function(transport)
{
    var openPosCount = 0;
    if (this.openPosArray != undefined) {
        openPosCount = this.openPosArray.length;
        if (this.openPosArray.length == 0) {
            var openLineupDiv = this.controller.get("openLineup");
            openLineupDiv.hide();
        }
        var j = 0;
        this.openPosObj = new Array();
        for (var i = 0; i < openPosCount; i += 1) {
            this.openPosObj[j] = {
                "position": this.openPosArray[i]
            };
            j += 1;
        }
        this.listWidgetOL.mojo.noticeUpdatedItems(0, this.openPosObj);
    }
};

ViewTeamAssistant.prototype.setPlayers = function(transport)
{
    this.players = this.list[this.index].players;
    var playerCount = this.list[this.index].players_count;
    this.roster = new Array();
    var i;
    var j = 0;
    for (i = 0; i < playerCount; i += 1) {
        var position = this.players[i].current_position;
        if (position != "BN" && position != "IR") {
            this.roster[j] = {
                "league_key": this.players[i].league_key,
                "team_key": this.players[i].team_key,
                "player_key": this.players[i].player_key,
                "player_id": this.players[i].player_id,
                "player_name": this.players[i].player_name,
                "player_full_name": this.players[i].player_full_name,
                "player_schedule": this.players[i].player_schedule,
                "player_schedule_list": this.players[i].player_schedule_list,
                "editorial_player_key": this.players[i].editorial_player_key,
                "editorial_team_key": this.players[i].editorial_team_key,
                "editorial_team_full_name": this.players[i].editorial_team_full_name,
                "editorial_team_abbr": this.players[i].editorial_team_abbr,
                "bye_week": this.players[i].bye_week,
                "uniform_number": this.players[i].uniform_number,
                "image_url": this.players[i].image_url,
                "is_undroppable": this.players[i].is_undroppable,
                "display_position": this.players[i].display_position,
                "current_position": position,
                "eligible_positions": "",
                "has_player_notes": this.players[i].has_player_notes,
                "week_points": "", //scores refresh
                "season_points": this.players[i].season_points,
                "week_stats": "", //scores refresh
                "season_stats": this.players[i].season_stats,
                "percent_owned": this.players[i].percent_owned,
                "average_pick": this.players[i].average_pick,
                "average_round": this.players[i].average_round,
                "percent_drafted": this.players[i].percent_drafted,
                "status": this.players[i].status,
                "status_list": this.players[i].status_list,
                "on_disabled_list": this.players[i].on_disabled_list,
                "league_current_week": this.players[i].league_current_week
            };
            if (this.listRefresh == true) {
                this.roster[j].week_points = this.players[i].week_points;
                this.roster[j].week_stats = this.players[i].week_stats;
                this.roster[j].eligible_positions = this.players[i].eligible_positions;
            }
            j += 1;
        }
    }
    this.slLength1 = this.listWidgetSL.mojo.getLength();
    this.listWidgetSL.mojo.noticeUpdatedItems(0, this.roster);
};

ViewTeamAssistant.prototype.setBenchedPlayers = function(transport)
{
    this.players = this.list[this.index].players;
    var playerCount = this.list[this.index].players_count;
    this.benched = new Array();
    var i;
    var j = 0;
    for (i = 0; i < playerCount; i += 1) {
        var position = this.players[i].current_position;
        if (position == "BN" || position == "IR") {
            this.benched[j] = {
                "league_key": this.players[i].league_key,
                "team_key": this.players[i].team_key,
                "player_key": this.players[i].player_key,
                "player_id": this.players[i].player_id,
                "player_name": this.players[i].player_name,
                "player_full_name": this.players[i].player_full_name,
                "player_schedule": this.players[i].player_schedule,
                "player_schedule_list": this.players[i].player_schedule_list,
                "editorial_player_key": this.players[i].editorial_player_key,
                "editorial_team_key": this.players[i].editorial_team_key,
                "editorial_team_full_name": this.players[i].editorial_team_full_name,
                "editorial_team_abbr": this.players[i].editorial_team_abbr,
                "bye_week": this.players[i].bye_week,
                "uniform_number": this.players[i].uniform_number,
                "image_url": this.players[i].image_url,
                "is_undroppable": this.players[i].is_undroppable,
                "display_position": this.players[i].display_position,
                "current_position": position,
                "eligible_positions": "",
                "has_player_notes": this.players[i].has_player_notes,
                "week_points": "", //scores refresh
                "season_points": this.players[i].season_points,
                "week_stats": "", //scores refresh
                "season_stats": this.players[i].season_stats,
                "percent_owned": this.players[i].percent_owned,
                "average_pick": this.players[i].average_pick,
                "average_round": this.players[i].average_round,
                "percent_drafted": this.players[i].percent_drafted,
                "status": this.players[i].status,
                "status_list": this.players[i].status_list,
                "on_disabled_list": this.players[i].on_disabled_list,
                "league_current_week": this.players[i].league_current_week
            };
            if (this.listRefresh == true) {
                this.benched[j].week_points = this.players[i].week_points;
                this.benched[j].week_stats = this.players[i].week_stats;
                this.benched[j].eligible_positions = this.players[i].eligible_positions;
            }
            j += 1;
        }
    }
    this.bnLength1 = this.listWidgetBN.mojo.getLength();
    this.listWidgetBN.mojo.noticeUpdatedItems(0, this.benched);
};

ViewTeamAssistant.prototype.getSchedule = function(transport)
{
    //get the player's schedule
    var url = 'https://reallysimpleapps.com/FanFeedrAPI/ScheduleAPI.php';

    var request = new Ajax.Request(url,{
        method: 'POST',
        parameters: {
            'appID': 'AmljMatBLUYS873DUAwyZUBdaJpgTGOK'
        },
        onSuccess: this.setSchedule.bind(this),
        onFailure: function(){
            Mojo.Log.error('Failed to get schedule.');
        }
    });
};

ViewTeamAssistant.prototype.setSchedule = function(transport)
{
    this.schedule = transport.responseText.evalJSON();
};

ViewTeamAssistant.prototype.getTeamRefresh = function(transport)
{
    //set the refresh flag
    this.listRefresh = true;

    //insert score refresh here
    var oauth_tokenCookie = new Mojo.Model.Cookie("oauth_token");
    var oauth_token = oauth_tokenCookie.get();
    var oauth_token_secretCookie = new Mojo.Model.Cookie("oauth_token_secret");
    var oauth_token_secret = oauth_token_secretCookie.get();

    var method = "data";
    if (this.list[this.index].league_scoring_type == "head" && this.list[this.index].league_current_week >= this.list[this.index].league_start_week) {
        var baseURL = "http://fantasysports.yahooapis.com/fantasy/v2/games;game_keys=" + this.gameKeys + "/leagues;league_keys=" + this.list[this.index].league_key + ";out=settings,transactions,messages,scoreboard/teams;team_keys=" + this.list[this.index].team_key + ";out=standings,stats;stats.type=week;stats.week=" + this.list[this.index].league_current_week + "/roster/players/stats;type=week;week=" + this.list[this.index].league_current_week;
//        var baseURL = "http://fantasysports.yahooapis.com/fantasy/v2/games;game_keys=" + this.gameKeys + "/leagues;league_keys=" + this.list[this.index].league_key + ";out=settings,transactions,messages,scoreboard/teams;team_keys=" + this.list[this.index].team_key + ";out=standings,stats;stats.type=week;stats.week=1/roster/players/stats;type=week;week=1";
    } else {
        var baseURL = "http://fantasysports.yahooapis.com/fantasy/v2/games;game_keys=" + this.gameKeys + "/leagues;league_keys=" + this.list[this.index].league_key + ";out=settings,transactions,messages/teams;team_keys=" + this.list[this.index].team_key + ";out=standings,stats;stats.type=week;stats.week=" + this.list[this.index].league_current_week + "/roster/players/stats;type=week;week=" + this.list[this.index].league_current_week;
    }
    var format = "json";
    var http_method = "GET";

    var paramObj = new GenParams;
    paramObj.genCount("week", oauth_token);
    var params = paramObj.getParams(method, baseURL, oauth_token_secret, oauth_token, null, null, format, http_method);

    var url = baseURL + "?" + params;

    var request = new Ajax.Request(url,
    {
        method: 'GET',
        onSuccess: this.refreshTeam.bind(this),
        onFailure: function() {
            Mojo.Log.error("Get Scores Data Call Failed");
        }
    });
};

ViewTeamAssistant.prototype.refreshTeam = function(transport)
{
    this.games = transport.responseJSON.fantasy_content.games;

    var z = 0;

    this.transactions = transport.responseJSON.fantasy_content.games[0].game[1].leagues[0].league[2].transactions;
    this.messages = transport.responseJSON.fantasy_content.games[0].game[1].leagues[0].league[3].messages;
    if (this.list[this.index].league_scoring_type == "head" && this.list[this.index].league_current_week >= this.list[this.index].league_start_week) {
        this.matchups = transport.responseJSON.fantasy_content.games[0].game[1].leagues[0].league[4].scoreboard[0].matchups;
        z = 1;
        var opponentTitleDiv = this.controller.get("opponentTitle");
        opponentTitleDiv.innerHTML = '<span>Opponent</span>';
        var opponentDiv = this.controller.get("opponent");
        var myTeamKey = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[0][0].team_key
        var matchupsCount = this.matchups.count;
        for (var y = 0; y < matchupsCount; y += 1) {
            var matchupTeams = this.matchups[y].matchup[0].teams
            var matchupTeamsCount = matchupTeams.count;
            for (var x = 0; x < matchupTeamsCount; x += 1) {
                if (matchupTeams[x].team[0][0].team_key == myTeamKey) {
                    var otherTeam = x == 0 ? 1 : 0;
                    var opponent = '<span class="leftMg5"><img src="' + matchupTeams[otherTeam].team[0][4].team_logos[0].team_logo.url + '" align="middle"></span><span class="leftMg5">' + matchupTeams[otherTeam].team[0][2].name + ':</span><span class="leftMg5">' + matchupTeams[otherTeam].team[1].team_points.total + '</span>';
                    opponentDiv.innerHTML = opponent;
                    this.otherTeam = new Array();
                    //setup the data array to be passed to otherTeam
                    this.otherTeam[0] = {
                        "league_scoring_type": this.list[this.index].league_scoring_type,
                        "league_current_week": this.list[this.index].league_current_week,
                        "league_start_week": this.list[this.index].league_start_week,
                        "league_key": this.list[this.index].league_key,
                        "team_key": matchupTeams[otherTeam].team[0][0].team_key
                    };
                }
            }
        }
    } else {
        var opponentMainDiv = this.controller.get("opponentGroup");
        opponentMainDiv.hide();
    }

    // gather manager information
    var managers = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[0][8].managers;
    var manager_id = managers[0].manager.manager_id;
    var manager_nickname = managers[0].manager.nickname;
    var is_commissioner = "";
    if (managers[0].manager.is_commissioner == 1) {
        is_commissioner = " - Commissioner";
    }

    // gather co-manager information
    var co_manager_id = "";
    var co_manager_nickname = "";
    var is_comanager_commissioner = "";
    if (managers.length == 2) {
        co_manager_id = managers[1].manager.manager_id;
        co_manager_nickname = "<br />Co-Manager: " + managers[1].manager.nickname;
        if (managers[1].manager.is_commissioner == 1) {
            is_comanager_commissioner = " - Commissioner";
        }
    }

//    // setup stat categories for leagues
//    var statCats = this.games[0].game[1].leagues[0].league[1].settings[0].stat_categories.stats;
//    var statCatsCount = statCats.length;
//    var seasonStatCats = "";
//    for (var i = 0; i < statCatsCount; i += 1) {
//        seasonStatCats = seasonStatCats + statCats[i].stat.stat_id + "|" + statCats[i].stat.name + ",";
//    }
//
    // setup roster league postions
    this.rosterPositions = {
        "QB": "0",
        "WR": "0",
        "RB": "0",
        "TE": "0",
        "WT": "0",
        "WRb": "0",
        "WRT": "0",
        "QWRT": "0",
        "K": "0",
        "DEF": "0",
        "D": "0",
        "DL": "0",
        "DB": "0",
        "LB": "0",
        "DE": "0",
        "DT": "0",
        "CB": "0",
        "S": "0",
        "IR": "0",
        "BN": "0"
    }
    var roster_positions = this.games[0].game[1].leagues[0].league[1].settings[0].roster_positions;
    var roster_positions_count = roster_positions.length;
    var rosterPositions = "";
    this.totalPositions = 0;
    for (var j = 0; j < roster_positions_count; j += 1) {
        var position = "";
        switch(roster_positions[j].roster_position.position) {
            case "QB":
                position = "Quarterbacks";
                this.rosterPositions.QB = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "WR":
                position = "Wide Receivers";
                this.rosterPositions.WR = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "RB":
                position = "Running Backs";
                this.rosterPositions.RB = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "TE":
                position = "Tight Ends";
                this.rosterPositions.TE = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "W/T":
                position = "Wide Receiver/Tight End";
                this.rosterPositions.WT = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "W/R":
                position = "Wide Receiver/Running Back";
                this.rosterPositions.WRb = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "W/R/T":
                position = "Wide Receiver/Running Back/Tight End ";
                this.rosterPositions.WRT = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "Q/W/R/T":
                position = "Quarterback/Wide Receiver/Running Back/Tight End";
                this.rosterPositions.QWRT = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "K":
                position = "Kickers";
                this.rosterPositions.K = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "DEF":
                position = "Defense";
                this.rosterPositions.DEF = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "D":
                position = "Defensive Player";
                this.rosterPositions.D = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "DL":
                position = "Defensive Lineman";
                this.rosterPositions.DL = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "DB":
                position = "Defensive Back";
                this.rosterPositions.DB = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "LB":
                position = "Linebacker";
                this.rosterPositions.LB = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "DE":
                position = "Defensive End";
                this.rosterPositions.DE = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "DT":
                position = "Defensive Tackle";
                this.rosterPositions.DT = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "CB":
                position = "Cornerback";
                this.rosterPositions.CB = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "S":
                position = "Safety";
                this.rosterPositions.S = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "IR":
                position = "Injured Reserve";
                this.rosterPositions.IR = parseInt(roster_positions[j].roster_position.count);
//                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
            case "BN":
                position = "Bench";
                this.rosterPositions.BN = parseInt(roster_positions[j].roster_position.count);
                this.totalPositions = this.totalPositions + parseInt(roster_positions[j].roster_position.count);
                break;
        }
        //this isn't actually used currently
        rosterPositions = rosterPositions + position + ": " + parseInt(roster_positions[j].roster_position.count) + "<br />";
    }

    // setup the list
    this.list[this.index].game_count = this.games.count;
    this.list[this.index].game_key = this.games[0].game[0].game_key;
    this.list[this.index].game_id = this.games[0].game[0].game_id;
    this.list[this.index].game_name = this.games[0].game[0].name;
    this.list[this.index].game_code = this.games[0].game[0].code;
    this.list[this.index].game_type = this.games[0].game[0].type;
    this.list[this.index].game_url = this.games[0].game[0].url;
    this.list[this.index].game_season = this.games[0].game[0].season;
    this.list[this.index].league_count = this.games[0].game[1].leagues.count;
    this.list[this.index].league_key = this.games[0].game[1].leagues[0].league[0].league_key;
    this.list[this.index].league_id = this.games[0].game[1].leagues[0].league[0].league_id;
    this.list[this.index].league_name = this.games[0].game[1].leagues[0].league[0].name;
    this.list[this.index].league_url = this.games[0].game[1].leagues[0].league[0].url;
    this.list[this.index].league_draft_status = this.games[0].game[1].leagues[0].league[0].draft_status;
    this.list[this.index].league_num_teams = this.games[0].game[1].leagues[0].league[0].num_teams;
    this.list[this.index].league_current_week = this.games[0].game[1].leagues[0].league[0].current_week;
    this.list[this.index].league_start_week = this.games[0].game[1].leagues[0].league[0].start_week;
    this.list[this.index].league_end_week = this.games[0].game[1].leagues[0].league[0].end_week;
    this.list[this.index].league_draft_type = this.games[0].game[1].leagues[0].league[1].settings[0].draft_type;
    this.list[this.index].league_scoring_type = this.games[0].game[1].leagues[0].league[1].settings[0].scoring_type;
    this.list[this.index].league_uses_playoff = this.games[0].game[1].leagues[0].league[1].settings[0].uses_playoff;
    this.list[this.index].league_playoff_start_week = ""; //head to head league
//    this.list[this.index].league_stat_categories = seasonStatCats;
    this.list[this.index].league_roster_positions = rosterPositions;
    this.list[this.index].team_count = this.games[0].game[1].leagues[0].league[4 + z].teams.count;
    this.list[this.index].team_key = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[0][0].team_key;
    this.list[this.index].team_id = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[0][1].team_id;
    this.list[this.index].team_name = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[0][2].name;
    this.list[this.index].team_url = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[0][3].url;
    this.list[this.index].team_logo = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[0][4].team_logos[0].team_logo.url;
    this.list[this.index].team_rank = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[1].team_standings.rank;
    this.list[this.index].team_wins = ""; //head to head league
    this.list[this.index].team_losses = ""; //head to head league
    this.list[this.index].team_ties = ""; //head to head league
    this.list[this.index].team_percentage = ""; //head to head league
    this.list[this.index].team_week_points = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[2].team_points.total; //scores refresh
    this.list[this.index].team_projected_points = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[2].team_projected_points.total; //scores refresh
    this.list[this.index].team_points_change = ""; //points league //need to know if this changes during the day on Sunday
    this.list[this.index].manager = manager_nickname;
    this.list[this.index].manager_id = manager_id;
    this.list[this.index].co_manager = co_manager_nickname;
    this.list[this.index].co_manager_id = co_manager_id;
    this.list[this.index].commissioner = is_commissioner;
    this.list[this.index].comanager_commissioner = is_comanager_commissioner;
    this.list[this.index].players_count = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[3].roster[0].players.count;

    if (this.games[0].game[1].leagues[0].league[1].settings[0].scoring_type == "head") {
        //nfl head-to-head leagues
        this.list[this.index].league_playoff_start_week = this.games[0].game[1].leagues[0].league[1].settings[0].playoff_start_week;
        this.list[this.index].team_wins = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[1].team_standings.outcome_totals.wins; //head to head league
        this.list[this.index].team_losses = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[1].team_standings.outcome_totals.losses; //head to head league
        this.list[this.index].team_ties = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[1].team_standings.outcome_totals.ties; //head to head league
        this.list[this.index].team_percentage = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[1].team_standings.outcome_totals.percentage; //head to head league
        if (this.list[this.index].team_percentage == "") this.list[this.index].team_percentage = 0;
    } else {
        //nfl points leagues
        this.list[this.index].team_points_change = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[1].team_standings.points_change; //points league
    }

    if (this.list[this.index].team_rank == "") this.list[this.index].team_rank = "-";
    if (this.list[this.index].team_total_points == "") this.list[this.index].team_total_points = 0;

    // set the players list
    var players = this.games[0].game[1].leagues[0].league[4 + z].teams[0].team[3].roster[0].players;
    this.playerCount = players.count;
    for (var k = 0; k < this.playerCount; k += 1) {

        // look for status
        var l = 0;
        if (players[k].player[0][3].status) l = 1;
        if (players[k].player[0][4].on_disabled_list) l = 2;

        // display multiple available positions
        var positions = players[k].player[0][12 + l].eligible_positions;
        var eligible_positions = "";
        for (var m in positions) {
            if (positions.hasOwnProperty(m)) {
                if (m == 0) {
                    eligible_positions = eligible_positions + positions[m].position;
                } else {
                    eligible_positions = eligible_positions + "," + positions[m].position;
                }
            }
        }

        // display correct name, fullname for defense, first initial and last name for players
        var display_name
        if (players[k].player[0][2].name.last == "") {
            display_name = players[k].player[0][2].name.full;
        } else {
            display_name = players[k].player[0][2].name.first.substr(0,1) + " " + players[k].player[0][2].name.last;
        }

        // setup stats for players
        var stats = players[k].player[3].player_stats.stats;
        var statsCount = stats.length;
        var weekStats = "";
        for (var n = 0; n < statsCount; n += 1) {
            weekStats = weekStats + stats[n].stat.stat_id + "|" + stats[n].stat.value + " ";
        }

        var teamAbbr = players[k].player[0][6 + l].editorial_team_abbr;
        var player_schedule = "";
        switch (teamAbbr) {
            case "Ari":
                player_schedule = this.schedule.Ari;
                break;
            case "Atl":
                player_schedule = this.schedule.Atl;
                break;
            case "Bal":
                player_schedule = this.schedule.Bal;
                break;
            case "Buf":
                player_schedule = this.schedule.Buf;
                break;
            case "Car":
                player_schedule = this.schedule.Car;
                break;
            case "Chi":
                player_schedule = this.schedule.Chi;
                break;
            case "Cin":
                player_schedule = this.schedule.Cin;
                break;
            case "Cle":
                player_schedule = this.schedule.Cle;
                break;
            case "Dal":
                player_schedule = this.schedule.Dal;
                break;
            case "Den":
                player_schedule = this.schedule.Den;
                break;
            case "Det":
                player_schedule = this.schedule.Det;
                break;
            case "GB":
                player_schedule = this.schedule.GB;
                break;
            case "Hou":
                player_schedule = this.schedule.Hou;
                break;
            case "Ind":
                player_schedule = this.schedule.Ind;
                break;
            case "Jac":
                player_schedule = this.schedule.Jac;
                break;
            case "KC":
                player_schedule = this.schedule.KC;
                break;
            case "Mia":
                player_schedule = this.schedule.Mia;
                break;
            case "Min":
                player_schedule = this.schedule.Min;
                break;
            case "NE":
                player_schedule = this.schedule.NE;
                break;
            case "NO":
                player_schedule = this.schedule.NO;
                break;
            case "NYG":
                player_schedule = this.schedule.NYG;
                break;
            case "NYJ":
                player_schedule = this.schedule.NYJ;
                break;
            case "Oak":
                player_schedule = this.schedule.Oak;
                break;
            case "Phi":
                player_schedule = this.schedule.Phi;
                break;
            case "Pit":
                player_schedule = this.schedule.Pit;
                break;
            case "SD":
                player_schedule = this.schedule.SD;
                break;
            case "Sea":
                player_schedule = this.schedule.Sea;
                break;
            case "SF":
                player_schedule = this.schedule.SF;
                break;
            case "StL":
                player_schedule = this.schedule.StL;
                break;
            case "TB":
                player_schedule = this.schedule.TB;
                break;
            case "Ten":
                player_schedule = this.schedule.Ten;
                break;
            case "Was":
                player_schedule = this.schedule.Was;
                break;
        }

        var player_schedule_list = "";
        if (player_schedule == undefined) {
            player_schedule_list = "";
            player_schedule = "";
        } else {
            player_schedule_list = '<span class="medFont leftMg15">' + player_schedule + '</span><br />';
            player_schedule = '<tr><td colspan="2"><span class="medFont">Current: ' + player_schedule + '</span></td></tr>';
        }

        // set the players list
        this.list[this.index].players[k].player_key = players[k].player[0][0].player_key;
        this.list[this.index].players[k].player_id = players[k].player[0][1].player_id;
        this.list[this.index].players[k].player_name = display_name;
        this.list[this.index].players[k].player_full_name = players[k].player[0][2].name.full;
        this.list[this.index].players[k].player_schedule = player_schedule;
        this.list[this.index].players[k].player_schedule_list = player_schedule_list;
        this.list[this.index].players[k].editorial_player_key = players[k].player[0][3 + l].editorial_player_key;
        this.list[this.index].players[k].editorial_team_key = players[k].player[0][4 + l].editorial_team_key;
        this.list[this.index].players[k].editorial_team_full_name = players[k].player[0][5 + l].editorial_team_full_name;
        this.list[this.index].players[k].editorial_team_abbr = players[k].player[0][6 + l].editorial_team_abbr;
        this.list[this.index].players[k].bye_week = players[k].player[0][7 + l].bye_weeks.week;
        this.list[this.index].players[k].uniform_number = players[k].player[0][8 + l].uniform_number;
        this.list[this.index].players[k].display_position = players[k].player[0][9 + l].display_position;
        this.list[this.index].players[k].image_url = players[k].player[0][10 + l].image_url;
        this.list[this.index].players[k].is_undroppable = players[k].player[0][11 + l].is_undroppable;
        this.list[this.index].players[k].current_position = players[k].player[1].selected_position[1].position;
        this.list[this.index].players[k].eligible_positions = eligible_positions;
        this.list[this.index].players[k].week_points = players[k].player[3].player_points.total;
        this.list[this.index].players[k].week_stats = weekStats;
        this.list[this.index].players[k].status = "";
        this.list[this.index].players[k].status_list = "";
        this.list[this.index].players[k].on_disabled_list = "";
        this.list[this.index].players[k].league_current_week = this.games[0].game[1].leagues[0].league[0].current_week

        //alert players on bye weeks
        if (this.list[this.index].players[k].league_current_week == this.list[this.index].players[k].bye_week) {
            this.list[this.index].players[k].status = players[k].player[0][3].status;
            this.list[this.index].players[k].bye_week = '<span class="red">Bye Week: ' + players[k].player[0][7 + l].bye_weeks.week + '</span>';
        } else {
            this.list[this.index].players[k].status = players[k].player[0][3].status;
            this.list[this.index].players[k].bye_week = '<span>Bye Week: ' + players[k].player[0][7 + l].bye_weeks.week + '</span>';
        }

        //populate status
        if (l == 2) {
            this.list[this.index].players[k].status_list = '<span class="red">Status: ' + players[k].player[0][3].status + '</span>';
            this.list[this.index].players[k].on_disabled_list = players[k].player[0][4].on_disabled_list;
        } else if (l == 1) {
            this.list[this.index].players[k].status_list = '<span class="red">Status: ' + players[k].player[0][3].status + '</span>';
        }

        //update the roster counts
        switch(this.list[this.index].players[k].current_position) {
            case "QB":
                this.rosterPositions.QB = this.rosterPositions.QB - 1;
                break;
            case "WR":
                this.rosterPositions.WR = this.rosterPositions.WR - 1;
                break;
            case "RB":
                this.rosterPositions.RB = this.rosterPositions.RB - 1;
                break;
            case "TE":
                this.rosterPositions.TE = this.rosterPositions.TE - 1;
                break;
            case "W/T":
                this.rosterPositions.WT = this.rosterPositions.WT - 1;
                break;
            case "W/R":
                this.rosterPositions.WRb = this.rosterPositions.WRb - 1;
                break;
            case "W/R/T":
                this.rosterPositions.WRT = this.rosterPositions.WRT - 1;
                break;
            case "Q/W/R/T":
                this.rosterPositions.QWRT = this.rosterPositions.QWRT - 1;
                break;
            case "K":
                this.rosterPositions.K = this.rosterPositions.K - 1;
                break;
            case "DEF":
                this.rosterPositions.DEF = this.rosterPositions.DEF - 1;
                break;
            case "D":
                this.rosterPositions.D = this.rosterPositions.D - 1;
                break;
            case "DL":
                this.rosterPositions.DL = this.rosterPositions.DL - 1;
                break;
            case "DB":
                this.rosterPositions.DB = this.rosterPositions.DB - 1;
                break;
            case "LB":
                this.rosterPositions.LB = this.rosterPositions.LB - 1;
                break;
            case "DE":
                this.rosterPositions.DE = this.rosterPositions.DE - 1;
                break;
            case "DT":
                this.rosterPositions.DT = this.rosterPositions.DT - 1;
                break;
            case "CB":
                this.rosterPositions.CB = this.rosterPositions.CB - 1;
                break;
            case "S":
                this.rosterPositions.S = this.rosterPositions.S - 1;
                break;
            case "IR":
                this.rosterPositions.IR = this.rosterPositions.IR - 1;
                break;
            case "BN":
                this.rosterPositions.BN = this.rosterPositions.BN - 1;
                break;
        }
    }

    //array for open positions list
    this.openPosArray = [];

    //find open positions
    this.openPositions = "";
    this.openPositionCount = 0;
    if (this.rosterPositions.QB > 0) {
        for (var i = 0; i < this.rosterPositions.QB; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "QB";
            this.openPosArray[this.openPosArray.length] = "Quarterback - QB";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.WR > 0) {
        for (var i = 0; i < this.rosterPositions.WR; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "WR";
            this.openPosArray[this.openPosArray.length] = "Wide Receiver - WR";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.RB > 0) {
        for (var i = 0; i < this.rosterPositions.RB; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "RB";
            this.openPosArray[this.openPosArray.length] = "Running Back - RB";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.TE > 0) {
        for (var i = 0; i < this.rosterPositions.TE; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "TE";
            this.openPosArray[this.openPosArray.length] = "Tight End - TE";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.WT > 0) {
        for (var i = 0; i < this.rosterPositions.WT; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "W/T";
            this.openPosArray[this.openPosArray.length] = "Wide Receiver/Tight End - W/T";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.WRb > 0) {
        for (var i = 0; i < this.rosterPositions.WRb; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "W/R";
            this.openPosArray[this.openPosArray.length] = "Wide Receiver/Running Back - W/R";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.WRT > 0) {
        for (var i = 0; i < this.rosterPositions.WRT; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "W/R/T";
            this.openPosArray[this.openPosArray.length] = "Wide Receiver/Running Back/Tight End - W/R/T";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.QWRT > 0) {
        for (var i = 0; i < this.rosterPositions.QWRT; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "Q/W/R/T";
            this.openPosArray[this.openPosArray.length] = "Quarterback/Wide Receiver/Running Back/Tight End - Q/W/R/T";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.K > 0) {
        for (var i = 0; i < this.rosterPositions.K; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "K";
            this.openPosArray[this.openPosArray.length] = "Kicker - K";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.DEF > 0) {
        for (var i = 0; i < this.rosterPositions.DEF; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "DEF";
            this.openPosArray[this.openPosArray.length] = "Defense - DEF";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.D > 0) {
        for (var i = 0; i < this.rosterPositions.D; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "D";
            this.openPosArray[this.openPosArray.length] = "Defensive Player - D";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.DL > 0) {
        for (var i = 0; i < this.rosterPositions.DL; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "DL";
            this.openPosArray[this.openPosArray.length] = "Defensive Lineman - DL";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.DB > 0) {
        for (var i = 0; i < this.rosterPositions.DB; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "DB";
            this.openPosArray[this.openPosArray.length] = "Defensive Back - DB";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.LB > 0) {
        for (var i = 0; i < this.rosterPositions.LB; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "LB";
            this.openPosArray[this.openPosArray.length] = "Linebacker - LB";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.DE > 0) {
        for (var i = 0; i < this.rosterPositions.DE; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "DE";
            this.openPosArray[this.openPosArray.length] = "Defensive End - DE";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.DT > 0) {
        for (var i = 0; i < this.rosterPositions.DT; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "DT";
            this.openPosArray[this.openPosArray.length] = "Defensive Tackle - DT";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.CB > 0) {
        for (var i = 0; i < this.rosterPositions.CB; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "CB";
            this.openPosArray[this.openPosArray.length] = "Cornerback - CB";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
    if (this.rosterPositions.S > 0) {
        for (var i = 0; i < this.rosterPositions.S; i += 1) {
            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
            this.openPositions = this.openPositions + "S";
            this.openPosArray[this.openPosArray.length] = "Safety - S";
            this.openPositionCount = this.openPositionCount += 1;
        }
    }
//    if (this.rosterPositions.IR > 0) {
//        for (var i = 0; i < this.rosterPositions.IR; i += 1) {
//            if (this.openPositions != "") this.openPositions = this.openPositions + ", ";
//            this.openPositions = this.openPositions + "IR";
//            this.openPositionCount = this.openPositionCount += 1;
//        }
//    }
    this.openLineup(this);

    //display the team
    this.setPlayers(this);
    this.setBenchedPlayers(this);
    this.slLength2 = this.listWidgetSL.mojo.getLength();
    this.bnLength2 = this.listWidgetBN.mojo.getLength();
    this.olLength = this.listWidgetOL.mojo.getLength();
    //bench list didn't shorten
    if (this.slLength1 != this.slLength2 && this.bnLength1 == this.bnLength2) {
        if (this.slLength2 > this.slLength1) {
            this.listWidgetBN.mojo.noticeRemovedItems(this.bnLength2 - 1, 1)
            this.listWidgetOL.mojo.noticeRemovedItems(this.olLength - 1, 1)
        }
    }
    //starting lineup didn't shorten
    if (this.bnLength1 != this.bnLength2 && this.slLength1 == this.slLength2) {
        if (this.bnLength2 > this.bnLength1) {
            this.listWidgetSL.mojo.noticeRemovedItems(this.slLength2 - 1, 1)
        }
    }
    this.displayTeam(this);
};

ViewTeamAssistant.prototype.displayTeam = function(event)
{
    //team and league names and rank
    this.details = '<table class="team"><tr><td><img src="' + this.list[this.index].team_logo + '"></td>' +
        "<td>" +
        this.list[this.index].team_name + "<br />" +
        this.list[this.index].league_name + "<br />" +
        '<span class="medFont">Rank: ' + this.list[this.index].team_rank +
        " of " + this.list[this.index].league_num_teams + "</span>";
    if (this.list[this.index].league_scoring_type == "head") {
        this.details = this.details +
        '<span class="leftMg15 medFont">' + this.list[this.index].team_wins + "-" +
        this.list[this.index].team_losses + "-" + this.list[this.index].team_ties + " " +
        Math.round(this.list[this.index].team_percentage * 100) + "%</span>";
    }
    this.details = this.details + "</td></tr></table>";

    var detailsDiv = this.controller.get("details");
    detailsDiv.innerHTML = this.details;

    //alerts
    this.alerts = "";
    var openSlots = (this.totalPositions - this.playerCount);
    if (openSlots > 0) {
        this.alerts = this.alerts = '<span class="red">You currently have ' + openSlots + ' empty spot(s) on your roster.</span>';
    }
    if (this.openPositionCount > 0) {
        if (this.alerts != "") this.alerts = this.alerts + '<br /><br />'
        this.alerts = this.alerts + '<span class="red">The following postion(s) are currently open in your starting lineup: ' +
            this.openPositions;
    }

    var alertsMainDiv = this.controller.get("groupAlerts");
    var alertsTitleDiv = this.controller.get("alertsTitle");
    var alertsDiv = this.controller.get("alerts");

    if (this.alerts == "") {
        alertsMainDiv.hide();
    } else {
        alertsTitleDiv.innerHTML = '<span class="red">Alerts</span>';
        alertsDiv.innerHTML = this.alerts;
    }

    //points
    this.points = '<span class="medFont leftMg5">Week ' + this.list[this.index].league_current_week + ':</span><span class="leftMg5">' + this.list[this.index].team_week_points + "</span>" +
        '<span class="leftMg15 medFont">Total: ' + this.list[this.index].team_total_points + "</span>";
    var pointsDiv = this.controller.get("points");
    pointsDiv.innerHTML = this.points;

    //don't refresh scores until we make a player change
    var refreshScores = false;
    var refreshScoresCookie = new Mojo.Model.Cookie("refreshScores");
    refreshScoresCookie.put(refreshScores);

    var fetchingDiv = this.controller.get("fetching");
    fetchingDiv.hide();
    $("ajaxSpinner").mojo.stop();
    this.scrim.hide();
};

ViewTeamAssistant.prototype.activate = function(event)
{
    //setup the cookie to see if we should refresh scores
    var refreshScoresCookie = new Mojo.Model.Cookie("refreshScores");
    var refreshScores = refreshScoresCookie.get();

    if (refreshScores == true) {
        this.scrim.show();
        $("ajaxSpinner").mojo.start();
        this.getTeamRefresh(this);
    }
};

ViewTeamAssistant.prototype.refToken = function()
{
    this.scrim.show();
    $("ajaxSpinner").mojo.start();
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
    paramObj.genCount("weekref", oauth_token);
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
};

ViewTeamAssistant.prototype.setCookies = function(response)
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
    this.depot.add("oauth", this.data, this.dbSuccess, this.dbFailure)

    this.getSchedule(this);
    this.getTeamRefresh(this);
};

ViewTeamAssistant.prototype.dbSuccess = function(event)
{
};

ViewTeamAssistant.prototype.dbFailure = function(event)
{
    Mojo.Log.error("Depot Add failed");
};

ViewTeamAssistant.prototype.deactivate = function(event)
{
};

ViewTeamAssistant.prototype.cleanup = function(event)
{
//    Mojo.Event.stopListening(this.controller.get('openLineup'), Mojo.Event.listTap, this.openLineupTap.bind(this));
    Mojo.Event.stopListening(this.controller.get('startingLineup'), Mojo.Event.listTap, this.startingLineupTap.bind(this));
    Mojo.Event.stopListening(this.controller.get('benchedPlayers'), Mojo.Event.listTap, this.benchedPlayersTap.bind(this));
};
