package com.app.voicenotes

import android.util.Log
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService

class WearMessageReceiverService : WearableListenerService() {

    override fun onMessageReceived(messageEvent: MessageEvent) {
        super.onMessageReceived(messageEvent)
        Log.d("PhoneApp", "Message received from WearOS")
        if (messageEvent.path == "/auth_token") {
            val message = String(messageEvent.data)
            Log.d("PhoneApp", "Message received from WearOS: $message")
            initiateReactAndRetrieveToken()
        }
    }

    private fun initiateReactAndRetrieveToken() {
        val reactInstanceManager = (applicationContext as? MainApplication)?.reactNativeHost?.reactInstanceManager

        val currentReactContext = reactInstanceManager?.currentReactContext
        if (currentReactContext != null) {
            Log.d("PhoneApp", "ReactContext already initialized")
            triggerReactMethod()
        } else {
            Log.d("PhoneApp", "ReactContext not initialized, adding listener")
            reactInstanceManager?.addReactInstanceEventListener { context ->
                Log.d("PhoneApp", "ReactInstanceManager initialized")
                triggerReactMethod()
            }
            reactInstanceManager?.createReactContextInBackground()
        }
    }

    private fun triggerReactMethod() {
        Log.d("PhoneApp", "triggerReactMethod invoked")

        val reactContext = (applicationContext as? MainApplication)?.reactNativeHost?.reactInstanceManager?.currentReactContext

        if (reactContext != null) {
            Log.d("PhoneApp", "ReactContext successfully retrieved")

            val tokenBridgeModule = reactContext.getNativeModule(TokenBridgeModule::class.java)

            if (tokenBridgeModule != null) {
                Log.d("PhoneApp", "TokenBridgeModule found, invoking fetchTokenWithWatch()")
                tokenBridgeModule.fetchTokenWithWatch()
            } else {
                Log.e("PhoneApp", "TokenBridgeModule is not found in ReactContext")
            }
        } else {
            Log.e("PhoneApp", "ReactContext is not initialized")
        }
    }
}
