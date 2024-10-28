package com.app.voicenotes

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@ReactModule(name = "TokenBridge")
class TokenBridgeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {


    companion object {
        const val WEARABLE_TOKEN_PATH = "/token_path"
        const val TAG = "TokenBridgeModule"
    }

    override fun getName(): String {
        return "TokenBridge"
    }


    @ReactMethod
    fun sendTokenToWatch(token: String) {
        // Send the token to the Wear OS app
        Log.d("MainApplication", "sendTokenToWatch: $token")
        sendMessageToWatch(token)
    }

    @ReactMethod
    fun fetchTokenWithWatch() {
        // Trigger a React Native event to let the JS side know to send the token
        Log.d(TAG, "fetchTokenWithWatch invoked")
        sendEventToReactNative("sendToken")
    }

    private fun sendEventToReactNative(eventName: String) {
        val reactContext = reactApplicationContext
        if (reactContext.hasActiveCatalystInstance()) {
            Log.d("TokenBridgeModule", "Sending event to React Native: $eventName")
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, null)
        } else {
            Log.w("TokenBridgeModule", "React Native catalyst instance is not active")
        }
    }


    private fun sendMessageToWatch(token: String) {
        Log.d("MainApplication", "sendMessageToWatch started")
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val nodeClient = Wearable.getNodeClient(reactApplicationContext)
                nodeClient.connectedNodes.addOnSuccessListener { nodes ->
                    nodes.forEach { node ->
                        val sendMessageTask = Wearable.getMessageClient(reactApplicationContext)
                            .sendMessage(node.id, WEARABLE_TOKEN_PATH, token.toByteArray())
                        sendMessageTask.addOnSuccessListener {
                            Log.d("MainApplication", "Message sent successfully")


                        }.addOnFailureListener {
                            it.printStackTrace()
                            Log.e("MainApplication", "Failed to send message", it)
                        }
                    }
                }.addOnFailureListener {
                    it.printStackTrace()
                    Log.e("MainApplication", "No connected nodes found")
                }
            } catch (e: Exception) {
                e.printStackTrace()
                Log.e("MainApplication", "Failed to get connected nodes", e)
            }
        }
    }
}
