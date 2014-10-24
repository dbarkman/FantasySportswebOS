function ViewMatchupsAssistant(league_name, league_current_week, matchups)
{
    this.league_name = league_name;
    this.league_current_week = league_current_week;
    this.matchups = matchups;
}

ViewMatchupsAssistant.prototype.setup = function()
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

    var details = this.league_name + '<br />' +
        'Current Week: ' + this.league_current_week;

    var detailsDiv = this.controller.get("details");
    detailsDiv.innerHTML = details;

    var matchups = this.matchups;
    var matchupsCount = matchups.count;
    var matchupsDisplay = '<table><tr><td><span class="medFont">Team</span></td><td><span class="medFont">Projected</span></td><td><span class="medFont">Actual</span></td></tr>';
    matchupsDisplay = matchupsDisplay + '<tr><td colspan="3"><hr></td></tr>';
    for (var i = 0; i < matchupsCount; i += 1) {
        var teams = matchups[i].matchup[0].teams;
        var teamName1 = teams[0].team[0][2].name;
        var projectedPoints1 = teams[0].team[1].team_projected_points.total;
        var actualPoints1 = teams[0].team[1].team_points.total;
        var teamName2 = teams[1].team[0][2].name;
        var projectedPoints2 = teams[1].team[1].team_projected_points.total;
        var actualPoints2 = teams[1].team[1].team_points.total;
        if (i != 0) matchupsDisplay = matchupsDisplay + '<tr><td colspan="3"><hr></td></tr>';
        matchupsDisplay = matchupsDisplay + '<tr><td><span class="medFont">' + teamName1 + '</span></td><td><span class="medFont">' + projectedPoints1 + '</span></td><td><span class="medFont">' + actualPoints1 + "</span></td></tr>";
        matchupsDisplay = matchupsDisplay + '<tr><td colspan="3">vs.</td></tr>';
        matchupsDisplay = matchupsDisplay + '<tr><td><span class="medFont">' + teamName2 + '</span></td><td><span class="medFont">' + projectedPoints2 + '</span></td><td><span class="medFont">' + actualPoints2 + "</span></td></tr>";
    }
    matchupsDisplay = matchupsDisplay + "</table>";

    var matchupsDiv = this.controller.get("matchups");
    matchupsDiv.innerHTML = matchupsDisplay;
};

ViewMatchupsAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'fantasySportsHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

ViewMatchupsAssistant.prototype.activate = function(event)
{
};

ViewMatchupsAssistant.prototype.deactivate = function(event)
{
};

ViewMatchupsAssistant.prototype.cleanup = function(event)
{
};
