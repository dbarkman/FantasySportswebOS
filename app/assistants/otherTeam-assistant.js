function OtherTeamAssistant(list, index, statCats, schedule)
{
    this.list = list;
    this.index = index;
    this.statCats = statCats;
    this.schedule = schedule;

    // get the game keys
    var gameKeysCookie = new Mojo.Model.Cookie("gameKeys");
    this.gameKeys = gameKeysCookie.get();
};

OtherTeamAssistant.prototype.setup = function()
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

    //setup the list widget to display the starting lineup
    this.listAttr = {
        renderLimit: 20,
        itemTemplate: 'otherTeam/startingLineup',
        listTemplate: 'otherTeam/startingLineupList',
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
        itemTemplate: 'otherTeam/benchedPlayers',
        listTemplate: 'otherTeam/benchedPlayersList',
        itemsCallback: this.setBenchedPlayers.bind(this)
    };
    this.controller.setupWidget('benchedPlayers', this.listAttr);
    this.listWidgetBN = $('benchedPlayers');

    //setup the tap handler
    this.benchedPlayersTapBinder = this.benchedPlayersTap.bind(this);
    Mojo.Event.listen(this.controller.get('benchedPlayers'),Mojo.Event.listTap, this.benchedPlayersTapBinder);

    this.listRefresh = false;
    this.getTeamRefresh(this);
};

OtherTeamAssistant.prototype.startingLineupTap = function(event)
{
    this.controller.stageController.pushScene('otherPlayer', this.roster, event.index, this.statCats);
};

OtherTeamAssistant.prototype.benchedPlayersTap = function(event)
{
    this.controller.stageController.pushScene('otherPlayer', this.benched, event.index, this.statCats);
};

OtherTeamAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'fantasySportsHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

OtherTeamAssistant.prototype.setPlayers = function(transport)
{
    if (this.listRefresh == true) {
        var playerCount = this.team[3].roster[0].players.count;
        this.roster = new Array();
        var j = 0;
        for (var i = 0; i < playerCount; i += 1) {
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
                    "eligible_positions": this.players[i].eligible_positions,
                    "has_player_notes": this.players[i].has_player_notes,
                    "week_points": this.players[i].week_points, //scores refresh
                    "week_stats": this.players[i].week_stats, //scores refresh
                    "status": this.players[i].status,
                    "status_list": this.players[i].status_list,
                    "on_disabled_list": this.players[i].on_disabled_list,
                    "league_current_week": this.players[i].league_current_week
                };
                j += 1;
            }
        }
        this.listWidgetSL.mojo.noticeUpdatedItems(0, this.roster);
    }
};

OtherTeamAssistant.prototype.setBenchedPlayers = function(transport)
{
    if (this.listRefresh == true) {
        var playerCount = this.team[3].roster[0].players.count;
        this.benched = new Array();
        var j = 0;
        for (var i = 0; i < playerCount; i += 1) {
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
                    "eligible_positions": this.players[i].eligible_positions,
                    "has_player_notes": this.players[i].has_player_notes,
                    "week_points": this.players[i].week_points, //scores refresh
                    "week_stats": this.players[i].week_stats, //scores refresh
                    "status": this.players[i].status,
                    "status_list": this.players[i].status_list,
                    "on_disabled_list": this.players[i].on_disabled_list,
                    "league_current_week": this.players[i].league_current_week
                };
                j += 1;
            }
        }
        this.listWidgetBN.mojo.noticeUpdatedItems(0, this.benched);
    }
};

OtherTeamAssistant.prototype.getTeamRefresh = function(transport)
{
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
    paramObj.genCount("otherTeam", oauth_token);
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

OtherTeamAssistant.prototype.refreshTeam = function(transport)
{
    this.game = transport.responseJSON.fantasy_content.games;
    this.league = this.game[0].game[1].leagues[0].league;
    if (this.list[this.index].league_scoring_type == "head" && this.list[this.index].league_current_week >= this.list[this.index].league_start_week) {
        this.team = this.league[5].teams[0].team;
    } else {
        this.team = this.league[4].teams[0].team;
    }

    // gather manager information
    var managers = this.team[0][8].managers;
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

    //set the players list
    var players = this.team[3].roster[0].players;
    var playerCount = players.count;
    this.players = new Array();
    for (var i = 0; i < playerCount; i += 1) {

        //look for status
        var j = 0;
        if (players[i].player[0][3].status) j = 1;
        if (players[i].player[0][4].on_disabled_list) j = 2;

        // display multiple available positions
        var positions = players[i].player[0][12 + j].eligible_positions;
        var eligible_positions = "";
        for (var k in positions) {
            if (positions.hasOwnProperty(k)) {
                if (k == 0) {
                    eligible_positions = eligible_positions + positions[k].position;
                } else {
                    eligible_positions = eligible_positions + "," + positions[k].position;
                }
            }
        }

        //display correct name, fullname for defense, first initial and last name for players
        var display_name
        if (players[i].player[0][2].name.last == "") {
            display_name = players[i].player[0][2].name.full;
        } else {
            display_name = players[i].player[0][2].name.first.substr(0,1) + " " + players[i].player[0][2].name.last;
        }

        // setup stats for players
        var stats = players[i].player[3].player_stats.stats;
        var statsCount = stats.length;
        var weekStats = "";
        for (var n = 0; n < statsCount; n += 1) {
            weekStats = weekStats + stats[n].stat.stat_id + "|" + stats[n].stat.value + " ";
        }

        var teamAbbr = players[i].player[0][6 + j].editorial_team_abbr;
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

        //set the players list
        this.players[i] = {
            "league_key": this.league[0].league_key,
            "team_key": this.team[0][0].team_key,
            "player_key": players[i].player[0][0].player_key,
            "player_id": players[i].player[0][1].player_id,
            "player_name": display_name,
            "player_full_name": players[i].player[0][2].name.full,
            "player_schedule": player_schedule,
            "player_schedule_list": player_schedule_list,
            "editorial_player_key": players[i].player[0][3 + j].editorial_player_key,
            "editorial_team_key": players[i].player[0][4 + j].editorial_team_key,
            "editorial_team_full_name": players[i].player[0][5 + j].editorial_team_full_name,
            "editorial_team_abbr": teamAbbr,
            "bye_week": players[i].player[0][7 + j].bye_weeks.week,
            "uniform_number": players[i].player[0][8 + j].uniform_number,
            "image_url": players[i].player[0][10 + j].image_url,
            "is_undroppable": players[i].player[0][11 + j].is_undroppable,
            "display_position": players[i].player[0][9 + j].display_position,
            "current_position": players[i].player[1].selected_position[1].position,
            "eligible_positions": eligible_positions,
            "has_player_notes": players[i].player[0][13 + j].has_player_notes,
            "week_points": players[i].player[3].player_points.total,
            "week_stats": weekStats,
            "status": "",
            "status_list": "",
            "on_disabled_list": "",
            "league_current_week": this.league[0].current_week
        };

        //alert players on bye weeks
        if (this.players[i].league_current_week == this.players[i].bye_week) {
            this.players[i].bye_week = '<span class="red">Bye Week: ' + players[i].player[0][7 + j].bye_weeks.week + '</span>';
        } else {
            this.players[i].bye_week = '<span>Bye Week: ' + players[i].player[0][7 + j].bye_weeks.week + '</span>';
        }

        //populate status
        if (j == 2) {
            this.players[i].status = players[i].player[0][3].status;
            this.players[i].status_list = '<span class="red">Status: ' + players[i].player[0][3].status + '</span>';
            this.players[i].on_disabled_list = players[i].player[0][4].on_disabled_list;
        } else if (j == 1) {
            this.players[i].status = players[i].player[0][3].status;
            this.players[i].status_list = '<span class="red">Status: ' + players[i].player[0][3].status + '</span>';
        }
    }

    //set the refresh flag
    this.listRefresh = true;
    this.setPlayers(this);
    this.setBenchedPlayers(this);

    //display the team
    this.displayTeam(this);
};

OtherTeamAssistant.prototype.displayTeam = function(event)
{
    //team and league names and rank
    this.details = '<table class="team"><tr><td><img src="' + this.team[0][4].team_logos[0].team_logo.url + '"></td>' +
        "<td>" +
        this.team[0][2].name + "<br />" +
        this.league[0].name + "<br />" +
        '<span class="medFont">Rank: ' + this.team[1].team_standings.rank +
        " of " + this.league[0].num_teams + "</span>";
    if (this.league[1].settings[0].scoring_type == "head") {
        this.details = this.details +
        '<span class="leftMg15 medFont">' + this.team[1].team_standings.outcome_totals.wins + "-" +
        this.team[1].team_standings.outcome_totals.losses + "-" + this.team[1].team_standings.outcome_totals.ties + " " +
        Math.round(this.team[1].team_standings.outcome_totals.percentage * 100) + "%</span>";
    }
    this.details = this.details + "</td></tr></table>";

    var detailsDiv = this.controller.get("details");
    detailsDiv.innerHTML = this.details;

    //points
    this.points = '<span class="medFont">Week ' + this.league[0].current_week + ": " + this.team[2].team_points.total + "</span>";
    var pointsDiv = this.controller.get("points");
    pointsDiv.innerHTML = this.points;

    var fetchingDiv = this.controller.get("fetching");
    fetchingDiv.hide();
    $("ajaxSpinner").mojo.stop();
    this.scrim.hide();
};

OtherTeamAssistant.prototype.activate = function(event)
{
};

OtherTeamAssistant.prototype.deactivate = function(event)
{
};

OtherTeamAssistant.prototype.cleanup = function(event)
{
    Mojo.Event.stopListening(this.controller.get('startingLineup'), Mojo.Event.listTap, this.startingLineupTap.bind(this));
    Mojo.Event.stopListening(this.controller.get('benchedPlayers'), Mojo.Event.listTap, this.benchedPlayersTap.bind(this));
};
