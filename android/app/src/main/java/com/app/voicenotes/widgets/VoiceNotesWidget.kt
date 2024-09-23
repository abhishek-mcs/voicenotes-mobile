package com.app.voicenotes.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.util.SizeF
import android.widget.RemoteViews
import androidx.annotation.RequiresApi
import com.app.voicenotes.R

class VoiceNotesWidget : AppWidgetProvider() {

    private val widgetScheduler = WidgetScheduler()

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
        widgetScheduler.scheduleUpdates(context, appWidgetIds, this.javaClass)
    }

    @RequiresApi(Build.VERSION_CODES.S)
    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: Bundle?
    ) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions)
        val sizes = newOptions?.getParcelableArrayList<SizeF>(AppWidgetManager.OPTION_APPWIDGET_SIZES)
        if (sizes.isNullOrEmpty()) return

        val remoteViews = RemoteViews(sizes.associateWith { size ->
            createRemoteViews(context, size)
        })
        appWidgetManager.updateAppWidget(appWidgetId, remoteViews)
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.voice_notes_widget)

        setupWidgetButtons(context, views)
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun createRemoteViews(context: Context, size: SizeF): RemoteViews {
        val layoutId = when {
            size.width >= 350f && size.height >= 210f -> R.layout.voice_notes_widget
            size.width >= 280f && size.height >= 210f -> R.layout.voice_notes_widget_medium
            size.width >= 206f && size.height >= 210f -> R.layout.voice_notes_widget_small
            size.width >= 133f && size.height >= 94f -> R.layout.voice_notes_widget_extra_small
            else -> R.layout.voice_notes_widget
        }
        val views = RemoteViews(context.packageName, layoutId)
        setupWidgetButtons(context, views)
        return views
    }

    private fun setupWidgetButtons(context: Context, views: RemoteViews) {
        setupRecordButton(context, views)
        setupAskAiButton(context, views)
        setupSearchButton(context, views)
    }
}