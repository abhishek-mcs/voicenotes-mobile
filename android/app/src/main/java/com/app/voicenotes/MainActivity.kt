package com.app.voicenotes

import android.os.Build
import android.os.Bundle
import android.util.Log

import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns // To get filename from ContentResolver
import android.util.Patterns // For URL detection

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import com.facebook.react.ReactInstanceManager // Needed for checking ReactContext readiness
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.modules.core.DeviceEventManagerModule // To send events to JS

import com.google.android.gms.wearable.Wearable

import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.util.UUID // For generating unique IDs

import expo.modules.ReactActivityDelegateWrapper


class MainActivity : ReactActivity() {
    private val logTag = "MainActivityShare"
    // Flag to prevent double handling on initial create when launched via intent
    private var initialIntentHandled = false

    override fun onCreate(savedInstanceState: Bundle?) {
        // Set the theme to AppTheme BEFORE onCreate to support
        // coloring the background, status bar, and navigation bar.
        // This is required for expo-splash-screen.
        setTheme(R.style.AppTheme);
        super.onCreate(null)
        Log.d("PhoneApp", "On created ")

        // Check if launched via an intent ONLY if not already handled and not restoring state
        if (!initialIntentHandled && savedInstanceState == null) {
            intent?.let {
                Log.d(logTag, "onCreate: Checking initial intent: ${it.action}")
                handleIntent(it)
                // We only mark as handled if it was actually a share intent we processed
                // handleIntent will return true if it processed something
                if (handleIntent(it)) {
                    initialIntentHandled = true
                }
            }
        }
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

    // Called when the activity is already running and receives a new intent.
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        Log.d(logTag, "onNewIntent: Received intent: ${intent?.action}")
        intent?.let {
            handleIntent(it) // Process the new intent
        }
    }

    /**
     * Processes the incoming intent to extract shared data.
     * Returns true if a share intent was processed, false otherwise.
     */
    private fun handleIntent(intent: Intent): Boolean {
        val action = intent.action
        val type = intent.type // The general MIME type

        Log.d(logTag, "Handling intent action: $action type: $type")

        val itemsArray = Arguments.createArray()
        var processed = false // Track if we actually handled this as a share

        when (action) {
            Intent.ACTION_SEND -> {
                // Handle single item sharing
                // Prioritize text content if MIME type suggests it
                if (type?.startsWith("text/") == true) {
                    intent.getStringExtra(Intent.EXTRA_TEXT)?.let { text ->
                        val itemType = if (Patterns.WEB_URL.matcher(text).matches()) "url" else "text"
                        val mime = type ?: (if (itemType == "url") "text/url" else "text/plain")
                        Log.d(logTag, "SEND: Found text/url content (type: $itemType)")
                        itemsArray.pushMap(createItemMap(itemType, mime, textContent = text))
                        processed = true
                    }
                }

                // Check for a stream (file) - could be primary or alternative
                intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)?.let { uri ->
                    // Process stream only if text wasn't the primary content, or if type isn't text
                    if (!processed || type?.startsWith("text/") == false) {
                        Log.d(logTag, "SEND: Found stream URI: $uri")
                        val fileInfo = copyUriToAppCache(uri)
                        if (fileInfo != null) {
                            itemsArray.pushMap(fileInfo)
                            processed = true
                        } else {
                        }
                    } else {
                        Log.d(logTag, "SEND: Ignoring stream URI as text content was already processed.")
                    }
                }

                if (!processed) {
                    Log.w(logTag, "SEND Intent: Action recognized but no processable TEXT or STREAM found for type $type.")
                }
            }
            Intent.ACTION_SEND_MULTIPLE -> {
                // Handle multiple item sharing (usually files)
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
                    if (successCount > 0) {
                        processed = true
                    } else {
                        Log.w(logTag, "SEND_MULTIPLE: No URIs could be successfully processed.")
                    }
                } ?: Log.w(logTag, "SEND_MULTIPLE Intent: No EXTRA_STREAM ArrayList found.")
            }
            else -> {
                // Not a share intent we handle
                Log.d(logTag, "Intent action $action not handled as share.")
                return false // Indicate nothing was processed
            }
        }

        // Emit event ONLY if we successfully processed items from THIS intent
        if (processed && !itemsArray.toArrayList().isEmpty()) {
            Log.d(logTag, "Processed ${itemsArray.size()} items from intent. Emitting event 'onShareReceived'.")
            val eventPayload = Arguments.createMap().apply {
                putArray("items", itemsArray) // Key must match JS listener
            }
            sendEvent("onShareReceived", eventPayload)
        } else {
            Log.d(logTag, "No items processed from this intent or items array is empty.")
        }

        return processed // Return whether we handled it as a share action
    }

    /**
     * Creates a WritableMap representing a shared item for React Native.
     */
    private fun createItemMap(
        type: String,          // "file", "text", "url"
        mimeType: String?,     // Determined MIME type
        textContent: String? = null,
        filePath: String? = null,
        fileName: String? = null
    ): WritableMap {
        return Arguments.createMap().apply {
            putString("id", UUID.randomUUID().toString()) // Unique ID for RN list keys
            putString("type", type)
            putString("mimeType", mimeType ?: "unknown") // Provide a fallback
            when (type) {
                "file" -> {
                    putString("path", filePath?.let { "file://$it" }) // Prepend file:// scheme
                    putString("fileName", fileName ?: "shared_file") // Provide fallback filename
                }
                "text", "url" -> {
                    putString("content", textContent ?: "") // Provide fallback content
                }
            }
        }
    }

    /**
     * Copies content from a shared URI to the app's private cache directory.
     * Returns a WritableMap for the file item on success, null on failure.
     */
    private fun copyUriToAppCache(uri: Uri): WritableMap? {
        var inputStream: InputStream? = null
        var fileOutputStream: FileOutputStream? = null
        val context = applicationContext // Use application context for broader lifecycle safety
        val resolver = context.contentResolver
        val mimeType = resolver.getType(uri)
        val fileName = getFileName(uri) // Use helper to get a reasonable filename

        // Create file in app's cache directory (cleared by system when needed)
        // Alternatively use context.filesDir for more persistent storage
        val cacheDir = context.cacheDir
        if (!cacheDir.exists()) {
            cacheDir.mkdirs() // Ensure cache directory exists
        }
        // Use a unique name component to avoid collisions if original names are identical
        val uniqueFileNamePart = UUID.randomUUID().toString().substring(0, 8)
        val finalFileName = "${uniqueFileNamePart}_${fileName ?: "shared_file"}"
        val cacheFile = File(cacheDir, finalFileName)

        try {
            inputStream = resolver.openInputStream(uri)
            if (inputStream == null) {
                Log.e(logTag, "Could not open input stream for URI: $uri")
                return null
            }
            fileOutputStream = FileOutputStream(cacheFile)

            // Perform the copy
            val buffer = ByteArray(1024 * 4) // 4KB buffer
            var len: Int
            while (inputStream.read(buffer).also { len = it } > 0) {
                fileOutputStream.write(buffer, 0, len)
            }
            fileOutputStream.flush() // Ensure all data is written

            Log.d(logTag, "Successfully copied URI $uri to cache file: ${cacheFile.absolutePath}")

            // Return the WritableMap for this file item
            return createItemMap(
                type = "file",
                mimeType = mimeType, // Use resolver-provided MIME type
                filePath = cacheFile.absolutePath, // Path *without* file:// scheme yet
                fileName = fileName ?: finalFileName // Use original name if available, else the generated one
            )
        } catch (e: Exception) {
            Log.e(logTag, "Failed to copy file from URI: $uri", e)
            // Clean up partially written file if error occurred
            if (cacheFile.exists()) {
                cacheFile.delete()
            }
            return null
        } finally {
            // Ensure streams are closed
            try {
                inputStream?.close()
            } catch (e: Exception) {
                Log.e(logTag, "Error closing input stream", e)
            }
            try {
                fileOutputStream?.close()
            } catch (e: Exception) {
                Log.e(logTag, "Error closing output stream", e)
            }
        }
    }

    /**
     * Helper to get a display name for a URI, primarily for content URIs.
     */
    private fun getFileName(uri: Uri): String? {
        var result: String? = null
        if (uri.scheme == "content") {
            try {
                applicationContext.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                    if (cursor.moveToFirst()) {
                        val colIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                        if (colIndex >= 0) {
                            result = cursor.getString(colIndex)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.w(logTag,"Error querying content resolver for display name: $e")
            }
        }
        // Fallback if not a content URI or query failed
        if (result == null) {
            result = uri.path
            val cut = result?.lastIndexOf('/')
            if (cut != null && cut != -1) {
                result = result?.substring(cut + 1)
            }
        }
        // Basic sanitation - remove potentially problematic characters for filename
        return result?.replace("[^a-zA-Z0-9.\\-_]".toRegex(), "_")
    }

    /**
     * Sends an event to the React Native JavaScript environment.
     */
    private fun sendEvent(eventName: String, params: WritableMap?) {
        // Get reference to the React Native instance manager
        val instanceManager = reactNativeHost?.reactInstanceManager ?: return
        val reactContext = instanceManager.currentReactContext

        if (reactContext != null && reactContext.hasActiveReactInstance()) {
            Log.d(logTag, "Sending event '$eventName' to JS.")
            try {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, params)
            } catch (e: Exception) {
                Log.e(logTag, "Error emitting event $eventName", e)
            }
        } else {
            Log.w(logTag, "Cannot send event '$eventName', ReactContext not available or instance not active. Event may be lost if app is initializing.")
            // Potential improvement: Queue events if context is not ready yet.
        }
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
}
