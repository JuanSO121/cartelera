package com.movieplatform.movies.repository;

import com.movieplatform.movies.entity.Movie;
import com.movieplatform.movies.entity.MovieStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    Page<Movie> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Movie> findByStatusAndTitleContainingIgnoreCase(MovieStatus status, String title, Pageable pageable);

    Optional<Movie> findByIdAndStatus(Long id, MovieStatus status);

    /** De los ids recibidos, solo los que tienen el estado indicado (una sola consulta). */
    @Query("select m.id from Movie m where m.id in :ids and m.status = :status")
    List<Long> findIdsByIdInAndStatus(@Param("ids") Collection<Long> ids, @Param("status") MovieStatus status);
}
