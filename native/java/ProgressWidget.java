package com.pastmetki.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONObject;

// 2x1: процент выполненных задач за сегодня
public class ProgressWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        JSONObject o = PmData.prog(c);
        int p = o.optInt("p", 0), d = o.optInt("d", 0), n = o.optInt("n", 0);
        for (int id : ids) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_progress);
            PmData.applyBg(c, v, id);
            v.setTextViewText(R.id.pct, p + "%");
            v.setTextViewText(R.id.ps, n > 0 ? d + " из " + n + " выполнено" : "На сегодня задач нет");
            boolean full = n > 0 && p >= 100;
            v.setProgressBar(R.id.pb, 100, p, false);
            v.setViewVisibility(R.id.pb, full ? View.GONE : View.VISIBLE);
            v.setViewVisibility(R.id.pbg, full ? View.VISIBLE : View.GONE);
            v.setViewVisibility(R.id.chk, full ? View.VISIBLE : View.GONE);
            v.setTextColor(R.id.pct, full ? 0xFF35D07F : 0xFFFFC400);
            v.setOnClickPendingIntent(R.id.root, PmData.link(c, "home", 60));
            m.updateAppWidget(id, v);
        }
    }
}
