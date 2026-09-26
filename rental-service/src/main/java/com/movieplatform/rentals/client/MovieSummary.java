package com.movieplatform.rentals.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Lo único que rental-service necesita de una película. El resto de campos se ignora. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record MovieSummary(Long id, String title) {
}
