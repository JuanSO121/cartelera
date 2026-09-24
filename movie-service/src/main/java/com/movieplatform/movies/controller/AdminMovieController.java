package com.movieplatform.movies.controller;

import com.movieplatform.movies.dto.MovieRequest;
import com.movieplatform.movies.dto.MovieResponse;
import com.movieplatform.movies.dto.PageResponse;
import com.movieplatform.movies.entity.MovieStatus;
import com.movieplatform.movies.service.MovieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/movies")
@Tag(name = "Películas (administración)", description = "CRUD de todas las películas")
public class AdminMovieController {

    private final MovieService movieService;

    public AdminMovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping
    @Operation(summary = "Listar todas las películas, con filtro opcional por estado")
    public PageResponse<MovieResponse> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) MovieStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return movieService.findAll(search, status, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de una película")
    public MovieResponse get(@PathVariable Long id) {
        return movieService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear una película")
    public MovieResponse create(@Valid @RequestBody MovieRequest request) {
        return movieService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una película, incluido su estado")
    public MovieResponse update(@PathVariable Long id, @Valid @RequestBody MovieRequest request) {
        return movieService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Borrar una película y su portada")
    public void delete(@PathVariable Long id) {
        movieService.delete(id);
    }

    @PostMapping(value = "/{id}/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir o reemplazar la portada (JPG, PNG o WEBP, máx. 2 MB)")
    public MovieResponse uploadCover(@PathVariable Long id, @RequestPart("file") MultipartFile file) {
        return movieService.updateCover(id, file);
    }
}
