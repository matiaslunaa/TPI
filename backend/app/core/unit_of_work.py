from typing import Callable

from sqlmodel import Session


class UnitOfWork:

    session: Session

    def __init__(self, session_factory: Callable[[], Session]):
        self.session_factory = session_factory

    def __enter__(self) -> "UnitOfWork":
        self.session = self.session_factory()
        self._create_repositories()
        return self

    def _create_repositories(self) -> None:
        """Cada módulo lo redefine para exponer sus repositorios."""

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        try:
            if exc_type:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            self.session.close()
