package com.pastmetki.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

// 1x1: плюсик, сразу открывает создание заметки
public class PlusWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_plus);
            PmData.applyBg(c, v, id);
            v.setOnClickPendingIntent(R.id.root, PmData.link(c, "new/note", 50));
            m.updateAppWidget(id, v);
        }
    }
}
