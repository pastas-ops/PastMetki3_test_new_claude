package com.pastmetki.app;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.appwidget.AppWidgetProviderInfo;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.SeekBar;
import android.widget.TextView;

// Настройка фона виджета: цвет и прозрачность (по умолчанию чёрный).
public class WidgetConfigActivity extends Activity {
    static final int[] COLORS = { 0x000000, 0x1B1B27, 0x5D34E6, 0x1565C0, 0x1B8F4A, 0xB71C1C };

    int wid = AppWidgetManager.INVALID_APPWIDGET_ID;
    int rgb = 0x000000;
    int alpha = 242;
    View preview;
    TextView label;

    int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setResult(RESULT_CANCELED);
        Bundle ex = getIntent().getExtras();
        if (ex != null) wid = ex.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        if (wid == AppWidgetManager.INVALID_APPWIDGET_ID) { finish(); return; }

        SharedPreferences sp = PmData.sp(this);
        rgb = sp.getInt("bgc_" + wid, 0x000000);
        alpha = sp.getInt("bga_" + wid, 242);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(24), dp(36), dp(24), dp(24));
        root.setBackgroundColor(0xFF16161F);

        TextView title = new TextView(this);
        title.setText("Фон виджета");
        title.setTextColor(Color.WHITE);
        title.setTextSize(20);
        root.addView(title);

        FrameLayout pw = new FrameLayout(this);
        pw.setBackgroundColor(0xFF9A9AA8);
        preview = new View(this);
        pw.addView(preview, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        LinearLayout.LayoutParams plp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(90));
        plp.topMargin = dp(16);
        root.addView(pw, plp);

        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams rlp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        rlp.topMargin = dp(16);
        for (final int col : COLORS) {
            View sw = new View(this);
            GradientDrawable g = new GradientDrawable();
            g.setShape(GradientDrawable.OVAL);
            g.setColor(0xFF000000 | col);
            g.setStroke(dp(1), 0xFFFFFFFF);
            sw.setBackground(g);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(dp(40), dp(40));
            lp.rightMargin = dp(10);
            sw.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) { rgb = col; refresh(); }
            });
            row.addView(sw, lp);
        }
        root.addView(row, rlp);

        label = new TextView(this);
        label.setTextColor(0xFFA6A6B8);
        label.setTextSize(14);
        LinearLayout.LayoutParams llp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        llp.topMargin = dp(20);
        root.addView(label, llp);

        SeekBar sb = new SeekBar(this);
        sb.setMax(100);
        sb.setProgress(Math.round(alpha * 100f / 255f));
        sb.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override public void onProgressChanged(SeekBar s, int p, boolean u) { alpha = Math.round(p * 255f / 100f); refresh(); }
            @Override public void onStartTrackingTouch(SeekBar s) {}
            @Override public void onStopTrackingTouch(SeekBar s) {}
        });
        root.addView(sb);

        Button ok = new Button(this);
        ok.setText("Сохранить");
        ok.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { save(); }
        });
        LinearLayout.LayoutParams blp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        blp.topMargin = dp(24);
        root.addView(ok, blp);

        setContentView(root);
        refresh();
    }

    void refresh() {
        GradientDrawable g = new GradientDrawable();
        g.setColor((alpha << 24) | rgb);
        g.setCornerRadius(dp(22));
        preview.setBackground(g);
        label.setText("Непрозрачность: " + Math.round(alpha * 100f / 255f) + "%");
    }

    void save() {
        PmData.sp(this).edit().putInt("bgc_" + wid, rgb).putInt("bga_" + wid, alpha).apply();
        Intent r = new Intent();
        r.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, wid);
        setResult(RESULT_OK, r);
        AppWidgetProviderInfo info = AppWidgetManager.getInstance(this).getAppWidgetInfo(wid);
        if (info != null) {
            try {
                Object o = Class.forName(info.provider.getClassName()).getDeclaredConstructor().newInstance();
                if (o instanceof AppWidgetProvider) {
                    ((AppWidgetProvider) o).onUpdate(this, AppWidgetManager.getInstance(this), new int[] { wid });
                }
            } catch (Throwable t) {
                // запасной путь: обычное широковещательное обновление
            }
            Intent u = new Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            u.setComponent(info.provider);
            u.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[] { wid });
            sendBroadcast(u);
        }
        finish();
    }
}
