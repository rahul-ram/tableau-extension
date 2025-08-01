# 🌐 Local Access Troubleshooting Guide

## ✅ **SOLUTION: Use HTTP for Local Development**

The HTTPS server was causing SSL/TLS handshake issues on Windows. Here's how to access the app locally:

### **Method 1: HTTP Development Server (Recommended for Local Testing)**

1. **Start HTTP Server**:
   ```bash
   npm run dev:http
   ```
   
2. **Access Application**:
   - Open browser to: **`http://localhost:3000`**
   - ✅ **Should work immediately** - no certificate issues!

3. **Expected Output**:
   ```
   ➜ Local:   http://localhost:3000/
   ➜ Network: http://192.168.x.x:3000/
   ```

### **Method 2: HTTPS Server (For Production Testing)**

1. **Start HTTPS Server**:
   ```bash
   npm run dev:https
   ```

2. **Access with Certificate Bypass**:
   - Open: `https://localhost:8080`
   - Click "Advanced" → "Proceed to localhost (unsafe)"
   - Accept the self-signed certificate warning

---

## 🔧 **Available Development Scripts**

| Command | Purpose | URL | Use Case |
|---------|---------|-----|----------|
| `npm run dev:http` | HTTP development | `http://localhost:3000` | **Local testing & development** |
| `npm run dev:https` | HTTPS development | `https://localhost:8080` | Production testing |
| `npm run dev` | Default (HTTP) | `http://localhost:3000` | Quick start |

---

## 🧪 **Testing the Application**

### **What You Should See**:
1. **Parameter Form** with blue background (`#003366`)
2. **Workspace Dropdown** - should be empty initially
3. **Report Dropdown** - should be empty initially  
4. **COB Date Field** with light blue background (`#8cb3d9`)
5. **"Use COB Date Range" Checkbox**
6. **Submit and Reset Buttons**
7. **Data Status Indicator**

### **Interactive Testing**:
```bash
# Test API endpoints (will show errors since backend isn't running)
# This is expected - the frontend is working correctly!
```

### **Browser Console**:
- Should show Tableau extension initialization attempts
- May show API errors (expected without backend)
- No JavaScript errors or React warnings

---

## 📱 **Network Access (Optional)**

To access from other devices on your network:

1. **Find Your IP Address**:
   ```bash
   ipconfig | findstr IPv4
   ```

2. **Access from Other Devices**:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```

---

## 🎯 **For Tableau Extension Testing**

### **Local Development Manifest**:
Create a temporary manifest for local testing:

```xml
<!-- manifest-local.xml -->
<manifest manifest-version="1.0" xmlns="http://www.tableau.com/xml/manifest">
  <!-- ... other settings ... -->
  <source-location>
    <url>http://localhost:3000/</url>
  </source-location>
</manifest>
```

### **Production Manifest**:
Use the original manifest with HTTPS for production deployment.

---

## 🚨 **Common Issues & Solutions**

### **Issue**: "This site can't be reached"
**Solution**: 
- Ensure server is running: `npm run dev:http`
- Check port 3000 is not blocked by firewall
- Try `http://127.0.0.1:3000` instead

### **Issue**: "ERR_CONNECTION_REFUSED"
**Solution**:
- Restart the server: `Ctrl+C` then `npm run dev:http`
- Check if another process is using port 3000

### **Issue**: Blank white screen
**Solution**:
- Check browser console for JavaScript errors
- Ensure all dependencies installed: `npm install`
- Try hard refresh: `Ctrl+Shift+R`

### **Issue**: API errors in console
**This is expected!** The frontend works without the backend. API errors show:
- `Error fetching workspaces: Error: Network Error`
- This means the frontend is correctly trying to call APIs

---

## ✅ **Verification Checklist**

- [ ] Server starts without errors
- [ ] Browser can access `http://localhost:3000`
- [ ] Parameter form is visible with correct styling
- [ ] No JavaScript errors in browser console
- [ ] Form elements are interactive (dropdowns, checkboxes, buttons)
- [ ] Tableau extension initialization attempts in console

---

## 📞 **Still Having Issues?**

1. **Check Windows Firewall**: Allow Node.js through firewall
2. **Antivirus Software**: May block local server - temporarily disable
3. **Port Conflicts**: Another app might be using port 3000
4. **Browser Cache**: Clear cache and hard refresh
5. **Node.js Version**: Ensure you're using Node.js 20.19.4+

---

## 🎉 **Success!**

If you can see the parameter form at `http://localhost:3000`, the application is working correctly! 

The extension is ready for:
- ✅ Local development and testing
- ✅ Production deployment with HTTPS
- ✅ Integration with Tableau dashboards