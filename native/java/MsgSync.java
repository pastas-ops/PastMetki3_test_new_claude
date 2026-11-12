package com.pastmetki.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.json.JSONArray;
import org.json.JSONObject;

// Фоновая проверка новых сообщений через обычный REST-доступ к Firestore (те же правила доступа, что и в приложении).
public class MsgSync {
    static final String BASE = "https://firestore.googleapis.com/v1/projects/pastmetki/databases/(default)/documents";

    static String http(String method, String url, String body, String ctype, String bearer) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setRequestMethod(method);
        c.setConnectTimeout(15000);
        c.setReadTimeout(20000);
        if (bearer != null) c.setRequestProperty("Authorization", "Bearer " + bearer);
        if (body != null) {
            c.setDoOutput(true);
            c.setRequestProperty("Content-Type", ctype);
            OutputStream os = c.getOutputStream();
            os.write(body.getBytes(StandardCharsets.UTF_8));
            os.close();
        }
        int code = c.getResponseCode();
        InputStream is = code >= 400 ? c.getErrorStream() : c.getInputStream();
        StringBuilder sb = new StringBuilder();
        if (is != null) {
            BufferedReader r = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
            String l;
            while ((l = r.readLine()) != null) sb.append(l).append('\n');
            r.close();
        }
        c.disconnect();
        if (code >= 400) throw new Exception("HTTP " + code);
        return sb.toString();
    }

    static String token(SharedPreferences sp) throws Exception {
        String rt = sp.getString("sy_rt", "");
        String key = sp.getString("sy_key", "");
        String body = "grant_type=refresh_token&refresh_token=" + URLEncoder.encode(rt, "UTF-8");
        String r = http("POST", "https://securetoken.googleapis.com/v1/token?key=" + key, body, "application/x-www-form-urlencoded", null);
        JSONObject o = new JSONObject(r);
        String n = o.optString("refresh_token", "");
        if (n.length() > 0) sp.edit().putString("sy_rt", n).apply();
        return o.getString("id_token");
    }

    static JSONArray query(String tok, String coll, String uid) throws Exception {
        JSONObject val = new JSONObject().put("stringValue", uid);
        JSONObject fld = new JSONObject().put("fieldPath", "members");
        JSONObject ff = new JSONObject().put("field", fld).put("op", "ARRAY_CONTAINS").put("value", val);
        JSONObject where = new JSONObject().put("fieldFilter", ff);
        JSONObject from = new JSONObject().put("collectionId", coll);
        JSONObject sq = new JSONObject().put("from", new JSONArray().put(from)).put("where", where);
        String r = http("POST", BASE + ":runQuery", new JSONObject().put("structuredQuery", sq).toString(), "application/json", tok);
        return new JSONArray(r);
    }

    static JSONObject fields(JSONObject o, String k) {
        if (o == null) return null;
        JSONObject m = o.optJSONObject(k);
        if (m == null) return null;
        JSONObject mv = m.optJSONObject("mapValue");
        if (mv == null) return null;
        return mv.optJSONObject("fields");
    }

    static String str(JSONObject o, String k) {
        if (o == null) return "";
        JSONObject v = o.optJSONObject(k);
        return v == null ? "" : v.optString("stringValue", "");
    }

    static long num(JSONObject o, String k) {
        if (o == null) return 0;
        JSONObject v = o.optJSONObject(k);
        if (v == null) return 0;
        try {
            if (v.has("integerValue")) return Long.parseLong(v.optString("integerValue", "0"));
            if (v.has("doubleValue")) return (long) v.optDouble("doubleValue", 0);
        } catch (Exception e) { }
        return 0;
    }

    static boolean arrHas(JSONObject f, String k, String val) {
        JSONObject a = f.optJSONObject(k);
        if (a == null) return false;
        JSONObject av = a.optJSONObject("arrayValue");
        if (av == null) return false;
        JSONArray vs = av.optJSONArray("values");
        if (vs == null) return false;
        for (int i = 0; i < vs.length(); i++) {
            JSONObject o = vs.optJSONObject(i);
            if (o != null && val.equals(o.optString("stringValue", ""))) return true;
        }
        return false;
    }

    static String other(JSONObject f, String uid) {
        JSONObject a = f.optJSONObject("members");
        if (a == null) return "";
        JSONObject av = a.optJSONObject("arrayValue");
        if (av == null) return "";
        JSONArray vs = av.optJSONArray("values");
        if (vs == null) return "";
        for (int i = 0; i < vs.length(); i++) {
            JSONObject o = vs.optJSONObject(i);
            String s = o == null ? "" : o.optString("stringValue", "");
            if (s.length() > 0 && !s.equals(uid)) return s;
        }
        return "";
    }

    static void run(Context c) throws Exception {
        SharedPreferences sp = PmData.sp(c);
        String uid = sp.getString("sy_uid", "");
        if (uid.length() == 0 || sp.getString("sy_rt", "").length() == 0 || !sp.getBoolean("sy_on", true)) return;
        String tok = token(sp);
        boolean first = !sp.contains("sy_seen");
        JSONObject seen = new JSONObject(sp.getString("sy_seen", "{}"));
        JSONObject rd = new JSONObject();
        try {
            String u = http("GET", BASE + "/users/" + uid, null, null, tok);
            JSONObject f = new JSONObject(u).optJSONObject("fields");
            JSONObject ff = fields(f, "rd");
            if (ff != null) {
                JSONArray names = ff.names();
                if (names != null) {
                    for (int i = 0; i < names.length(); i++) {
                        String k = names.getString(i);
                        rd.put(k, num(ff, k));
                    }
                }
            }
        } catch (Exception e) { }
        check(c, tok, uid, "chats", false, seen, rd, first);
        check(c, tok, uid, "groups", true, seen, rd, first);
        sp.edit().putString("sy_seen", seen.toString()).apply();
    }

    static void check(Context c, String tok, String uid, String coll, boolean grp, JSONObject seen, JSONObject rd, boolean first) {
        try {
            JSONArray arr = query(tok, coll, uid);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject d = arr.getJSONObject(i).optJSONObject("document");
                if (d == null) continue;
                String name = d.getString("name");
                String id = name.substring(name.lastIndexOf('/') + 1);
                JSONObject f = d.optJSONObject("fields");
                if (f == null) continue;
                JSONObject last = fields(f, "last");
                if (last == null) continue;
                String from = str(last, "f");
                long ts = num(last, "ts");
                if (ts == 0 || from.equals(uid)) continue;
                if (!grp) {
                    JSONObject on = f.optJSONObject("on");
                    if (on != null && on.has("booleanValue") && !on.getBoolean("booleanValue")) continue;
                } else if (arrHas(f, "muted", from)) {
                    continue;
                }
                String key = grp ? "g_" + id : id;
                long prev = Math.max(rd.optLong(key, 0), seen.optLong(key, 0));
                if (ts <= prev) continue;
                seen.put(key, ts);
                if (first) continue;
                String target = grp ? key : other(f, uid);
                if (target.length() == 0) continue;
                post(c, key, target);
            }
        } catch (Exception e) { }
    }

    static void post(Context c, String key, String target) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel("pm_msg", "Сообщения", NotificationManager.IMPORTANCE_HIGH);
            nm.createNotificationChannel(ch);
        }
        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse("pastmetki://chat/" + target));
        i.setClass(c, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        int id = Math.abs(key.hashCode() % 900000) + 1;
        PendingIntent pi = PendingIntent.getActivity(c, id, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder b = new NotificationCompat.Builder(c, "pm_msg")
            .setSmallIcon(android.R.drawable.stat_notify_chat)
            .setContentTitle("PastMetki")
            .setContentText("У вас новое сообщение")
            .setAutoCancel(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pi);
        nm.notify(id, b.build());
    }
}
