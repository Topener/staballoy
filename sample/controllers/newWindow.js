$.close.text = $.args.staballoy.getVar('closeButtonName');

function close(){
    $.getView().close();
}

console.log($.args.eventHandlerGuid);

$.args.subscribe($.close, $);
