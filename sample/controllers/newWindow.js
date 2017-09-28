function close(){
    $.getView().close();
}

console.log($.args.eventHandlerGuid);

$.args.subscribe($.close, $);
