/**
 * Staballoy is created by Rene Pot (2017)
 * Version 1.0.0 -- 2021-01-19
 * The latest version can be found at Github: https://github.com/topener/staballoy
 * Or npmjs: https://www.npmjs.com/package/staballoy
 */

let data = Ti.App.Properties.getObject('Staballoy.DataSub', {});
let subscriptions = [];
const deepmerge = require('deepmerge');

function handleChange() {
    let changes = 0;
    subscriptions.forEach(sub => {
        changes += parseSubscriptions(sub.UI);
    });
    console.log(`${changes} changes in subscriptions`);
}

function createSubscription(type, args) {
    let UI = Ti.UI[type](args);
    if (!args.hasOwnProperty('staballoy')) return UI;
    
    let sub = {UI: UI, subscription: args.staballoy};
    parseSubscriptions(UI);
    subscriptions.push(sub);
    return UI;
}

function parseSubscriptions(UI) {
    let changes = 0;
    if (!UI.hasOwnProperty('staballoy')) return 0;
    Object.keys(UI.staballoy).forEach((key) => {
        let res = find(data, UI.staballoy[key]);
        if (res) {
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
        console.warn(`Subscription path ${path} not found`)
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

exports.get = function(prop) {
    if (!prop) return data;
    return data[prop];
};