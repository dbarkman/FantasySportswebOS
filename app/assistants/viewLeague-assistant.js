function ViewLeagueAssistant(teamList, teamIndex, transactions, messages, statCats, schedule)
{
    this.transactions = transactions;
    this.messages = messages;
    this.teamList = teamList;
    this.teamIndex = teamIndex;
    this.statCats = statCats;
    this.schedule = schedule;
};

ViewLeagueAssistant.prototype.setup = function()
{
    this.name = this.teamList[this.teamIndex].league_name;
    this.current_week = this.teamList[this.teamIndex].league_current_week;
    this.standings = this.teamList[this.teamIndex].league_standings

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

    //setup the list widget to display the league standings
    this.listAttr = {
        renderLimit: 20,
        itemTemplate: 'viewLeague/standings',
        listTemplate: 'viewLeague/standingsList',
        itemsCallback: this.setLeagueStandings.bind(this)
    };

    this.controller.setupWidget('standings', this.listAttr);
    this.listWidgetStandings = $('standings')

    //setup the tap handler
    this.standingsTapBinder = this.standingsTap.bind(this);
    Mojo.Event.listen(this.controller.get('standings'),Mojo.Event.listTap, this.standingsTapBinder);
};

ViewLeagueAssistant.prototype.standingsTap = function(event)
{
    this.controller.stageController.pushScene('otherTeam', this.standings, event.index, this.statCats, this.schedule);
};

ViewLeagueAssistant.prototype.setLeagueStandings = function(transport)
{
    var teams = this.standings[0].teams;
    var teamCount = teams.count;
    this.standings = new Array();
    this.teamArray = new Array();
    var j = 0;
    for (var i = 0; i < teamCount; i += 1) {
        var rank = teams[i].team[2].team_standings.rank;
        if (rank == "") {
            rank = "-";
        }
        var score = teams[i].team[1].team_points.total;
        if (score == "") {
            score = "0.00";
        }
        this.standings[j] = {
            "rank": rank,
            "name": teams[i].team[0][2].name,
            "image": '<img src="' + teams[i].team[0][4].team_logos[0].team_logo.url + '" align="middle">',
            "score": score,
            "league_key": this.teamList[this.teamIndex].league_key,
            "team_key": teams[i].team[0][0].team_key,
            "league_current_week": this.current_week
        };
        j += 1;
        this.teamArray[teams[i].team[0][1].team_id] = teams[i].team[0][2].name;
    }
    this.listWidgetStandings.mojo.noticeUpdatedItems(0, this.standings);

    this.displayLeague(this);
};

ViewLeagueAssistant.prototype.displayLeague = function(event)
{
    var details = this.name + '<br />' +
        'Current Week: ' + this.current_week;

    var detailsDiv = this.controller.get("details");
    detailsDiv.innerHTML = details;

    //setup display of messages
    var messages = this.messages;
    var messagesCount = messages.count;
    var messagesList = '<span class="medFont">';
    for (var i = 0; i < messagesCount; i += 1) {
        if (i != 0) messagesList = messagesList + "<hr>";
        messagesList = messagesList + "From: " + messages[i].message.display_name + "<br />" +
            "Subject: " + messages[i].message.subject + "<br />" + messages[i].message.text + "<br />";
    }
    messagesList = messagesList + "</span>";

    var messagesDiv = this.controller.get("messages");
    messagesDiv.innerHTML = messagesList;

    //setup display of transactions
    var transactions = this.transactions;
    var transactionsCount = transactions.count;
    var transactionsList = '<span class="medFont">';
    var k = 0;
    for (var i = 0; i < transactionsCount; i += 1) {
        var type = transactions[i].transaction[0].type;
        if (type == "add\/drop" || type == "add" || type == "drop") {
            var dateObj = new Date(transactions[i].transaction[0].timestamp * 1000);
            var month = "";
            var day = "";
            var hour = "";
            var minute = "";
            var meridiem = "am"
            switch (dateObj.getMonth()) {
                case 0:
                    month = "Jan";
                    break;
                case 1:
                    month = "Feb";
                    break;
                case 2:
                    month = "Mar";
                    break;
                case 3:
                    month = "Apr";
                    break;
                case 4:
                    month = "May";
                    break;
                case 5:
                    month = "Jun";
                    break;
                case 6:
                    month = "Jul";
                    break;
                case 7:
                    month = "Aug";
                    break;
                case 8:
                    month = "Sep";
                    break;
                case 9:
                    month = "Oct";
                    break;
                case 10:
                    month = "Nov";
                    break;
                case 11:
                    month = "Dec";
                    break;
            }
            if (dateObj.getDate() < 10) {
                day = "0" + dateObj.getDate();
            } else {
                day = dateObj.getDate();
            }
            if (dateObj.getHours() >= 13) {
                hour = (dateObj.getHours() - 12);
                meridiem = "pm";
            } else {
                hour = dateObj.getHours();
            }
            if (hour < 10) {
                hour = "0" + hour;
            }
            if (hour == 00) {
                hour = "12";
            }
            if (dateObj.getMinutes() < 10) {
                minute = "0" + dateObj.getMinutes();
            } else {
                minute = dateObj.getMinutes();
            }
            var date = month + " " + day + " " + hour + ":" + minute + meridiem + "<br />";

            if (k != 0) transactionsList = transactionsList + "<hr>";
            transactionsList = transactionsList + date;

            var players = transactions[i].transaction[1].players;
            var playersCount = players.count;
            for (var j = 0; j < playersCount; j += 1) {
                var fullName = players[j].player[0][2].name.full;
                var transType = players[j].player[1].transaction_data[0].type;
                switch (transType) {
                    case "add":
                        transType = "Added";
                        break;
                    case "drop":
                        transType = "Dropped";
                        break;
                }
                var source = "";
                var destination = "";
                if (players[j].player[1].transaction_data[0].source_type == "team") {
                    source = this.teamArray[players[j].player[1].transaction_data[0].source_team_key.split(".")[4]];
                    destination = players[j].player[1].transaction_data[0].destination_type;
                    switch (destination) {
                        case "freeagents":
                            destination = "Freeagents";
                            break;
                        case "waivers":
                            destination = "Waivers";
                            break;
                    }
                } else {
                    source = players[j].player[1].transaction_data[0].source_type;
                    destination = this.teamArray[players[j].player[1].transaction_data[0].destination_team_key.split(".")[4]];
                    switch (source) {
                        case "freeagents":
                            source = "Freeagents";
                            break;
                        case "waivers":
                            source = "Waivers";
                            break;
                    }
                }
                transactionsList = transactionsList + fullName + " " + transType + " from:<br />" + source + " to: " + destination + "<br />";
            }
            k += 1;
        }
    }
    transactionsList = transactionsList + "</span>";

    var transactionsDiv = this.controller.get("transactions");
    transactionsDiv.innerHTML = transactionsList;
};

ViewLeagueAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'fantasySportsHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

ViewLeagueAssistant.prototype.activate = function(event)
{
};

ViewLeagueAssistant.prototype.deactivate = function(event)
{
};

ViewLeagueAssistant.prototype.cleanup = function(event)
{
//    Mojo.Event.stopListening(this.controller.get('standings'), Mojo.Event.listTap, this.standingsTap.bind(this));
};
