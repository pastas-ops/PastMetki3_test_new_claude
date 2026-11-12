package com.pastmetki.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

// 2x1: быстрые действия (заметка и календарь)
public class Quick2Widget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_quick2);
            PmData.applyBg(c, v, id);
            v.setOnClickPendingIntent(R.id.qn, PmData.link(c, "new/note", 44));
            v.setOnClickPendingIntent(R.id.qt, PmData.link(c, "calendar", 45));
            m.updateAppWidget(id, v);
        }
    }
}
