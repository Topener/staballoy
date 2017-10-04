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
    controller.getView().guid = controllerGuid;
    
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
    
    _.each(args.subscriptions, function(attribute, variable){
        
        var data = {"var": variable, "component": args.component, "attribute": attribute, "window": args.window.args.staballoy.guid};
        if (args.logicFunction) data.logicFunction = args.logicFunction;
        
        trigger(data);
        subscribers.push(data);
    });        
}

function handleFocus(e){
    currentlyFocussed = e.source.guid;
}

/**
 * Callback method on the close event listener
 */
function handleClose(e){
    var index = _.findIndex(activeControllers, function(c){
        return c.guid == e.source.guid;
    });
    
    var controller = activeControllers[index].controller;
    controller.getView().removeEventListener('close', handleClose);
    controller.off();
    controller.destroy();
    activeControllers.splice(index,1);
    
    removeSubscribersForWindow(e.source.guid);
}

/**
 * remove all subscribers based on the GUID of a window
 */
function removeSubscribersForWindow(guid){
    var toRemove =  _.where(subscribers, {'window' : guid});
    _.each(toRemove, function(r){
        subscribers.splice(subscribers.indexOf(r), 1);
    });
}

/**
 * Set variable in staballoy and trigger update throughout all subscribers
 */
function setVar(key, value){
    
    if (!vars.hasOwnProperty(key)) vars[key];
    vars[key] = value;
    
    var toUpdate = _.where(subscribers, {"var" : key});
    _.each(toUpdate, function(sub){
        trigger(sub);
    });
}

function trigger(sub){
    
    var value = vars[sub.var];
    
    if (sub.logicFunction){
        value = sub.logicFunction(value);
    }
    
    if (sub.attribute.indexOf('set') === 0){
        return sub.component[sub.attribute](value);
    }
    
    sub.component[sub.attribute] = value;
    
    
}

/**
 * Get variable from staballoy
 */
function getVar(key){
    if (!vars.hasOwnProperty(key)) return null;
    return vars[key];
}

/**
 * Check if, based on ApiName, a subscription is allowed
 */
function isSubscribable(apiName){
    return apiName === 'Ti.UI.Window' || apiName === 'Ti.UI.iOS.NavigationWindow' || apiName === 'Ti.UI.TabGroup';
}

/**
 * Method to get a unique GUID (from Alloy source code)
 */
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