package com.onmm.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;

import java.lang.reflect.Method;

@Configuration
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (Throwable ex, Method method, Object... params) -> {
            Logger log = LoggerFactory.getLogger(method.getDeclaringClass());
            log.error("[ASYNC ERROR] {}.{} : {}", method.getDeclaringClass().getSimpleName(),
                    method.getName(), ex.getMessage(), ex);
        };
    }
}
