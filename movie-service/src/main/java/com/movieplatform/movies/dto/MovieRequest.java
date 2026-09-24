package com.movieplatform.movies.dto;

import com.movieplatform.movies.entity.MovieStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record MovieRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
        String title,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(max = 2000, message = "La descripción no puede superar 2000 caracteres")
        String description,

        @NotNull(message = "El puntaje es obligatorio")
        @DecimalMin(value = "0.0", message = "El puntaje mínimo es 0")
        @DecimalMax(value = "10.0", message = "El puntaje máximo es 10")
        @Digits(integer = 2, fraction = 1, message = "El puntaje admite un solo decimal")
        BigDecimal score,

        @NotNull(message = "El estado es obligatorio")
        MovieStatus status
) {
}
