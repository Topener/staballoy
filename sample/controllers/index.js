var i = 0;

setInterval(function(){
    i++;
    $.args.staballoy.setVar('closeButtonName', i);
}, 500);

function doClick(e) {
	Alloy.createController('newWindow').getView().open();
	setTimeout(function(){
	    $.args.staballoy.setVar('closeButtonColor', 'red');
	},2500);
}

$.args.subscribe({
    'component' : $.subView,
    'window' : $,
    'subscriptions' : {'closeButtonName': 'setVisible'},
    'logicFunction' : function(value, variable, property) {
        return !(value % 10);
    }
});

$.index.open();