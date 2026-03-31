"""CLI utilities for database init/seed/reset."""

from __future__ import annotations

import argparse

from backend.app.db.bootstrap import ensure_database, reset_database


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="AgencyManager local DB admin")
    parser.add_argument(
        "command",
        choices=["init", "seed", "reset"],
        help="init creates schema and seeds if empty, reset recreates deterministic demo data",
    )
    return parser


def main() -> None:
    args = _build_parser().parse_args()
    if args.command in {"init", "seed"}:
        ensure_database()
        print("Database initialized and seeded (if empty).")
        return

    reset_database()
    print("Database reset to deterministic demo state.")


if __name__ == "__main__":
    main()
