# Tableau Parameterized Report Extension

A dynamic Tableau dashboard extension for parameter selection and report refresh functionality with real-time data staleness monitoring.

## 🎯 Features

- **Dynamic Parameter Selection**: Fetch workspaces, reports, and parameters from backend APIs
- **Flexible Date Handling**: Support for single date or date range selection  
- **Real-time Staleness Monitoring**: Periodic checks for data freshness
- **Tableau-native UI**: Uses `@tableau/tableau-ui` components
- **Secure HTTPS**: Built-in HTTPS support for production deployment
- **Easy Deployment**: Automated `.trex` package generation
- **Comprehensive Testing**: >85% test coverage with Vitest

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19.4+
- npm 8+
- Tableau Desktop 2019.4+ or Tableau Server 2019.4+

### Development Setup
```bash
# Clone and install
git clone <repository-url>
cd tableau-extension
npm install

# Start development server
npm run dev
# App runs at https://localhost:8080

# Build for production
npm run build

# Create .trex package
npm run build-extension

# Run tests
npm run test:coverage
```

## 📁 Project Structure

```
tableau-extension/
├── public/
│   ├── manifest.xml      # Tableau extension manifest
│   └── index.html       # HTML template
├── src/
│   ├── components/      # React components
│   ├── tests/          # Unit tests (>85% coverage)
│   ├── App.tsx         # Main application
│   ├── config.ts       # Configuration
│   └── types.ts        # TypeScript definitions
├── scripts/
│   ├── build-trex.js   # Extension packaging
│   └── sign-artifact.js # Code signing
└── dist/               # Built assets
```

## 🔧 Configuration

### Environment Variables
```env
# .env file
VITE_API_HOSTNAME=https://your-api-server.com
```

### Manifest Configuration
Update `public/manifest.xml`:
```xml
<SourceLocation>
  <URL>https://your-production-domain.com/</URL>
</SourceLocation>
```

## 🌐 Deployment Guide

### 1. Build the Extension
```bash
npm install
npm run build-extension
```

### 2. Server Deployment
The `.trex` file is a ZIP archive. Extract contents to your web server:
- `manifest.xml` → webserver root
- `index.html` → webserver root  
- `assets/` → webserver root/assets/

### 3. HTTPS Configuration (Required)

**Nginx Example:**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private-key.pem;
    
    root /path/to/tableau-extension/;
    index index.html;
    
    # Security headers for Tableau
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 4. Tableau Server Configuration
```bash
# Enable extensions
tsm configuration set -k viz.web_page_extension.enabled -v true

# Allowlist domain (optional but recommended)
tsm configuration set -k viz.web_page_extension.allowlist.mode -v ALLOWLIST
tsm configuration set -k viz.web_page_extension.allowlist.content -v "https://your-domain.com"

tsm pending-changes apply
```

## 👥 User Guide

### Adding Extension to Tableau
1. Open Tableau Dashboard
2. Drag "Extension" object from Objects panel
3. Choose "Access Local Extensions"
4. Select the `.trex` file
5. Click "OK"

### Using the Extension
1. **Select Workspace**: Choose from dropdown (auto-populated)
2. **Select Report**: Pick from available reports  
3. **Set Parameters**: Fill in required report parameters
4. **Configure Dates**: 
   - Single date: Use "COB Date From"
   - Date range: Check "Use COB Date Range" checkbox
5. **Monitor Status**: View data staleness indicator
6. **Execute**: Click "Submit" to refresh with parameters
7. **Reset**: Clear all selections to start over

### Example Workflow
```
1. Select "HISTSIM" workspace
2. Choose "HS_VaR" report
3. Set SNAPTYPE="EOD", RISKCLASS="EQUITY"  
4. Set COB Date to "2023-12-31"
5. Click "Submit" → Data refreshes with parameters
```

## 🔌 API Reference

The extension expects these backend endpoints:

### Get Workspaces
```http
GET /reportsApi/getWorkspace?userEmail={email}
Response: { "workspaces": ["HISTSIM", "FRTB", "SANDBOX"] }
```

### Get Reports  
```http
GET /reportsApi/getReports?userEmail={email}&workspaceName={workspace}
Response: { "reports": ["HS_VaR", "HS_PORTFOLIO_PnL"] }
```

### Get Parameters
```http
GET /reportsApi/getReportParams?reportName={report}
Response: { "parameters": ["SNAPTYPE", "RISKCLASS"] }
```

### Check Staleness
```http
GET /reportsApi/checkDataStaleness?currentTimestamp={iso}&reportName={report}&workspaceName={workspace}&params={json}
Response: { "timestamp": "2023-10-01T00:00:00Z", "isStale": true }
```

### Store Parameters
```http
POST /reportsApi/storeReportParams?userEmail={email}
Body: { "reportName": "HS_VaR", "params": { "SNAPTYPE": "EOD" } }
```

### Create Data Source
```http
POST /reportsApi/createDataSource
Body: { "userEmail": "user@domain.com", "reportName": "HS_VaR" }
```

## 🛠️ Development Guide

### Testing
```bash
npm test              # Run tests once
npm run test:coverage # Coverage report (>85% required)
npm test -- --watch  # Watch mode
```

### Code Quality
```bash
npm run lint          # Check issues
npm run lint -- --fix # Auto-fix
```

### Build Process
1. TypeScript compilation (`tsc`)
2. Vite bundling (optimized assets)
3. Extension packaging (`.trex` creation)

## 🔍 Troubleshooting

### Can't Access from Browser
**Problem**: Extension URL not accessible locally

**Solutions**:
1. **Check HTTPS**: Extension must run on HTTPS
   ```bash
   # Development server should show:
   # Local: https://localhost:8080/
   ```

2. **Accept Self-signed Certificate**: 
   - Navigate to `https://localhost:8080`
   - Click "Advanced" → "Proceed to localhost (unsafe)"
   - This is required for local development

3. **Verify Server is Running**:
   ```bash
   npm run dev
   # Should output: ➜ Local: https://localhost:8080/
   ```

4. **Check Firewall/Antivirus**: Ensure port 8080 is not blocked

### Extension Won't Load in Tableau
1. **HTTPS Required**: Tableau requires HTTPS for extensions
2. **Valid Certificate**: Use proper SSL cert for production
3. **Manifest URL**: Ensure manifest.xml URL matches deployment
4. **CORS Headers**: Configure server to allow Tableau domain

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Verify Node version
node --version  # Should be 20.19.4+
```

### Test Failures
```bash
# Run with verbose output
npm test -- --reporter=verbose

# Clear test cache  
npx vitest --run --coverage
```

## 🚀 Production Checklist

- [ ] Valid SSL certificate installed
- [ ] Extension URL accessible via HTTPS
- [ ] Tableau Server extensions enabled
- [ ] Domain allowlisted (if using allowlist mode)
- [ ] API endpoints accessible from extension domain
- [ ] CORS configured for Tableau domain
- [ ] Security headers configured
- [ ] Monitoring and logging setup

## 📊 Performance Tips

- Enable gzip compression on web server
- Use CDN for static assets if needed
- Monitor bundle size with `npm run build`
- Check browser dev tools for performance issues

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Maintain >85% test coverage
4. Follow ESLint configuration
5. Update documentation
6. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

---

*Built with React, TypeScript, and Tableau Extensions API*