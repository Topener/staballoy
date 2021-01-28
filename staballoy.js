/**
 * Staballoy is created by Rene Pot (2021)
 * Version 1.0.4 -- 2021-01-28
 * The latest version can be found at Github: https://github.com/topener/staballoy
 * Or npmjs: https://www.npmjs.com/package/staballoy
 */

let data = Ti.App.Properties.getObject('Staballoy.DataSub', {});
let subscriptions = {};
let debug = false;
const deepmerge = require('deepmerge');

function handleChange() {
    let changes = 0;
    Object.keys(subscriptions).forEach(sub => {
        changes += parseSubscriptions(subscriptions[sub].UI);
    });
    log(`${changes} changes in subscriptions`);
}

function createSubscription(type, args) {
    let UI = Ti.UI[type](args);
    if (!args.hasOwnProperty('staballoy')) return UI;
    log('creating new subscription');
    UI.addEventListener('postlayout', PLHandler);
    UI.staballoyGuid = guid();
    let sub = {UI: UI, subscription: args.staballoy};
    parseSubscriptions(UI);
    subscriptions[UI.staballoyGuid] = sub;
    return UI;
}

function PLHandler(e) {
    // sanity check
    if (!e.source.hasOwnProperty('staballoyGuid')) return false;
    let parentWindow = findParentWindow(e.source);
    if (parentWindow) {
        subscriptions[e.source.staballoyGuid].parentWindow = parentWindow;
        subscriptions[e.source.staballoyGuid].UI.removeEventListener('postlayout', PLHandler);
    }
}

function findParentWindow(el) {
    if (el.apiName !== 'Ti.UI.Window' && el.parent) return findParentWindow(el.parent);
    if (el.apiName === 'Ti.UI.Window' && el.hasOwnProperty('staballoyGuid')) return el.staballoyGuid;
    if (el.apiName === 'Ti.UI.Window' && !el.hasOwnProperty('staballoyGuid')) {
        el.staballoyGuid = guid();
        el.addEventListener('close', handleWindowClose);
        log(`Found new window ${el.staballoyGuid}. Added monitoring`);
        return el.staballoyGuid;
    }
    return false;
}

function handleWindowClose(e) {
    e.source.removeEventListener('close', handleWindowClose);
    if (!e.source.staballoyGuid) return;
    let changes = 0;
    Object.keys(subscriptions).forEach(key => {
        if (subscriptions[key].hasOwnProperty('parentWindow') && subscriptions[key].parentWindow === e.source.staballoyGuid) {
            // remove just in case
            subscriptions[key].UI.removeEventListener('postlayout', PLHandler);
            // remove subscription entirely
            delete subscriptions[key];
            changes++;
        }
    });

    log(`cleaned up ${changes} subscriptions because of closing window ${e.source.staballoyGuid}`);
}

function parseSubscriptions(UI) {
    let changes = 0;
    if (!UI || !UI.staballoy) return 0;
    Object.keys(UI.staballoy).forEach((key) => {
        let res = find(data, UI.staballoy[key]);
        if (res !== undefined) {
            if (key.indexOf('set') === 0) {
                UI[key](res);
            }
            else if (UI[key] !== res) {
                UI[key] = res;
                changes++;
            }
        }
    });
    return changes;
}

function find(obj, path) {
    try {
        path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        path = path.replace(/^\./, '');           // strip a leading dot
        var a = path.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (k in obj) {
                obj = obj[k];
            } else {
                return;
            }
        }
        return obj;
    } catch (e) {
        log(`Subscription path ${path} not found`)
        return;
    }
}

const supportedUI = [" createActivityIndicator", "createAlertDialog", "createAttributedString", "createButton", "createButtonBar", "createImageView", "createLabel", "createListView", "createMaskedImage", "createNavigationWindow", "createOptionDialog", "createPicker", "createPickerColumn", "createPickerRow", "createProgressBar", "createRefreshControl", "createScrollableView", "createScrollView", "createSearchBar", "createSlider", "createSwitch", "createTab", "createTabbedBar", "createTabGroup", "createTableView", "createTableViewRow", "createTableViewSection", "createTextArea", "createTextField", "createToolbar", "createView", "createWebView", "createWindow"];
supportedUI.forEach(el => {
    exports[el] = function(args) { return createSubscription(el, args); }
});

exports.set = function(newData) {
    data = deepmerge(data, newData);
    Ti.App.Properties.setObject('Staballoy.DataSub', data);
    handleChange();
}

exports.reset = function(newData) {
    data = newData;
    Ti.App.Properties.setObject('Staballoy.DataSub', data);
    handleChange();
}

exports.get = function(prop) {
    if (!prop) return data;
    return find(data, prop);
};

exports.setDebug = function(state) {
    debug = typeof state === 'boolean' ? state : false;
}

// helpers

/**
 * Method to get a unique GUID (from Alloy source code)
 */
function guid() {
    function S4() {
        return (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
    }

    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function log(value) {
    if (debug) console.log('[staballoy]', value);
}