package com.pastmetki.app;

public class NotesWidget extends BaseListWidget {
    @Override String title() { return "📝 Заметки"; }
    @Override Class<?> service() { return NotesService.class; }
    @Override int rc() { return 20; }
    @Override String addPath() { return "new/note"; }
    @Override Class<?> tplClass() { return ToggleActivity.class; }
}
