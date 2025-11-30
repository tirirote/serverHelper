# 🖥️ Server Helper 

# Descripción del Proyecto

El proyecto de Server Helper es una aplicación web cuyo objetivo principal es simular el proceso de creación de un ambiente de trabajo virtual en el cual se pueden crear servidores virtuales.
# backend

Este backend ha sido construido con las siguientes tecnologías:

- **Node.js**: Entorno de ejecución de JavaScript.
- **Express.js**: Framework para la creación de la API.
- **Joi**: Librería para la validación de esquemas de datos.
- **Jest**: Framework de testing para JavaScript.
- **Supertest**: Librería para probar las APIs.
## 🚀 Cómo Empezar 

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local:

1. Clona el repositorio:

```bash
git clone [URL_DEL_REPOSITORIO]
```

2. Navega al directorio del proyecto:

```bash 
cd serverHelper
```


3. Instala las dependencias de Node.js:

```bash
npm install
```

4. Inicia el servidor en modo desarrollo:

```bash
npm start
```


👉 El servidor se iniciará en http://localhost:3000.

## 📡 API 

A continuación se detallan los principales endpoints de la API para interactuar con los recursos del sistema.

  
**Users** `(/api/users)`

- **POST** /api/users: Crea un nuevo usuario.
- **GET** /api/users: Obtiene la lista de todos los usuarios.

**Workspaces** `(/api/workspaces)`

- **POST** /api/workspaces: Crea un nuevo workspace.
- **GET** /api/workspaces: Obtiene todos los workspaces.
- **GET** /api/workspaces/:name: Obtiene un workspace por su nombre.

**Racks** `(/api/racks)`

- **POST** /api/racks: Crea un nuevo rack.
- **DELETE** /api/racks/:workspaceName/:rackName: Elimina un rack de un workspace.

**Components** `(/api/components)`

- **POST** /api/components: Crea un nuevo componente de hardware.
- **GET** /api/components: Obtiene todos los componentes.
- **DELETE** /api/components/:name: Elimina un componente por su nombre.

**Servers** `(/api/servers)`

- **POST** /api/servers: Crea un nuevo servidor con una lista de componentes.
- **GET** /api/servers: Obtiene todos los servidores.
- **GET** /api/servers/:name: Obtiene un servidor por su nombre.
- **GET** /api/servers/:name/components: Obtiene los componentes de un servidor.
- DELETE /api/servers/:name: Elimina un servidor.

## 🧪 Tests

Para ejecutar la suite de tests que garantiza la correcta funcionalidad del backend, utiliza el siguiente comando:

```bash
npm test
```

# Frontend

El frontend está construido con React + Vite y utiliza `axios` para comunicarse con un backend Node/Express expuesto en `/api`.

Puntos clave:

- UI modular basada en componentes y páginas.

- Servicios API centralizados en `src/api/services` que usan `apiClient` (`axios`) configurado por `VITE_API_BASE_URL`.

- Pautas y patrones que ayudan a evitar fetchs infinitos: uso de `useRef` para `activeItem` y manejo de `onSubmit` desde la página (parent) en lugar del propio formulario.

## 🚀 Requisitos

- Tener instalado Node.js (versión recomendada 18 o superior).
- Tener instalado NPM
 - Backend corriendo (ver instrucciones más abajo)

## 🛠️ Instalación y ejecución

1. Instalar dependencias 

```bash
cd frontend
```

```bash
npm install
```

2. Configurar el endpoint del backend (opcional)

Crea un archivo `.env` en `frontend/` con (si quieres cambiar la URL por defecto): 

```
VITE_API_BASE_URL=http://localhost:3000/api
```

Si no configuras `VITE_API_BASE_URL`, la aplicación usará `http://localhost:3000/api` por defecto.  

3. Arrancar el servidor de desarrollo 
```bash
npm run dev
```

4. Para crear un build de producción (todavía no aplicable para esta versión del proyecto)

```bash
npm run build
```

```bash
npm run preview
```
  
## 📡 Conexión con el backend

El frontend está conectado con el backen através de un cliente Axios configurado en `src/api/api.js` con `VITE_API_BASE_URL`.

Implementamos estrucutra de servicios y peticiones HTTP al backend. Estos son los servicios implementados:

  - `src/api/services/networkService.js` — redes (GET/POST/DELETE/GET by name)
  - `src/api/services/workspaceService.js` — workspaces
  - `src/api/services/rackService.js` — racks
  - `src/api/services/serverService.js` — servidores
  - `src/api/services/componentService.js` — componentes

Estructura típica de uso en una página:

- La página `src/pages/*` llama al servicio (`getAll`, `create`, `delete`) y maneja el estado local (lista, detalle `active`), los toasts y el refresco.

- Los formularios (`src/components/form/*`) delegan la responsabilidad de persistencia al `onSubmit` provisto desde la página (no hacen `apiClient.post` directamente), así la página puede:

  - Actualizar el estado local al crear/eliminar

  - Evitar múltiples llamadas de re-render

  - Controlar mensajes y cierre de modales

## 📁 Estructura destacada (frontend)

- `src/api` — cliente `apiClient` y servicios

- `src/components` — componentes reusables, formularios y UI

- `src/pages` — páginas principales de la app (Networks, Workspaces, Shop, Dashboard, Playground, etc.)

- `src/styles` — CSS global y utilidades

- `public/` — archivos estáticos y modelos 3D para la UI 3D

## 🧭 Buenas prácticas y patrones ya usados

- **Parent-controlled persistence**: las páginas realizan las llamadas a la API y las formas llaman a un `onSubmit` pasado desde la página.

Otras buenas prácticas incluyen:

- El uso de `useRef` para `activeItem`: evita re-creaciones de callback y dependencias que causan fetch loops.

- **Formularios**: evita cerrar el modal desde el formulario al inicio; permite a la página cerrar el modal tras validar y persistir la data.

- **Loading state**: los buttons de submit disponen de `isLoading` para evitar dobles envíos.

- **Validación**: Joi (en backend) y validaciones mínimas en frontend (nombres y tipos) para UX.

## 🐞 Problemas comunes y soluciones

Fetchs infinitos en una página:

  - Verifica las dependencias de `useEffect`. Evita incluir objetos que cambian de referencia cada render.

  - Usa `useRef` para `active` o la selección actual si la efect provoca un setState que cambia la dependencia.  

Los cambios guardados en backend no aparecen en la UI:

  - Asegúrate de llamar a una función que actualice el estado local (por ejemplo, `setNetworks(...)`) después del POST/DELETE.

  - En el backend, confirma que `data` persiste en disco y que no se ejecuta en `NODE_ENV=test` por accidente cuando estás probando.

Modelos 3D no cargan en `ModelViewer`:

  - Revisa las rutas dentro de `public/assets` y `typeToModelPath` en formularios.

## 📌 Enlaces rápidos

- API base: `src/api/api.js`

- Servicios: `src/api/services/`

- Páginas: `src/pages/workspaces`, `src/pages/networks`, `src/pages/shop`.

- Formularios: `src/components/form` (componentes, network, workspace, server, etc.)

### Licencia

Licencia Creative Commons CC BY-NC
![[Pasted image 20250825174726.png]]

___
*README* creado con [Obsidian](https://obsidian.md/)