package com.movieplatform.rentals.service;

import com.movieplatform.rentals.client.MovieClient;
import com.movieplatform.rentals.client.MovieSummary;
import com.movieplatform.rentals.config.RentalProperties;
import com.movieplatform.rentals.dto.RentalRequest;
import com.movieplatform.rentals.dto.RentalResponse;
import com.movieplatform.rentals.entity.Rental;
import com.movieplatform.rentals.entity.RentalStatus;
import com.movieplatform.rentals.exception.RentalConflictException;
import com.movieplatform.rentals.exception.RentalNotFoundException;
import com.movieplatform.rentals.repository.RentalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class RentalService {

    private final RentalRepository repository;
    private final MovieClient movieClient;
    private final RentalProperties properties;
    private final Clock clock;

    public RentalService(RentalRepository repository, MovieClient movieClient,
                         RentalProperties properties, Clock clock) {
        this.repository = repository;
        this.movieClient = movieClient;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public RentalResponse rent(RentalRequest request) {
        String email = normalizeEmail(request.customerEmail());

        // Primero se valida contra movie-service: solo se alquilan películas publicadas.
        MovieSummary movie = movieClient.findPublished(request.movieId());

        if (repository.existsByMovieIdAndCustomerEmailAndStatus(movie.id(), email, RentalStatus.ACTIVE)) {
            throw new RentalConflictException("Ya tienes un alquiler activo de \"" + movie.title() + "\"");
        }

        Instant now = clock.instant();
        Rental rental = new Rental(
                movie.id(),
                movie.title(),
                request.customerName().trim(),
                email,
                now,
                now.plus(properties.rentalDuration()));

        return RentalResponse.from(repository.save(rental), now);
    }

    public List<RentalResponse> findByEmail(String email) {
        Instant now = clock.instant();
        return repository.findByCustomerEmailOrderByRentedAtDesc(normalizeEmail(email)).stream()
                .map(rental -> RentalResponse.from(rental, now))
                .toList();
    }

    @Transactional
    public RentalResponse returnRental(Long id, String email) {
        // Si el correo no coincide se responde "no encontrado", sin revelar que el alquiler existe.
        Rental rental = repository.findByIdAndCustomerEmail(id, normalizeEmail(email))
                .orElseThrow(() -> new RentalNotFoundException(id));

        if (rental.getStatus() == RentalStatus.RETURNED) {
            throw new RentalConflictException("Este alquiler ya fue devuelto");
        }

        Instant now = clock.instant();
        rental.markReturned(now);
        return RentalResponse.from(rental, now);
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
