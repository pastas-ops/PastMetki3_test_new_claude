package com.pastmetki.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;

// Сетка быстрых действий 2x2 / 3x3: показывает ваши быстрые действия с главной (и чаты, если вы их добавили).
public abstract class QuickGridWidget extends AppWidgetProvider {
    static final int[] IDS = { R.id.q1, R.id.q2, R.id.q3, R.id.q4, R.id.q5, R.id.q6, R.id.q7, R.id.q8, R.id.q9 };
    static final int[] BG = { R.drawable.pm_btn_y, R.drawable.pm_btn_b, R.drawable.pm_btn_p, R.drawable.pm_btn_g };
    static final String[][] DEF = {
        { "＋ Заметка", "new/note" }, { "📅 Календарь", "calendar" }, { "💬 Чаты", "chats" },
        { "🔍 Поиск", "search" }, { "⚙ Настройки", "settings" }, { "👥 Группа", "group" } };

    abstract int layout();
    abstract int count();
    abstract int rc();

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        JSONArray qa = PmData.qa(c);
        for (int id : ids) {
            RemoteViews v = new RemoteViews(c.getPackageName(), layout());
            PmData.applyBg(c, v, id);
            for (int i = 0; i < count(); i++) {
                String l = null, u = null;
                if (qa.length() > 0) {
                    JSONObject o = qa.optJSONObject(i);
                    if (o != null) { l = o.optString("l"); u = o.optString("u"); }
                } else if (i < DEF.length) {
                    l = DEF[i][0];
                    u = DEF[i][1];
                }
                if (l == null || u == null || u.length() == 0) {
                    v.setViewVisibility(IDS[i], View.INVISIBLE);
                    continue;
                }
                v.setViewVisibility(IDS[i], View.VISIBLE);
                v.setTextViewText(IDS[i], l);
                v.setInt(IDS[i], "setBackgroundResource", BG[i % 4]);
                v.setTextColor(IDS[i], i % 4 == 0 ? 0xFF000000 : 0xFFFFFFFF);
                v.setOnClickPendingIntent(IDS[i], PmData.link(c, u, rc() + i));
            }
            m.updateAppWidget(id, v);
        }
    }
}
