package com.movieplatform.rentals.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Para devolver hay que indicar el correo del alquiler: protección mínima sin sistema de usuarios. */
public record ReturnRequest(

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no es válido")
        String customerEmail
) {
}
