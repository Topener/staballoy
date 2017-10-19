function requestLocationPermission(success, error) {
	var locationServicesAuthorization = Ti.Geolocation.locationServicesAuthorization;

	// we cannot ask it!
	if (locationServicesAuthorization === Ti.Geolocation.AUTHORIZATION_RESTRICTED) {
		error && error();
		return showAlertDialog(L('location_permission_restricted'));
	} else if (locationServicesAuthorization === Ti.Geolocation.AUTHORIZATION_DENIED) {
		error && error();
		return showAlertDialog(L('location_permission_denied'));
	}
	
	Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(e) {
		
		if (e.success){
			return success();
		}
		
		return showAlertDialog(L('location_permission_denied'));
	});
	
}

function showAlertDialog(message){
	var dialog = Ti.UI.createAlertDialog({
		title: L('error'),
		message: message,
	});
	
	dialog.show();
}

function editPermissions(e) {

	if (OS_IOS) {
		Ti.Platform.openURL(Ti.App.iOS.applicationOpenSettingsURL);
	}

	if (OS_ANDROID) {
		var intent = Ti.Android.createIntent({
			action: 'android.settings.APPLICATION_SETTINGS',
		});
		intent.addFlags(Ti.Android.FLAG_ACTIVITY_NEW_TASK);
		Ti.Android.currentActivity.startActivity(intent);
	}
}

module.exports = {
	requestLocationPermission: requestLocationPermission,
	editPermissions: editPermissions
};
