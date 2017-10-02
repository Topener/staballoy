# Staballoy
Reactive UI framework for Titanium Alloy with event handling Edit

Why the name staballoy? Well.. to quote wikipedia

> staballoys are metal alloys of a high proportion of depleted uranium with other metals, usually titanium

It has the Titanium in it, is an alloy and uranium is a reactive metal. Sounds like the perfect name to me.

## How does it work?
Staballoy injects itself in every controller and can handle monitoring of variables for you in a reactive way. You can subscribe any UI component in staballoy and your UI component will be updated for the argument you provide.

## Setup

So enough talk, how do I install it? First you need to `staballoy.js` to your `lib` folder and require it in `alloy.js`

    var staballoy = require('/staballoy');

Now, this will override `Alloy.createController` so it is not compatible with any other modules/libraries that do the same. Keep this in mind! (barely any modules/library does this, but [Jason Kneens AlloyXL](https://github.com/jasonkneen/AlloyXL) is an example)

## Example

Every controller will have access to a `$.args.subscribe` method as well as `$.args.staballoy` which contains methods to set and get variables stored.

You can set a variable like this:

    $.args.staballoy.setVar('myVarName', 'value');
    
Next to `setVar` there of course is also a `getVar` method

    var value = $.args.staballoy.getVar('myVarName');
    
Now for the interesting stuff. Lets subscribe to a variable! In this case, we'll subscribe to `myVarName` and put it for the `text` property of a label.

So in any controller, you subscribe like this. First argument is the UI component you want to a subscription on, the second is the `$`. This is needed to now context and so staballoy can keep memory clean.

    $.args.subscribe($.myLabel, $);
    
What it subscribes to exactly you can define in `tss` like this:

    "#myLabel": {
        staballoy: {
            subscribe: [{
                var: "myVarName",
                attribute: "text"
            }]
        }
    }

As you can see, the `subscribe` object in `tss` accepts an array, so multiple variables can be monitored for multiple properties of a single UI component.

## Logic functions
Instead of wanting to use the exact data stored in the variable, you might also want to use the data provided to do something else with it?

An example, lets say we monitor geolocation and its accuracy, and we want to display a warning to the user if the accuracy is higher than 50 (inaccurate, the lower the better).

    // some controller
    Ti.Geolocation.addEventListener('location', locationCallback);

    function locationCallback(e){
        if (e.coords){
            staballoy.setVar('geoAccuracy', e.coords.accuracy);
        }
    }
    
    // subscriber controller
    $.args.subscribe($.warningLabel, $, function(value){
        return value >= 50;
    });
    
    // subscriber tss
    
    "#warningLabel": {
        staballoy: {
            subscribe: [{
                var: "geoAccuracy",
                attribute: "visible"
            }]
        }
    }    
    
