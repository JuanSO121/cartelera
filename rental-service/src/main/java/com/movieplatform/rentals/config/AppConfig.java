package com.movieplatform.rentals.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
@EnableConfigurationProperties(RentalProperties.class)
public class AppConfig {

    /** Reloj inyectable: en producción es el del sistema; en las pruebas, uno fijo. */
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
