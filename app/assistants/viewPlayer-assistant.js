function ViewPlayerAssistant(list, index, statCats, weekList, roster)
{
    this.list = list;
    this.index = index;
    this.statCats = statCats;
    this.weekList = weekList;
    this.rosterPositions = roster;
}

ViewPlayerAssistant.prototype.setup = function()
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

    if (this.list[this.index].current_position != "BN") {
        this.cmdMenuModel = {
            visible: true,
            items: [
                {label: 'Bench', command:'bench'}
            ]
        };
    } else {
        var i = 0;
        var str = this.list[this.index].eligible_positions;
        var comma = str.search(",");
        var epArray = [];
        while (comma >= 0) {
            var pos = str.slice(0,comma);
            var posCount = this.findPositionCount(pos);
            if (posCount > 0) epArray[epArray.length] = pos;
            str = str.slice(comma + 1);
            comma = str.search(",");
            i += 1;
        }
        var pos = str;
        var posCount = this.findPositionCount(pos);
        if (posCount > 0) epArray[epArray.length] = pos;
        var o = epArray.length;
        switch (o) {
            case 0:
                this.cmdMenuModel = {
                    visible: true,
                    items: [
                        {label: 'Start', command:'start'}
                    ]
                };
                break;
            case 1:
                this.newPosition1 = epArray[0];
                this.cmdMenuModel = {
                    visible: true,
                    items: [
                        {label: 'Start @ ' + this.newPosition1, command:'startPos1'}
                    ]
                };
                break;
            case 2:
                this.newPosition1 = epArray[0];
                this.newPosition2 = epArray[1];
                this.cmdMenuModel = {
                    visible: true,
                    items: [
                        {label: 'Start @ ' + this.newPosition1, command:'startPos1'},
                        {label: 'Start @ ' + this.newPosition2, command:'startPos2'}
                    ]
                };
                break;
            case 3:
                this.newPosition1 = epArray[0];
                this.newPosition2 = epArray[1];
                this.newPosition3 = epArray[2];
                this.cmdMenuModel = {
                    visible: true,
                    items: [
                        {label: 'Start @ ' + this.newPosition1, command:'startPos1'},
                        {label: 'Start @ ' + this.newPosition2, command:'startPos2'},
                        {label: 'Start @ ' + this.newPosition3, command:'startPos3'}
                    ]
                };
                break;
            case 4:
                this.newPosition1 = epArray[0];
                this.newPosition2 = epArray[1];
                this.newPosition3 = epArray[2];
                this.newPosition4 = epArray[3];
                this.cmdMenuModel = {
                    visible: true,
                    items: [
                        {label: 'Start @ ' + this.newPosition1, command:'startPos1'},
                        {label: 'Start @ ' + this.newPosition2, command:'startPos2'},
                        {label: 'Start @ ' + this.newPosition3, command:'startPos3'},
                        {label: 'Start @ ' + this.newPosition4, command:'startPos4'}
                    ]
                };
                break;
            case 5:
                this.newPosition1 = epArray[0];
                this.newPosition2 = epArray[1];
                this.newPosition3 = epArray[2];
                this.newPosition4 = epArray[3];
                this.newPosition5 = epArray[4];
                this.cmdMenuModel = {
                    visible: true,
                    items: [
                        {label: 'Start @ ' + this.newPosition1, command:'startPos1'},
                        {label: 'Start @ ' + this.newPosition2, command:'startPos2'},
                        {label: 'Start @ ' + this.newPosition3, command:'startPos3'},
                        {label: 'Start @ ' + this.newPosition4, command:'startPos4'},
                        {label: 'Start @ ' + this.newPosition5, command:'startPos5'}
                    ]
                };
                break;
        }
    }

    this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, this.cmdMenuModel);

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
    this.details = this.details + '<tr><td colspan="2"><span class="medFont">Percent Owned: ' + Math.round(this.list[this.index].percent_owned) + "%</span></td></tr>";
    this.details = this.details + '<tr><td colspan="2"><span class="medFont">Average Draft Pick: ' + this.list[this.index].average_pick + "</span></td></tr>";
    this.details = this.details + '<tr><td colspan="2"><span class="medFont">Average Draft Round: ' + this.list[this.index].average_round + "</span></td></tr>";
    this.details = this.details + '<tr><td colspan="2"><span class="medFont">Percent Drafted: ' + Math.round(this.list[this.index].percent_drafted * 100) + "%</span></td></tr>";
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

    var seasonStats = this.list[this.index].season_stats.split(" ");
    var seasonStatsCount = seasonStats.length -1;
    var seasonStatsArray = [];
    for (var m = 0; m < seasonStatsCount; m += 1) {
        var statId = seasonStats[m].split("|")[0];
        var value = seasonStats[m].split("|")[1];
        seasonStatsArray[statId] = value;
    }

    var playerStats = "";
    for (var n = 0; n < allStatsCount; n += 1) {
        playerStats = playerStats + '<tr><td colspan="3"><hr></td></tr>' +
            '<tr><td><span class="medFont">' + allStatCatsArray[statIDArray[n]] + "</span></td>" +
            '<td><span class="medFont">' + allStatsArray[statIDArray[n]] + "</span></td>" +
            '<td><span class="medFont">' + seasonStatsArray[statIDArray[n]] + "</span></td></tr>";
    }

    this.stats = '<table><tr><td><span class="medFont">Category</span></td>' +
        '<td><span class="medFont">Week</span></td>' +
        '<td><span class="medFont">Season</span></td></tr>' +
        '<tr><td colspan="3"><hr></td></tr>' +
        '<tr><td><span class="medFont">Points</span></td>' +
        '<td><span class="medFont">' + this.list[this.index].week_points + '</span></td>' +
        '<td><span class="medFont">' + this.list[this.index].season_points + '</span></td></tr>' +
        playerStats + "</table>";

    var statsDiv = this.controller.get("stats");
    statsDiv.innerHTML = this.stats;
};

ViewPlayerAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'bench':
                this.controller.stageController.pushScene('editRoster', this.list, this.index, "BN");
                break;
            case 'start':
                this.controller.showAlertDialog({
                    title: ('No Positions Open'),
                    message: ('There are no more ' + this.list[this.index].display_position + ' positions available. ' +
                        'Please remove a ' + this.list[this.index].display_position + ' from the starting lineup first.'),
                    choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
                });
                break;
            case 'startPos1':
                this.controller.stageController.pushScene('editRoster', this.list, this.index, this.newPosition1);
                break;
            case 'startPos2':
                this.controller.stageController.pushScene('editRoster', this.list, this.index, this.newPosition2);
                break;
            case 'startPos3':
                this.controller.stageController.pushScene('editRoster', this.list, this.index, this.newPosition3);
                break;
            case 'startPos4':
                this.controller.stageController.pushScene('editRoster', this.list, this.index, this.newPosition4);
                break;
            case 'startPos5':
                this.controller.stageController.pushScene('editRoster', this.list, this.index, this.newPosition5);
                break;
            case 'fantasySportsHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

ViewPlayerAssistant.prototype.findPositionCount = function(position)
{
    var positionCount = 0;
    switch(position) {
        case "QB":
            positionCount = this.rosterPositions.QB;
            break;
        case "WR":
            positionCount = this.rosterPositions.WR;
            break;
        case "RB":
            positionCount = this.rosterPositions.RB;
            break;
        case "TE":
            positionCount = this.rosterPositions.TE;
            break;
        case "W/T":
            positionCount = this.rosterPositions.WT;
            break;
        case "W/R":
            positionCount = this.rosterPositions.WRb;
            break;
        case "W/R/T":
            positionCount = this.rosterPositions.WRT;
            break;
        case "Q/W/R/T":
            positionCount = this.rosterPositions.QWRT;
            break;
        case "K":
            positionCount = this.rosterPositions.K;
            break;
        case "DEF":
            positionCount = this.rosterPositions.DEF;
            break;
        case "D":
            positionCount = this.rosterPositions.D;
            break;
        case "DL":
            positionCount = this.rosterPositions.DL;
            break;
        case "DB":
            positionCount = this.rosterPositions.DB;
            break;
        case "LB":
            positionCount = this.rosterPositions.LB;
            break;
        case "DE":
            positionCount = this.rosterPositions.DE;
            break;
        case "DT":
            positionCount = this.rosterPositions.DT;
            break;
        case "CB":
            positionCount = this.rosterPositions.CB;
            break;
        case "S":
            positionCount = this.rosterPositions.S;
            break;
        case "IR":
            positionCount = this.rosterPositions.IR;
            break;
        case "BN":
            positionCount = this.rosterPositions.BN;
            break;
    }
    return positionCount;
}

ViewPlayerAssistant.prototype.activate = function(event)
{
    if (event != undefined) {
        var cpSpan = this.controller.get("current_position");
        cpSpan.innerHTML = event;
    }
};

ViewPlayerAssistant.prototype.deactivate = function(event)
{
};

ViewPlayerAssistant.prototype.cleanup = function(event)
{
};
