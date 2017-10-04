function close() {
    $.getView().close();
    $.args.staballoy.setVar('closeButtonColor', '#000');
}


$.args.subscribe({
    'component' : $.close,
    'window' : $,
    'subscriptions': {'closeButtonColor' : 'color', 'closeButtonName': 'text'}
});