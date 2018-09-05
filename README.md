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
    
### Through NPM
In classic go to the `Resources` folder, for **Alloy** go to the `lib` directory of your project, then run the following command

`npm install staballoy`
_Note: if your app doesn't have `node_modules` yet, run `npm init` first!_

### Include it in your application

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


### Deep setting/getting

If you're storing objects in variables, you can update them without having to get them first. For example, if you have this object:

```js
var config = {
    "user": {
        "preferences": {
            "notifications": true,
            "language": "en"
        }
    }
}
staballoy.setVar('config', config);
```

If you now want to update the language, you can do it like this:
```js
staballoy.setVar('config_user_preferences_language', 'de');
```

Same with getting it.
```js
staballoy.getVar('config_user_preferences_language');
// results in "de"
```

You can even set properties on object trees that don't exist yet, and it will make the tree for you
```js
staballoy.setVar('config_user_info_name', 'myName');
```

## Subscribe
Any of the supported controllers will be automatically parsed and checked for subscriptions. These subscriptions can be configured in the tss file. Say we have a label

    <Label id="myLabel" />
    
And you want to subscribe the text property to the variable `closeButtonName`. You can do that by putting the following in tss
```
    "#myLabel": {
        staballoy: {
            subscriptions: {
                "closeButtonName": "text"
            }
        }
    }
```

The subscriptions object specifies what to subscribe to and to what attribute. In this example I am subscribing to the `closeButtonName` variable, and I want the `text` attribute to be set with the value that is contained in the variable. Multiple subscriptions are possible for every element.

Internally, every time the `closeButtonName` variable is updated, the following code is executed: `$.myLabel.text = closeButtonName;`

As with `setVar` and `getVar` you can also use deep-binding and it will get it from inside the object

```
    "#myLabel": {
        staballoy: {
            subscriptions: {
                "config_user_info_name": "text"
            }
        }
    }
```

## 2-way data-binding
When you subscribe to a property with the value binding, it will automatically be 2-way. The tss sample below is of a textfield.

```
staballoy: {
    subscriptions: {
        "user_name": "value"
    }
},
```
So when the value of the textfield changes, using the `change` event, the `user_name` variable will be updated automatically as well. So when you bind it to a label somewhere else, that will update automatically too.

## Manual Subscribe
If you don't want to subscribe in the tss but want to do it more dynamically, in the controller, you can do it as follows:

    $.args.subscribe({
        'component' : $.myLabel,
        'window' : $,
        'subscriptions' : {'closeButtonName': 'text'},
    });

The object consists of:

- **component** - The UI element you want updated
- **window** - The window the UI element is in, this needs to be an alloy generated window, so usually `$` is enough. The window GUID is also accepted
- **subscriptions** - As explained above.

As you can see this flow is the same as the earlier one, but it is a little more complex as it needs to know the context.

### Using setters
Instead of using an attribute, you can also use the setters. So if you provide the following for subscriptions:

        'subscriptions' : {'closeButtonName': 'setText'},

This will internally be translated to: `$.myLabel.setText(closeButtonName)`

## Manipulating the data that is being set
So want to alter the data of the variable before it being set you can use the `logicFunction`. It can be really powerfull if you store objects in staballoy. You can do that as following:


    $.args.staballoy.setVar('closeButtonStuff', {"id" : 5, "key": "buttonTitle"});
    
You then set the logicFunction has a string. This is of course a property in the tss, but can also be specified in the manual flow
    
    logicFunction: "myLogicFunction"
    
Then, you can add the logicFunction to the `$` nameSpace in the controller

    $.myLogicFunction = function(value){
    	return L(value.key);
    };
    
In the manual approach you can, instead of a string to the `$` namespace, you can also add in the function directly, so it can also be an anonymous function

    logicFunction: function(value){
        return L(value.key);
    }
    
Now, you can use part of an object to set the value of your UI component automatically. Another example for visibilty of an object based on an integer you can find in the sample app.
    
## Subscribe in other controllers

The preferred method would be to pass the window GUID to the child controller, so you can pass the guid in the manual subscribe method inside a sub-controller

    // index.js
    Alloy.createController('mySubController', {parentGuid: $.args.staballoy.guid});
    
    // mySubController
    $.args.subscribe({
        window: $.args.parentGuid
    });

In case you create the controller inside an XML, you should create a setter and start subscribing after the setter has been called. 

You could also use an exported function in the sub-controller, and use the main controller (a window) to subscribe. An example of this is included in the sample app.

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
    
> This flow is not really optimal so expect it to change in the future with a non-backwards compatible implementation. Suggestions for the new flow are welcome.

# Missing features / bugs / questions?
For missing features and bugs, please submit a ticket, or even better submit a Pull Request. 

If you have any questions, just contact me on [TiSlack](http://tislack.org). My name there is @Wraldpyk. There also is a `#staballoy` channel.

Want to support my work? Send a donation my way via the PayPal button on [TiSlack.org](http://tislack.org). Any support is appreciated.

## Changelog
- **0.3.3** - (20180905) Fixed issue where creating empty controllers crashed the app 
- **0.3.0** - (20180711) Added 2-way binding and deep-binding.
- **0.2.4** - (20171205) Add the ability to manual subscribe with a guid instead of a window.
- **0.2.3** - (20171030) Ignoring the setVar function call if the new value is the same as the stored one
- **0.2.2** - (20171024) Subscriptions of top most element weren't processed. Now they are!
- **0.2.1** - (20171019) Added support for NavigationWindows & ListSections. Fixed elements with children not being able to subscribe
- **0.2** - (20171012) Added direct subscribers from tss instead of controllers
- **0.1** - (20170928) First release
