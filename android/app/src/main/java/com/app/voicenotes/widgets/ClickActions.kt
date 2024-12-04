package com.app.voicenotes.widgets

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.widget.RemoteViews
import com.app.voicenotes.MainActivity
import com.app.voicenotes.R
import com.facebook.react.ReactApplication
import com.facebook.react.modules.core.DeviceEventManagerModule

internal fun setupRecordButton(context: Context, views: RemoteViews) {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("voicenotes://record"))
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    val pendingIntent = PendingIntent.getActivity(
        context,
        0,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
    views.setOnClickPendingIntent(R.id.record_btn, pendingIntent)

}

internal fun setupAskAiButton(context: Context, views: RemoteViews) {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("voicenotes://ask"))
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    val pendingIntent = PendingIntent.getActivity(
        context,
        0,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
    views.setOnClickPendingIntent(R.id.ask_btn, pendingIntent)
}


internal fun setupSearchButton(context: Context, views: RemoteViews) {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("voicenotes://searchDeeplink"))
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    val pendingIntent = PendingIntent.getActivity(
        context,
        0,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
    views.setOnClickPendingIntent(R.id.button_search, pendingIntent)
}

internal fun triggerReactNativeEvent(context: Context, eventName: String) {
    Log.d("Widget", "Triggering event: $eventName")

    val reactApplication = context.applicationContext as ReactApplication
    val reactInstanceManager = reactApplication.reactNativeHost.reactInstanceManager
    val reactContext = reactInstanceManager.currentReactContext

    reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        ?.emit(eventName, null)

    context.startActivity(launchMainActivityIntent(context))
}

private fun launchMainActivityIntent(context: Context): Intent {
    return Intent(context, MainActivity::class.java).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
}
