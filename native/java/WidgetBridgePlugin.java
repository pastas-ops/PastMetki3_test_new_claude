package com.pastmetki.app;

import android.app.DownloadManager;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Environment;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    @PluginMethod
    public void setData(PluginCall call) {
        PmData.save(getContext(),
            call.getString("chats", "[]"),
            call.getString("notes", "[]"),
            call.getString("dls", "[]"),
            call.getString("prog", "{}"),
            call.getString("qa", "[]"));
        call.resolve();
    }

    @PluginMethod
    public void getPending(PluginCall call) {
        JSObject r = new JSObject();
        r.put("ops", PmData.takeOps(getContext()));
        call.resolve(r);
    }

    // Данные для фоновой проверки новых сообщений (раз в ~15 минут, даже когда приложение закрыто).
    @PluginMethod
    public void setSync(PluginCall call) {
        Context c = getContext();
        String uid = call.getString("uid", "");
        String rt = call.getString("rt", "");
        String key = call.getString("key", "");
        Boolean on = call.getBoolean("on", true);
        SharedPreferences sp = PmData.sp(c);
        SharedPreferences.Editor e = sp.edit();
        if (uid == null || uid.length() == 0 || rt == null || rt.length() == 0) {
            e.remove("sy_uid").remove("sy_rt").remove("sy_seen").apply();
            try { MsgJobService.cancel(c); } catch (Exception x) { }
        } else {
            String old = sp.getString("sy_uid", "");
            e.putString("sy_uid", uid).putString("sy_rt", rt).putString("sy_key", key == null ? "" : key).putBoolean("sy_on", on == null || on);
            if (!uid.equals(old)) e.remove("sy_seen");
            e.apply();
            try {
                if (on == null || on) MsgJobService.schedule(c); else MsgJobService.cancel(c);
            } catch (Exception x) { }
        }
        call.resolve();
    }

    // Загрузка файла обновления (APK) через системный менеджер загрузок; по завершении нажмите на уведомление.
    @PluginMethod
    public void download(PluginCall call) {
        try {
            String url = call.getString("url", "");
            String name = call.getString("name", "PastMetki.apk");
            if (url == null || url.length() == 0) { call.reject("нет ссылки"); return; }
            DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
            r.setTitle("PastMetki: обновление");
            r.setDescription(name);
            r.setMimeType("application/vnd.android.package-archive");
            r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            r.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name);
            DownloadManager dm = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
            dm.enqueue(r);
            call.resolve();
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    // Проверка: сколько виджетов на экране и сколько заметок передано виджетам.
    @PluginMethod
    public void diag(PluginCall call) {
        Context c = getContext();
        int n = 0;
        try { n = new JSONArray(PmData.get(c, "notes")).length(); } catch (Exception e) { }
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        Class<?>[] all = new Class<?>[] { ChatsWidget.class, NotesWidget.class, Notes2Widget.class, Notes4Widget.class, DeadlineWidget.class,
            QuickWidget.class, Quick2Widget.class, PlusWidget.class, ProgressWidget.class, TodayWidget.class,
            Quick22Widget.class, Quick33Widget.class };
        int w = 0;
        for (Class<?> k : all) w += m.getAppWidgetIds(new ComponentName(c, k)).length;
        JSObject r = new JSObject();
        r.put("notes", n);
        r.put("widgets", w);
        r.put("saved", PmData.sp(c).getLong("ts", 0));
        r.put("sync", PmData.sp(c).getString("sy_uid", "").length() > 0);
        call.resolve(r);
    }
}
