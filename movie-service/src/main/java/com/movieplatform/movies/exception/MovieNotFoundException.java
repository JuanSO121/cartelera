package com.movieplatform.movies.exception;

public class MovieNotFoundException extends RuntimeException {

    public MovieNotFoundException(Long id) {
        super("No se encontró la película con id " + id);
    }
}
