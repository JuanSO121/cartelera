package com.movieplatform.rentals.exception;

public class MovieNotAvailableException extends RuntimeException {

    public MovieNotAvailableException(Long movieId) {
        super("La película " + movieId + " no existe o no está disponible para alquilar");
    }
}
