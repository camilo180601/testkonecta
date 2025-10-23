# 💻 Reto Técnico – Sistema de Ventas de Productos Financieros

**Autor:** Camilo López  
**Tecnologías:** Next.js (Fullstack) + Node.js + MySQL  
**Propósito:** Prueba técnica para la evaluación de desarrollo web (Frontend + Backend).  

---

## 🧾 Descripción del Proyecto

Este proyecto es una **prueba técnica** que implementa un **sistema de ventas de productos financieros** para un banco, con autenticación JWT, panel de administración, control de roles y CRUDs completos.

El aplicativo permite:
- Sistema de login con **JWT** y **captcha**.
- Gestión (CRUD) de **usuarios** con roles (“Administrador”, “Asesor”).
- Registro y visualización de **ventas** de productos financieros.
- Estadísticas de ventas y cupos.
- Validaciones en frontend y backend.
- Conexión a **MySQL** mediante `mysql2/promise`.

---

## ⚙️ Tecnologías Utilizadas

| Área | Tecnologías |
|------|--------------|
| **Frontend** | Next.js 14+, React 18, Radix UI, TailwindCSS |
| **Backend** | API Routes de Next.js, Node.js, JWT (`jose`), bcryptjs |
| **Base de Datos** | MySQL (relacional) |
| **ORM / Query Layer** | `mysql2/promise` |
| **Estilos** | TailwindCSS, Shadcn/UI |
| **Otros** | TypeScript, ESLint, .env |

---

## 🧩 Estructura Principal del Proyecto

```
📦 proyecto-nextjs/
 ┣ 📂 app/
 ┃ ┣ 📂 api/               # Endpoints REST (usuarios, ventas, login, etc.)
 ┃ ┣ 📂 dashboard/         # Panel de administración
 ┃ ┗ 📂 login/             # Página de autenticación
 ┣ 📂 components/          # Componentes UI (Select, Sheet, Table, etc.)
 ┣ 📂 lib/                 # Módulos utilitarios (auth, db, utils)
 ┣ 📂 scripts/             # Scripts SQL para crear la base de datos
 ┣ 📄 .env.example         # Plantilla de variables de entorno
 ┣ 📄 README.md            # Documentación del proyecto
 ┣ 📄 package.json
 ┗ 📄 tsconfig.json
```

---

## 🧠 Requisitos Previos

Antes de iniciar, asegúrate de tener instalado:

- **Node.js** `>= 18`
- **MySQL Server** `>= 8.0`
- **npm** o **yarn**
- (Opcional) **Docker** si deseas levantar MySQL en contenedor

---

## 🚀 Instrucciones de Instalación y Ejecución

### 1️⃣ Clonar el repositorio

```bash
git clone <repo_url>
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Crear el archivo `.env`

Crea un archivo `.env` en la raíz del proyecto **basado en `.env.example`**:

```bash
cp .env.example .env
```

Luego, edita el archivo `.env` con tus credenciales locales:

```env
JWT_SECRET=clave-ultra-secreta
DATABASE_URL=mysql://usuario:password@localhost:3306/banco_productos
```

---

### 4️⃣ Crear la base de datos

Ejecuta el script SQL incluido en `/scripts` para crear la base de datos con sus tablas

El script crea la base de datos y las tablas:
- `usuarios`
- `roles`
- `productos`
- `ventas`
- `historial_estados`
- `franquicias`
- `estados_venta`

---

### 5️⃣ Iniciar el servidor de desarrollo

```bash
npm run dev
```

Accede a la aplicación en:

👉 [http://localhost:3000](http://localhost:3000)

---

## 🔐 Credenciales Iniciales

Una vez ejecutado el script SQL, tendrás un usuario administrador predefinido:

| Campo | Valor |
|-------|--------|
| **Email** | `admin@banco.com` |
| **Contraseña** | `admin` |

---

## 🧮 Módulos y Funcionalidades

### 🔑 Autenticación
- Inicio de sesión con JWT.
- Verificación de token en cada request (`Authorization: Bearer <token>`).
- Captcha numérico simple desde backend.

### 👤 Usuarios (CRUD)
- Listado, creación, edición y eliminación.
- Roles: `Administrador`, `Asesor`.
- Validaciones de correo y contraseña con bcryptjs.

### 💸 Ventas (CRUD)
- Registro de productos financieros:
  - Crédito de Consumo
  - Libranza Libre Inversión
  - Tarjeta de Crédito
- Validaciones dinámicas:
  - `Tasa` solo si aplica.
  - `Franquicia` solo para tarjetas.
- Historial de estados (`Abierto`, `En Proceso`, `Finalizado`).
- Sumatoria automática de cupo total.

### 📊 Estadísticas (Dashboard)
- Ventas por asesor.
- Cupos por producto.
- Ventas por fecha.

---

## 🧪 Scripts Disponibles

| Comando | Descripción |
|----------|--------------|
| `npm run dev` | Ejecuta el servidor Next.js en modo desarrollo |
| `npm run build` | Compila el proyecto para producción |
| `npm start` | Inicia el servidor en producción |
| `npm run lint` | Corre la validación de ESLint |

---

## 🧑‍💻 Autor

**Camilo López**  
Desarrollador Fullstack – Node.js / React.js  
📧 [camilo06180401@gmail.com](mailto:camilo06180401@gmail.com)  
📍 Colombia  

---

## 🧾 Licencia

Este proyecto fue desarrollado como **prueba técnica**.  
Su uso es educativo y de demostración únicamente.

---

> “La mejor manera de demostrar conocimiento es construyendo.”

