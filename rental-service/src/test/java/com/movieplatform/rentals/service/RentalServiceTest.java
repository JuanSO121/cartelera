package com.movieplatform.rentals.service;

import com.movieplatform.rentals.client.MovieClient;
import com.movieplatform.rentals.client.MovieSummary;
import com.movieplatform.rentals.config.RentalProperties;
import com.movieplatform.rentals.dto.RentalRequest;
import com.movieplatform.rentals.dto.RentalResponse;
import com.movieplatform.rentals.entity.Rental;
import com.movieplatform.rentals.entity.RentalStatus;
import com.movieplatform.rentals.exception.MovieNotAvailableException;
import com.movieplatform.rentals.exception.RentalConflictException;
import com.movieplatform.rentals.exception.RentalNotFoundException;
import com.movieplatform.rentals.repository.RentalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RentalServiceTest {

    private static final Instant NOW = Instant.parse("2026-09-25T12:00:00Z");

    @Mock
    private RentalRepository repository;

    @Mock
    private MovieClient movieClient;

    private RentalService rentalService;

    @BeforeEach
    void setUp() {
        RentalProperties properties = new RentalProperties("http://localhost:8081", Duration.ofHours(48));
        Clock clock = Clock.fixed(NOW, ZoneOffset.UTC);
        rentalService = new RentalService(repository, movieClient, properties, clock);
    }

    @Test
    void rentsPublishedMovieForFortyEightHoursWithNormalizedEmail() {
        when(movieClient.findPublished(16L)).thenReturn(new MovieSummary(16L, "Dune: Parte dos"));
        when(repository.existsByMovieIdAndCustomerEmailAndStatus(16L, "ana@correo.com", RentalStatus.ACTIVE))
                .thenReturn(false);
        when(repository.save(any(Rental.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RentalResponse response = rentalService.rent(new RentalRequest(16L, " Ana ", "  Ana@Correo.com "));

        assertThat(response.movieTitle()).isEqualTo("Dune: Parte dos");
        assertThat(response.customerName()).isEqualTo("Ana");
        assertThat(response.dueDate()).isEqualTo(NOW.plus(Duration.ofHours(48)));
        assertThat(response.status()).isEqualTo(RentalStatus.ACTIVE);
        assertThat(response.overdue()).isFalse();
    }

    @Test
    void cannotRentMovieThatIsNotPublished() {
        when(movieClient.findPublished(17L)).thenThrow(new MovieNotAvailableException(17L));

        assertThatThrownBy(() -> rentalService.rent(new RentalRequest(17L, "Ana", "ana@correo.com")))
                .isInstanceOf(MovieNotAvailableException.class);

        verify(repository, never()).save(any());
    }

    @Test
    void cannotRentSameMovieTwiceWhileActive() {
        when(movieClient.findPublished(16L)).thenReturn(new MovieSummary(16L, "Dune: Parte dos"));
        when(repository.existsByMovieIdAndCustomerEmailAndStatus(16L, "ana@correo.com", RentalStatus.ACTIVE))
                .thenReturn(true);

        assertThatThrownBy(() -> rentalService.rent(new RentalRequest(16L, "Ana", "ana@correo.com")))
                .isInstanceOf(RentalConflictException.class);

        verify(repository, never()).save(any());
    }

    @Test
    void returnWithAnotherEmailIsNotFound() {
        when(repository.findByIdAndCustomerEmail(5L, "otro@correo.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> rentalService.returnRental(5L, "otro@correo.com"))
                .isInstanceOf(RentalNotFoundException.class);
    }

    @Test
    void returnMarksRentalAsReturnedAndCannotBeRepeated() {
        Rental rental = new Rental(16L, "Dune: Parte dos", "Ana", "ana@correo.com",
                NOW.minus(Duration.ofHours(5)), NOW.plus(Duration.ofHours(43)));
        when(repository.findByIdAndCustomerEmail(5L, "ana@correo.com")).thenReturn(Optional.of(rental));

        RentalResponse response = rentalService.returnRental(5L, "ana@correo.com");

        assertThat(response.status()).isEqualTo(RentalStatus.RETURNED);
        assertThat(response.returnedAt()).isEqualTo(NOW);
        assertThatThrownBy(() -> rentalService.returnRental(5L, "ana@correo.com"))
                .isInstanceOf(RentalConflictException.class);
    }

    @Test
    void activeRentalOfMovieRemovedFromCatalogIsMarkedUnavailable() {
        Rental stillPublished = new Rental(16L, "Dune: Parte dos", "Ana", "ana@correo.com",
                NOW.minus(Duration.ofHours(5)), NOW.plus(Duration.ofHours(43)));
        Rental removed = new Rental(17L, "Pulp Fiction", "Ana", "ana@correo.com",
                NOW.minus(Duration.ofHours(2)), NOW.plus(Duration.ofHours(46)));
        when(repository.findByCustomerEmailOrderByRentedAtDesc("ana@correo.com"))
                .thenReturn(List.of(removed, stillPublished));
        when(movieClient.findPublishedIds(Set.of(16L, 17L))).thenReturn(Optional.of(Set.of(16L)));

        List<RentalResponse> rentals = rentalService.findByEmail("ana@correo.com");

        assertThat(rentals).extracting(RentalResponse::movieTitle, RentalResponse::movieAvailable)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("Pulp Fiction", false),
                        org.assertj.core.groups.Tuple.tuple("Dune: Parte dos", true));
    }

    @Test
    void rentalsAreListedEvenIfMovieServiceIsDown() {
        Rental rental = new Rental(16L, "Dune: Parte dos", "Ana", "ana@correo.com",
                NOW.minus(Duration.ofHours(5)), NOW.plus(Duration.ofHours(43)));
        when(repository.findByCustomerEmailOrderByRentedAtDesc("ana@correo.com")).thenReturn(List.of(rental));
        when(movieClient.findPublishedIds(Set.of(16L))).thenReturn(Optional.empty());

        List<RentalResponse> rentals = rentalService.findByEmail("ana@correo.com");

        assertThat(rentals).hasSize(1);
        assertThat(rentals.getFirst().movieAvailable()).isNull();
    }

    @Test
    void activeRentalPastDueDateIsReportedAsOverdue() {
        Rental rental = new Rental(15L, "Oppenheimer", "Ana", "ana@correo.com",
                NOW.minus(Duration.ofDays(3)), NOW.minus(Duration.ofDays(1)));

        assertThat(RentalResponse.from(rental, NOW).overdue()).isTrue();
    }
}
