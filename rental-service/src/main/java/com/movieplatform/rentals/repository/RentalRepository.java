package com.movieplatform.rentals.repository;

import com.movieplatform.rentals.entity.Rental;
import com.movieplatform.rentals.entity.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RentalRepository extends JpaRepository<Rental, Long> {

    /** Los correos se guardan normalizados (minúsculas, sin espacios). */
    List<Rental> findByCustomerEmailOrderByRentedAtDesc(String customerEmail);

    /** El alquiler activo de esa película para ese correo, si existe (a lo sumo hay uno). */
    Optional<Rental> findFirstByMovieIdAndCustomerEmailAndStatus(Long movieId, String customerEmail, RentalStatus status);

    Optional<Rental> findByIdAndCustomerEmail(Long id, String customerEmail);
}
