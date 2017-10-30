/**
 * Staballoy is created by Rene Pot (2017)
 * Version 0.2.3 -- 2017-10-30
 * It extends alloy to add reactive components to Titanium.
 * The latest version can be found at Github: https://github.com/topener/staballoy
 */

var requiredControllers = {};
var activeControllers = [];
var subscribers = [];
var vars = {};
var currentlyFocussed = false;

/**
 * Alloy.createController override
 */
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
    
    // only parse through all subscribable components
    if (isSubscribable(controller.getView().apiName)){
    	if (controller.getView().apiName == 'Ti.UI.iOS.NavigationWindow'){
	        parseChildren([controller.getView().window], controller);
    	} else {
	        parseChildren(controller.getView().children, controller);
    	}
    	if (controller.getView().staballoy){
	    	parseSubscriptions(controller.getView(), controller);
    	}
        activeControllers.push({controller: controller, guid: controllerGuid});
        controller.getView().addEventListener('focus', handleFocus);
        controller.getView().addEventListener('close', handleClose);

        if (!currentlyFocussed){
            currentlyFocussed = controllerGuid;
        }
    }
    
    return controller;
};

/**
 * look through all UI elements and find those that need subscribing
 */
function parseChildren(children, controller){
    _.each(children, function(child){
    	if (child.children && child.children.length > 0){
            parseChildren(child.children, controller);
            if (child.staballoy){
                parseSubscriptions(child, controller);
            }
        } else if (child.sections && child.sections.length > 0){
        	parseChildren(child.sections, controller);
        }
        
        if (child.staballoy){
            parseSubscriptions(child, controller);
        }
    });
}

/**
 * parse through all subscriptions of the component
 */
function parseSubscriptions(elem, controller){
    if (!elem.staballoy.subscriptions || elem.staballoy.subscriptions.length == 0) return;
    _.each(elem.staballoy.subscriptions, function(attribute, variable){
        
        // create a subscription model
        var data = {"var": variable, "component": elem, "attribute": attribute, "window": controller.args.staballoy.guid};
        if (elem.staballoy.logicFunction){
            if (typeof elem.staballoy.logicFunction == 'string'){
                
                if (controller[elem.staballoy.logicFunction] && typeof controller[elem.staballoy.logicFunction] == 'function'){
                    data.logicFunction = controller[elem.staballoy.logicFunction];
                }
            } else {
                data.logicFunction = elem.staballoy.logicFunction;
            }
        }
        trigger(data);
        subscribers.push(data);
    });       
}    

/**
 * The in-controller exposed subscribe method
 */
function subscribe(args){
    if (!isSubscribable(args.window.getView().apiName)){
        return console.error('subscription not possible without context window');
    }
        
    if (!args.subscriptions || args.subscriptions.length == 0) return;
    
    args.component.staballoy = {subscriptions: args.subscriptions, logicFunction: args.logicFunction};
    parseSubscriptions(args.component, args.window);
       
}

/**
 * handle focus and store which is focussed last
 */
function handleFocus(e){
    currentlyFocussed = e.source.guid;
}

function getWindowIndexById(guid){
    return _.findIndex(activeControllers, function(c){
        return c.guid == guid;
    });
}

/**
 * Callback method on the close event listener
 */
function handleClose(e){
    var index = getWindowIndexById(e.source.guid);
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
    if (_.isEqual(getVar(key), value)){
    	return false;
    }
    if (!vars.hasOwnProperty(key)) vars[key];
    vars[key] = value;
    
    var toUpdate = _.where(subscribers, {"var" : key});
    _.each(toUpdate, function(sub){
        trigger(sub);
    });
}

/**
 * Trigger a variable update
 */
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
