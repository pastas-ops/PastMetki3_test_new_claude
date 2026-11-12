package com.pastmetki.app;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;
import org.json.JSONArray;
import org.json.JSONObject;

public class NotesService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new Factory(getApplicationContext());
    }

    static class Factory implements RemoteViewsFactory {
        final Context c;
        JSONArray a = new JSONArray();

        Factory(Context c) { this.c = c; }

        @Override public void onCreate() { onDataSetChanged(); }

        @Override public void onDataSetChanged() {
            try { a = new JSONArray(PmData.get(c, "notes")); } catch (Exception e) { a = new JSONArray(); }
        }

        @Override public void onDestroy() {}

        @Override public int getCount() { return a.length(); }

        @Override
        public RemoteViews getViewAt(int p) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_item_note);
            JSONObject o = a.optJSONObject(p);
            if (o == null) return v;
            boolean done = o.optInt("d") == 1;
            v.setTextViewText(R.id.t, o.optString("t"));
            v.setTextColor(R.id.t, done ? 0xFF777788 : 0xFFFFFFFF);
            String s = o.optString("s");
            v.setTextViewText(R.id.s, s);
            v.setViewVisibility(R.id.s, s.length() > 0 ? View.VISIBLE : View.GONE);
            v.setTextViewText(R.id.ck, done ? "✓" : "");
            v.setInt(R.id.ck, "setBackgroundResource", done ? R.drawable.pm_ck_on : R.drawable.pm_ck_off);
            int col = 0xFFFFC400;
            try { col = Color.parseColor(o.optString("c", "#FFC400")); } catch (Exception e) { }
            v.setInt(R.id.bar, "setBackgroundColor", done ? 0x55FFFFFF : col);
            long id = o.optLong("i");
            Intent open = new Intent();
            open.setData(Uri.parse("pastmetki://note/" + id));
            v.setOnClickFillInIntent(R.id.body, open);
            Intent tg = new Intent();
            tg.setData(Uri.parse("pastmetki://toggle/" + id));
            v.setOnClickFillInIntent(R.id.ckw, tg);
            return v;
        }

        @Override public RemoteViews getLoadingView() { return null; }
        @Override public int getViewTypeCount() { return 1; }
        @Override public long getItemId(int p) { return p; }
        @Override public boolean hasStableIds() { return false; }
    }
}
