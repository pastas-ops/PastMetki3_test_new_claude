package com.pastmetki.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

public class QuickWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_quick);
            PmData.applyBg(c, v, id);
            v.setOnClickPendingIntent(R.id.qn, PmData.link(c, "new/note", 41));
            v.setOnClickPendingIntent(R.id.qt, PmData.link(c, "chats", 42));
            v.setOnClickPendingIntent(R.id.qc, PmData.link(c, "calendar", 43));
            m.updateAppWidget(id, v);
        }
    }
}
