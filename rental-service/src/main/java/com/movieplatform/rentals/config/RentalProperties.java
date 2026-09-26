package com.movieplatform.rentals.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * Propiedades "app.*" de application.yml.
 *
 * @param movieServiceUrl URL base de movie-service
 * @param rentalDuration  duración de un alquiler (por ejemplo, 48h)
 */
@ConfigurationProperties("app")
public record RentalProperties(String movieServiceUrl, Duration rentalDuration) {
}
