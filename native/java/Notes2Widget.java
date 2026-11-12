package com.pastmetki.app;

public class Notes2Widget extends BaseListWidget {
    @Override String title() { return "📝 Заметки"; }
    @Override Class<?> service() { return NotesService.class; }
    @Override int rc() { return 22; }
    @Override String addPath() { return "new/note"; }
    @Override Class<?> tplClass() { return ToggleActivity.class; }
}
