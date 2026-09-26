package com.movieplatform.rentals.dto;

import com.movieplatform.rentals.entity.Rental;
import com.movieplatform.rentals.entity.RentalStatus;

import java.time.Instant;

public record RentalResponse(
        Long id,
        Long movieId,
        String movieTitle,
        String customerName,
        Instant rentedAt,
        Instant dueDate,
        Instant returnedAt,
        RentalStatus status,
        boolean overdue,
        /**
         * Solo en alquileres activos: si la película sigue publicada. {@code null} cuando no aplica
         * (devuelto) o no se pudo verificar (movie-service no respondió).
         */
        Boolean movieAvailable
) {
    public static RentalResponse from(Rental rental, Instant now) {
        return from(rental, now, null);
    }

    public static RentalResponse from(Rental rental, Instant now, Boolean movieAvailable) {
        return new RentalResponse(
                rental.getId(),
                rental.getMovieId(),
                rental.getMovieTitle(),
                rental.getCustomerName(),
                rental.getRentedAt(),
                rental.getDueDate(),
                rental.getReturnedAt(),
                rental.getStatus(),
                rental.isOverdue(now),
                movieAvailable
        );
    }
}
