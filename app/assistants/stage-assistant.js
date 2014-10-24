function StageAssistant()
{
    var options = {
        name: "oauth", //Name used for the HTML5 database name. (required)
        version: 1, //Version number used for the HTML5 database. (optional, defaults to 1)
        replace: false // open an existing depot
    };

    //Create a database when the scene is generated
    this.depot = new Mojo.Depot(options, this.dbConnectionSuccess, this.dbConnectionFailure);
}

StageAssistant.prototype.setup = function()
{
    //setup Metrix
    FantasySports = {};
    FantasySports.Metrix = new Metrix();
    FantasySports.Metrix.postDeviceData();
    
    //allow the app to rotate
    if (this.controller.setWindowOrientation) {
        this.controller.setWindowOrientation("free");
    }

    //change the theme to palm-dark
    $$('body')[0].addClassName('palm-dark');
    this.controller.pushScene('first', this.depot);
};
