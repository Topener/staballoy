var i = 0;

setInterval(function(){
    i++;
    $.args.staballoy.setVar('closeButtonName', 'close now - ' + i);
}, 500);


function doClick(e) {
	Alloy.createController('newWindow').getView().open();
}

$.index.open();
