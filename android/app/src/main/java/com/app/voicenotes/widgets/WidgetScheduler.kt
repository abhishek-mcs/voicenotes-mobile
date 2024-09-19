package com.app.voicenotes.widgets

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.annotation.RequiresApi
import java.time.ZonedDateTime
import kotlin.time.Duration.Companion.minutes
import kotlin.time.toJavaDuration

class WidgetScheduler {

    private val Context.alarmManager: AlarmManager
        get() = getSystemService(Context.ALARM_SERVICE) as AlarmManager

    private val interval = 1.minutes

    @RequiresApi(Build.VERSION_CODES.O)
    fun scheduleUpdates(
        context: Context,
        appWidgetIds: IntArray = intArrayOf(),
        widgetClass: Class<*> = VoiceNotesWidget::class.java
    ) {
        if (appWidgetIds.isNotEmpty()) {
            val nextUpdate = ZonedDateTime.now() + interval.toJavaDuration()
            val pendingIntent = getUpdatePendingIntent(context, appWidgetIds, widgetClass)

            context.alarmManager.set(
                AlarmManager.RTC_WAKEUP,
                nextUpdate.toInstant()
                    .toEpochMilli(),
                pendingIntent
            )
        }
    }

    private fun getUpdatePendingIntent(
        context: Context,
        appWidgetsIds: IntArray,
        widgetClass: Class<*>
    ): PendingIntent {
        val updateIntent = Intent(context, widgetClass).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetsIds)
        }

        val requestCode = widgetClass.name.hashCode()
        val flags = PendingIntent.FLAG_CANCEL_CURRENT or PendingIntent.FLAG_IMMUTABLE

        return PendingIntent.getBroadcast(context, requestCode, updateIntent, flags)
    }
}




