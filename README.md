## Trabajo Práctico Integrador — Programación 4 - Food Store
Sistema de pedidos de comida: *backend* FastAPI + SQLModel y *frontend* React + TypeScript.

- Alumno: Matias Luna
- Repositorio GitHub: <PEGAR_URL_DEL_REPOSITORIO>
- Video de demostración: <PEGAR_LINK_PUBLICO_DEL_VIDEO>


## Estructura
```
backend/
frontend/
README.md
```

## Backend
Desde la carpeta `backend/`:

```bash
# 1. Entorno virtual
python -m venv venv
.venv\Scripts\activate

# 2. Dependencias
pip install -r requirements.txt

# 3. Variables de entorno
copy .env.example .env

# 4. Datos iniciales (admin, categorías y productos)
python -m app.db.seed

# 5. Iniciar
fastapi dev app/main.py
```

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` solo si se sirve por HTTPS | `false` |


### Usuario del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | `admin` |

Los usuarios con rol `user` se crean desde la pantalla de registro.


# ###################################################################################################################################
## Frontend
Desde la carpeta `frontend/`:

```bash
copy .env.example .env
pnpm install
pnpm run dev
```

## Flujo de demostración

1. Registro de un cliente.
2. Compra: catálogo → carrito → checkout.
3. Como `admin`: resumen, ABM de categorías/productos, cambio de estado de pedidos, usuarios.
4. Cancelación de un pedido y restitución del stock (se ve en el catálogo/productos).