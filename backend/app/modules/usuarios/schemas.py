from datetime import datetime
from typing import Annotated

from pydantic import EmailStr, StringConstraints, field_validator
from sqlmodel import Field, SQLModel

Username = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=3, max_length=50)
]
NombreCompleto = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)
]


class UserCreate(SQLModel):
    username: Username
    full_name: NombreCompleto
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("email")
    @classmethod
    def email_en_minusculas(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def password_max_72_bytes(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes")
        return v


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
