function submitItem(){
	if ($.newItemTitle.getValue().length <= 2){
		return;
	}
	
	var items = Ti.App.Properties.getList('todoItems',[]);
	
	items.push($.newItemTitle.getValue());
	Ti.App.Properties.setList('todoItems', items);
	staballoy.setVar('todoItems', items);
	$.newItemTitle.setValue('');
}
