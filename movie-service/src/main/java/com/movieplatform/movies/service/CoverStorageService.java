package com.movieplatform.movies.service;

import com.movieplatform.movies.exception.InvalidRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

/**
 * Guarda las portadas en una carpeta del disco. En la base de datos solo se guarda el nombre del archivo.
 */
@Service
public class CoverStorageService {

    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private final Path root;

    public CoverStorageService(@Value("${app.uploads-dir}") String uploadsDir) {
        this.root = Path.of(uploadsDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo crear la carpeta de portadas: " + root, e);
        }
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("Debe adjuntar una imagen");
        }
        String extension = ALLOWED_TYPES.get(file.getContentType());
        if (extension == null) {
            throw new InvalidRequestException("Formato no permitido: use JPG, PNG o WEBP");
        }

        // Nombre único: evita colisiones y permite cachear la imagen en el navegador.
        String filename = UUID.randomUUID() + extension;
        try (InputStream input = file.getInputStream()) {
            Files.copy(input, root.resolve(filename));
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo guardar la portada", e);
        }
        return filename;
    }

    public void delete(String filename) {
        if (filename == null) {
            return;
        }
        try {
            Files.deleteIfExists(root.resolve(filename).normalize());
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo borrar la portada " + filename, e);
        }
    }

    public Path getRoot() {
        return root;
    }
}
