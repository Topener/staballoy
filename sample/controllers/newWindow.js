function close(){
    $.getView().close();
    $.args.staballoy.setVar('closeButtonColor', '#000');
}

$.args.subscribe($.close, $);