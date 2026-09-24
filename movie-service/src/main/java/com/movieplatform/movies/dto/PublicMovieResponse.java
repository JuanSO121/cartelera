package com.movieplatform.movies.dto;

import com.movieplatform.movies.entity.Movie;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Respuesta del área pública: no expone el estado ni datos internos.
 */
public record PublicMovieResponse(
        Long id,
        String title,
        String description,
        String coverUrl,
        BigDecimal score,
        Instant createdAt
) {
    public static PublicMovieResponse from(Movie movie) {
        return new PublicMovieResponse(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                CoverUrls.of(movie.getCoverPath()),
                movie.getScore(),
                movie.getCreatedAt()
        );
    }
}
