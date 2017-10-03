$.args.subscribe({
    'component' : $.getView(),
    'window' : $,
    'subscriptions' : [{'closeButtonName': 'visible'}],
    'logicFunction' : function(value, variable, property) {
        return !(value % 10);
    }
});
