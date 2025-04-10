package com.app.voicenotes

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise // To return results/errors asynchronously
import com.facebook.react.modules.core.DeviceEventManagerModule

import java.io.File // For file operations
import android.util.Log

class ShareReceiverModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val logTag = "ShareReceiverModule"

    // This is the name used to access the module from React Native
    // e.g., const { ShareReceiver } = NativeModules;
    override fun getName(): String {
        return "ShareReceiver"
    }

   @ReactMethod
    fun checkForPendingShareEvents(promise: Promise) {
        Log.d(logTag, "JS called checkForPendingShareEvents.")
        val pendingData = MainActivity.pendingShareEventData // Access static variable

        if (pendingData != null) {
            Log.d(logTag, "Pending share event data found. Attempting to send.")
            // Try to get current context - it SHOULD be ready if JS is calling this
            val currentContext = reactApplicationContext
            if (currentContext != null && currentContext.hasActiveReactInstance()) {
                 try {
                    currentContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("onShareReceived", pendingData) // Emit the queued event
                    MainActivity.pendingShareEventData = null // Clear the static variable after sending
                    Log.d(logTag, "Successfully sent pending event data.")
                    promise.resolve(true) // Indicate event was sent (or was pending)
                 } catch (e: Exception) {
                     Log.e(logTag, "Error emitting pending event", e)
                     promise.reject("E_PENDING_EMIT", "Failed to emit pending event: ${e.message}", e)
                 }
            } else {
                 Log.w(logTag, "Context not ready when trying to send pending event. Data remains queued.")
                 // Should not happen often if called from JS, but handle defensively
                 promise.reject("E_CONTEXT_NULL", "ReactContext not available when sending pending event.")
            }
        } else {
            Log.d(logTag, "No pending share event data found.")
            promise.resolve(false) // Indicate no event was pending
        }
    }

    // Method exposed to React Native to clear files stored in the app's cache directory
    @ReactMethod
    fun clearSharedFilesCache(promise: Promise) {
        try {
            val cacheDir = reactApplicationContext.cacheDir // Get app's cache directory
            if (cacheDir == null || !cacheDir.exists()) {
                Log.d(logTag, "Cache directory does not exist, nothing to clear.")
                promise.resolve(true) // Indicate success as there's nothing to do
                return
            }

            val files = cacheDir.listFiles()
            var deletedCount = 0
            var failedCount = 0

            files?.forEach { file ->
                // Optional: Add more specific logic to only delete files created by the share intent
                // (e.g., check for a prefix like "shared_") if cache is used for other things.
                try {
                    if (file.isFile && file.delete()) {
                        deletedCount++
                    } else if (file.isDirectory) {
                        // Optionally delete directories recursively if needed
                    } else if (file.isFile) { // File exists but delete failed
                        Log.w(logTag, "Failed to delete cache file: ${file.name}")
                        failedCount++
                    }
                } catch (e: SecurityException) {
                    Log.e(logTag, "SecurityException deleting cache file: ${file.name}", e)
                    failedCount++
                } catch (e: Exception) {
                    Log.e(logTag, "Exception deleting cache file: ${file.name}", e)
                    failedCount++
                }
            }

            if (failedCount == 0) {
                Log.d(logTag, "Successfully cleared $deletedCount files from cache.")
                promise.resolve(true)
            } else {
                Log.w(logTag, "Cleared $deletedCount files, but failed to delete $failedCount files from cache.")
                // Resolve partially successful, or reject based on severity
                promise.resolve(false) // Indicate partial success/failure
            }

        } catch (e: Exception) {
            Log.e(logTag, "Error accessing or clearing cache directory.", e)
            promise.reject("E_CLEAR_CACHE_ERROR", "Failed to clear cache directory: ${e.message}", e)
        }
    }

}
