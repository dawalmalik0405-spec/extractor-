from datetime import datetime
import uuid

from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    String,
    Text
)
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class Document(Base):
    __tablename__ = "documents"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    filename = Column(String, nullable=False)

    file_type = Column(String, nullable=False)

    file_path = Column(String, nullable=False)

    file_size = Column(Integer)

    extracted_text = Column(Text)

    total_chunks = Column(Integer, default=0)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )