# Frontend — Serverhelper

Bienvenido al frontend de Serverhelper. Este README explica cómo configurar y ejecutar la aplicación React (Vite), describe la estructura del frontend y explica las pautas de integración con el backend y los servicios de API.

---

## 🔎 Descripción general

El frontend está construido con React + Vite y utiliza `axios` para comunicarse con un backend Node/Express expuesto en `/api`.

Puntos clave:
- UI modular basada en componentes y páginas.
- Servicios API centralizados en `src/api/services` que usan `apiClient` (`axios`) configurado por `VITE_API_BASE_URL`.
- Pautas y patrones que ayudan a evitar fetchs infinitos: uso de `useRef` para `activeItem` y manejo de `onSubmit` desde la página (parent) en lugar del propio formulario.

---

## 🚀 Requisitos

- Node.js (Recomendado 18+)
- npm (o yarn) instalado
- Backend corriendo (ver instrucciones más abajo)

---

## 🛠️ Instalación y ejecución

1. Instalar dependencias

```bash
cd frontend
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

4. Para crear un build de producción

```bash
npm run build
npm run preview
```

---

## 📡 Conexión con el backend

- El cliente Axios está configurado en `src/api/api.js` con `VITE_API_BASE_URL`.
- Servicios comunes:
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

Ejemplo rápido (conceptual):

```jsx
// PARENT PAGE
const handleCreate = async (payload) => {
  const created = await createComponent(payload);
  setComponents(prev => [created, ...prev]);
};

<NewComponentForm onSubmit={handleCreate} onClose={() => setModalOpen(false)} />

// FORM
const NewComponentForm = ({ onSubmit, onClose }) => {
  const handleSubmit = async (data) => {
    await onSubmit(data);
    onClose();
  };
};
```

---

## 📁 Estructura destacada (frontend)

- `src/api` — cliente `apiClient` y servicios
- `src/components` — componentes reusables, formularios y UI
- `src/pages` — páginas principales de la app (Networks, Workspaces, Shop, Dashboard, Playground, etc.)
- `src/styles` — CSS global y utilidades
- `public/` — archivos estáticos y modelos 3D para la UI 3D

---

## 🧭 Buenas prácticas y patrones ya usados

- Parent-controlled persistence: las páginas realizan las llamadas a la API y las formas llaman a un `onSubmit` pasado desde la página.
- `useRef` para `activeItem`: evita re-creaciones de callback y dependencias que causan fetch loops. Ejemplo:

```jsx
const activeRef = useRef(active);
useEffect(() => { activeRef.current = active; }, [active]);
// en callbacks no necesitamos active como dep.
```

- Formularios: evita cerrar el modal desde el formulario al inicio; permite a la página cerrar el modal tras validar y persistir la data.
- Loading state: los buttons de submit disponen de `isLoading` para evitar dobles envíos.
- Validación: Joi (en backend) y validaciones mínimas en frontend (nombres y tipos) para UX.

---

## 🧪 Tests y linting

- Linting: `npm run lint` (configurado con ESLint y plugin de hooks).
- Tests: Por ahora, el frontend no incluye un suite de tests (unit/e2e) en este repo; se pueden añadir `vitest` o `react-testing-library` si se desea.

---

## 🐞 Problemas comunes y soluciones

- Fetchs infinitos en una página:
  - Verifica las dependencias de `useEffect`. Evita incluir objetos que cambian de referencia cada render.
  - Usa `useRef` para `active` o la selección actual si la efect provoca un setState que cambia la dependencia.

- Los cambios guardados en backend no aparecen en la UI:
  - Asegúrate de llamar a una función que actualice el estado local (por ejemplo, `setNetworks(...)`) después del POST/DELETE.
  - En el backend, confirma que `data` persiste en disco y que no se ejecuta en `NODE_ENV=test` por accidente cuando estás probando.

- Modelos 3D no cargan en `ModelViewer`:
  - Revisa las rutas dentro de `public/assets` y `typeToModelPath` en formularios.

---

## 🔏 Desarrollo y Contribución

- Código y estilo:
  - Ejecuta `npm run lint` antes de enviar PRs.
  - Presta atención a la gestión de estados locales y a la delegación de `onSubmit` a páginas.

- Añadir un nuevo formulario y servicio:
  - Crear un servicio en `src/api/services/xxxService.js` y exportar `getAll/create/delete/getByName` según sea necesario.
  - Crear el formulario en `src/components/form/xxx/NewXxxForm.jsx` y propagar un `onSubmit` para que la página lo pase y maneje el estado.
  - Actualizar la página que usa ese formulario en `src/pages` para hacer el create y actualizar la lista local.

---

## 🧭 Depuración del backend desde el frontend

- Asegúrate de arrancar el backend:

```bash
cd backend
npm install
npm run dev
```

- El backend expone rutas bajo `http://localhost:3000/api` por defecto; el `VITE_API_BASE_URL` debe apuntar a esa ruta.
- Si usas docker o un proxy, adapta `VITE_API_BASE_URL` (ej. `http://host.docker.internal:3000/api` en Windows con Docker).

---

## ✨ Siguientes mejoras recomendadas

- Implementar watchers robustos en backend con `chokidar` (evitar `fs.watch`) y un evento `dbReload` (emitter) para que la API recargue la cache tras los `writeFileSync`.
- Añadir tests frontend: unitarios (Vitest + React Testing Library) para formularios, páginas y llamadas a servicios.
- Uniformizar los loaders y `isLoading` en todas las formas para mejor UX.

---

## 📌 Enlaces rápidos

- API base: `src/api/api.js`
- Servicios: `src/api/services/`
- Páginas: `src/pages/workspaces`, `src/pages/networks`, `src/pages/shop`.
- Formularios: `src/components/form` (componentes, network, workspace, server, etc.)

---

Si necesitas que añada instrucciones de contribución (pruebas, pipelines, o más ejemplos de uso) o que prepare un README principal para todo el repo (incluyendo el backend), dime y lo preparo.

¡Listo! 🎉 — He incluido un README del frontend con prácticas de desarrollo, patrones de diseño y procedimientos recomendados.
