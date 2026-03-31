"""Database bootstrap helpers (init + seed)."""

from __future__ import annotations

from threading import Lock

from backend.app.core.config import Settings
from backend.app.db.schema import initialize_schema
from backend.app.db.seed import reset_demo_data, seed_reference_data
from backend.app.db.sqlite import sqlite_connection

_BOOTSTRAP_LOCK = Lock()
_BOOTSTRAPPED = False


def ensure_database(settings: Settings | None = None) -> None:
    global _BOOTSTRAPPED

    if _BOOTSTRAPPED:
        return

    with _BOOTSTRAP_LOCK:
        if _BOOTSTRAPPED:
            return
        with sqlite_connection(settings) as connection:
            initialize_schema(connection)
            seed_reference_data(connection)
        _BOOTSTRAPPED = True


def reset_database(settings: Settings | None = None) -> None:
    global _BOOTSTRAPPED

    with _BOOTSTRAP_LOCK:
        with sqlite_connection(settings) as connection:
            initialize_schema(connection)
            reset_demo_data(connection)
        _BOOTSTRAPPED = True
