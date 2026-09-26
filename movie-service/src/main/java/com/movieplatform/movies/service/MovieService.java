package com.movieplatform.movies.service;

import com.movieplatform.movies.dto.MovieRequest;
import com.movieplatform.movies.dto.MovieResponse;
import com.movieplatform.movies.dto.PageResponse;
import com.movieplatform.movies.dto.PublicMovieResponse;
import com.movieplatform.movies.entity.Movie;
import com.movieplatform.movies.entity.MovieStatus;
import com.movieplatform.movies.exception.InvalidRequestException;
import com.movieplatform.movies.exception.MovieNotFoundException;
import com.movieplatform.movies.repository.MovieRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class MovieService {

    static final int MAX_PAGE_SIZE = 50;
    static final int MAX_AVAILABILITY_IDS = 100;

    private final MovieRepository repository;
    private final CoverStorageService coverStorage;

    public MovieService(MovieRepository repository, CoverStorageService coverStorage) {
        this.repository = repository;
        this.coverStorage = coverStorage;
    }

    // ---------- Área pública: solo películas publicadas ----------

    public PageResponse<PublicMovieResponse> findPublished(String search, String sort, int page, int size) {
        Pageable pageable = pageRequest(page, size, sortFor(sort));
        Page<Movie> movies = repository.findByStatusAndTitleContainingIgnoreCase(
                MovieStatus.PUBLISHED, normalize(search), pageable);
        return PageResponse.from(movies, PublicMovieResponse::from);
    }

    public PublicMovieResponse findPublishedById(Long id) {
        return repository.findByIdAndStatus(id, MovieStatus.PUBLISHED)
                .map(PublicMovieResponse::from)
                .orElseThrow(() -> new MovieNotFoundException(id));
    }

    /**
     * De una lista de ids, devuelve los que están publicados. Lo usa rental-service para
     * marcar los alquileres activos cuya película salió del catálogo, con una sola llamada.
     */
    public List<Long> findPublishedIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        if (ids.size() > MAX_AVAILABILITY_IDS) {
            throw new InvalidRequestException(
                    "Se pueden consultar hasta " + MAX_AVAILABILITY_IDS + " películas a la vez");
        }
        return repository.findIdsByIdInAndStatus(ids, MovieStatus.PUBLISHED);
    }

    // ---------- Área administrativa: todas las películas ----------

    public PageResponse<MovieResponse> findAll(String search, MovieStatus status, int page, int size) {
        Pageable pageable = pageRequest(page, size, sortFor("recent"));
        String title = normalize(search);
        Page<Movie> movies = status == null
                ? repository.findByTitleContainingIgnoreCase(title, pageable)
                : repository.findByStatusAndTitleContainingIgnoreCase(status, title, pageable);
        return PageResponse.from(movies, MovieResponse::from);
    }

    public MovieResponse findById(Long id) {
        return MovieResponse.from(getMovie(id));
    }

    @Transactional
    public MovieResponse create(MovieRequest request) {
        Movie movie = new Movie(
                request.title().trim(),
                request.description().trim(),
                request.score(),
                request.status());
        return MovieResponse.from(repository.save(movie));
    }

    @Transactional
    public MovieResponse update(Long id, MovieRequest request) {
        Movie movie = getMovie(id);
        movie.update(
                request.title().trim(),
                request.description().trim(),
                request.score(),
                request.status());
        return MovieResponse.from(movie);
    }

    @Transactional
    public void delete(Long id) {
        Movie movie = getMovie(id);
        repository.delete(movie);
        coverStorage.delete(movie.getCoverPath());
    }

    @Transactional
    public MovieResponse updateCover(Long id, MultipartFile file) {
        Movie movie = getMovie(id);
        String previousCover = movie.getCoverPath();
        movie.changeCover(coverStorage.store(file));
        coverStorage.delete(previousCover);
        return MovieResponse.from(movie);
    }

    // ---------- Utilidades ----------

    private Movie getMovie(Long id) {
        return repository.findById(id).orElseThrow(() -> new MovieNotFoundException(id));
    }

    /**
     * Lista blanca de ordenamientos: el cliente no puede ordenar por columnas arbitrarias.
     * El id se usa como desempate para que la paginación sea estable.
     */
    private static Sort sortFor(String sort) {
        return switch (sort == null ? "recent" : sort.trim().toLowerCase()) {
            case "recent" -> Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
            case "score" -> Sort.by(Sort.Order.desc("score"), Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
            default -> throw new InvalidRequestException("Orden no válido: use 'recent' o 'score'");
        };
    }

    private static Pageable pageRequest(int page, int size, Sort sort) {
        return PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), sort);
    }

    private static String normalize(String search) {
        return search == null ? "" : search.trim();
    }
}
