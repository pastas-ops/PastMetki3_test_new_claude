package com.pastmetki.app;

public class Notes4Widget extends BaseListWidget {
    @Override String title() { return "📝 Мои заметки"; }
    @Override Class<?> service() { return NotesService.class; }
    @Override int rc() { return 24; }
    @Override String addPath() { return "new/note"; }
    @Override Class<?> tplClass() { return ToggleActivity.class; }
}
