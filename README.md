# Frontend Entidad Financiera — Angular 21 Standalone & Signals

Interfaz de usuario moderna, reactiva y de alto rendimiento para la plataforma de entidad bancaria, construida con **Angular 21** (Standalone Components, Signals, New Control Flow `@if/@for`), CSS puro optimizado (sin dependencias pesadas de UI) y empaquetada con **Nginx unprivileged** en Docker.

---

## 🏛️ Características Principales

- **Gestión de Clientes (`/clientes`)**: Listado con filtrado en tiempo real, registro modal con validación de mayoría de edad (>=18 años) y eliminación protegida (alerta si tiene cuentas vinculadas).
- **Gestión de Cuentas (`/cuentas`)**: Apertura de cuentas de ahorros (prefijo 53) y corriente (prefijo 33), estados (`ACTIVA`, `INACTIVA`, `CANCELADA`), activación, inactivación y cancelación protegida (solo saldo $0).
- **Operaciones Financieras (`/transacciones`)**: Consignación, retiro y transferencia entre cuentas con validación de cuentas distintas, control de montos positivos y extracto histórico de movimientos.
- **Feedback y Manejo de Errores**: Sistema de notificaciones toast para alertas de negocio (`422`, `400`, `409 Conflict`).
- **Proxy Inverso Transparente**: En desarrollo apunta a `http://localhost:8080`, en producción Nginx reenvía `/api/` al backend Spring Boot sin problemas de CORS.

---

## 🚀 Ejecución en Desarrollo

```bash
npm install --legacy-peer-deps
npm start
```
Acceder en el navegador a: `http://localhost:4200` (las peticiones a `/api` se enrutan automáticamente al backend en el puerto `8080`).

---

## 📦 Compilación y Docker

```bash
# Compilar bundle de producción
npm run build

# Construir imagen Docker ultraligera (<65 MB con Nginx)
podman build -t banco-front .
podman run -d -p 8080:8080 banco-front
```
