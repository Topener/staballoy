# Staballoy
Reactive UI framework for Titanium Alloy with event handling

Why the name staballoy? Well.. to quote wikipedia

> staballoys are metal alloys of a high proportion of depleted uranium with other metals, usually titanium

It has the Titanium in it, is an alloy and uranium is a reactive metal. Sounds like the perfect name to me.

## How does it work?
Staballoy injects itself in every controller and can handle monitoring of variables for you in a reactive way. You can subscribe any UI component in staballoy and your UI component will be updated for the argument you provide.

## Setup

So enough talk, how do I install it? First download the latest release (from the dist folder) and install it as a commonjs module.

    <modules>
        <module platform="commonjs" version="0.1">staballoy</module>
    </modules>
    
Next, require staballoy in your `alloy.js` file.

    var staballoy = require('staballoy');

Now, this will override `Alloy.createController` so it is not compatible with any other modules/libraries that do the same. Keep this in mind! (barely any modules/library does this, but [Jason Kneens AlloyXL](https://github.com/jasonkneen/AlloyXL) is an example)

Next, staballoy _**requires**_ a newer underscorejs lib to function, you can do so by downloading the [latest underscorejs](http://underscorejs.org) and putting that in `/lib/alloy/underscore.js`. You can follow [this](https://jira.appcelerator.org/browse/ALOY-1583) ticket on JIRA to monitor when that is done by default.

## Supported controllers

Every Window controller will have access to a `$.args.subscribe` method as well as `$.args.staballoy` which contains methods to set and get variables stored. The current supported controller types are

- Ti.UI.Window
- Ti.UI.TabGroup
- Ti.UI.iOS.NavigationWindow

Staballoy automatically removes subscriptions based on the `close` event of these UI elements. If it wouldn't be able to do this there would be memory leaks. It is important to only use Windows that are created by alloy!

## Variables

You can set variables stored in staballoy. Any variable set are single session. There is no storage. Therefore staballoy should not be used as storage. Keep that in mind when using it. 

You can `set` and `get` variables in any Alloy created controller, as it will have the following methods exposed:

    $.args.staballoy.setVar('myVarName', 'value');
    var value = $.args.staballoy.getVar('myVarName');
    
Thats all you need to do to update variables. Again, if you want to store the data you should handle the storage of it, and init the right data when starting the app, in `alloy.js` for example, or better in a library file (eg. `/lib/initStaballoy.js`) called from `alloy.js`

## Subscribe
Any of the supported controllers (listed above) has access to the `$.args.subscribe` method. The subscribe method accepts a dictionary.

    $.args.subscribe({
        'component' : $.myLabel,
        'window' : $,
        'subscriptions' : {'closeButtonName': 'text'},
    });

**component** - The UI element you want updated
**window** - The window the UI element is in, this needs to be an alloy generated window, so usually `$` is enough
**subscriptions** - An object of subscriptions. In this example I am subscribing to the `closeButtonName` variable, and I want the `text` attribute to be set with the value that is contained in the variable

Internally, every time the `closeButtonName` variable is updated, the following code is executed: `$.myLabel.text = closeButtonName;`

### Using setters
Instead of using an attribute, you can also use the setters. So if you provide the following for subscriptions:

        'subscriptions' : {'closeButtonName': 'setText'},

This will internally be translated to: `$.myLabel.setText(closeButtonName)`

### Manipulating the data that is being set
So want to alter the data of the variable before it being set you can use the `logicFunction`. It can be really powerfull if you store objects in staballoy. You can do that as following:


    $.args.staballoy.setVar('closeButtonStuff', {"id" : 5, "key": "buttonTitle"});
    
    $.args.subscribe({
        'component' : $.myLabel,
        'window' : $,
        'subscriptions' : {'closeButtonName': 'text'},
        'logicFunction' : function(value) {
            return L(value.key);
        }
    });
    
Now, you can use part of an object to set the value of your UI component automatically. An example for visibilty of an object based on an integer you can find in the sample app.
    
### Subscribe in other controllers

If you want to subscribe from controllers other than the supported ones you should use an exported function in the sub-controller, and use the main controller (a window) to subscribe. An example of this is included in the sample app. 

    // index.js
    $.args.subscribe({
        'component' : $.subView,
        'window' : $,
        'subscriptions' : {'closeButtonName': 'setVisible'}
    });
    
`$.subView` is a `<Require>` in `index.xml`. 

		<Require src="subView" id="subView"></Require>

As I'm using the `setVisible` property, I can have an exported function in `subView.js` so that can be called.

    exports.setVisible = function(value){
        $.getView().visible = value;
    };

# Missing features / bugs / questions?
For missing features and bugs, please submit a ticket, or even better submit a Pull Request. 

If you have any questions, just contact me on [TiSlack](http://tislack.org). My name there is @Wraldpyk.

Want to support my work? Consider supporting me on [Patreon](https://www.patreon.com/wraldpyk), or send a donation my way via the PayPal button on [TiSlack.org](http://tislack.org). Any support is appreciated.
