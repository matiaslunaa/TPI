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

# categoría, nombre, descripción, precio, stock, archivo de imagen
PRODUCTOS = [
    ("Hamburguesas", "Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 6500.0, 25, "hamburguesaClasica.png"),
    ("Hamburguesas", "Hamburguesa Doble Cheddar", "Doble carne y cheddar fundido", 8200.0, 20, "hamburguesaDoble.png"),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de garbanzos y vegetales", 6900.0, 15, "hamburguesaVeggie.png"),
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate y muzzarella", 7800.0, 18, "pizzaMuzza.png"),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate y ajo", 8900.0, 12, "pizzaNapo.png"),
    ("Bebidas", "Coca Cola 500ml", "Bien fría", 1800.0, 60, "cocacola.png"),
    ("Bebidas", "Limonada", "Con menta y jengibre", 2200.0, 30, "limonada.png"),
    ("Postres", "Flan con Dulce de Leche", "Casero, con crema", 3200.0, 14, "flan.png"),
    ("Postres", "Brownie con Helado", "Chocolate y vainilla", 4100.0, 10, "brownie.png"),
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

        # Catálogo: solo se carga si la base todavía está vacía.
        hay_categorias = session.exec(select(Categoria)).first() is not None
        hay_productos = session.exec(select(Producto)).first() is not None

        if hay_categorias or hay_productos:
            print("El catálogo ya tiene datos: no se cargan categorías ni productos.")
        else:
            categorias: dict[str, Categoria] = {}
            for nombre, descripcion in CATEGORIAS:
                cat = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(cat)
                session.flush()
                categorias[nombre] = cat
                print(f"Categoría creada: {nombre}")

            for cat_nombre, nombre, descripcion, precio, stock, archivo in PRODUCTOS:
                session.add(
                    Producto(
                        categoria_id=categorias[cat_nombre].id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=f"/img/{archivo}",
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