/**
 * Staballoy is created by Rene Pot (2017) 
 * Its intention is to hook into the Alloy.createController flow (by overriding it) so contollers
 * can be more dynamic and have reactive components
 */

var requiredControllers = {};
var activeControllers = [];
var subscribers = [];
var vars = {};
var currentlyFocussed = false;

Alloy.createController = function(name, args) {
    var args = args || {};
    
    if (!requiredControllers[name]){
        requiredControllers[name] = require("/alloy/controllers/" + name);
    }
    var controllerGuid = guid();
    args.staballoy = {setVar: setVar, getVar: getVar, guid: controllerGuid};
    args.subscribe = subscribe;
    var controller = new (requiredControllers[name])(args);
    
    if (isSubscribable(controller.getView().apiName)){
	    activeControllers.push({controller: controller, guid: controllerGuid});
        controller.getView().addEventListener('focus', handleFocus);
        controller.getView().addEventListener('close', handleClose);

        if (!currentlyFocussed){
            currentlyFocussed = controllerGuid;
        }
    }
    
    return controller;
};

function subscribe(args){
    if (!isSubscribable(args.window.getView().apiName)){
    	return console.error('subscription not possible without context window');
    }
    if (!args.subscriptions || args.subscriptions.length == 0) return;
    
    _.each(args.subscriptions, function(sub){
        _.each(sub, function(attribute, variable){
        	if (args.logicFunction && vars[variable]){
	            args.component[attribute] = args.logicFunction(vars[variable], variable, attribute);
        	} else {
	            args.component[attribute] = vars[variable];
        	}


            var data = {"var": variable, "component": args.component, "attribute": attribute, "window": args.window.args.staballoy.guid};
            if (args.logicFunction) data.logicFunction = args.logicFunction;
            subscribers.push(data);

        });        
    });
}

function handleFocus(e){
    currentlyFocussed = e.source.eventHandlerGuid;
}

function handleClose(e){
    var index = _.findIndex(activeControllers, function(c){
        return c.guid == e.source.eventHandlerGuid;
    });
    
    var controller = activeControllers[index].controller;
    controller.getView().removeEventListener('close', handleClose);
    controller.off();
    controller.destroy();
    activeControllers.splice(index,1);
    
    removeSubscribersForWindow(e.source.eventHandlerGuid);
}

function removeSubscribersForWindow(guid){
    subscribers = _.without(subscribers, _.find(subscribers, {'window' : guid}));
}

function setVar(key, value){
    
    if (!vars.hasOwnProperty(key)) vars[key];
    vars[key] = value;
    
    var toUpdate = _.where(subscribers, {"var" : key});

    _.each(toUpdate, function(sub){
        
        // if there is a logicFunction, use the value returned by it instead
        if (sub.logicFunction){
            return sub.component[sub.attribute] = sub.logicFunction(value, key, sub.attribute);
        }
        sub.component[sub.attribute] = value;
    });
}

function getVar(key){
    if (!vars.hasOwnProperty(key)) return null;
    return vars[key];
}

function isSubscribable(apiName){
	return apiName === 'Ti.UI.Window' || apiName === 'Ti.UI.iOS.NavigationWindow' || apiName === 'Ti.UI.TabGroup';
}

function guid() {
    function S4() {
        return (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
    }

    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

module.exports = {
    setVar: setVar,
    getVar: getVar
};
