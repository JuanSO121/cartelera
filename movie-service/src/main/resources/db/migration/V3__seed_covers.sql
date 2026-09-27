-- Asigna las portadas de prueba (src/main/resources/seed-covers) a las películas de V2.
-- SeedCoverInitializer las copia a la carpeta de portadas como "seed-<nombre>.jpg".
-- Solo afecta a las que aún no tienen portada, para no pisar una subida desde el admin.
-- Si falta algún archivo, el frontend muestra el fondo de color generado.

UPDATE movies SET cover_path = 'seed-' || c.file
FROM (VALUES
    ('Wicked: Por siempre',                            'wicked-por-siempre.jpg'),
    ('Zootopia 2',                                     'zootopia-2.jpg'),
    ('Avatar: Fuego y cenizas',                        'avatar-fuego-y-cenizas.jpg'),
    ('Proyecto Salvación',                             'proyecto-salvacion.jpg'),
    ('Super Mario Galaxy: La película',                'super-mario-galaxy.jpg'),
    ('Michael',                                        'michael.jpg'),
    ('El diablo viste a la moda 2',                    'el-diablo-viste-a-la-moda-2.jpg'),
    ('Obsesión',                                       'obsesion.jpg'),
    ('The Mandalorian and Grogu',                      'the-mandalorian-and-grogu.jpg'),
    ('Toy Story 5',                                    'toy-story-5.jpg'),
    ('Supergirl',                                      'supergirl.jpg'),
    ('Minions y monstruos',                            'minions-y-monstruos.jpg'),
    ('Moana',                                          'moana.jpg'),
    ('La Odisea',                                      'la-odisea.jpg'),
    ('Spider-Man: Un nuevo día',                       'spider-man-un-nuevo-dia.jpg'),
    ('La isla olvidada',                               'la-isla-olvidada.jpg'),
    ('Los juegos del hambre: Amanecer en la cosecha',  'juegos-del-hambre-amanecer-en-la-cosecha.jpg'),
    ('Avengers: Doomsday',                             'avengers-doomsday.jpg'),
    ('Dune: Parte tres',                               'dune-parte-tres.jpg')
) AS c(title, file)
WHERE movies.title = c.title
  AND movies.cover_path IS NULL;
