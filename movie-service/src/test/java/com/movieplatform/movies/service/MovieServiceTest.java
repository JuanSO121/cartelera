package com.movieplatform.movies.service;

import com.movieplatform.movies.entity.MovieStatus;
import com.movieplatform.movies.exception.InvalidRequestException;
import com.movieplatform.movies.exception.MovieNotFoundException;
import com.movieplatform.movies.repository.MovieRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MovieServiceTest {

    @Mock
    private MovieRepository repository;

    @Mock
    private CoverStorageService coverStorage;

    @InjectMocks
    private MovieService movieService;

    @Test
    void publicListOnlyQueriesPublishedMoviesAndTrimsSearch() {
        when(repository.findByStatusAndTitleContainingIgnoreCase(eq(MovieStatus.PUBLISHED), eq("matrix"), any(Pageable.class)))
                .thenReturn(Page.empty());

        movieService.findPublished("  matrix  ", "recent", 0, 12);

        verify(repository).findByStatusAndTitleContainingIgnoreCase(eq(MovieStatus.PUBLISHED), eq("matrix"), any(Pageable.class));
    }

    @Test
    void sortByScoreOrdersByHighestScoreFirst() {
        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        when(repository.findByStatusAndTitleContainingIgnoreCase(eq(MovieStatus.PUBLISHED), eq(""), pageable.capture()))
                .thenReturn(Page.empty());

        movieService.findPublished("", "score", 0, 12);

        Sort.Order order = pageable.getValue().getSort().getOrderFor("score");
        assertThat(order).isNotNull();
        assertThat(order.isDescending()).isTrue();
    }

    @Test
    void pageSizeIsLimited() {
        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        when(repository.findByStatusAndTitleContainingIgnoreCase(eq(MovieStatus.PUBLISHED), eq(""), pageable.capture()))
                .thenReturn(Page.empty());

        movieService.findPublished("", "recent", 0, 500);

        assertThat(pageable.getValue().getPageSize()).isEqualTo(MovieService.MAX_PAGE_SIZE);
    }

    @Test
    void unknownSortIsRejected() {
        assertThatThrownBy(() -> movieService.findPublished("", "title", 0, 12))
                .isInstanceOf(InvalidRequestException.class);

        verifyNoInteractions(repository);
    }

    @Test
    void draftMovieIsNotVisibleInPublicArea() {
        when(repository.findByIdAndStatus(1L, MovieStatus.PUBLISHED)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> movieService.findPublishedById(1L))
                .isInstanceOf(MovieNotFoundException.class);
    }
}
