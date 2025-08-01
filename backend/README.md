# FastAPI Backend for Tableau Extension

This FastAPI backend provides mock data for the Tableau Parameterized Report Extension.

## Requirements

- Python 3.11.15+
- FastAPI
- Uvicorn

## Quick Start

### 1. Setup Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Unix/macOS:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
# Install from requirements.txt
pip install -r requirements.txt

# Or install from setup.py
pip install -e .
```

### 3. Run the Server

```bash
# Start the development server
python main.py

# Or use uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 4173 --reload
```

### 4. Verify Installation

The server will start at: http://localhost:4173

- **API Root**: http://localhost:4173/
- **Interactive Docs**: http://localhost:4173/docs
- **Health Check**: http://localhost:4173/health

## API Endpoints

### Get Workspaces
```http
GET /reportsApi/getWorkspace?userEmail=user@example.com
```

### Get Reports
```http
GET /reportsApi/getReports?userEmail=user@example.com&workspaceName=HISTSIM
```

### Get Report Parameters
```http
GET /reportsApi/getReportParams?reportName=HS_VaR
```

### Check Data Staleness
```http
GET /reportsApi/checkDataStaleness?currentTimestamp=2023-10-01T00:00:00Z&reportName=HS_VaR&workspaceName=HISTSIM&params={}
```

### Store Parameters
```http
POST /reportsApi/storeReportParams?userEmail=user@example.com
Content-Type: application/json

{
  "reportName": "HS_VaR",
  "params": {
    "SNAPTYPE": "EOD",
    "RISKCLASS": "EQUITY"
  }
}
```

### Create Data Source
```http
POST /reportsApi/createDataSource
Content-Type: application/json

{
  "userEmail": "user@example.com",
  "reportName": "HS_VaR"
}
```

## Mock Data

The backend provides hardcoded data for development:

- **Workspaces**: HISTSIM, FRTB, SANDBOX, MARKET_RISK, CREDIT_RISK
- **Reports**: Various reports per workspace (e.g., HS_VaR, FRTB_IMA_VaR)
- **Parameters**: Different parameter sets per report

## Development

### Running Tests
```bash
pytest
```

### Code Structure
- `main.py` - FastAPI application and endpoints
- `requirements.txt` - Python dependencies  
- `setup.py` - Package configuration

### Environment Variables
You can override default settings:
- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 4173)

## Integration with Frontend

The Tableau extension frontend expects the API to run on `http://localhost:4173`.

1. Start the backend: `python main.py`
2. Start the frontend: `npm run dev:http` 
3. Access frontend: `http://localhost:3000`

The frontend will now successfully connect to the backend APIs.

## Production Deployment

For production:
1. Update CORS origins in `main.py`
2. Use production WSGI server
3. Configure proper authentication
4. Replace mock data with real database queries

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 4173
lsof -ti:4173 | xargs kill -9

# Or use different port
uvicorn main:app --port 4174
```

### CORS Issues
The backend allows all origins for development. For production, update the CORS configuration in `main.py`.

### Python Version
Ensure you're using Python 3.11.15+:
```bash
python --version
```