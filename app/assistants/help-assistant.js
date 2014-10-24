function HelpAssistant() {
}

HelpAssistant.prototype.setup = function() {
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

    //setup the tap handler
    Mojo.Event.listen(this.controller.get('sendEmail'),Mojo.Event.tap, this.sendEmail.bind(this));
};

HelpAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'fantasySportsHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

HelpAssistant.prototype.sendEmail = function(){
    this.controller.serviceRequest('palm://com.palm.applicationManager', {
        method: 'open',
        parameters: {
            id: 'com.palm.app.email',
            params: {
                summary: "Fantasy Sports Support - 1.5.5",
                recipients: [{
                    value : 'fantasysportsapp@gmail.com',
                    contactDisplay : 'Fantasy Sports App Support'
                }]
            }
        }
    });
};

HelpAssistant.prototype.activate = function(event) {
};

HelpAssistant.prototype.deactivate = function(event) {
};

HelpAssistant.prototype.cleanup = function(event) {
    Mojo.Event.stopListening(this.controller.get('sendEmail'), Mojo.Event.tap, this.sendEmail.bind(this));
};
