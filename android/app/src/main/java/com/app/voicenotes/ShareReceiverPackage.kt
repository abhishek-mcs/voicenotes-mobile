package com.app.voicenotes

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

import java.util.Collections // Or use listOf for immutable list

class ShareReceiverPackage : ReactPackage {

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        // Return a list containing an instance of your module
        return listOf(ShareReceiverModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        // Return an empty list if your module doesn't provide any UI components (ViewManagers)
        return Collections.emptyList()
        // Or return emptyList()
    }
}
