#!/usr/bin/env python3
"""
Quick start script for the FastAPI backend
"""

import subprocess
import sys
import os


def main():
    """Start the FastAPI server with proper configuration"""

    # Check if we're in a virtual environment
    if not hasattr(sys, "real_prefix") and not (
        hasattr(sys, "base_prefix") and sys.base_prefix != sys.prefix
    ):
        print("⚠️  Warning: Not running in a virtual environment")
        print("   Consider creating one: python -m venv venv")
        print("   Then activate it and install dependencies")
        print()

    # Check if FastAPI is installed
    try:
        import fastapi
        import uvicorn

        print(f"✅ FastAPI {fastapi.__version__} found")
        print(f"✅ Uvicorn {uvicorn.__version__} found")
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("   Please install: pip install -r requirements.txt")
        sys.exit(1)

    # Start the server
    print("🚀 Starting FastAPI server...")
    print("   URL: http://localhost:4173")
    print("   Docs: http://localhost:4173/docs")
    print("   Press Ctrl+C to stop")
    print()

    try:
        import uvicorn

        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=4173,
            reload=True,
            log_level="info",
            access_log=True,
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
