# Proyecto USB Radio

![Logo de USB Radio](/src/img/favicon.png)

## Descripción

USB Radio es una plataforma de radio en línea que conecta a la comunidad Bonaventuriana. Actualmente, el proyecto se encuentra en fase de pruebas con varias funcionalidades pendientes de desarrollo.

## Proyecto Aún Pendiente en Fase de Pruebas

En esta sección se detallan los procesos que están pendientes y en fase de pruebas para mejorar la funcionalidad de USB Radio.

### Procesos Pendientes

1. **API de Reconocimiento Musical**  
   Integrar una API que identifique la canción en reproducción y extraiga la metadata correspondiente, como:

   - Información del artista.
   - Servicios de streaming donde la canción está disponible.
   - Contenido relevante o artistas similares.

2. **Entrega de Metadata**  
   La metadata puede ser obtenida mediante:

   - Una ID key de [MusicBrainz](https://musicbrainz.org/).
   - La API de [LastFM](https://www.last.fm/api).

3. **Transformación de contenido (Voz - Texto)**  
   Mediante la API de Google Cloud ( Speech to Text ) convertir la voz de la transmisión
   a contenido tipo texto.

   - Identificar si es una canción o un podcast y activar el servicio.
   - Convertir los datos de voz de la transmision a subtitulos o texto.

4. **Base de Datos de Usuarios**  
   Desarrollar una pequeña base de datos para almacenar la información de los usuarios registrados en el sitio. Esta base de datos facilitará:
   - La personalización de la experiencia de los usuarios.
   - El seguimiento de las preferencias musicales.
   - La implementación de funcionalidades adicionales basadas en la actividad de los usuarios.

---

## Interfaz Actual

Aquí se presenta la interfaz que está en funcionamiento en la versión actual de USB Radio.
Actualmente realiza peticiones cada 10 segundos al servidor de AzuraCast para actualizar la
información de la radio.

![Interfaz de la aplicación](/src/img/Interfaz/1.PNG)

### Características Actuales

- Transmisión en vivo de la radio.
- Información en tiempo real sobre la canción actual y el artista.
- Control de volumen y reproducción.

## Secciones Pendientes

En esta sección se describen las partes de la aplicación que aún están en desarrollo o pendientes de implementación.

![Secciones pendientes](/src/img/Interfaz/2.PNG)

### Características por Implementar

- Integración del sistema de recomendaciones (usuario).
- Subtitulos en las transmisiones Podcast.
- Adicionar metadata y contenido relacionado con la cancion en emision a tiempo real.

---

### Contacto

Para más información, puedes contactarnos en [usbradio@usbbog.edu.co](mailto:usbradio@usbbog.edu.co).
