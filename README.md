# 🖥️ Server Helper 

## Descripción del Proyecto

Server Helper es el backend de una aplicación web diseñada para la gestión de infraestructura de centros de datos. La API permite a los usuarios gestionar componentes de hardware (como CPUs y RAM), crear servidores virtuales a partir de estos componentes, organizarlos en racks y administrar todo dentro de un espacio de trabajo. El proyecto fue desarrollado como una solución para simplificar la planificación y el inventario de recursos de hardware.
## Tecnologías Utilizadas

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

### Licencia

Licencia Creative Commons CC BY-NC
![[Pasted image 20250825174726.png]]

___
*README* creado con [Obsidian](https://obsidian.md/)