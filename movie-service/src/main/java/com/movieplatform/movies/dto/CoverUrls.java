package com.movieplatform.movies.dto;

final class CoverUrls {

    private static final String PREFIX = "/uploads/";

    private CoverUrls() {
    }

    static String of(String coverPath) {
        return coverPath == null ? null : PREFIX + coverPath;
    }
}
