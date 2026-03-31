"""SQLite connection helpers for the local PoC database."""

from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from backend.app.core.config import Settings, get_settings


def resolve_db_path(settings: Settings | None = None) -> Path:
    app_settings = settings or get_settings()
    return Path(app_settings.app_db_path).resolve()


@contextmanager
def sqlite_connection(settings: Settings | None = None) -> Iterator[sqlite3.Connection]:
    db_path = resolve_db_path(settings)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()
