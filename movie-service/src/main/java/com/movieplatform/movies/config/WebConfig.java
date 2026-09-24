package com.movieplatform.movies.config;

import com.movieplatform.movies.service.CoverStorageService;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Duration;

/**
 * Sirve las portadas guardadas en disco bajo /uploads/**.
 * Como cada archivo tiene un nombre único, el navegador puede cachearlo sin riesgo.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final CoverStorageService coverStorage;

    public WebConfig(CoverStorageService coverStorage) {
        this.coverStorage = coverStorage;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(coverStorage.getRoot().toUri().toString())
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic());
    }
}
