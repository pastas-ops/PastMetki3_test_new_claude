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

public class ChatsService extends RemoteViewsService {
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
            try { a = new JSONArray(PmData.get(c, "chats")); } catch (Exception e) { a = new JSONArray(); }
        }

        @Override public void onDestroy() {}

        @Override public int getCount() { return a.length(); }

        @Override
        public RemoteViews getViewAt(int p) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_item_chat);
            JSONObject o = a.optJSONObject(p);
            if (o == null) return v;
            v.setTextViewText(R.id.name, o.optString("n"));
            v.setViewVisibility(R.id.nw, o.optBoolean("w") ? View.VISIBLE : View.GONE);
            Intent f = new Intent();
            f.setData(Uri.parse("pastmetki://chat/" + o.optString("u")));
            v.setOnClickFillInIntent(R.id.row, f);
            return v;
        }

        @Override public RemoteViews getLoadingView() { return null; }
        @Override public int getViewTypeCount() { return 1; }
        @Override public long getItemId(int p) { return p; }
        @Override public boolean hasStableIds() { return false; }
    }
}
