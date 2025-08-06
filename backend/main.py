"""
FastAPI backend for Tableau Parameterized Report Extension
Provides hardcoded data for development and testing
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import asyncio

# Initialize FastAPI app
app = FastAPI(
    title="Tableau Extension API",
    description="Backend API for Tableau Parameterized Report Extension",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class ReportParams(BaseModel):
    reportName: str
    params: Dict[str, Any]


class DataSourceRequest(BaseModel):
    userEmail: EmailStr
    reportName: str


class ReportStatus(BaseModel):
    timestamp: str
    isStale: bool


# Hardcoded data for development
MOCK_DATA = {
    "workspaces": ["WS_HS1", "WS_PVT", "WS_OFFICIAL"],
    "reports": {
        "WS_HS1": ["report1", "report2", "report3"],
        "WS_PVT": ["report4", "report6"],
        "WS_OFFICIAL": ["report5", "report3", "report1"],
    },
    "report_params": {
        # Group A: report1, report3, report5
        "report1": [
            {"param_name": "snap_type", "data_type": "string"},
            {"param_name": "riskclass", "data_type": "string"},
            {"param_name": "offset", "data_type": "number"},
            {"param_name": "cobdate", "data_type": "date"},
        ],
        "report3": [
            {"param_name": "snap_type", "data_type": "string"},
            {"param_name": "riskclass", "data_type": "string"},
            {"param_name": "offset", "data_type": "number"},
            {"param_name": "cobdate", "data_type": "date"},
        ],
        "report5": [
            {"param_name": "snap_type", "data_type": "string"},
            {"param_name": "riskclass", "data_type": "string"},
            {"param_name": "offset", "data_type": "number"},
            {"param_name": "cobdate", "data_type": "date"},
        ],
        # Group B: report2, report4, report6 - date range reports
        "report2": [
            {"param_name": "val_context", "data_type": "float"},
            {"param_name": "cobdate_from", "data_type": "date"},
            {"param_name": "cobdate_to", "data_type": "date"},
        ],
        "report4": [
            {"param_name": "val_context", "data_type": "float"},
            {"param_name": "cobdate_from", "data_type": "date"},
            {"param_name": "cobdate_to", "data_type": "date"},
        ],
        "report6": [
            {"param_name": "val_context", "data_type": "float"},
            {"param_name": "cobdate_from", "data_type": "date"},
            {"param_name": "cobdate_to", "data_type": "date"},
        ],
    },
}


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Tableau Extension API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "workspaces": "/reports/workspaces",
            "reports": "/reports/getReports",
            "parameters": "/reports/getReportParams",
            "staleness": "/reports/checkDataStaleness",
            "store_params": "/reports/storeReportParams",
            "create_datasource": "/reports/createDataSource",
            "docs": "/docs",
        },
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


# Get workspaces for a user
@app.get("/reports/workspaces")
async def get_workspaces():
    """Get available workspaces for a user"""
    # Simulate async processing
    await asyncio.sleep(0.1)

    # In production, this would query a database based on user permissions
    return {"workspaces": MOCK_DATA["workspaces"]}


# Get reports for a workspace
@app.get("/reports/getReports")
async def get_reports(
    workspace_name: str = Query(..., description="Workspace name"),
):
    """Get available reports for a workspace"""
    await asyncio.sleep(0.1)

    if workspace_name not in MOCK_DATA["reports"]:
        raise HTTPException(
            status_code=404, detail=f"Workspace '{workspace_name}' not found"
        )

    return {"reports": MOCK_DATA["reports"][workspace_name]}


# Get parameters for a report
@app.get("/reports/getReportParams")
async def get_report_params(
    workspace_name: str = Query(..., description="Workspace name"),
    report_name: str = Query(..., description="Report name"),
):
    """Get required parameters for a report"""
    await asyncio.sleep(0.1)

    if report_name not in MOCK_DATA["report_params"]:
        raise HTTPException(status_code=404, detail=f"Report '{report_name}' not found")

    return {"parameters": MOCK_DATA["report_params"][report_name]}


# Check data staleness
@app.get("/reports/checkDataStaleness")
async def check_data_staleness(
    currentTimestamp: str = Query(..., description="Current timestamp in ISO format"),
    report_name: str = Query(..., description="Report name"),
    workspace_name: str = Query(..., description="Workspace name"),
    params: str = Query(..., description="JSON string of parameters"),
):
    """Check if report data is stale"""
    await asyncio.sleep(0.2)

    # Parse the current timestamp
    try:
        current_time = datetime.fromisoformat(currentTimestamp.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid timestamp format")

    # Simulate data staleness logic
    # In production, this would check actual data timestamps
    import json
    import random

    try:
        param_dict = json.loads(params)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid parameters JSON")

    # Mock staleness - randomly return stale/fresh with some logic
    # Data is "stale" if it's been more than 30 minutes since last refresh
    mock_last_refresh = datetime.now(timezone.utc).replace(
        minute=random.randint(0, 59), second=random.randint(0, 59)
    )

    time_diff = current_time - mock_last_refresh
    is_stale = time_diff.total_seconds() > 1800  # 30 minutes

    return ReportStatus(timestamp=mock_last_refresh.isoformat(), isStale=is_stale)


# Store report parameters
@app.post("/reports/storeReportParams")
async def store_report_params(
    report_params: ReportParams,
    userEmail: str = Query(..., description="User email address"),
):
    """Store report parameters for a user"""
    await asyncio.sleep(0.1)

    # In production, this would save to a database
    print(f"Storing params for {userEmail}: {report_params.dict()}")

    return {
        "message": "Parameters stored successfully",
        "userEmail": userEmail,
        "reportName": report_params.reportName,
        "paramCount": len(report_params.params),
    }


# Create data source
@app.post("/reports/createDataSource")
async def create_data_source(request: DataSourceRequest):
    """Create a data source for the report"""
    await asyncio.sleep(0.3)

    # In production, this would create/configure a data source
    datasource_name = f"Parameterized_Report_{request.userEmail}_{request.reportName}"

    return {
        "message": "Data source created successfully",
        "dataSourceName": datasource_name,
        "userEmail": request.userEmail,
        "reportName": request.reportName,
        "status": "ready",
    }


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404, content={"error": "Endpoint not found", "detail": str(exc)}
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500, content={"error": "Internal server error", "detail": str(exc)}
    )


if __name__ == "__main__":
    import uvicorn
    import os

    # Check if running in HTTPS mode
    use_https = os.getenv("USE_HTTPS", "dscs").lower() == "true"

    if use_https:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=4173,
            ssl_keyfile="localhost+2-key.pem",
            ssl_certfile="localhost+2.pem",
            reload=True,
            log_level="info",
        )
    else:
        uvicorn.run(
            "main:app", host="0.0.0.0", port=4173, reload=True, log_level="info"
        )
