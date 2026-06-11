const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("@expo/config-plugins");

function javaPackagePath(packageName) {
  return packageName.split(".").join(path.sep);
}

function moduleSource(packageName) {
  return `package ${packageName};

import android.database.Cursor;
import android.net.Uri;
import android.provider.Telephony;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

public class SpenzaSmsReaderModule extends ReactContextBaseJavaModule {
  public SpenzaSmsReaderModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "SpenzaSmsReader";
  }

  @ReactMethod
  public void getRecentSms(ReadableMap options, Promise promise) {
    int sinceHours = options.hasKey("sinceHours") ? options.getInt("sinceHours") : 24;
    int limit = options.hasKey("limit") ? options.getInt("limit") : 200;
    long since = System.currentTimeMillis() - (sinceHours * 60L * 60L * 1000L);

    String[] projection = new String[] {
      Telephony.Sms._ID,
      Telephony.Sms.ADDRESS,
      Telephony.Sms.BODY,
      Telephony.Sms.DATE
    };

    String selection = Telephony.Sms.DATE + " >= ?";
    String[] selectionArgs = new String[] { String.valueOf(since) };
    String sortOrder = Telephony.Sms.DATE + " DESC LIMIT " + Math.max(1, Math.min(limit, 500));
    WritableArray messages = Arguments.createArray();

    try {
      Uri inboxUri = Telephony.Sms.Inbox.CONTENT_URI;
      Cursor cursor = getReactApplicationContext()
        .getContentResolver()
        .query(inboxUri, projection, selection, selectionArgs, sortOrder);

      if (cursor == null) {
        promise.resolve(messages);
        return;
      }

      try {
        int idIndex = cursor.getColumnIndexOrThrow(Telephony.Sms._ID);
        int senderIndex = cursor.getColumnIndexOrThrow(Telephony.Sms.ADDRESS);
        int bodyIndex = cursor.getColumnIndexOrThrow(Telephony.Sms.BODY);
        int dateIndex = cursor.getColumnIndexOrThrow(Telephony.Sms.DATE);

        while (cursor.moveToNext()) {
          WritableMap message = Arguments.createMap();
          message.putString("id", cursor.getString(idIndex));
          message.putString("sender", cursor.getString(senderIndex));
          message.putString("body", cursor.getString(bodyIndex));
          message.putDouble("timestamp", cursor.getLong(dateIndex));
          messages.pushMap(message);
        }
      } finally {
        cursor.close();
      }

      promise.resolve(messages);
    } catch (SecurityException error) {
      promise.reject("SMS_PERMISSION_DENIED", "SMS permission is required to read inbox messages.", error);
    } catch (Exception error) {
      promise.reject("SMS_READ_FAILED", "Could not read SMS messages.", error);
    }
  }
}
`;
}

function packageSource(packageName) {
  return `package ${packageName};

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class SpenzaSmsReaderPackage implements ReactPackage {
  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
    List<NativeModule> modules = new ArrayList<>();
    modules.add(new SpenzaSmsReaderModule(reactContext));
    return modules;
  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }
}
`;
}

function registerKotlinPackage(contents) {
  if (contents.includes("SpenzaSmsReaderPackage()")) return contents;

  return contents.replace(
    /val packages = PackageList\(this\)\.packages\s*\n/,
    "val packages = PackageList(this).packages\n        packages.add(SpenzaSmsReaderPackage())\n"
  );
}

function registerJavaPackage(contents) {
  if (contents.includes("new SpenzaSmsReaderPackage()")) return contents;

  return contents.replace(
    /List<ReactPackage> packages = new PackageList\(this\)\.getPackages\(\);\s*\n/,
    "List<ReactPackage> packages = new PackageList(this).getPackages();\n          packages.add(new SpenzaSmsReaderPackage());\n"
  );
}

module.exports = function withSpenzaSmsReader(config) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const packageName = modConfig.android?.package || "com.spenza.app";
      const srcRoot = path.join(
        modConfig.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "java",
        ...packageName.split(".")
      );

      fs.mkdirSync(srcRoot, { recursive: true });
      fs.writeFileSync(path.join(srcRoot, "SpenzaSmsReaderModule.java"), moduleSource(packageName));
      fs.writeFileSync(path.join(srcRoot, "SpenzaSmsReaderPackage.java"), packageSource(packageName));

      const mainApplicationKt = path.join(srcRoot, "MainApplication.kt");
      const mainApplicationJava = path.join(srcRoot, "MainApplication.java");

      if (fs.existsSync(mainApplicationKt)) {
        fs.writeFileSync(mainApplicationKt, registerKotlinPackage(fs.readFileSync(mainApplicationKt, "utf8")));
      } else if (fs.existsSync(mainApplicationJava)) {
        fs.writeFileSync(mainApplicationJava, registerJavaPackage(fs.readFileSync(mainApplicationJava, "utf8")));
      }

      return modConfig;
    },
  ]);
};
