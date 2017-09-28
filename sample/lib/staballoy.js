/**
 * Staballoy is created by Rene Pot (2017) 
 * Its intention is to hook into the Alloy.createController flow (by overriding it) so contollers
 * can be more dynamic and have reactive components
 */

var requiredControllers = {};
var activeControllers = [];
var subscribers = {};
var vars = {};

Alloy.createController = function(name, args) {
    var args = args || {};
    
    console.log('creating controller', name);
    if (!requiredControllers[name]){
        requiredControllers[name] = require("/alloy/controllers/" + name);
    }
    var controllerGuid = guid();
    args.eventHandlerGuid = controllerGuid;
    args.subscribe = subscribe;
    args.staballoy = {setVar: setVar, getVar: getVar};
    
    var controller = new (requiredControllers[name])(args);
    if (controller.getView().apiName === 'Ti.UI.Window'){
        
        activeControllers.push({controller: controller, guid: controllerGuid});
        controller.getView().eventHandlerGuid = controllerGuid; 
        controller.getView().addEventListener('close', handleClose);
    }
    
    
    return controller;
};

function subscribe(component, $){
    var SA = component.staballoy;
    if (!SA || !SA.subscribe || SA.subscribe.length == 0) return;
    _.each(SA.subscribe, function(sub){
        if (!subscribers.hasOwnProperty(sub.var)) subscribers[sub.var] = [];
        component[sub.attribute] = vars[sub.var];
        subscribers[sub.var].push({"component": component, "attribute": sub.attribute, "window": $.args.eventHandlerGuid});
    });
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
    
    stopSubscribersForWindow(e.source.eventHandlerGuid);
}

function stopSubscribersForWindow(guid){
    //@TODO stop it!
}

function setVar(key, value){
    if (!vars.hasOwnProperty(key)) vars[key];
    
    vars[key] = value;
    
    if (subscribers[key]){
        _.each(subscribers[key], function(sub){
            sub.component[sub.attribute] = value;
        });
    }
}

function getVar(key){
    if (!vars.hasOwnProperty(key)) return null;
    return vars[key];
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
