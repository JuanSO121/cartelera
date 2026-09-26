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
        boolean overdue
) {
    public static RentalResponse from(Rental rental, Instant now) {
        return new RentalResponse(
                rental.getId(),
                rental.getMovieId(),
                rental.getMovieTitle(),
                rental.getCustomerName(),
                rental.getRentedAt(),
                rental.getDueDate(),
                rental.getReturnedAt(),
                rental.getStatus(),
                rental.isOverdue(now)
        );
    }
}
