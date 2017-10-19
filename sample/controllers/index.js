$.parseTodoItems = function(val){
	if (!val || val.length === 0) return;
	var items = [];
	_.each(val, function(item){
		items.push({properties: {title: item}});
	});
	return items;
};

$.windowTitleParser = function(items){
	return items.length + " todo items";
};

function addItem(){
	$.navWin.openWindow(Alloy.createController('newitem').getView());
}

$.getView().open();
