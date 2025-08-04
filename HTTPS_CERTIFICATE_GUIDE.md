# HTTPS Certificate Guide for Local Development

This guide explains how to set up HTTPS certificates for local development and testing of the Tableau extension.

## Why HTTPS is Required

Tableau extensions **must** run over HTTPS in production. Even for local development, it's recommended to use HTTPS to:
- Match production environment conditions
- Test SSL/TLS certificate handling
- Ensure proper security headers and CORS behavior
- Avoid mixed content warnings

## Option 1: Using Self-Signed Certificates (Recommended for Development)

### Generate Self-Signed Certificate

#### Using OpenSSL (Cross-platform)

```bash
# Generate private key
openssl genrsa -out tableau-extension.key 2048

# Generate certificate signing request
openssl req -new -key tableau-extension.key -out tableau-extension.csr

# Fill in the prompts (use localhost or 127.0.0.1 for Common Name)
# Country Name: US
# State: Your State
# City: Your City  
# Organization: Your Organization
# Organizational Unit: IT Department
# Common Name: localhost (IMPORTANT!)
# Email Address: your-email@domain.com
# Challenge password: [leave empty]
# Optional company name: [leave empty]

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -in tableau-extension.csr -signkey tableau-extension.key -out tableau-extension.crt -days 365

# Convert to PEM format (if needed)
cat tableau-extension.crt tableau-extension.key > tableau-extension.pem
```

#### Using mkcert (Easier Alternative)

Install mkcert first:
```bash
# Windows (using Chocolatey)
choco install mkcert

# macOS (using Homebrew)
brew install mkcert

# Linux (manual installation)
curl -s https://api.github.com/repos/FiloSottile/mkcert/releases/latest | grep browser_download_url | grep linux-amd64 | cut -d '"' -f 4 | wget -qi -
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
```

Generate certificates:
```bash
# Install local CA
mkcert -install

# Generate certificates for localhost
mkcert localhost 127.0.0.1 ::1

# This creates:
# - localhost+2.pem (certificate)
# - localhost+2-key.pem (private key)
```

### Configure Vite for HTTPS

Update your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'localhost+2-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localhost+2.pem')),
    },
    host: true,
    port: 8080,
    cors: true
  },
  preview: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'localhost+2-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localhost+2.pem')),
    },
    host: true,
    port: 8080,
    cors: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
```

### Start Development Server

```bash
npm run dev

# Server will start at: https://localhost:8080
```

## Option 2: Using Production-Ready Certificates

### Let's Encrypt (for public domains)

If deploying to a public domain, use Let's Encrypt:

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate (replace your-domain.com)
sudo certbot certonly --standalone -d your-domain.com

# Certificates will be saved to:
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem
```

### Commercial SSL Certificate

1. Purchase SSL certificate from a trusted CA
2. Generate CSR (Certificate Signing Request)
3. Submit CSR to certificate authority
4. Download and install the certificate

## Option 3: Proxy Setup (Alternative)

If you can't generate certificates, use a reverse proxy:

### Using nginx

```nginx
server {
    listen 443 ssl http2;
    server_name localhost;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Using Apache

```apache
<VirtualHost *:443>
    ServerName localhost
    DocumentRoot /var/www/html
    
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    ProxyPreserveHost On
</VirtualHost>
```

## Updating Backend for HTTPS

### FastAPI with HTTPS

Update your `backend/main.py`:

```python
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware for HTTPS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://localhost:8080", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=4173,
        ssl_keyfile="path/to/localhost+2-key.pem",
        ssl_certfile="path/to/localhost+2.pem",
        reload=True,
        log_level="info"
    )
```

### Update API Configuration

Update `src/config.ts`:

```typescript
export const API_HOSTNAME = import.meta.env.VITE_API_HOSTNAME || 'https://localhost:4173';
```

## Browser Certificate Acceptance

### For Self-Signed Certificates

1. **Navigate to your extension URL**: `https://localhost:8080`
2. **Accept the security warning**:
   - Chrome: Click "Advanced" → "Proceed to localhost (unsafe)"
   - Firefox: Click "Advanced" → "Accept the Risk and Continue"
   - Safari: Click "Show Details" → "Visit this website"
3. **Accept for API endpoint**: `https://localhost:4173`
4. **Verify both URLs work** without security warnings

### For mkcert Certificates

If using mkcert, the certificates should be automatically trusted after running `mkcert -install`.

## Production Deployment

### Server Configuration

#### Nginx Production Setup

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    root /path/to/tableau-extension/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Update Manifest for Production

Update `public/manifest.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DashboardExtension schemaVersion="1.0" xmlns="http://www.tableau.com/xml/extension_manifest">
  <Name>Parameterized Report Extension</Name>
  <Version>1.0.0</Version>
  <Author name="Your Name" email="your-email@domain.com" organization="Your Org" website="https://your-domain.com"/>
  <MinApiVersion>1.0</MinApiVersion>
  <Description>A dynamic Tableau extension for parameter selection and report refresh functionality with real-time data staleness monitoring.</Description>
  <SourceLocation>
    <URL>https://your-domain.com/</URL>
  </SourceLocation>
  <Icon>assets/react.svg</Icon>
  <Permissions>
    <Permission>full data</Permission>
  </Permissions>
  <Context>
    <ContextItem name="worksheet" required="false"/>
    <ContextItem name="dashboard" required="true"/>
  </Context>
</DashboardExtension>
```

## Testing HTTPS Setup

### 1. Test Frontend

```bash
# Start development server
npm run dev

# Should open at: https://localhost:8080
curl -k https://localhost:8080
```

### 2. Test Backend

```bash
# Start backend with HTTPS
cd backend
python main.py

# Test API endpoint
curl -k https://localhost:4173/health
```

### 3. Test Full Integration

1. Open `https://localhost:8080` in browser
2. Accept any certificate warnings
3. Verify the extension loads without errors
4. Check browser console for any mixed content warnings
5. Test form functionality (workspace/report selection)

## Troubleshooting

### Common Issues

1. **"Your connection is not private" error**
   - This is normal for self-signed certificates
   - Click "Advanced" and proceed to localhost

2. **Mixed content warnings**
   - Ensure both frontend and backend use HTTPS
   - Check that API_HOSTNAME uses `https://` protocol

3. **CORS errors**
   - Verify backend CORS configuration includes your frontend URL
   - Ensure both frontend and backend use same protocol (HTTPS)

4. **Certificate validation errors**
   - For mkcert: Run `mkcert -install` to trust local CA
   - For OpenSSL: Manually add certificate to browser trust store

5. **Port conflicts**
   - Change ports in vite.config.ts if 8080 is in use
   - Update manifest.xml to match new port

### Browser-Specific Issues

#### Chrome
- Clear SSL state: Settings → Privacy → Clear browsing data → Advanced → Clear SSL state
- Bypass certificate errors: Navigate to `chrome://flags/#allow-insecure-localhost`

#### Firefox  
- Clear certificates: Settings → Privacy & Security → Certificates → View Certificates → Servers → Delete

#### Safari
- Keychain Access → Certificates → Double-click certificate → Trust → Always Trust

## Security Considerations

### Development
- Self-signed certificates are acceptable for local development
- Never use self-signed certificates in production
- Keep certificate files secure and don't commit to version control

### Production
- Use proper CA-signed certificates
- Implement HSTS (HTTP Strict Transport Security)
- Use strong SSL/TLS configuration
- Regularly update certificates before expiration
- Monitor certificate health

## Useful Commands

```bash
# Check certificate details
openssl x509 -in certificate.crt -text -noout

# Test SSL connection
openssl s_client -connect localhost:8080 -servername localhost

# Check certificate expiration
openssl x509 -in certificate.crt -noout -dates

# Generate new certificate with SAN (Subject Alternative Names)
openssl req -new -x509 -days 365 -nodes -out cert.pem -keyout key.pem \
  -config <(cat <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no
[req_distinguished_name]
CN = localhost
[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
[alt_names]
DNS.1 = localhost
DNS.2 = 127.0.0.1
IP.1 = 127.0.0.1
IP.2 = ::1
EOF
)
```

This completes the HTTPS certificate setup guide for your Tableau extension development and deployment!