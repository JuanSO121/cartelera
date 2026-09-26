package com.movieplatform.rentals.client;

import com.movieplatform.rentals.config.RentalProperties;
import com.movieplatform.rentals.exception.MovieNotAvailableException;
import com.movieplatform.rentals.exception.MovieServiceUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

/**
 * Consulta a movie-service por su API pública. Si la película no existe o no está publicada,
 * movie-service responde 404; si no responde a tiempo, se informa como servicio no disponible.
 */
@Component
public class MovieClient {

    private static final Logger log = LoggerFactory.getLogger(MovieClient.class);

    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(2);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(3);

    private final RestClient restClient;

    public MovieClient(RentalProperties properties) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(CONNECT_TIMEOUT)
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(READ_TIMEOUT);

        this.restClient = RestClient.builder()
                .baseUrl(properties.movieServiceUrl())
                .requestFactory(requestFactory)
                .build();
    }

    public MovieSummary findPublished(Long movieId) {
        try {
            MovieSummary movie = restClient.get()
                    .uri("/api/movies/{id}", movieId)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, response) -> {
                        // 404: no existe o no está publicada. Cualquier otro error: el servicio falló.
                        if (response.getStatusCode().isSameCodeAs(HttpStatus.NOT_FOUND)) {
                            throw new MovieNotAvailableException(movieId);
                        }
                        throw new MovieServiceUnavailableException();
                    })
                    .body(MovieSummary.class);
            if (movie == null) {
                throw new MovieServiceUnavailableException();
            }
            return movie;
        } catch (RestClientException e) {
            // Tiempo agotado, conexión rechazada o respuesta ilegible.
            throw new MovieServiceUnavailableException();
        }
    }

    /**
     * De los ids recibidos, cuáles siguen publicados, en una sola llamada.
     * Devuelve vacío si movie-service no responde: la disponibilidad queda "desconocida"
     * y quien llama decide cómo mostrarlo, sin que la consulta de alquileres falle.
     */
    public Optional<Set<Long>> findPublishedIds(Collection<Long> movieIds) {
        if (movieIds.isEmpty()) {
            return Optional.of(Set.of());
        }
        try {
            Long[] ids = restClient.get()
                    .uri(builder -> builder.path("/api/movies/published-ids")
                            .queryParam("ids", movieIds.toArray())
                            .build())
                    .retrieve()
                    .body(Long[].class);
            return Optional.of(ids == null ? Set.of() : new HashSet<>(Arrays.asList(ids)));
        } catch (RestClientException e) {
            log.warn("No se pudo consultar la disponibilidad de películas: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
