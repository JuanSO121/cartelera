-- Datos de prueba. Las películas en DRAFT tienen puntajes altos a propósito:
-- si aparecieran en el área pública al ordenar por puntaje, el filtro estaría fallando.

INSERT INTO movies (title, description, score, status, created_at, updated_at) VALUES
('El Padrino', 'El patriarca de una familia de la mafia de Nueva York cede el control de su imperio a su hijo menor, que al principio quería mantenerse al margen.', 9.2, 'PUBLISHED', now() - interval '320 days', now() - interval '320 days'),
('Interestelar', 'Un grupo de exploradores viaja a través de un agujero de gusano en busca de un nuevo hogar para una humanidad al borde de la extinción.', 8.7, 'PUBLISHED', now() - interval '290 days', now() - interval '290 days'),
('El viaje de Chihiro', 'Una niña queda atrapada en un mundo de espíritus y debe trabajar en una casa de baños para liberar a sus padres.', 8.6, 'PUBLISHED', now() - interval '260 days', now() - interval '260 days'),
('Parásitos', 'Una familia sin empleo se infiltra poco a poco en el hogar de una familia adinerada, con consecuencias inesperadas.', 8.5, 'PUBLISHED', now() - interval '230 days', now() - interval '230 days'),
('Matrix', 'Un programador descubre que la realidad que conoce es una simulación y se une a la resistencia contra las máquinas.', 8.7, 'PUBLISHED', now() - interval '200 days', now() - interval '200 days'),
('Origen', 'Un ladrón que roba secretos a través de los sueños recibe el encargo contrario: implantar una idea en la mente de alguien.', 8.8, 'PUBLISHED', now() - interval '180 days', now() - interval '180 days'),
('Coco', 'Un niño que sueña con ser músico cruza al mundo de los muertos durante el Día de Muertos para descubrir la historia de su familia.', 8.4, 'PUBLISHED', now() - interval '160 days', now() - interval '160 days'),
('El laberinto del fauno', 'En la España de la posguerra, una niña se refugia en un mundo fantástico mientras enfrenta la crueldad de su padrastro.', 8.2, 'PUBLISHED', now() - interval '140 days', now() - interval '140 days'),
('Whiplash', 'Un joven baterista de jazz se somete a los métodos extremos de un profesor obsesionado con la perfección.', 8.5, 'PUBLISHED', now() - interval '120 days', now() - interval '120 days'),
('Mad Max: Furia en la carretera', 'En un desierto postapocalíptico, una guerrera y un vagabundo huyen de un tirano en una persecución sin descanso.', 8.1, 'PUBLISHED', now() - interval '100 days', now() - interval '100 days'),
('Relatos salvajes', 'Seis historias independientes sobre personas comunes que pierden el control ante situaciones límite.', 8.1, 'PUBLISHED', now() - interval '85 days', now() - interval '85 days'),
('Amores perros', 'Un accidente de tránsito en Ciudad de México conecta las vidas de tres personas de mundos muy distintos.', 8.0, 'PUBLISHED', now() - interval '70 days', now() - interval '70 days'),
('Toy Story', 'Los juguetes de un niño cobran vida cuando nadie los ve, y la llegada de un nuevo juguete pone a prueba su amistad.', 8.3, 'PUBLISHED', now() - interval '55 days', now() - interval '55 days'),
('La La Land', 'Una aspirante a actriz y un pianista de jazz se enamoran mientras persiguen sus sueños en Los Ángeles.', 8.0, 'PUBLISHED', now() - interval '40 days', now() - interval '40 days'),
('Oppenheimer', 'La historia del físico que dirigió el desarrollo de la bomba atómica y de las consecuencias que cargó después.', 8.3, 'PUBLISHED', now() - interval '20 days', now() - interval '20 days'),
('Dune: Parte dos', 'Paul Atreides se une a los Fremen en el desierto de Arrakis para vengarse de quienes destruyeron a su familia.', 8.5, 'PUBLISHED', now() - interval '5 days', now() - interval '5 days'),
('Pulp Fiction', 'Varias historias de criminales de Los Ángeles se entrecruzan en un relato contado fuera de orden.', 8.9, 'DRAFT', now() - interval '3 days', now() - interval '3 days'),
('El club de la pelea', 'Un oficinista con insomnio y un vendedor de jabón fundan un club clandestino de peleas que se sale de control.', 8.8, 'DRAFT', now() - interval '2 days', now() - interval '2 days'),
('Blade Runner 2049', 'Un cazador de replicantes descubre un secreto enterrado que podría cambiar el orden de la sociedad.', 8.0, 'DRAFT', now() - interval '1 day', now() - interval '1 day');
