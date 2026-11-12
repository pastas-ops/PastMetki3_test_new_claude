package com.pastmetki.app;

public class ChatsWidget extends BaseListWidget {
    @Override String title() { return "💬 Чаты"; }
    @Override Class<?> service() { return ChatsService.class; }
    @Override int rc() { return 10; }
    @Override String addPath() { return null; }
}
