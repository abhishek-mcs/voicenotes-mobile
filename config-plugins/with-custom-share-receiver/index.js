const {
    withAndroidManifest,
    withMainApplication,
    withMainActivity,
    withDangerousMod,
    withEntitlementsPlist,
    WarningAggregator, // For logging warnings
    createRunOncePlugin, // Ensures plugin logic runs once
} = require('@expo/config-plugins');

// For file system operations (copying files)
const fs = require('fs');
const path = require('path');
const plist = require('@expo/plist');


// --- Plugin Configuration Constants ---
// !! IMPORTANT: Update these values !!
const SHARE_EXTENSION_FOLDER_NAME = 'VoicenotesShareExtension'; // Folder name in ios/ for extension files
const MAIN_APP_URL_SCHEME = 'voicenotes'; // Your main app's URL scheme
const APP_GROUP_ID = 'group.app.voicenotes';


// ----------------------------
// ------ iOS Functions -------
// ----------------------------
// Copies files using withDangerousMod context
function copyIosSourceFiles(projectRoot, projectName, pluginSourceDir) {
    const iosSourceDir = path.join(pluginSourceDir, 'ios');
    const iosProjectDir = path.join(projectRoot, 'ios');

    const mainAppTargetDir = path.join(iosProjectDir, projectName); // e.g., ios/YourAppName
    const extensionTargetDir = path.join(iosProjectDir, SHARE_EXTENSION_FOLDER_NAME); // e.g., ios/VoicenotesShareExtension

    // Ensure target directories exist
    // Main app dir should exist from prebuild
    if (!fs.existsSync(mainAppTargetDir)) {
        WarningAggregator.addWarningIOS('with-custom-share-receiver', `iOS main app source directory "${mainAppTargetDir}" not found. Cannot copy main app native files.`);
    } else {
        copyFiles(iosSourceDir, mainAppTargetDir, ['ShareReceiverModule.swift', 'ShareReceiverBridge.m', 'ShareReceiverApp-Bridging-Header.h']);
    }

    // Extension dir should exist from manual setup
    if (!fs.existsSync(extensionTargetDir)) {
        // If it doesn't exist, the manual step was missed or folder name constant is wrong.
        WarningAggregator.addWarningIOS('with-custom-share-receiver', `Directory "${extensionTargetDir}" not found. Cannot copy extension files. Ensure manual Xcode setup was done and SHARE_EXTENSION_FOLDER_NAME constant is correct.`);
    } else {
        copyFiles(iosSourceDir, extensionTargetDir, ['ShareViewController.swift']);
    }
}

// Adds App Group Entitlements for the main app
const withAppEntitlements = (config) => {
    return withEntitlementsPlist(config, (modConfig) => {
        const key = 'com.apple.security.application-groups';
        if (!Array.isArray(modConfig.modResults[key])) modConfig.modResults[key] = [];
        if (!modConfig.modResults[key].includes(APP_GROUP_ID)) {
            modConfig.modResults[key].push(APP_GROUP_ID);
            console.log(`[with-custom-share-receiver] Added App Group "${APP_GROUP_ID}" to main app entitlements.`);
        }
        return modConfig;
    });
};

/**
 * Modifies the Extension's Info.plist and Entitlements files on disk.
 * Runs within withDangerousMod *after* files are potentially created/copied.
 * VERSION 2: Only adds LSApplicationQueriesSchemes and removes Apple Sign In entitlement.
 * @param {string} platformProjectRoot - Path to the ios/ directory.
 */
function modifyExtensionFiles(platformProjectRoot) {
    // Construct paths using constants defined elsewhere in your plugin
    const extensionTargetDir = path.join(platformProjectRoot, SHARE_EXTENSION_FOLDER_NAME);
    const plistFilePath = path.join(extensionTargetDir, 'Info.plist');
    const pluginName = 'with-custom-share-receiver'; // Or your plugin name constant

    // --- Configure Extension Info.plist File ---
    try {
        // Check if file exists before trying to read/modify
        if (fs.existsSync(plistFilePath)) {
            let extensionPlist = plist.parse(fs.readFileSync(plistFilePath, 'utf8'));
            let plistChanged = false;

            // --- Add LSApplicationQueriesSchemes ---
            const queriesKey = 'LSApplicationQueriesSchemes';
            // Ensure the key exists as an array, create if not
            if (!Array.isArray(extensionPlist[queriesKey])) {
                extensionPlist[queriesKey] = [];
            }

            // Add the main app's URL scheme if it's not already present
            if (!extensionPlist[queriesKey].includes(MAIN_APP_URL_SCHEME)) {
                extensionPlist[queriesKey].push(MAIN_APP_URL_SCHEME);
                console.log(`[${pluginName}] Added LSApplicationQueriesSchemes "${MAIN_APP_URL_SCHEME}" to extension Info.plist.`);
                plistChanged = true; // Mark that a change was made
            } else {
                console.log(`[${pluginName}] LSApplicationQueriesSchemes "${MAIN_APP_URL_SCHEME}" already in extension Info.plist.`);
            }

            // Write file back ONLY if changes were actually made
            if(plistChanged) {
                fs.writeFileSync(plistFilePath, plist.build(extensionPlist));
                console.log(`[${pluginName}] Wrote updated Info.plist file: ${plistFilePath}`);
            }
        } else {
            // Log warning if file doesn't exist - essential for this approach
            WarningAggregator.addWarningIOS(pluginName, `Extension Info.plist not found at "${plistFilePath}". Cannot add LSApplicationQueriesSchemes. Ensure manual Xcode setup created this file and constants (SHARE_EXTENSION_FOLDER_NAME) are correct.`);
        }
    } catch (e) {
        // Log errors during file processing
        WarningAggregator.addWarningIOS(pluginName, `Error modifying extension Info.plist file at "${plistFilePath}": ${e.message}`);
    }
}

// ----------------------------
// ------ Android Functions ---
// ----------------------------

/**
 * Modifies the AndroidManifest.xml.
 * @param {object} config Expo config object.
 * @returns {object} Modified Expo config object.
 */
const withReceiverAndroidManifest = (config) => {
    return withAndroidManifest(config, async (modConfig) => {
        const mainApplication = modConfig.modResults.manifest.application[0];
        const mainActivity = mainApplication.activity?.find(
            (act) => act.$['android:name'] === '.MainActivity' // Adjust if your activity name differs
        );

        if (!mainActivity) {
            WarningAggregator.addWarningAndroid(
                'with-custom-share-receiver',
                'Could not find MainActivity element in AndroidManifest.xml.'
            );
            return modConfig;
        }

        // 1. Ensure launchMode is set
        mainActivity.$['android:launchMode'] = 'singleTask'; // Or singleTop

        // 2. Add Intent Filters (if they don't already exist - basic check)
        const intentFilters = mainActivity['intent-filter'] || [];
        const hasSendFilter = intentFilters.some(f => f.action?.some(a => a.$['android:name'] === 'android.intent.action.SEND'));
        const hasSendMultipleFilter = intentFilters.some(f => f.action?.some(a => a.$['android:name'] === 'android.intent.action.SEND_MULTIPLE'));

        if (!hasSendFilter) {
            intentFilters.push({
                action: [{$: {'android:name': 'android.intent.action.SEND'}}],
                category: [{$: {'android:name': 'android.intent.category.DEFAULT'}}],
                data: [ // Add all your supported MIME types here
                    {$: {'android:mimeType': 'text/plain'}},
                    {$: {'android:mimeType': 'image/*'}},
                    {$: {'android:mimeType': 'audio/*'}},
                    {$: {'android:mimeType': 'video/*'}},
                    {$: {'android:mimeType': 'application/pdf'}},
                    {$: {'android:mimeType': '*/*'}}, // Fallback
                ],
            });
            console.log('Added SEND intent filter to AndroidManifest.xml');
        }

        if (!hasSendMultipleFilter) {
            intentFilters.push({
                action: [{$: {'android:name': 'android.intent.action.SEND_MULTIPLE'}}],
                category: [{$: {'android:name': 'android.intent.category.DEFAULT'}}],
                data: [ // Add supported MIME types for multiple items
                    {$: {'android:mimeType': 'image/*'}},
                    {$: {'android:mimeType': 'audio/*'}},
                    {$: {'android:mimeType': 'video/*'}},
                    {$: {'android:mimeType': 'application/pdf'}},
                    {$: {'android:mimeType': '*/*'}}, // Fallback for files
                ],
            });
            console.log('Added SEND_MULTIPLE intent filter to AndroidManifest.xml');
        }

        mainActivity['intent-filter'] = intentFilters;

        return modConfig;
    });
};

/**
 * Modifies MainApplication.kt/java to register the custom package.
 * @param {object} config Expo config object.
 * @param {object} options Expo config object.
 * @returns {object} Modified Expo config object.
 */
const withReceiverMainApplication = (config, options = {}) => {
    const packageName = options.package; // Get package name from options passed down
    const pluginName = 'with-custom-share-receiver'; // For warnings

    if (!packageName) {
        WarningAggregator.addWarningAndroid(
            pluginName,
            'Cannot modify MainApplication - Android package name was not passed in options.'
        );
        return config; // Return unmodified config if package name is missing
    }

    return withMainApplication(config, async (modConfig) => {
        let mainApplication = modConfig.modResults.contents;

        // Define the lines to add
        const importLine = `import ${packageName}.ShareReceiverPackage`;
        // Make the instantiation check slightly more robust against whitespace variations
        const packageInstantiationCheck = /packages\.add\(\s*ShareReceiverPackage\(\s*\)\s*\)/;
        // Ensure consistent indentation (assuming 2 spaces common in Expo templates)
        const packageInstantiation = `      packages.add(ShareReceiverPackage())`; // Added indentation

        // --- 1. Add Import ---
        if (!mainApplication.includes(importLine)) {
            // (Keep the existing import logic - it worked)
            const importAnchor = /^(import .*;)/m;
            const lastImportMatch = mainApplication.match(new RegExp(`^${importAnchor.source}`, 'gm'));
            if (lastImportMatch) {
                const lastImportLine = lastImportMatch[lastImportMatch.length - 1];
                mainApplication = mainApplication.replace(lastImportLine, `${lastImportLine}\n${importLine}`);
                console.log(`[with-custom-share-receiver] Added ShareReceiverPackage import to MainApplication`);
            } else {
                const packageAnchor = /^package .*/m;
                if (packageAnchor.test(mainApplication)) {
                    mainApplication = mainApplication.replace(packageAnchor, `$&\n\n${importLine}`);
                    console.log(`[with-custom-share-receiver] Added ShareReceiverPackage import (after package) to MainApplication`);
                } else {
                    mainApplication = `${importLine}\n\n${mainApplication}`;
                    console.log(`[with-custom-share-receiver] Added ShareReceiverPackage import (at beginning) to MainApplication`);
                }
            }
        } else {
            console.log(`[with-custom-share-receiver] ShareReceiverPackage import seems to exist in MainApplication, skipping addition.`);
        }

        // --- 2. Add Package Instantiation ---
        if (!packageInstantiationCheck.test(mainApplication)) {
            // *** UPDATED ANCHOR: Look for 'return packages' line ***
            const returnPackagesAnchor = /(\s*return packages\s*)/m; // Match 'return packages' line

            if (returnPackagesAnchor.test(mainApplication)) {
                // Insert the new package line *before* the 'return packages' line
                mainApplication = mainApplication.replace(
                    returnPackagesAnchor,
                    `\n${packageInstantiation}\n$1` // Add line before the matched group
                );
                console.log(`[with-custom-share-receiver] Added ShareReceiverPackage instantiation to MainApplication (before return).`);
            } else {
                // Fallback warning if the new anchor isn't found either
                WarningAggregator.addWarningAndroid(pluginName, 'Could not find "return packages" anchor in MainApplication.kt to add package instantiation.');
            }
        } else {
            console.log(`[with-custom-share-receiver] ShareReceiverPackage instantiation seems to exist in MainApplication, skipping addition.`);
        }

        // Update contents
        modConfig.modResults.contents = mainApplication;
        return modConfig;
    });
};


// Function to generate the Kotlin code strings needed for injection
function getKotlinSnippets() {
    return {
        imports: `
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
`,
        classMembers: `
    // --- Share Receiver Members Start ---
    private val logTag = "MainActivityShare"
    private var initialIntentHandled = false
    // --- Share Receiver Members End ---
    
    // --- Companion Object for Static Pending Data ---
    companion object {
        @Volatile // Static variable to hold event data if JS isn't ready
        var pendingShareEventData: WritableMap? = null
    }
    // ---------------------------------------------
`,
        onCreateContent: `
        // --- Share Intent Handling in onCreate Start ---
        // Check if launched via an intent ONLY if not already handled and not restoring state
        if (!initialIntentHandled && savedInstanceState == null) {
            intent?.let {
                Log.d(logTag, "onCreate: Checking initial intent: \${it.action}")
                // Process intent and mark handled only if it was a share action
                if (handleIntent(it)) { // handleIntent returns true if processed
                    initialIntentHandled = true
                }
            }
        }
        // --- Share Intent Handling in onCreate End ---
`,
        onNewIntentMethod: `
    // --- Share Receiver onNewIntent Start ---
    // Handle intents received while the activity is already running
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        Log.d(logTag, "onNewIntent: Received intent: \${intent?.action}")
        intent?.let {
            handleIntent(it) // Process the new intent
        }
    }
    // --- Share Receiver onNewIntent End ---
`,
        handleIntentMethod: `
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
                    Log.d(logTag, "SEND_MULTIPLE: Found \${uris.size} URIs.")
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
            Log.d(logTag, "Processed \${itemsArray.size()} items from intent. Emitting event 'onShareReceived'.")
            val eventPayload = Arguments.createMap().apply { putArray("items", itemsArray) }
            // *** Store directly in static variable ***
            pendingShareEventData = eventPayload
            sendEvent("onShareReceived", eventPayload)
        } else if (processed) {
             Log.d(logTag, "Intent processed but resulted in zero items.")
             // Clear any old pending data if current share is empty
             pendingShareEventData = null
        } else {
             Log.d(logTag, "Intent not processed as a relevant share action.")
        }
        return processed
    }
    // --- Share Receiver handleIntent End ---
`,
        createItemMapMethod: `
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
`,
        copyUriToAppCacheMethod: `
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
         val finalFileName = "\${uniqueFileNamePart}_\${sanitizedBaseName}"
        val cacheFile = File(cacheDir, finalFileName)

        try {
            inputStream = resolver.openInputStream(uri) ?: throw Exception("Could not open input stream for URI")
            fileOutputStream = FileOutputStream(cacheFile)
            inputStream.copyTo(fileOutputStream)
            fileOutputStream.flush()
            Log.d(logTag, "Copied URI $uri to cache: \${cacheFile.absolutePath}")
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
`,
        getFileNameMethod: `
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
`,
        sendEventMethod: `
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
`
    };
}

/**
 * Modify MainActivity.kt for share intent handling.
 * @param {object} config Expo config object.
 * @returns {object} Modified Expo config object.
 */
const withReceiverMainActivity = (config) => {
    return withMainActivity(config, (modConfig) => {
        const packageName = config.android?.package;
        if (!packageName) {
            WarningAggregator.addWarningAndroid(
                'with-custom-share-receiver',
                'Cannot modify MainActivity - Android package name is not defined.'
            );
            return modConfig;
        }

        let mainActivity = modConfig.modResults.contents;
        const snippets = getKotlinSnippets();
        const pluginName = 'with-custom-share-receiver'; // For warnings

        // --- 1. Add Imports ---
        const importCheck = "import android.content.Intent"; // Check for a specific import
        if (!mainActivity.includes(importCheck)) {
            const importAnchor = /^(package .*|import .*)/m; // Find package or first import
            if (importAnchor.test(mainActivity)) {
                mainActivity = mainActivity.replace(importAnchor, `$1\n${snippets.imports}`);
                console.log(`[with-custom-share-receiver] Added required imports to MainActivity.kt`);
            } else {
                // Fallback: Add at the very beginning
                mainActivity = snippets.imports + "\n" + mainActivity;
                console.log(`[with-custom-share-receiver] Added required imports to beginning of MainActivity.kt`);
            }
        } else {
            console.log(`[with-custom-share-receiver] Imports seem to exist in MainActivity.kt, skipping addition.`);
        }

        // --- 2. Add Class Members ---
        const memberCheck = "private var initialIntentHandled = false";
        if (!mainActivity.includes(memberCheck)) {
            const classBodyAnchor = /class MainActivity\s*:\s*ReactActivity\(\)\s*\{/;
            if (classBodyAnchor.test(mainActivity)) {
                mainActivity = mainActivity.replace(classBodyAnchor, `$&\n${snippets.classMembers}`);
                console.log(`[with-custom-share-receiver] Added class members to MainActivity.kt`);
            } else {
                WarningAggregator.addWarningAndroid(pluginName, 'Could not find class definition anchor in MainActivity.kt to add members.');
            }
        } else {
            console.log(`[with-custom-share-receiver] Class members seem to exist in MainActivity.kt, skipping addition.`);
        }

        // --- 3. Modify onCreate ---
        const onCreateCheck = "if (handleIntent(it))"; // Check for specific line from our code
        if (!mainActivity.includes(onCreateCheck)) {
            const onCreateAnchor = /super\.onCreate\(.*\)/; // Find super.onCreate call
            if (onCreateAnchor.test(mainActivity)) {
                mainActivity = mainActivity.replace(onCreateAnchor, `$&\n${snippets.onCreateContent}`);
                console.log(`[with-custom-share-receiver] Added intent handling logic to onCreate in MainActivity.kt`);
            } else {
                WarningAggregator.addWarningAndroid(pluginName, 'Could not find super.onCreate() anchor in MainActivity.kt to modify.');
            }
        } else {
            console.log(`[with-custom-share-receiver] onCreate modification seems to exist in MainActivity.kt, skipping addition.`);
        }

        // --- 4. Add onNewIntent (if not present) ---
        const onNewIntentCheck = "override fun onNewIntent(intent: Intent?)";
        if (!mainActivity.includes(onNewIntentCheck)) {
            const lastBraceAnchor = /}\s*$/; // Anchor for the class's closing brace
            if (lastBraceAnchor.test(mainActivity)) {
                mainActivity = mainActivity.replace(lastBraceAnchor, `\n${snippets.onNewIntentMethod}\n}\n`);
                console.log(`[with-custom-share-receiver] Added onNewIntent method to MainActivity.kt`);
            } else {
                WarningAggregator.addWarningAndroid(pluginName, 'Could not find closing brace in MainActivity.kt to add onNewIntent.');
            }
        } else {
            console.log(`[with-custom-share-receiver] onNewIntent method seems to exist in MainActivity.kt, skipping addition.`);
        }

        // --- 5. Add Helper Methods (if not present) ---
        const helperMethodCheck = "private fun handleIntent(intent: Intent): Boolean"; // Check for one of the methods
        if (!mainActivity.includes(helperMethodCheck)) {
            const lastBraceAnchor = /}\s*$/; // Anchor for the class's closing brace
            const methodsToAdd = [ // Combine all helper methods
                snippets.handleIntentMethod,
                snippets.createItemMapMethod,
                snippets.copyUriToAppCacheMethod,
                snippets.getFileNameMethod,
                snippets.sendEventMethod
            ].join("\n\n"); // Add blank line between methods

            if (lastBraceAnchor.test(mainActivity)) {
                mainActivity = mainActivity.replace(lastBraceAnchor, `\n${methodsToAdd}\n}\n`);
                console.log(`[with-custom-share-receiver] Added helper methods (handleIntent, createItemMap, etc.) to MainActivity.kt`);
            } else {
                WarningAggregator.addWarningAndroid(pluginName, 'Could not find closing brace in MainActivity.kt to add helper methods.');
            }
        } else {
            console.log(`[with-custom-share-receiver] Helper methods seem to exist in MainActivity.kt, skipping addition.`);
        }

        // Update the file contents
        modConfig.modResults.contents = mainActivity;
        return modConfig;
    });
};

/**
 * Copies source files from the plugin's directories to the android project directories.
 * @param {string} projectRoot The root directory of the Expo project.
 * @param {object} options Plugin options (e.g., iosSourceDir, androidSourceDir).
 */
function copyAndroidSourceFiles(projectRoot, options = {}) {
    const androidSourceDir = options.androidSourceDir || path.join(__dirname, 'android');
    const androidProjectDir = path.join(projectRoot, 'android');
    const packagePath = options.package?.replace(/\./g, '/') || `com/${options.appName?.toLowerCase()}`; // Determine package path
    const javaPath = path.join(androidProjectDir, `app/src/main/java/${packagePath}`);

    if (fs.existsSync(javaPath)) {
        copyFiles(androidSourceDir, javaPath, ['ShareReceiverModule.kt', 'ShareReceiverPackage.kt']);
    } else {
        WarningAggregator.addWarningAndroid(
            'with-custom-share-receiver',
            `Android source directory "${javaPath}" not found. Skipping Android file copy.`
        );
    }
}

// ----------------------------
// ------- Common Functions ---
// ----------------------------

// Helper function to copy specific files
function copyFiles(sourceDir, targetDir, files) {
    files.forEach(file => {
        const srcPath = path.join(sourceDir, file);
        const destPath = path.join(targetDir, file);
        if (fs.existsSync(srcPath)) {
            // Ensure target directory exists (might be needed for ShareExtension subfolder)
            fs.mkdirSync(path.dirname(destPath), {recursive: true});
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied ${file} to ${destPath}`);
        } else {
            console.warn(`Source file not found, skipping copy: ${srcPath}`);
        }
    });
}

// Helper to get project name (used for default iOS target dir)
function getProjectName(projectRoot) {
    const appJsonPath = path.join(projectRoot, 'app.json');
    const appConfigPath = path.join(projectRoot, 'app.config.js');
    let appName = 'Voicenotes'; // Default fallback

    try {
        if (fs.existsSync(appJsonPath)) {
            const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
            appName = appJson.expo?.name || appJson.name || appName;
        } else if (fs.existsSync(appConfigPath)) {
            // Note: Reading app.config.js dynamically is complex, use a safe fallback.
            // Consider passing appName via plugin options if using app.config.js extensively.
            console.warn("Using app.config.js - relying on default app name or plugin options for directory structure.");
        }
    } catch (e) {
        console.error("Error reading app name:", e);
    }
    return appName.replace(/[^a-zA-Z0-9]/g, ''); // Sanitize name for directory usage
}

/**
 * Main plugin function.
 * @param {object} config Expo config object.
 * @param {object} props Plugin properties (optional).
 * @returns {object} Modified Expo config object.
 */
const withCustomShareReceiver = (config, props = {}) => {

    // Use props or derive from config for file copying paths
    const options = {
        appName: config.name,
        package: config.android?.package,
        iosSourceDir: props.iosSourceDir, // Allow overriding source paths
        androidSourceDir: props.androidSourceDir,
    };

    // --- Apply iOS Mods ---
    config = withAppEntitlements(config);

    // --- Apply Android Mods ---
    config = withReceiverAndroidManifest(config);
    config = withReceiverMainApplication(config, options);
    config = withReceiverMainActivity(config);

    // --- File Copying (Run last or within a mod that ensures native project exists) ---
    // Using withPlugins ensures this runs after base project generation.
    // Wrap file copying in a simple mod function.
    config = withDangerousMod(config, [
        'android', // Platform to run on
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            console.log(`[withDangerousMod][android] Running file copy for project root: ${projectRoot}`);
            // Pass necessary options derived from config
            copyAndroidSourceFiles(projectRoot, { ...options, appName: getProjectName(projectRoot) }); // Ensure latest appName
            return config;
        },
    ]);

    config = withDangerousMod(config, [
        'ios',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const platformProjectRoot = config.modRequest.platformProjectRoot; // Path to ios/ dir

            console.log(`[withDangerousMod][ios] Running file copy and plist/entitlements modification...`);

            // Copy your custom source files (overwriting templates)
            copyIosSourceFiles(projectRoot, getProjectName(projectRoot), __dirname);

            // Modify the extension's Info.plist and .entitlements files on disk
            modifyExtensionFiles(platformProjectRoot);

            return config;
        },
    ]);

    return config;
};

// Use createRunOncePlugin to prevent the plugin from running multiple times
// if it's included in multiple places (e.g., app.config.js and a dependency)
const pkg = require('./package.json');
module.exports = createRunOncePlugin(withCustomShareReceiver, pkg.name, pkg.version);
