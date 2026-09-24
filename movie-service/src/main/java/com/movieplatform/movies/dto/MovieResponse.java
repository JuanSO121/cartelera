package com.movieplatform.movies.dto;

import com.movieplatform.movies.entity.Movie;
import com.movieplatform.movies.entity.MovieStatus;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Respuesta del área administrativa: incluye el estado y la fecha de modificación.
 */
public record MovieResponse(
        Long id,
        String title,
        String description,
        String coverUrl,
        BigDecimal score,
        MovieStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    public static MovieResponse from(Movie movie) {
        return new MovieResponse(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                CoverUrls.of(movie.getCoverPath()),
                movie.getScore(),
                movie.getStatus(),
                movie.getCreatedAt(),
                movie.getUpdatedAt()
        );
    }
}
