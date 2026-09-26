package com.movieplatform.rentals.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "rentals")
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Referencia lógica: la película vive en otra base de datos (movie-service). */
    @Column(name = "movie_id", nullable = false)
    private Long movieId;

    /** Copia del título al momento de alquilar: se lista sin consultar a movie-service. */
    @Column(name = "movie_title", nullable = false, length = 150)
    private String movieTitle;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "customer_email", nullable = false, length = 150)
    private String customerEmail;

    @Column(name = "rented_at", nullable = false, updatable = false, columnDefinition = "timestamptz")
    private Instant rentedAt;

    @Column(name = "due_date", nullable = false, columnDefinition = "timestamptz")
    private Instant dueDate;

    @Column(name = "returned_at", columnDefinition = "timestamptz")
    private Instant returnedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RentalStatus status;

    protected Rental() {
        // Requerido por JPA
    }

    public Rental(Long movieId, String movieTitle, String customerName, String customerEmail,
                  Instant rentedAt, Instant dueDate) {
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.rentedAt = rentedAt;
        this.dueDate = dueDate;
        this.status = RentalStatus.ACTIVE;
    }

    public void markReturned(Instant now) {
        this.returnedAt = now;
        this.status = RentalStatus.RETURNED;
    }

    /** Vencido = sigue activo y ya pasó la fecha límite. Se calcula, no se guarda. */
    public boolean isOverdue(Instant now) {
        return status == RentalStatus.ACTIVE && now.isAfter(dueDate);
    }

    public Long getId() {
        return id;
    }

    public Long getMovieId() {
        return movieId;
    }

    public String getMovieTitle() {
        return movieTitle;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public Instant getRentedAt() {
        return rentedAt;
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public Instant getReturnedAt() {
        return returnedAt;
    }

    public RentalStatus getStatus() {
        return status;
    }
}
