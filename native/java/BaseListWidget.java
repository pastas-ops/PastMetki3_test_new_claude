package com.pastmetki.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;

// Общая основа для списочных виджетов (чаты, заметки 2x2/3x3/4x4, дедлайны).
public abstract class BaseListWidget extends AppWidgetProvider {
    abstract String title();
    abstract Class<?> service();
    abstract int rc();
    abstract String addPath();
    Class<?> tplClass() { return MainActivity.class; }

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_list);
            PmData.applyBg(c, v, id);
            v.setTextViewText(R.id.title, title());
            Intent s = new Intent(c, service());
            s.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id);
            s.setData(Uri.parse(s.toUri(Intent.URI_INTENT_SCHEME)));
            v.setRemoteAdapter(R.id.list, s);
            v.setEmptyView(R.id.list, R.id.empty);
            v.setPendingIntentTemplate(R.id.list, PmData.template(c, rc(), tplClass()));
            v.setOnClickPendingIntent(R.id.title, PmData.link(c, "home", rc() + 100));
            v.setOnClickPendingIntent(R.id.cfg, PmData.cfg(c, id));
            if (addPath() == null) {
                v.setViewVisibility(R.id.add, View.GONE);
            } else {
                v.setOnClickPendingIntent(R.id.add, PmData.link(c, addPath(), rc() + 200));
            }
            m.updateAppWidget(id, v);
        }
    }
}
