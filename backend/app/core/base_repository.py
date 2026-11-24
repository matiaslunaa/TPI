from typing import Generic, List, Optional, Type, TypeVar

from sqlmodel import Session, SQLModel, select

ModelT = TypeVar("ModelT", bound=SQLModel)

class BaseRepository(Generic[ModelT]):
    def __init__(self, session: Session, model: Type[ModelT]):
        self.session = session
        self.model = model

    def get_by_id(self, obj_id: int) -> Optional[ModelT]:
        return self.session.get(self.model, obj_id)

    def get_all(self) -> List[ModelT]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, obj: ModelT) -> ModelT:
        self.session.add(obj)
        self.session.flush()
        return obj

    def delete(self, obj: ModelT) -> None:
        self.session.delete(obj)
        self.session.flush()
