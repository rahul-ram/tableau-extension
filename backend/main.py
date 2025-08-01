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
    "workspaces": ["HISTSIM", "FRTB", "SANDBOX", "MARKET_RISK", "CREDIT_RISK"],
    "reports": {
        "HISTSIM": ["HS_VaR", "HS_PORTFOLIO_PnL", "HS_RISK_FACTORS", "HS_SCENARIOS"],
        "FRTB": ["FRTB_IMA_VaR", "FRTB_SBA_CHARGES", "FRTB_NMRF", "FRTB_DRC"],
        "SANDBOX": ["TEST_REPORT_1", "TEST_REPORT_2", "VALIDATION_SUITE"],
        "MARKET_RISK": ["MR_VaR_SUMMARY", "MR_STRESS_TESTS", "MR_BACKTESTING"],
        "CREDIT_RISK": ["CR_PD_MODELS", "CR_LGD_ANALYSIS", "CR_EXPOSURE_CALC"],
    },
    "report_params": {
        "HS_VaR": ["SNAPTYPE", "RISKCLASS", "CURRENCY", "CONFIDENCE_LEVEL"],
        "HS_PORTFOLIO_PnL": ["SNAPTYPE", "PORTFOLIO_ID", "CURRENCY"],
        "HS_RISK_FACTORS": ["SNAPTYPE", "FACTOR_TYPE", "REGION"],
        "HS_SCENARIOS": ["SNAPTYPE", "SCENARIO_TYPE", "STRESS_TYPE"],
        "FRTB_IMA_VaR": ["SNAPTYPE", "DESK_ID", "JURISDICTION"],
        "FRTB_SBA_CHARGES": ["SNAPTYPE", "ASSET_CLASS", "BUCKET"],
        "TEST_REPORT_1": ["SNAPTYPE", "TEST_PARAM"],
        "TEST_REPORT_2": ["SNAPTYPE", "ENVIRONMENT"],
        "MR_VaR_SUMMARY": ["SNAPTYPE", "BUSINESS_LINE", "PORTFOLIO"],
        "CR_PD_MODELS": ["SNAPTYPE", "RATING_SYSTEM", "SEGMENT"],
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
            "workspaces": "/reportsApi/getWorkspace",
            "reports": "/reportsApi/getReports",
            "parameters": "/reportsApi/getReportParams",
            "staleness": "/reportsApi/checkDataStaleness",
            "store_params": "/reportsApi/storeReportParams",
            "create_datasource": "/reportsApi/createDataSource",
            "docs": "/docs",
        },
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


# Get workspaces for a user
@app.get("/reportsApi/getWorkspace")
async def get_workspaces():
    """Get available workspaces for a user"""
    # Simulate async processing
    await asyncio.sleep(0.1)

    # In production, this would query a database based on user permissions
    return {"workspaces": MOCK_DATA["workspaces"]}


# Get reports for a workspace
@app.get("/reportsApi/getReports")
async def get_reports(
    userEmail: str = Query(..., description="User email address"),
    workspaceName: str = Query(..., description="Workspace name"),
):
    """Get available reports for a workspace"""
    await asyncio.sleep(0.1)

    if workspaceName not in MOCK_DATA["reports"]:
        raise HTTPException(
            status_code=404, detail=f"Workspace '{workspaceName}' not found"
        )

    return {"reports": MOCK_DATA["reports"][workspaceName]}


# Get parameters for a report
@app.get("/reportsApi/getReportParams")
async def get_report_params(reportName: str = Query(..., description="Report name")):
    """Get required parameters for a report"""
    await asyncio.sleep(0.1)

    if reportName not in MOCK_DATA["report_params"]:
        raise HTTPException(status_code=404, detail=f"Report '{reportName}' not found")

    return {"parameters": MOCK_DATA["report_params"][reportName]}


# Check data staleness
@app.get("/reportsApi/checkDataStaleness")
async def check_data_staleness(
    currentTimestamp: str = Query(..., description="Current timestamp in ISO format"),
    reportName: str = Query(..., description="Report name"),
    workspaceName: str = Query(..., description="Workspace name"),
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
@app.post("/reportsApi/storeReportParams")
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
@app.post("/reportsApi/createDataSource")
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

    uvicorn.run("main:app", host="0.0.0.0", port=4173, reload=True, log_level="info")
