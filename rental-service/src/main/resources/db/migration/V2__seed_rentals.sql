-- Alquileres de ejemplo para el correo demo@cartelera.test: uno activo, uno vencido y uno devuelto.
-- Los movie_id corresponden a los datos de prueba de movie-service (16 Dune, 15 Oppenheimer, 1 El Padrino).

INSERT INTO rentals (movie_id, movie_title, customer_name, customer_email, rented_at, due_date, returned_at, status) VALUES
(16, 'Dune: Parte dos', 'Cliente Demo', 'demo@cartelera.test', now() - interval '5 hours',  now() + interval '43 hours', NULL, 'ACTIVE'),
(15, 'Oppenheimer',     'Cliente Demo', 'demo@cartelera.test', now() - interval '3 days',   now() - interval '1 day',   NULL, 'ACTIVE'),
(1,  'El Padrino',      'Cliente Demo', 'demo@cartelera.test', now() - interval '10 days',  now() - interval '8 days',  now() - interval '9 days', 'RETURNED');
