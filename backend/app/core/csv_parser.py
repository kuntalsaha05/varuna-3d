"""
CSV in-situ observations parser module.
Delegates to ArgoService for high-performance indexed queries.
"""
from app.core.argo_parser import argo_service, ArgoService

__all__ = ["argo_service", "ArgoService"]
