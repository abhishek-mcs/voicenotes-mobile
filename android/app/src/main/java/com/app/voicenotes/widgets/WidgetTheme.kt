package com.app.voicenotes.widgets

import android.content.Context
import android.content.res.Configuration
import android.os.Build
import android.widget.RemoteViews
import androidx.annotation.RequiresApi
import androidx.core.content.ContextCompat.getColor
import com.app.voicenotes.R

internal fun isNightModeEnabled(context: Context): Boolean {
    val currentNightMode = context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
    return when (currentNightMode) {
        Configuration.UI_MODE_NIGHT_YES -> true
        Configuration.UI_MODE_NIGHT_NO -> false
        else -> false
    }
}

@RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
internal fun getContainerColor(context: Context) =
    if (!isNightModeEnabled(context)) android.R.color.system_primary_container_light
    else android.R.color.system_primary_container_dark

@RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
internal fun getBackgroundColor(context: Context) =
    if (!isNightModeEnabled(context)) android.R.color.system_background_light
    else android.R.color.system_background_dark

@RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
internal fun setColorsForWidgets(
    views: RemoteViews,
    context: Context,
) {
    val containerColor = getContainerColor(context)
    views.setInt(
        R.id.btn_layout,
        "setBackgroundColor",
        getColor(context, containerColor)
    )
    views.setInt(
        R.id.button_search,
        "setBackgroundColor",
        getColor(context, getBackgroundColor(context))
    )
    views.setInt(
        R.id.record_btn,
        "setBackgroundColor",
        getColor(context, getBackgroundColor(context))
    )
    views.setInt(
        R.id.ask_btn,
        "setBackgroundColor",
        getColor(context, getBackgroundColor(context))
    )
}

