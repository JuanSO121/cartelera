package com.movieplatform.movies.config;

import com.movieplatform.movies.service.CoverStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Copia las portadas de los datos de prueba (incluidas en el JAR) a la carpeta de portadas,
 * para que el catálogo se vea completo apenas se levanta el proyecto.
 * Solo copia las que falten: nunca sobrescribe archivos existentes.
 */
@Component
public class SeedCoverInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SeedCoverInitializer.class);
    private static final String SEED_LOCATION = "classpath:seed-covers/*.jpg";
    private static final String PREFIX = "seed-";

    private final CoverStorageService coverStorage;

    public SeedCoverInitializer(CoverStorageService coverStorage) {
        this.coverStorage = coverStorage;
    }

    @Override
    public void run(ApplicationArguments args) throws IOException {
        Resource[] covers = new PathMatchingResourcePatternResolver().getResources(SEED_LOCATION);
        int copied = 0;

        for (Resource cover : covers) {
            Path target = coverStorage.getRoot().resolve(PREFIX + cover.getFilename());
            if (Files.notExists(target)) {
                try (InputStream input = cover.getInputStream()) {
                    Files.copy(input, target);
                    copied++;
                }
            }
        }

        // Siempre se informa: si aquí aparece 0 encontradas, las imágenes no llegaron al JAR
        // (carpeta equivocada, extensión distinta de .jpg o falta reconstruir con --build).
        log.info("Portadas de prueba: {} encontradas en el proyecto, {} copiadas a {}",
                covers.length, copied, coverStorage.getRoot());
    }
}
