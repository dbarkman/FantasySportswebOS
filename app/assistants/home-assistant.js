function HomeAssistant(depot)
{
    this.depot = depot;

    // get the game keys
    var gameKeysCookie = new Mojo.Model.Cookie("gameKeys");
    this.gameKeys = gameKeysCookie.get();
};

HomeAssistant.prototype.setup = function()
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

    this.cmdMenuModel = {
        visible: true,
        items: [
            {label: 'Refresh', icon: 'refresh', command:'refresh'},
        ]
    };
    this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, this.cmdMenuModel);

    //get the token info
    var oauth_tokenCookie = new Mojo.Model.Cookie("oauth_token");
    this.oauth_token = oauth_tokenCookie.get();
    var oauth_token_secretCookie = new Mojo.Model.Cookie("oauth_token_secret");
    this.oauth_token_secret = oauth_token_secretCookie.get();

    //setup the list widget to display the results
    this.listAttr = {
        renderLimit: 20,
        itemTemplate: 'home/itemTemplate',
        listTemplate: 'home/listTemplate',
        itemsCallback: this.makeList.bind(this)
    };

    this.controller.setupWidget('resultList', this.listAttr);
    this.listWidget = $('resultList')

    //setup the tap handler
    this.handleItemTapBinder = this.handleItemTap.bind(this);
    Mojo.Event.listen(this.controller.get('resultList'),Mojo.Event.listTap, this.handleItemTapBinder);
};

HomeAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'refresh':
                this.refToken(this);
                break;
            case 'fantasySportsHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

HomeAssistant.prototype.handleItemTap = function(event)
{
    this.controller.stageController.pushScene('viewTeam', this.list, event.index, this.depot);
};

HomeAssistant.prototype.makeList = function()
{
    //Look for new bulletins before doing much else
    FantasySports.Metrix.checkBulletinBoard(this.controller, 22); //1.5.5

    var method = "data";
    var baseURL = "http://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=" + this.gameKeys + "/leagues;out=settings,standings/teams;out=standings,stats/roster/players;out=stats,percent_owned,draft_analysis";
    var format = "json";
    var http_method = "GET";

    var paramObj = new GenParams;
    paramObj.genCount("season", this.oauth_token);
    var params = paramObj.getParams(method, baseURL, this.oauth_token_secret, this.oauth_token, null, null, format, http_method);

    var url = baseURL + "?" + params;

    var request = new Ajax.Request(url,
    {
        method: 'GET',
        onSuccess: this.setNewList.bind(this),
        onFailure: function() {
            Mojo.Log.error("Make List Data Call Failed");
        }
    });
};

HomeAssistant.prototype.setNewList = function(transport)
{
    this.games = transport.responseJSON.fantasy_content.users[0].user[1].games;
    this.list = new Array();
    var i;
    var j;
    var k;
    var l = 0;
    var m;
    var gameCount = this.games.count;
    for (i = 0; i < gameCount; i += 1) {
        var leagueCount = this.games[i].game[1].leagues.count
        for (j = 0; j < leagueCount; j += 1) {
            var teamCount = this.games[i].game[1].leagues[j].league[3].teams.count;
            for (k = 0; k < teamCount; k += 1) {

                // gather manager information
                var managers = this.games[i].game[1].leagues[j].league[3].teams[k].team[0][8].managers;
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

                // setup roster league postions
                var roster_positions = this.games[i].game[1].leagues[j].league[1].settings[0].roster_positions;
                var roster_positions_count = roster_positions.length;
                var rosterPositions = "";
                for (var r = 0; r < roster_positions_count; r += 1) {
                    var position = "";
                    switch(roster_positions[r].roster_position.position) {
                        case "QB":
                            position = "Quarterbacks";
                            break;
                        case "WR":
                            position = "Wide Receivers";
                            break;
                        case "RB":
                            position = "Running Backs";
                            break;
                        case "TE":
                            position = "Tight Ends";
                            break;
                        case "K":
                            position = "Kickers";
                            break;
                        case "DEF":
                            position = "Defense";
                            break;
                        case "BN":
                            position = "Bench";
                            break;
                        default:
                            position = roster_positions[r].roster_position.position;
                            break;
                    }
                    rosterPositions = rosterPositions + position + ": " + roster_positions[r].roster_position.count + "<br />";
                }

                // setup stat categories for leagues
                var statCats = this.games[i].game[1].leagues[j].league[1].settings[0].stat_categories.stats;
                var statCatsCount = statCats.length;
                var seasonStatCats = "";
                for (var n = 0; n < statCatsCount; n += 1) {
                    seasonStatCats = seasonStatCats + statCats[n].stat.stat_id + "|" + statCats[n].stat.name + ",";
                }

                var standings = this.games[i].game[1].leagues[j].league[2].standings;

                // setup the list
                this.list[l] = {
                    "game_count": gameCount,
                    "game_key": this.games[i].game[0].game_key,
                    "game_id": this.games[i].game[0].game_id,
                    "game_name": this.games[i].game[0].name,
                    "game_code": this.games[i].game[0].code,
                    "game_type": this.games[i].game[0].type,
                    "game_url": this.games[i].game[0].url,
                    "game_season": this.games[i].game[0].season,
                    "league_count": leagueCount,
                    "league_key": this.games[i].game[1].leagues[j].league[0].league_key,
                    "league_id": this.games[i].game[1].leagues[j].league[0].league_id,
                    "league_name": this.games[i].game[1].leagues[j].league[0].name,
                    "league_url": this.games[i].game[1].leagues[j].league[0].url,
                    "league_draft_status": this.games[i].game[1].leagues[j].league[0].draft_status,
                    "league_num_teams": this.games[i].game[1].leagues[j].league[0].num_teams,
                    "league_current_week": this.games[i].game[1].leagues[j].league[0].current_week,
                    "league_start_week": this.games[i].game[1].leagues[j].league[0].start_week,
                    "league_end_week": this.games[i].game[1].leagues[j].league[0].end_week,
                    "league_draft_type": this.games[i].game[1].leagues[j].league[1].settings[0].draft_type,
                    "league_scoring_type": this.games[i].game[1].leagues[j].league[1].settings[0].scoring_type,
                    "league_uses_playoff": this.games[i].game[1].leagues[j].league[1].settings[0].uses_playoff,
                    "league_playoff_start_week": "", //head to head league
                    "league_stat_categories": seasonStatCats,
                    "league_roster_positions": rosterPositions,
                    "league_standings": standings,
                    "team_count": teamCount,
                    "team_key": this.games[i].game[1].leagues[j].league[3].teams[k].team[0][0].team_key,
                    "team_id": this.games[i].game[1].leagues[j].league[3].teams[k].team[0][1].team_id,
                    "team_name": this.games[i].game[1].leagues[j].league[3].teams[k].team[0][2].name,
                    "team_url": this.games[i].game[1].leagues[j].league[3].teams[k].team[0][3].url,
                    "team_logo": this.games[i].game[1].leagues[j].league[3].teams[k].team[0][4].team_logos[0].team_logo.url,
                    "team_rank": this.games[i].game[1].leagues[j].league[3].teams[k].team[1].team_standings.rank,
                    "team_wins": "", //head to head league
                    "team_losses": "", //head to head league
                    "team_ties": "", //head to head league
                    "team_percentage": "", //head to head league
                    "team_week_points": "", //scores refresh
                    "team_projected_points": "", //scores refresh
                    "team_points_change": "", //points league //need to know if this changes during the day on Sunday
                    "team_total_points": this.games[i].game[1].leagues[j].league[3].teams[k].team[2].team_points.total,
                    "manager": manager_nickname,
                    "manager_id": manager_id,
                    "co_manager": co_manager_nickname,
                    "co_manager_id": co_manager_id,
                    "commissioner": is_commissioner,
                    "comanager_commissioner": is_comanager_commissioner,
                    "players_count": this.games[i].game[1].leagues[j].league[3].teams[k].team[3].roster[0].players.count,
                    "players": {}
                };
                if (this.games[i].game[1].leagues[j].league[1].settings[0].scoring_type == "head") {
                    //nfl head-to-head leagues
                        this.list[l].league_playoff_start_week = this.games[i].game[1].leagues[j].league[1].settings[0].playoff_start_week;
                        this.list[l].team_wins = this.games[i].game[1].leagues[j].league[3].teams[k].team[1].team_standings.outcome_totals.wins; //head to head league
                        this.list[l].team_losses = this.games[i].game[1].leagues[j].league[3].teams[k].team[1].team_standings.outcome_totals.losses; //head to head league
                        this.list[l].team_ties = this.games[i].game[1].leagues[j].league[3].teams[k].team[1].team_standings.outcome_totals.ties; //head to head league
                        this.list[l].team_percentage = this.games[i].game[1].leagues[j].league[3].teams[k].team[1].team_standings.outcome_totals.percentage; //head to head league
                } else {
                    //nfl points leagues
                        this.list[l].team_points_change = this.games[i].game[1].leagues[j].league[3].teams[k].team[1].team_standings.points_change; //points league
                }

                // set the players list
                var players = this.games[i].game[1].leagues[j].league[3].teams[k].team[3].roster[0].players;
                var playerCount = players.count;
                for (m = 0; m < playerCount; m += 1) {

                    // look for status
                    var o = 0;
                    if (players[m].player[0][3].status) o = 1;
                    if (players[m].player[0][4].on_disabled_list) o = 2;

                    // display correct name, fullname for defense, first initial and last name for players
                    var display_name
                    if (players[m].player[0][2].name.last == "") {
                        display_name = players[m].player[0][2].name.full;
                    } else {
                        display_name = players[m].player[0][2].name.first.substr(0,1) + " " + players[m].player[0][2].name.last;
                    }

                    // setup stats for players
                    var stats = players[m].player[3].player_stats.stats;
                    var statsCount = stats.length;
                    var seasonStats = "";
                    for (var p = 0; p < statsCount; p += 1) {
                        seasonStats = seasonStats + stats[p].stat.stat_id + "|" + stats[p].stat.value + " ";
                    }

                    // set the players list
                    this.list[l].players[m] = {
                        "league_key": this.games[i].game[1].leagues[j].league[0].league_key,
                        "team_key": this.games[i].game[1].leagues[j].league[3].teams[k].team[0][0].team_key,
                        "player_key": players[m].player[0][0].player_key,
                        "player_id": players[m].player[0][1].player_id,
                        "player_name": display_name,
                        "player_full_name": players[m].player[0][2].name.full,
                        "player_schedule": "", 
                        "player_schedule_list": "",
                        "editorial_player_key": players[m].player[0][3 + o].editorial_player_key,
                        "editorial_team_key": players[m].player[0][4 + o].editorial_team_key,
                        "editorial_team_full_name": players[m].player[0][5 + o].editorial_team_full_name,
                        "editorial_team_abbr": players[m].player[0][6 + o].editorial_team_abbr,
                        "bye_week": players[m].player[0][7 + o].bye_weeks.week,
                        "uniform_number": players[m].player[0][8 + o].uniform_number,
                        "image_url": players[m].player[0][10 + o].image_url,
                        "is_undroppable": players[m].player[0][11 + o].is_undroppable,
                        "display_position": players[m].player[0][9 + o].display_position,
                        "current_position": players[m].player[1].selected_position[1].position,
                        "eligible_positions": "",
                        "has_player_notes": players[m].player[0][13 + o].has_player_notes,
                        "week_points": "", //scores refresh
                        "season_points": players[m].player[3].player_points.total,
                        "season_stats": seasonStats, //scores refresh
                        "week_stats": "", //scores refresh
                        "percent_owned": "", //possible empty, set below
                        "average_pick": "", //possible empty, set below
                        "average_round": "", //possible empty, set below
                        "percent_drafted": "", //possible empty, set below
                        "status": "",
                        "status_list": "",
                        "on_disabled_list": "",
                        "league_current_week": this.games[i].game[1].leagues[j].league[0].current_week
                    };

                    //populate the possible empties
                    if (players[m].player[4].percent_owned[1]) {
                        this.list[l].players[m].percent_owned = players[m].player[4].percent_owned[1].value;
                    } else {
                        this.list[l].players[m].percent_owned = 0;
                    }
                    if (players[m].player[5].draft_analysis[0]) {
                        this.list[l].players[m].average_pick = players[m].player[5].draft_analysis[0].average_pick;
                    } else {
                        this.list[l].players[m].average_pick = "-";
                    }
                    if (players[m].player[5].draft_analysis[1]) {
                        this.list[l].players[m].average_round = players[m].player[5].draft_analysis[1].average_round;
                    } else {
                        this.list[l].players[m].average_round = "-";
                    }
                    if (players[m].player[5].draft_analysis[2]) {
                        if (players[m].player[5].draft_analysis[2].percent_drafted == "-") {
                            this.list[l].players[m].percent_drafted = 0;
                        } else {
                            this.list[l].players[m].percent_drafted = players[m].player[5].draft_analysis[2].percent_drafted;
                        }
                    } else {
                        this.list[l].players[m].percent_drafted = "0";
                    }
                }
                l += 1;
            }
        }
    }
    var fetchDiv = this.controller.get("fetch");
    fetchDiv.hide();
    this.listWidget.mojo.noticeUpdatedItems(0, this.list);
    $("ajaxSpinner").mojo.stop();
    this.scrim.hide();
};

HomeAssistant.prototype.refToken = function()
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
    paramObj.genCount("seasonref", oauth_token);
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

HomeAssistant.prototype.setCookies = function(response)
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

    this.scrim.hide();
    $("ajaxSpinner").mojo.stop();
};

HomeAssistant.prototype.dbSuccess = function(event)
{
};

HomeAssistant.prototype.dbFailure = function(event)
{
    Mojo.Log.error("Depot Add failed");
};

HomeAssistant.prototype.activate = function(event)
{
};

HomeAssistant.prototype.deactivate = function(event)
{
};

HomeAssistant.prototype.cleanup = function(event)
{
    Mojo.Event.stopListening(this.controller.get('resultList'), Mojo.Event.listTap, this.handleItemTap.bind(this));
};
