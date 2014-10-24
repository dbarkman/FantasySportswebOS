function OtherPlayerAssistant(list, index, statCats)
{
    this.list = list;
    this.index = index;
    this.statCats = statCats;
}

OtherPlayerAssistant.prototype.setup = function()
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

    this.details = '<table class="team"><tr><td><img src="' + this.list[this.index].image_url + '"></td>' +
        '<td><span id="current_position" class="veryLargeFont">' + this.list[this.index].current_position + "</span> " +
        this.list[this.index].player_full_name + '<br />' +
        '<span class="medFont">' + this.list[this.index].editorial_team_full_name + " - " +
        this.list[this.index].display_position + '</span><hr></td></tr>' +
        this.list[this.index].player_schedule +
        '<tr><td colspan="2"><span class="medFont">';

    if (this.list[this.index].uniform_number != false) {
        this.details = this.details + '#' + this.list[this.index].uniform_number;
        if (this.list[this.index].league_current_week == this.list[this.index].bye_week) {
            this.details = this.details + '<span class="medFont leftMg15 red">' + this.list[this.index].bye_week + "</span>";
        } else {
            this.details = this.details + '<span class="medFont leftMg15">' + this.list[this.index].bye_week + "</span>";
        }
    } else {
        if (this.list[this.index].league_current_week == this.list[this.index].bye_week) {
            this.details = this.details + '<span class="medFont red">' + this.list[this.index].bye_week + "</span>";
        } else {
            this.details = this.details + '<span class="medFont">' + this.list[this.index].bye_week + "</span>";
        }
    }

    this.details = this.details + "</td></tr>";
    if (this.list[this.index].status != "" && this.list[this.index].status != undefined) this.details = this.details + '<tr><td colspan="2"><span class="medFont red">Status: ' + this.list[this.index].status + "</span></td></tr>";
    this.details = this.details + '<tr><td colspan="2"><span class="medFont"><a href="http://sports.yahoo.com/nfl/players/' + this.list[this.index].player_id + '">';
    if (this.list[this.index].has_player_notes == 1) this.details = this.details + "Player has notes: "
    this.details = this.details + 'Player Page</a></span></td></tr>';
    this.details = this.details + "</table>";

    var detailsDiv = this.controller.get("details");
    detailsDiv.innerHTML = this.details;

    var allStatCats = this.statCats.split(",");
    var allStatCatsCount = allStatCats.length -1;
    var allStatCatsArray = [];
    for (var k = 0; k < allStatCatsCount; k += 1) {
        var statId = allStatCats[k].split("|")[0];
        var name = allStatCats[k].split("|")[1];
        allStatCatsArray[statId] = name;
    }

    var weekStats = this.list[this.index].week_stats.split(" ");
    var allStatsCount = weekStats.length -1;
    var allStatsArray = [];
    var statIDArray = [];
    for (var l = 0; l < allStatsCount; l += 1) {
        var statId = weekStats[l].split("|")[0];
        var value = weekStats[l].split("|")[1];
        allStatsArray[statId] = value;
        statIDArray[l] = statId;
    }

    var playerStats = "";
    for (var n = 0; n < allStatsCount; n += 1) {
        playerStats = playerStats + '<tr><td colspan="2"><hr></td></tr>' +
            '<tr><td><span class="medFont">' + allStatCatsArray[statIDArray[n]] + "</span></td>" +
            '<td><span class="medFont">' + allStatsArray[statIDArray[n]] + "</span></td></tr>";
    }

    this.stats = '<table><tr><td><span class="medFont">Category</span></td>' +
        '<td><span class="medFont">Week</span></td></tr>' +
        '<tr><td colspan="2"><hr></td></tr>' +
        '<tr><td><span class="medFont">Points</span></td>' +
        '<td><span class="medFont">' + this.list[this.index].week_points + '</span></td>' +
        playerStats + "</table>";

    var statsDiv = this.controller.get("stats");
    statsDiv.innerHTML = this.stats;
};

OtherPlayerAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'fantasySportsHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

OtherPlayerAssistant.prototype.activate = function(event)
{
};

OtherPlayerAssistant.prototype.deactivate = function(event)
{
};

OtherPlayerAssistant.prototype.cleanup = function(event)
{
};
