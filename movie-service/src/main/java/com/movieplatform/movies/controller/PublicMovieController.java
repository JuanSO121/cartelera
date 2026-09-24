package com.movieplatform.movies.controller;

import com.movieplatform.movies.dto.PageResponse;
import com.movieplatform.movies.dto.PublicMovieResponse;
import com.movieplatform.movies.service.MovieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/movies")
@Tag(name = "Películas (público)", description = "Solo películas publicadas")
public class PublicMovieController {

    private final MovieService movieService;

    public PublicMovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping
    @Operation(summary = "Listar películas publicadas con búsqueda, orden y paginación")
    public PageResponse<PublicMovieResponse> list(
            @Parameter(description = "Texto a buscar en el nombre")
            @RequestParam(defaultValue = "") String search,
            @Parameter(description = "recent (más recientes) o score (mayor puntaje)")
            @RequestParam(defaultValue = "recent") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return movieService.findPublished(search, sort, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de una película publicada")
    public PublicMovieResponse get(@PathVariable Long id) {
        return movieService.findPublishedById(id);
    }
}
