from setuptools import setup, find_packages

setup(
    name="tableau-extension-api",
    version="1.0.0",
    description="FastAPI backend for Tableau Parameterized Report Extension",
    author="Rahul Ram",
    author_email="rahul@rram.dev",
    packages=find_packages(),
    python_requires=">=3.11.15",
    install_requires=[
        "fastapi>=0.104.0",
        "uvicorn[standard]>=0.24.0",
        "pydantic[email]>=2.5.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-asyncio>=0.21.0",
            "httpx>=0.25.0",
        ]
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
        "Framework :: FastAPI",
    ],
)
