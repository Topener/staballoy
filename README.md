# Staballoy
State Manager & Reactive UI framework for Titanium Alloy with event handling

## How does it work?
Staballoy maintains an object of data, stored in `Ti.App.Properties`, any alteration in this data (by setting the state) will cause the library to find any UI elements that need updating automatically. 
## Setup

So how do I install it? For **Alloy** projects go to the `lib` directory of your project (`app/lib`), then run the following command `npm i staballoy` for **Webpack** projects run the npm install in your app root.

_Note: if your Alloy app doesn't have `node_modules` yet, run `npm init` first!_

## Getting/Setting data

Staballoy stores all data in a single `Ti.App.Properties` object, so anything you set will add to this dataset. Staballoy automatically deep-merges the data you set, so you do not have to worry about overwriting/losing data if you do not include the already set data.

_Note: Setting an array will not merge the existing array in the same place, array's overwrite_

### Setting data
To set data in staballoy, all you need to do is call the `set` method and provide any data you want to **add** to the dataset

```js
require('staballoy').set(object);
```

An automatic deep merge will be initiated on the data you set.

### Resetting data
Instead of using `set` you can also use `reset` so you don't deep merge data, but override it instead. This will remove all data currently stored.

```js
require('staballoy').reset(object);
```

### Getting data
To get all the data currently set in the staballoy storage, call the `get` method

```js
const data = require('staballoy').get();
```

The `get` method has an optional argument, if you provide this argument you can return a subset of the data. A deep search is performed to get this property, so you can provide a path to the property you want to fetch.

```js
const data = require('staballoy').get('my.nested.property');
```

This will return `Hello, World!` when the data has been set as `{my: { nested: { property: "Hello, World!"}}}`.

## Subscribe

Of course the most important feature is subscribing to any data you have set. To enable subscribing all you need to do is add the `module="staballoy"` tag to any UI element you want to have support for this. 


```xml
<View module="staballoy" id="myView" />
```


To enable an entire controller at once, add this to the Alloy tag. 

```xml
<Alloy module="staballoy">
```

Once this is set, dive into your `tss` and add subscriptions, using a path to the property you want to set it to, and the property you want to update. There are 2 methods of subscribing, simple or with a transform method.

### Simple Subscribe
You want to set the color and text property of a `<Label>` based on a user profile:

```xml
<Label id="myLabel" module="staballoy" />
```

Then in the `tss`:
```js
"#myLabel": {
    staballoy: {
        text: "user.name",
        color: "user.favoriteColor"
    }
}
```

Then setting that data in staballoy is simple:

```js
require('staballoy').set({user: {name: "John Doe", color: "#6F2E25"}});
```

This will automatically change the color and text of the Label, on the fly, and anything you set is stored so you only need to do this once.

### Subscribing with dataTransform
If you want to tranform the data prior to setting it, you can add the transform method to the subscription. We're taking the example above and altering it to support transformation.

First, in tss set transform to true this way:
```js
"#myLabel": {
    staballoy: {
        text: {
            value: "user.name",
            transform: true
        },
        color: "user.favoriteColor"
    }
}
```

This will disable staballoy to automatically set the text value for you, but it will still automatically set the color. Instead it will trigger the tranform event on the UI element. So, time to subscribe to the UI element.

```xml
<Label id="myLabel" module="staballoy" onTransform="handleLabelTransform" />
```

And then in the controller you need to create your transform handler:

```js
function handleLabelTransform(e) {
    e.source[e.key] = e.value;
}
```

As you can see, the event contains the source, the key of what needs changing, and the value. In our situation the source is the `<Label>`, the key is `text` and the value is `John Doe`. But now you can do anything you want with the value you wish, just don't forget to apply the property to the UI element as Staballoy **won't do this automatically** anymore.

For example you now could do this:

```js
function handleLabelTransform(e) {
    e.source[e.key] = `Your name is: + ${e.value}`
}
```

## Debug
Want to get more logging? Enable debug mode! Add this line to `alloy.js` and you should be good
```js
require('staballoy').setDebug(true);
```

**Any UI property that is not creation- or read-only is supported. Most UI elements are supported too**
# Missing features / bugs / questions?
For missing features and bugs, please submit a ticket, or even better submit a Pull Request. 

If you have any questions, just contact me on [TiSlack](http://tislack.org). My name there is @Wraldpyk.

Want to support my work? Send a donation my way via the Ko-Fi button on [TiSlack.org](https://tislack.org). Any support is appreciated.

## Changelog
- **1.1.1** - (20210212) Arrays no longer merge, but they overwrite
- **1.1.0** - (20210205) Added ability to add a dataTransform to subscription
- **1.0.4** - (20210128) Fixed property search when property value was falsy
- **1.0.1** - (20210127) Added garbage-collection and debug mode
- **1.0.0** - (20210119) Complete rewrite of the module
- **0.3.3** - (20180905) Fixed issue where creating empty controllers crashed the app 
- **0.3.0** - (20180711) Added 2-way binding and deep-binding.
- **0.2.4** - (20171205) Add the ability to manual subscribe with a guid instead of a window.
- **0.2.3** - (20171030) Ignoring the setVar function call if the new value is the same as the stored one
- **0.2.2** - (20171024) Subscriptions of top most element weren't processed. Now they are!
- **0.2.1** - (20171019) Added support for NavigationWindows & ListSections. Fixed elements with children not being able to subscribe
- **0.2** - (20171012) Added direct subscribers from tss instead of controllers
- **0.1** - (20170928) First release
