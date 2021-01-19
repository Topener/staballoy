# Staballoy
Reactive UI framework for Titanium Alloy with event handling

| :exclamation:  **ALPHA VERSION**. There currently is NO garbage collection implemented :exclamation:  |
|------------------------|
| Use at own risk  |

Why the name staballoy? Well.. to quote wikipedia

> staballoys are metal alloys of a high proportion of depleted uranium with other metals, usually titanium

It has the Titanium in it, is an alloy and uranium is a reactive metal. Sounds like the perfect name to me.

| :warning:  Breaking changes :warning:  |
|------------------------|
| Version 1.0.0 introduced massive breaking changes as opposed to any 0.x version. Staballoy also no longer overrides the `Alloy.createController` method and therefore is completely compatible with any other framework. |

## How does it work?
Staballoy maintains an object of data, stored in `Ti.App.Properties`, any alteration in this data (by setting new properties) will cause the library to find any UI elements that need updating automatically. 
## Setup

So enough talk, how do I install it? For **Alloy** projects go to the `lib` directory of your project, then run the following command `npm i staballoy`.

_Note: if your app doesn't have `node_modules` yet, run `npm init` first!_

## Getting/Setting data

Staballoy stores all data in a single `Ti.App.Properties` object, so anything you set will add to this dataset. Staballoy automatically deep-merges the data you set, so you do not have to worry about overwriting/losing data if you do not include the already set data.

**Setting data**
To set data in staballoy, all you need to do is call the `set` method and provide any data you want to **add** to the dataset

```js
require('staballoy').set(object);
```

An automatic deep merge will be initiated on the data you set.

**Getting data**
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

Once this is set, dive into your `tss` and add subscriptions, using a path to the property you want to set it to, and the property you want to update. 

**Example 1**

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

This will automatically change the color and text of the Label, on the fly. 

**Any UI property that is not creation- or read-only is supported. Most UI elements are supported too**
# Missing features / bugs / questions?
For missing features and bugs, please submit a ticket, or even better submit a Pull Request. 

If you have any questions, just contact me on [TiSlack](http://tislack.org). My name there is @Wraldpyk.

Want to support my work? Send a donation my way via the Ko-Fi button on [TiSlack.org](http://tislack.org). Any support is appreciated.

## Changelog
- **1.0.0** - (20210119) Complete rewrite of the module
- **0.3.3** - (20180905) Fixed issue where creating empty controllers crashed the app 
- **0.3.0** - (20180711) Added 2-way binding and deep-binding.
- **0.2.4** - (20171205) Add the ability to manual subscribe with a guid instead of a window.
- **0.2.3** - (20171030) Ignoring the setVar function call if the new value is the same as the stored one
- **0.2.2** - (20171024) Subscriptions of top most element weren't processed. Now they are!
- **0.2.1** - (20171019) Added support for NavigationWindows & ListSections. Fixed elements with children not being able to subscribe
- **0.2** - (20171012) Added direct subscribers from tss instead of controllers
- **0.1** - (20170928) First release
