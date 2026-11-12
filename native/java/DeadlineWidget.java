package com.pastmetki.app;

public class DeadlineWidget extends BaseListWidget {
    @Override String title() { return "⏰ Дедлайны"; }
    @Override Class<?> service() { return DeadlinesService.class; }
    @Override int rc() { return 30; }
    @Override String addPath() { return "new/task"; }
}
