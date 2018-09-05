/**
 * Staballoy is created by Rene Pot (2017)
 * Version 0.3.3 -- 2018-09-05
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
    if (Alloy.CFG.debug) console.log('creating controller in staballoy: ', name, args);
    
    if (!requiredControllers[name]){
        requiredControllers[name] = require("/alloy/controllers/" + name);
    }
    var controllerGuid = guid();
    args.staballoy = {setVar: setVar, getVar: getVar, guid: controllerGuid};
    args.subscribe = subscribe;
    var controller = new (requiredControllers[name])(args);

    // ignoring this controller as it has no xml elements
    if (!controller.getView()) return controller;

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
    
    // subscriptions have already been created. Don't do it again
    if (elem.staballoy.guid) return;
    
    _.each(elem.staballoy.subscriptions, function(attribute, variable){
        var subscriberId = elem.staballoy.guid || guid();
        // create a subscription model
        var data = {"var": variable,  "component": elem, "attribute": attribute, "window": controller.args.staballoy.guid, guid: subscriberId};
        elem.staballoy.guid = subscriberId;
        
        if (elem.staballoy.logicFunction){
            if (typeof elem.staballoy.logicFunction == 'string'){
                
                if (controller[elem.staballoy.logicFunction] && typeof controller[elem.staballoy.logicFunction] == 'function'){
                    data.logicFunction = controller[elem.staballoy.logicFunction];
                }
            } else {
                data.logicFunction = elem.staballoy.logicFunction;
            }
        }
        
        if (attribute === 'value'){
          elem.addEventListener('change', valueChange);
          data.valueListener = true;
        }
        
        trigger(data);
        subscribers.push(data);
    });       
}    


function valueChange(e) {
    if (e.source && e.source.staballoy) {
        _.each(e.source.staballoy.subscriptions, function(attribute, variable) {
            if (attribute === 'value') {
                setVar(variable, e.source.value, e.source.staballoy.guid);
            }
        });
    }
}


/**
 * The in-controller exposed subscribe method
 */
function subscribe(args){
    
    if (typeof args.window == 'string' && getWindowIndexById(args.window) > -1){
        args.window = activeControllers[getWindowIndexById(args.window)].controller;
    }
    
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

function removeSubscribersForWindow(guid) {
    var toRemove = _.where(subscribers, {
        'window' : guid
    });
    _.each(toRemove, function(r) {
        var removed = subscribers.splice(subscribers.indexOf(r), 1);
        if (removed && removed[0] && removed[0].valueListener) {
            removed[0].component.removeEventListener('value', valueChange);
        }
    });
}

/**
 * Set variable in staballoy and trigger update throughout all subscribers
 */

function setVar(key, value, sourceguid) {
    function setVal(path, val) {
        var schema = vars;
        var pList = path.split('_');
        var len = pList.length;
        for (var i = 0; i < len - 1; i++) {
            var elem = pList[i];
            if (!schema[elem])
                schema[elem] = {};
            schema = schema[elem];
        }

        if (_.isEqual(getVar(path), value))
            return false;

        schema[pList[len - 1]] = val;
        return true;
    }

    if (!setVal(key, value)) {
        return false;
    }

    var options = [];
    var parts = key.split('_');
    var string = parts[0];
    _.each(parts, function(p, i){
        if (i > 0) string += '_' + p;
        options.push(string);
    });
    
    var toUpdate = _.filter(subscribers, function(sub){
        if (sub.var.indexOf(key + '_') === 0) return true;
        if (options.indexOf(sub.var) > -1) return true;
        return false;
    });
    
    _.each(toUpdate, function(sub) {
        // only update if the origin of the change isn't itself
        if (!sourceguid || sourceguid !== sub.guid)
            trigger(sub);
    });
}


/**
 * Trigger a variable update
 */
function trigger(sub){
    var value = getVar(sub.var);
    if (sub.logicFunction){
        value = sub.logicFunction(value, sub);
    }
    
    if (sub.attribute.indexOf('set') === 0){
        return sub.component[sub.attribute](value);
    }
    
    sub.component[sub.attribute] = value;    
}

/**
 * Get variable from staballoy
 */

function getVar(key) {

    function getVal(path) {
        var schema = vars;
        var pList = path.split('_');
        var len = pList.length;
        for (var i = 0; i < len - 1; i++) {
            var elem = pList[i];
            if (!schema[elem])
                return false;
            schema = schema[elem];
        }
        return _.clone(schema[pList[len - 1]]);
    }

    return getVal(key);
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
