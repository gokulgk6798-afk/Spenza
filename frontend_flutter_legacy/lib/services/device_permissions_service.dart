import 'package:permission_handler/permission_handler.dart';

class DevicePermissionsService {
  Future<Map<String, PermissionStatus>> requestTrackingPermissions() async {
    final sms = await Permission.sms.request();
    final notifications = await Permission.notification.request();

    return {
      'sms': sms,
      'notifications': notifications,
    };
  }
}

