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

public class DeadlinesService extends RemoteViewsService {
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
            try { a = new JSONArray(PmData.get(c, "dls")); } catch (Exception e) { a = new JSONArray(); }
        }

        @Override public void onDestroy() {}

        @Override public int getCount() { return a.length(); }

        @Override
        public RemoteViews getViewAt(int p) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_item_dl);
            JSONObject o = a.optJSONObject(p);
            if (o == null) return v;
            v.setTextViewText(R.id.t, o.optString("t"));
            v.setTextViewText(R.id.d, o.optString("d"));
            String k = o.optString("c");
            int col = "r".equals(k) ? Color.parseColor("#FF5252") : "y".equals(k) ? Color.parseColor("#FFC400") : Color.parseColor("#3DDC84");
            v.setInt(R.id.dot, "setColorFilter", col);
            v.setTextColor(R.id.d, col);
            Intent f = new Intent();
            f.setData(Uri.parse("pastmetki://note/" + o.optLong("i")));
            v.setOnClickFillInIntent(R.id.row, f);
            return v;
        }

        @Override public RemoteViews getLoadingView() { return null; }
        @Override public int getViewTypeCount() { return 1; }
        @Override public long getItemId(int p) { return p; }
        @Override public boolean hasStableIds() { return false; }
    }
}
