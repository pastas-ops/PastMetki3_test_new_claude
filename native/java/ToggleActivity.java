package com.pastmetki.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

// Прозрачная активность-посредник для нажатий в списке виджета:
// toggle -> отметить заметку, не открывая приложение; остальное -> открыть приложение по ссылке.
public class ToggleActivity extends Activity {
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        Uri d = getIntent().getData();
        if (d != null) {
            if ("toggle".equals(d.getHost())) {
                PmData.toggle(this, d.getLastPathSegment());
            } else {
                Intent i = new Intent(Intent.ACTION_VIEW, d);
                i.setClass(this, MainActivity.class);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
            }
        }
        finish();
        overridePendingTransition(0, 0);
    }
}
