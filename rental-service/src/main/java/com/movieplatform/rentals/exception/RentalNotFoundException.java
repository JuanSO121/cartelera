package com.movieplatform.rentals.exception;

public class RentalNotFoundException extends RuntimeException {

    public RentalNotFoundException(Long id) {
        super("No se encontró el alquiler " + id + " para ese correo");
    }
}
