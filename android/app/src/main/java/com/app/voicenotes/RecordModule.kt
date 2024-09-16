package com.app.voicenotes

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import javax.annotation.Nullable


class RecordModule (
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule() {
    override fun getName(): String {
       return "RecordModule"
    }

}