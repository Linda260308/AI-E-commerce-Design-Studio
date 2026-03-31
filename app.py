# Vercel Python FastAPI Entrypoint
# This file exports the FastAPI app instance for Vercel deployment

from index import app

# Export for Vercel
__all__ = ['app']
