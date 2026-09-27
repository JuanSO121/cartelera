# ---------- Compilación ----------
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Primero solo lo necesario para descargar dependencias: Docker reutiliza esta capa
# mientras el pom.xml no cambie, y las siguientes compilaciones son mucho más rápidas.
COPY .mvn .mvn
COPY mvnw pom.xml ./
# Si el repositorio se clonó en Windows, mvnw puede traer saltos de línea CRLF y fallar en Linux.
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -q -B dependency:go-offline

COPY src src
# Las pruebas se ejecutan aparte (mvnw test); aquí no hay base de datos disponible.
RUN ./mvnw -q -B package -DskipTests

# ---------- Ejecución ----------
FROM eclipse-temurin:25-jre
WORKDIR /app

# Usuario sin privilegios: el proceso no corre como root dentro del contenedor.
RUN useradd --system --create-home app && mkdir -p /app/uploads && chown app /app/uploads
COPY --from=build /app/target/*.jar app.jar
USER app

EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
