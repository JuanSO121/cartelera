package com.movieplatform.movies.config;

import com.movieplatform.movies.service.CoverStorageService;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.time.Duration;

/**
 * Sirve las portadas guardadas en disco bajo /uploads/**.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final CoverStorageService coverStorage;

    public WebConfig(CoverStorageService coverStorage) {
        this.coverStorage = coverStorage;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = coverStorage.getRoot().toUri().toString();

        // Portadas de prueba (seed-*): tienen nombre fijo, así que el navegador revalida en
        // cada visita en lugar de guardarlas 30 días. Si el archivo no existe, se entrega
        // seed-default.jpg en vez de un 404; al agregar la imagen real, se usa esa sola.
        registry.addResourceHandler("/uploads/seed-*")
                .addResourceLocations(location)
                .setCacheControl(CacheControl.noCache())
                .resourceChain(false)
                .addResolver(new SeedCoverFallbackResolver());

        // Portadas subidas desde el admin: nombre único (UUID), nunca cambian, se cachean sin riesgo.
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location)
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic());
    }

    /** Si falta una portada de prueba, responde con la portada por defecto (si existe). */
    static class SeedCoverFallbackResolver extends PathResourceResolver {

        private static final String DEFAULT_COVER = "seed-default.jpg";

        @Override
        protected Resource getResource(String resourcePath, Resource location) throws IOException {
            Resource resource = super.getResource(resourcePath, location);
            return resource != null ? resource : super.getResource(DEFAULT_COVER, location);
        }
    }
}
