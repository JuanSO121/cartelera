package com.movieplatform.rentals.exception;

public class MovieServiceUnavailableException extends RuntimeException {

    public MovieServiceUnavailableException() {
        super("No se pudo verificar la película en este momento. Intenta de nuevo en unos minutos");
    }
}
