package com.app.voicenotes

// --- Share Receiver Imports Start ---
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Patterns
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.util.UUID
// --- Share Receiver Imports End ---


import android.os.Build
import android.os.Bundle
import android.util.Log

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.google.android.gms.wearable.Wearable

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {

    // --- Share Receiver Members Start ---
    private val logTag = "MainActivityShare"
    private var initialIntentHandled = false
    // --- Share Receiver Members End ---

    // --- Companion Object for Static Pending Data ---
    companion object {
        // Static variable to hold event data if JS isn't ready
        var pendingShareEventData: WritableMap? = null
    }
    // ---------------------------------------------

    override fun onCreate(savedInstanceState: Bundle?) {
        // Set the theme to AppTheme BEFORE onCreate to support
        // coloring the background, status bar, and navigation bar.
        // This is required for expo-splash-screen.
        setTheme(R.style.AppTheme);
        super.onCreate(null)

        // --- Share Intent Handling in onCreate Start ---
        // Check if launched via an intent ONLY if not already handled and not restoring state
        if (!initialIntentHandled && savedInstanceState == null) {
            intent?.let {
                Log.d(logTag, "onCreate: Checking initial intent: ${it.action}")
                // Process intent and mark handled only if it was a share action
                if (handleIntent(it)) { // handleIntent returns true if processed
                    initialIntentHandled = true
                }
            }
        }
        // --- Share Intent Handling in onCreate End ---

        Log.d("PhoneApp", "On created ")
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "main"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return ReactActivityDelegateWrapper(
            this,
            BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
            object : DefaultReactActivityDelegate(
                this,
                mainComponentName,
                fabricEnabled
            ) {})
    }

    /**
     * Align the back button behavior with Android S
     * where moving root activities to background instead of finishing activities.
     * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
     */
    override fun invokeDefaultOnBackPressed() {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
            if (!moveTaskToBack(false)) {
                // For non-root activities, use the default implementation to finish them.
                super.invokeDefaultOnBackPressed()
            }
            return
        }

        // Use the default back button implementation on Android S
        // because it's doing more than [Activity.moveTaskToBack] in fact.
        super.invokeDefaultOnBackPressed()
    }


    // --- Share Receiver onNewIntent Start ---
    // Handle intents received while the activity is already running
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        Log.d(logTag, "onNewIntent: Received intent: ${intent?.action}")
        intent?.let {
            handleIntent(it) // Process the new intent
        }
    }
    // --- Share Receiver onNewIntent End ---



            // --- Share Receiver handleIntent Start ---
    private fun handleIntent(intent: Intent): Boolean {
        val action = intent.action
        val type = intent.type // The general MIME type

        Log.d(logTag, "Handling intent action: $action type: $type")

        val itemsArray = Arguments.createArray()
        var processed = false // Track if we actually handled this as a share

        when (action) {
            Intent.ACTION_SEND -> {
                // Handle single item sharing
                if (type?.startsWith("text/") == true) {
                     intent.getStringExtra(Intent.EXTRA_TEXT)?.let { text ->
                        val itemType = if (Patterns.WEB_URL.matcher(text).matches()) "url" else "text"
                        val mime = type ?: (if (itemType == "url") "text/url" else "text/plain")
                        Log.d(logTag, "SEND: Found text/url content (type: $itemType)")
                        itemsArray.pushMap(createItemMap(itemType, mime, textContent = text))
                        processed = true
                     }
                }
                intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)?.let { uri ->
                    if (!processed || type?.startsWith("text/") == false) {
                         Log.d(logTag, "SEND: Found stream URI: $uri")
                         val fileInfo = copyUriToAppCache(uri)
                         if (fileInfo != null) {
                             itemsArray.pushMap(fileInfo)
                             processed = true
                         } else {}
                    } else {
                         Log.d(logTag, "SEND: Ignoring stream URI as text content was already processed.")
                    }
                }
                if (!processed && type != null) { // Log only if type wasn't null but we didn't process
                     Log.w(logTag, "SEND Intent: Action recognized but no processable TEXT or STREAM found for type $type.")
                }
            }
            Intent.ACTION_SEND_MULTIPLE -> {
                intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)?.let { uris ->
                    Log.d(logTag, "SEND_MULTIPLE: Found ${uris.size} URIs.")
                    var successCount = 0
                    uris.forEach { uri ->
                        val fileInfo = copyUriToAppCache(uri)
                        if (fileInfo != null) {
                            itemsArray.pushMap(fileInfo)
                            successCount++
                        }
                    }
                    if (successCount > 0) processed = true
                    else Log.w(logTag, "SEND_MULTIPLE: No URIs could be successfully processed.")
                } ?: Log.w(logTag, "SEND_MULTIPLE Intent: No EXTRA_STREAM ArrayList found.")
            }
            else -> {
                Log.d(logTag, "Intent action $action not handled as share.")
                return false
            }
        }

        if (processed && !itemsArray.toArrayList().isEmpty()) {
            Log.d(logTag, "Processed ${itemsArray.size()} items from intent. Emitting event 'onShareReceived'.")
            val eventPayload = Arguments.createMap().apply { putArray("items", itemsArray) }
            sendEvent("onShareReceived", eventPayload)
        } else if (processed) {
             Log.d(logTag, "Intent processed but resulted in zero items.")
        } else {
             Log.d(logTag, "Intent not processed as a relevant share action.")
        }
        return processed
    }
    // --- Share Receiver handleIntent End ---



    // --- Share Receiver createItemMap Start ---
    private fun createItemMap(type: String, mimeType: String?, textContent: String? = null, filePath: String? = null, fileName: String? = null): WritableMap {
        return Arguments.createMap().apply {
            putString("id", UUID.randomUUID().toString())
            putString("type", type)
            putString("mimeType", mimeType ?: "unknown")
            when (type) {
                "file" -> {
                    putString("path", filePath?.let { "file://$it" })
                    putString("fileName", fileName ?: "shared_file")
                }
                "text", "url" -> {
                    putString("content", textContent ?: "")
                }
            }
        }
    }
    // --- Share Receiver createItemMap End ---



    // --- Share Receiver copyUriToAppCache Start ---
    private fun copyUriToAppCache(uri: Uri): WritableMap? {
        var inputStream: InputStream? = null
        var fileOutputStream: FileOutputStream? = null
        val context = applicationContext
        val resolver = context.contentResolver
        val mimeType = resolver.getType(uri)
        val fileName = getFileName(uri) // Use helper

        val cacheDir = context.cacheDir ?: return run { // Handle null cacheDir
            Log.e(logTag, "Cache directory is null. Cannot copy file.")
            null
        }
        if (!cacheDir.exists()) { cacheDir.mkdirs() }

         val uniqueFileNamePart = UUID.randomUUID().toString().substring(0, 8)
         // Ensure filename has a reasonable length and valid characters
         val safeBaseName = fileName ?: "shared_file"
         val sanitizedBaseName = safeBaseName.replace("[^a-zA-Z0-9.-_]".toRegex(), "_").take(100)
         val finalFileName = "${uniqueFileNamePart}_${sanitizedBaseName}"
        val cacheFile = File(cacheDir, finalFileName)

        try {
            inputStream = resolver.openInputStream(uri) ?: throw Exception("Could not open input stream for URI")
            fileOutputStream = FileOutputStream(cacheFile)
            inputStream.copyTo(fileOutputStream)
            fileOutputStream.flush()
            Log.d(logTag, "Copied URI $uri to cache: ${cacheFile.absolutePath}")
            return createItemMap("file", mimeType, filePath = cacheFile.absolutePath, fileName = fileName ?: finalFileName)
        } catch (e: Exception) {
            Log.e(logTag, "Failed to copy file from URI: $uri", e)
            if (cacheFile.exists()) { cacheFile.delete() }
            return null
        } finally {
            try { inputStream?.close() } catch (e: Exception) { Log.e(logTag, "Error closing input stream", e) }
            try { fileOutputStream?.close() } catch (e: Exception) { Log.e(logTag, "Error closing output stream", e) }
        }
    }
    // --- Share Receiver copyUriToAppCache End ---



    // --- Share Receiver getFileName Start ---
    private fun getFileName(uri: Uri): String? {
        var result: String? = null
        if (uri.scheme == "content") {
            try {
                 applicationContext.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
                    if (cursor.moveToFirst()) {
                        // Use getColumnIndex instead of hardcoding index 0
                        val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                        if (nameIndex != -1) { // Check if column exists
                             result = cursor.getString(nameIndex)
                        }
                    }
                }
            } catch (e: Exception) {
                 Log.w(logTag,"Error querying content resolver for display name: $e")
            }
        }
        if (result == null) {
            result = uri.path
            val cut = result?.lastIndexOf('/')
            if (cut != null && cut != -1) {
                result = result?.substring(cut + 1)
            }
        }
        // Return null if still null, let copyUriToAppCache handle default naming
        return result?.ifBlank { null }
    }
    // --- Share Receiver getFileName End ---



    // --- Share Receiver sendEvent Start ---
    private fun sendEvent(eventName: String, params: WritableMap?) {
         val instanceManager = reactNativeHost?.reactInstanceManager
         // Check instanceManager first
         if (instanceManager == null) {
             Log.e(logTag, "sendEvent: Cannot send event '$eventName', ReactInstanceManager is null. Queuing event.")
             pendingShareEventData = params // Queue if instance manager isn't even there
             return
         }

         val reactContext = instanceManager.currentReactContext
         var contextIsReady = false // Flag to check readiness

         if (reactContext != null) {
             // Check both context existence AND if it has an active JS instance
             contextIsReady = reactContext.hasActiveReactInstance()
             Log.d(logTag, "sendEvent: Attempting to send '$eventName'. ReactContext found. Has active instance: $contextIsReady")
         } else {
             Log.w(logTag, "sendEvent: Attempting to send '$eventName'. ReactContext is NULL.")
         }

        if (contextIsReady) {
             // Context seems ready, attempt direct emit
             Log.i(logTag, "sendEvent: ReactContext READY. Emitting '$eventName' directly.")
             try {
                  reactContext!! // Safe to use non-null assertion because contextIsReady is true
                      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                      .emit(eventName, params)
                  // Clear any potentially stale pending data only after successful emit
                  if (pendingShareEventData != null) {
                     Log.d(logTag, "sendEvent: Clearing potentially stale pending data after direct emit.")
                     pendingShareEventData = null
                  }
             } catch (e: Exception) {
                  Log.e(logTag, "sendEvent: Error emitting event $eventName directly. Queuing as fallback.", e)
                  // Fallback: Queue if emit fails unexpectedly
                  pendingShareEventData = params
             }
        } else {
            // Context not ready, queue the event data
            Log.w(logTag, "sendEvent: ReactContext NOT READY. Queuing event '$eventName'. Storing data.")
            pendingShareEventData = params // Store the data statically
        }
    }
    // --- Share Receiver sendEvent End ---

}
