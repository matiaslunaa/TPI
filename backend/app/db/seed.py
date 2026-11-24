from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas artesanales con papas"),
    ("Pizzas", "Pizzas a la piedra"),
    ("Bebidas", "Gaseosas, jugos y cervezas"),
    ("Postres", "Dulces para cerrar la comida"),
]


def _img(nombre: str) -> str:
    return f"/img/{nombre.replace(' ', '-').lower()}.png"


# categoría, nombre, descripción, precio, stock
PRODUCTOS = [
    ("Hamburguesas", "Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 6500.0, 25),
    ("Hamburguesas", "Hamburguesa Doble Cheddar", "Doble carne y cheddar fundido", 8200.0, 20),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de garbanzos y vegetales", 6900.0, 15),
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate y muzzarella", 7800.0, 18),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate y ajo", 8900.0, 12),
    ("Bebidas", "Gaseosa Cola 500ml", "Bien fría", 1800.0, 60),
    ("Bebidas", "Limonada Casera", "Con menta y jengibre", 2200.0, 30),
    ("Postres", "Flan con Dulce de Leche", "Casero, con crema", 3200.0, 14),
    ("Postres", "Brownie con Helado", "Chocolate y vainilla", 4100.0, 10),
]


def run() -> None:
    create_all_tables()
    session = session_factory()
    try:
        # Admin
        admin = session.exec(
            select(Usuario).where(Usuario.username == ADMIN["username"])
        ).first()
        if admin is None:
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )
            print("Usuario admin creado.")
        else:
            print("Usuario admin ya existe.")

        # Categorías
        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            cat = session.exec(
                select(Categoria).where(Categoria.nombre == nombre)
            ).first()
            if cat is None:
                cat = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(cat)
                session.flush()
                print(f"Categoría creada: {nombre}")
            categorias[nombre] = cat

        # Productos
        for cat_nombre, nombre, descripcion, precio, stock in PRODUCTOS:
            existe = session.exec(
                select(Producto).where(Producto.nombre == nombre)
            ).first()
            if existe is None:
                session.add(
                    Producto(
                        categoria_id=categorias[cat_nombre].id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=_img(nombre.replace(" ", "-").lower()),
                        stock=stock,
                    )
                )
                print(f"Producto creado: {nombre}")

        session.commit()
        print("Seed completo.")
    finally:
        session.close()


if __name__ == "__main__":
    run()
