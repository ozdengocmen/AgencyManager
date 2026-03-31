"""Backend data access layer (mock-only for PoC)."""

from backend.app.data.mock_data import load_agencies, load_benchmarks, load_kpis

__all__ = ["load_agencies", "load_kpis", "load_benchmarks"]
