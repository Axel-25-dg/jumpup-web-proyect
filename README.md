<h1 align="center">Universidad Tecnológica Equinoccial</h1>
<h2 align="center">Escuela de Tecnologías</h2>
<h3 align="center">Carrera de Desarrollo de Software</h3>
<p align="center">
  <br>
  <img src="src/assets/logo_ute.jpg" width="180" alt="Logo UTE"/>
</p>

# JumpUp Idiomas - Web App React

Aplicación web de aprendizaje de idiomas desarrollada con **ReactJS**, conectada a un backend **Django REST Framework**.

---

## Información del Proyecto

### Integrantes - Desarrolladores
- **Danny Guamán**
- **Alex Macias**
- **Ariel Paucar**

### ¿Para qué sirve?
**JumpUp Idiomas** es una plataforma educativa web diseñada para facilitar y enriquecer el proceso de aprendizaje de idiomas extranjeros de forma interactiva y dinámica.

El proyecto sirve para:
- Proporcionar a los estudiantes un entorno de aprendizaje adaptativo, donde pueden completar módulos y lecciones asignados por sus docentes de manera autónoma.
- Consolidar conocimientos mediante ejercicios evaluados en tiempo real (lectura, audio y materiales adicionales) y minijuegos educativos.
- Reforzar la expresión oral y la conversación.
- Gamificar la educación, motivando a los alumnos a través del seguimiento de niveles, recolección de puntos de experiencia (XP), mantenimiento de rachas diarias y obtención de logros para escalar en la tabla de clasificación.
- Facilitar a los docentes herramientas efectivas de creación de contenido, subida de recursos (videos, imágenes, PDF), administración de solicitudes en aulas y visualización de reportes de progreso.

### ¿Cómo funciona?
El ecosistema de la plataforma se compone de dos partes integradas:

1. **Frontend Aplicación Web**: Desarrollada en **ReactJS** con **TypeScript**, ofrece una experiencia de usuario moderna y reactiva. Gestiona los estados locales y globales mediante **Zustand** y realiza llamadas HTTP eficientes hacia la API usando **Axios**.
2. **Backend API de Datos**: Desarrollado bajo **Django REST Framework**, procesa la persistencia de datos (usuarios, progreso, rankings, cursos), la seguridad mediante autenticación basada en tokens JWT y las funcionalidades asíncronas.
3. **Flujos de Trabajo Principales**:
   - **Registro e Ingreso**: Los usuarios ingresan con sus credenciales y el sistema valida su rol (Estudiante, Profesor o Administrador).
   - **Flujo Estudiante**: Visualizan sus aulas inscritas. Al ingresar a una, progresan resolviendo lecciones y cuestionarios.
   - **Flujo Profesor/Admin**: Crean cursos, programan sesiones virtuales, aprueban las solicitudes de inscripción de nuevos estudiantes y suben materiales digitales que sirven como recursos didácticos de clase.
   - **Comunicación en Tiempo Real**: Incorpora un chat comunitario y notificaciones instantáneas mediante WebSockets.

---

## Funcionalidades Detalladas

### Módulo de Estudiante
- Acceso a cursos inscritos, módulos y lecciones por aula.
- Cuestionarios interactivos con repetición de errores y temporizador.
- Gamificación: XP, niveles, rachas diarias y logros desbloqueables.
- Minijuegos: Flashcards, Ahorcado, Trivia, Memory, Sopa de letras y Roleplay IA.
- Ingreso a clases virtuales desde el aula asignada.
- Descarga y visualización de recursos por lección: documentos, videos y links.
- Catálogo de cursos con carrito de compras e historial de pedidos.
- Ranking global y clasificaciones por curso.

### Módulo de Profesor / Admin
- Crear, editar y eliminar cursos con imagen.
- Gestión de aulas: inscripción de estudiantes y solicitudes.
- Creación y edición de módulos y lecciones del currículo.
- Subida de recursos
- Programar y gestionar sesiones en vivo con código de acceso.
- Reportes de progreso por aula.
- Gestión de usuarios y certificados.

### Módulo Social
- Feed comunitario con publicaciones y comentarios.
- Notificaciones en tiempo real.
- Búsqueda de cursos, usuarios y contenido.

---

## Requisitos previos

- Node.js `>= 18.x`
- npm `>= 9.x` o yarn `>= 1.22`
- Git

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Axel-25-dg/jumpup-web-proyect.git
cd jumpup-web-proyect

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

---

## Últimas actualizaciones

- Implementación de **Arquitectura Limpia** con separación en capas: dominio, aplicación, infraestructura y presentación.
- **Autenticación JWT** con manejo de sesión mediante Zustand, almacenamiento seguro de tokens y refresco automático.
- **Control de acceso por roles** (Estudiante, Profesor, Administrador) con rutas protegidas y menú adaptativo.
- **CRUD completo** de usuarios, cursos, módulos, lecciones, ejercicios, categorías, productos, catálogo, órdenes de compra, foro, anuncios, certificados, aulas y sesiones en vivo.
- **E-commerce integrado**: carrito de compras, historial de pedidos y gestión de órdenes desde el panel admin.
- **Subida de recursos multimedia** mediante FormData para cursos y materiales didácticos.
- **Generación y verificación de certificados** en formato PDF con visualización desde la plataforma.
- **Panel de administración completo** con tablas paginadas, formularios de creación/edición y acciones por rol.
- **Foro comunitario** con categorías, hilos y publicaciones.
- **Sesiones en vivo** con gestión de participantes, inicio y finalización desde el panel admin.

---

## Configuración y Variables de Entorno

La aplicación web se conecta al backend mediante la siguiente URL base de la API:

```
https://guaman-idiomas-ute.online/api
```

Para cambiar la configuración del servidor, cree un archivo `.env` en la raíz del proyecto con la siguiente variable:

```env
VITE_API_BASE_URL=https://guaman-idiomas-ute.online/api
```
---

## Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Estudiante | test@student.com | Clave1234! |
| Profesor | test@teacher.com | Clave1234! |
| Administrador | admin@jumpup.com | Clave1234! |

*Las credenciales reales deben ser proporcionadas por el equipo de desarrollo.*

---

## Conexión a la API y Endpoints principales

La aplicación consume servicios RESTful utilizando la biblioteca **Axios** en React. A continuación, se detallan los endpoints agrupados por su respectiva funcionalidad:

<details>
<summary><strong>Autenticación</strong></summary>
<br>

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login/` | Inicio de sesión |
| POST | `/api/auth/register/` | Registro de usuario |
| POST | `/api/auth/logout/` | Cierre de sesión |
| POST | `/api/auth/token/refresh/` | Refrescar JWT |
| GET | `/api/auth/me/` | Datos del usuario autenticado |

</details>

<details>
<summary><strong>Usuarios (Admin)</strong></summary>
<br>

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/users/` | Listar usuarios |
| POST | `/api/users/` | Crear usuario |
| GET | `/api/users/{id}/` | Detalle de usuario |
| PATCH | `/api/users/{id}/` | Actualizar usuario |
| DELETE | `/api/users/{id}/` | Eliminar usuario |

</details>

<details>
<summary><strong>Contenido educativo</strong></summary>
<br>

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/languages/` | Idiomas disponibles |
| GET/POST | `/api/courses/` | Cursos |
| GET/PATCH/DELETE | `/api/courses/{id}/` | Detalle/editar/eliminar curso |
| GET/POST | `/api/modules/` | Módulos de un curso |
| GET/PATCH/DELETE | `/api/modules/{id}/` | Detalle/editar/eliminar módulo |
| GET/POST | `/api/lessons/` | Lecciones de un módulo |
| GET/PATCH/DELETE | `/api/lessons/{id}/` | Detalle/editar/eliminar lección |
| GET/POST | `/api/exercises/` | Ejercicios de una lección |
| GET/PATCH/DELETE | `/api/exercises/{id}/` | Detalle/editar/eliminar ejercicio |
| POST | `/api/exercises/{id}/validar/` | Validar respuesta |
| GET | `/api/resources/?lesson={id}&classroom={id}` | Recursos por lección |

</details>

<details>
<summary><strong>Categorías</strong></summary>
<br>

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/categories/` | Listar categorías |
| POST | `/api/categories/` | Crear categoría |
| GET | `/api/categories/{id}/` | Detalle de categoría |
| PATCH | `/api/categories/{id}/` | Actualizar categoría |
| DELETE | `/api/categories/{id}/` | Eliminar categoría |

</details>

<details>
<summary><strong>Productos y Catálogo</strong></summary>
<br>

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/products/` | Productos (con filtros y paginación) |
| GET | `/api/products/{id}/` | Detalle de producto |
| GET | `/api/catalogo/` | Catálogo de productos (CRUD admin) |
| POST | `/api/catalogo/` | Crear producto en catálogo |
| PATCH | `/api/catalogo/{id}/` | Actualizar producto |
| DELETE | `/api/catalogo/{id}/` | Eliminar producto del catálogo |

</details>

<details>
<summary><strong>E-commerce</strong></summary>
<br>

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/cart/` | Ver carrito |
| POST | `/api/cart/add/` | Agregar al carrito |
| DELETE | `/api/cart/{id}/remove/` | Eliminar del carrito |
| POST | `/api/orders/` | Crear orden (compra) |
| GET | `/api/orders/` | Historial de órdenes |
| GET | `/api/orders/{id}/` | Detalle de orden |
| GET | `/api/ordenes-compra/` | Órdenes de compra (admin) |
| GET | `/api/ordenes-compra/{id}/` | Detalle de orden (admin) |

</details>

<details>
<summary><strong>Aulas y sesiones</strong></summary>
<br>

| Método | Endpoint | Descripción |
|---|---|---|
| GET/POST | `/api/classrooms/` | Aulas |
| POST | `/api/classrooms/join/` | Unirse con código |
| GET/PATCH/DELETE | `/api/classrooms/{id}/` | Detalle/editar/eliminar aula |
| GET/POST | `/api/live-sessions/` | Sesiones en vivo |
| GET/PATCH/DELETE | `/api/live-sessions/{id}/` | Detalle/editar/eliminar sesión |
| POST | `/api/live-sessions/{id}/start/` | Iniciar sesión |
| POST | `/api/live-sessions/{id}/end/` | Finalizar sesión |
| GET | `/api/live-sessions/{id}/participants/` | Participantes de la sesión |

</details>

<details>
<summary><strong>Foro</strong></summary>
<br>

| Método | Endpoint | Descripción |
|---|---|---|
| GET/POST | `/api/forum/categories/` | Categorías del foro |
| GET/PATCH/DELETE | `/api/forum/categories/{id}/` | Detalle/editar/eliminar categoría |
| GET/POST | `/api/forum/threads/` | Hilos del foro |
| GET/PATCH/DELETE | `/api/forum/threads/{id}/` | Detalle/editar/eliminar hilo |
| GET/POST | `/api/forum/posts/` | Publicaciones del foro |
| GET/PATCH/DELETE | `/api/forum/posts/{id}/` | Detalle/editar/eliminar publicación |

</details>

<details>
<summary><strong>Anuncios</strong></summary>
<br>

| Método | Endpoint | Descripción |
|---|---|---|
| GET/POST | `/api/announcements/` | Anuncios |
| GET/PATCH/DELETE | `/api/announcements/{id}/` | Detalle/editar/eliminar anuncio |

</details>

<details>
<summary><strong>Certificados</strong></summary>
<br>

| Método | Endpoint | Descripción |
|---|---|---|
| GET/POST | `/api/certificates/` | Certificados |
| GET | `/api/certificates/{id}/` | Detalle de certificado |
| PATCH | `/api/certificates/{id}/` | Editar certificado |
| POST | `/api/certificates/issue/` | Emitir certificado |
| GET | `/api/certificates/verify/{code}/` | Verificar certificado por código |

</details>

<details>
<summary><strong>Progreso y Gamificación</strong></summary>
<br>

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/progress/summary/` | Resumen de progreso |
| POST | `/api/progress/` | Registrar progreso |
| GET | `/api/stats/` | XP, rachas y nivel |
| GET | `/api/achievements/` | Logros disponibles |
| GET | `/api/my-achievements/` | Mis logros |
| GET | `/api/ranking/` | Tabla de clasificación |

</details>

---

## Estructura del Proyecto

```
src/
├── domain/                    # Capa de dominio (reglas de negocio)
│   ├── entities/              #   Entidades del negocio
│   └── ports/                 #   Interfaces de repositorio (contratos)
│
├── application/               # Capa de aplicación (casos de uso)
│   ├── dtos/                  #   Data Transfer Objects
│   └── use-cases/             #   Casos de uso (auth, course, product, etc.)
│
├── infrastructure/            # Capa de infraestructura (implementaciones)
│   ├── config/                #   Configuración de API
│   ├── http/                  #   Cliente Axios, parseo de errores
│   ├── storage/               #   Almacenamiento local de tokens
│   ├── adapters/              #   Implementaciones de repositorios (Axios)
│   └── factories/             #   Fábricas (wiring de dependencias)
│
└── presentation/              # Capa de presentación (UI)
    ├── theme/                 #   Colores y estilos
    ├── utils/                 #   Funciones utilitarias
    ├── store/                 #   Estado global con Zustand
    ├── router/                #   React Router con rutas protegidas
    ├── components/            #   Componentes reutilizables
    └── pages/                 #   Páginas de la aplicación
```

---

## Comandos útiles

```bash
npm run dev              # Iniciar servidor de desarrollo (Vite)
npm run build            # Compilar para producción
npm run preview          # Previsualizar build de producción
npm run lint             # Analizar código con oxlint
```

---

## Roles y control de acceso

| Rol | Rutas accesibles | Permisos |
|---|---|---|
| **Estudiante** | `/dashboard`, `/courses`, `/forum`, `/cart`, `/profile`, etc. | Visualizar cursos, comprar, participar en foro, ver progreso |
| **Profesor** | `/teacher/` | Crear/editar cursos, gestionar aulas, subir recursos, programar sesiones |
| **Administrador** | `/admin/` | CRUD completo de usuarios, cursos, certificados, catálogo, foro, anuncios, aulas, sesiones en vivo |

### Protección de rutas
- Las rutas públicas (`/`, `/catalog`, `/products/:id`) son accesibles sin autenticación.
- Las rutas de autenticación (`/login`, `/register`) redirigen al dashboard si el usuario ya está logueado.
- Las rutas de estudiante requieren rol `student`.
- Las rutas de profesor requieren rol `teacher`.
- Las rutas de administración requieren rol `admin`.
- El componente `ProtectedRoute` valida el token y el rol antes de renderizar cualquier ruta privada.

---

## Soporte

¿Problemas o sugerencias? 

Comunicate con nuestros desarrolladores.