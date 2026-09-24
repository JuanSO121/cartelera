package com.movieplatform.movies.repository;

import com.movieplatform.movies.entity.Movie;
import com.movieplatform.movies.entity.MovieStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    Page<Movie> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Movie> findByStatusAndTitleContainingIgnoreCase(MovieStatus status, String title, Pageable pageable);

    Optional<Movie> findByIdAndStatus(Long id, MovieStatus status);
}
