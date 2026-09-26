package com.movieplatform.rentals.controller;

import com.movieplatform.rentals.dto.RentalRequest;
import com.movieplatform.rentals.dto.RentalResponse;
import com.movieplatform.rentals.dto.ReturnRequest;
import com.movieplatform.rentals.service.RentalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@Tag(name = "Alquileres", description = "Alquiler de películas sin sistema de usuarios")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Alquilar una película publicada")
    public RentalResponse rent(@Valid @RequestBody RentalRequest request) {
        return rentalService.rent(request);
    }

    @GetMapping
    @Operation(summary = "Alquileres de un correo, del más reciente al más antiguo")
    public List<RentalResponse> findByEmail(
            @RequestParam @NotBlank(message = "El correo es obligatorio")
            @Email(message = "El correo no es válido") String email) {
        return rentalService.findByEmail(email);
    }

    @PatchMapping("/{id}/return")
    @Operation(summary = "Devolver un alquiler (requiere el correo con que se alquiló)")
    public RentalResponse returnRental(@PathVariable Long id, @Valid @RequestBody ReturnRequest request) {
        return rentalService.returnRental(id, request.customerEmail());
    }
}
