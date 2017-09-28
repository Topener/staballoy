function close(){
    $.getView().close();
}

console.log($.args.eventHandlerGuid);

$.args.subscribe($.close);


setTimeout(function(){
    $.args.staballoy.setVar('closeButtonName', 'close now');
}, 1000);
