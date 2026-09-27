-- Alquileres de ejemplo para el correo demo@cartelera.test: uno activo, uno vencido y uno devuelto.
-- Los movie_id corresponden al orden de inserción de V2 en movie-service:
-- 10 Toy Story 5, 14 La Odisea, 6 Michael.

INSERT INTO rentals (movie_id, movie_title, customer_name, customer_email, rented_at, due_date, returned_at, status) VALUES
(10, 'Toy Story 5', 'Cliente Demo', 'demo@cartelera.test', now() - interval '5 hours',  now() + interval '43 hours', NULL, 'ACTIVE'),
(14, 'La Odisea',   'Cliente Demo', 'demo@cartelera.test', now() - interval '3 days',   now() - interval '1 day',   NULL, 'ACTIVE'),
(6,  'Michael',     'Cliente Demo', 'demo@cartelera.test', now() - interval '10 days',  now() - interval '8 days',  now() - interval '9 days', 'RETURNED');
