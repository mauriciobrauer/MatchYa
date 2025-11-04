# MatchYa

Aplicación web para gestionar torneos de squash entre dos clubes. Permite registrar partidos, mostrar resultados y gestionar productos promocionados.

## Características

- ✅ Gestión de torneos con múltiples fechas
- ✅ Registro de partidos con resultados y fotos
- ✅ Sistema de jugadores
- ✅ Productos promocionados
- ✅ Panel de administración con autenticación
- ✅ Diseño responsivo
- ✅ Almacenamiento de datos en Turso (libSQL)

## Tecnologías

- **Frontend**: Next.js 14 (App Router) con React y TypeScript
- **Estilos**: TailwindCSS
- **Base de datos**: Turso (libSQL)
- **Hosting**: Vercel
- **Control de versiones**: GitHub

## Configuración

### 1. Prerequisitos

- Node.js 18+ instalado
- Cuenta de Turso para la base de datos
- Repositorio de GitHub
- Cuenta de Vercel

### 2. Configuración de Turso

1. Crea una cuenta en [Turso](https://turso.tech/)
2. Crea una nueva base de datos
3. Obtén la URL de la base de datos y el token de autenticación
4. Ejecuta el script de inicialización:

```bash
node scripts/init-turso.js
```

Esto creará todas las tablas necesarias:
- `tournaments` - Torneos
- `matches` - Partidos
- `players` - Jugadores
- `predictions` - Predicciones
- `products` - Productos

### 3. Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/mauriciobrauer/MatchYa.git
cd MatchYa

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env.local
# Editar .env.local con tus credenciales de Turso:
# TURSO_DATABASE_URL=libsql://...
# TURSO_AUTH_TOKEN=...
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 5. Despliegue en Vercel

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno en Vercel:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
3. Vercel desplegará automáticamente en cada push a la rama principal

## Estructura del proyecto

```
MatchYa/
├── app/
│   ├── api/              # API routes
│   ├── admin/             # Panel de administración
│   ├── tournament/        # Páginas de torneos
│   └── page.tsx           # Página principal
├── components/            # Componentes React
├── lib/
│   └── db.ts             # Configuración de Turso y queries
├── scripts/
│   ├── init-turso.js     # Script para crear tablas
│   └── populate-turso.js # Script para poblar datos de prueba
└── public/               # Archivos estáticos
```

## Uso

### Para administradores

1. Accede a `/admin/login` (contraseña: `dualmeet`)
2. Gestiona torneos, partidos y jugadores desde el panel
3. Crea nuevos torneos con múltiples fechas
4. Agrega partidos con información de jugadores
5. Una vez finalizado el partido, marca el estado como "Finalizado" y agrega los resultados
6. Sube fotos del partido desde tu dispositivo

### Para usuarios

1. Ve la lista de torneos en la página principal
2. Selecciona un torneo para ver los partidos
3. Explora los partidos próximos y finalizados
4. Consulta el resultado global del torneo
5. Explora los productos promocionados

## Desarrollo

### Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## Notas

- Las imágenes se pueden subir desde el dispositivo o usar URLs públicas
- El panel de administración está protegido con contraseña
- La aplicación es completamente responsiva y funciona en móviles, tablets y desktop

## Licencia

MIT
