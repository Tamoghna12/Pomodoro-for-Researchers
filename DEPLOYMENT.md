# 🚀 Deployment Guide

This guide explains how to deploy the Pomodoro for Researchers application to various platforms.

## 📋 Prerequisites

- Node.js 18+ installed
- Git repository set up
- GitHub account (for GitHub Pages)

## 🔧 GitHub Pages Deployment (Recommended)

### Automatic Deployment
This repository includes GitHub Actions workflow for automatic deployment.

1. **Fork or create the repository on GitHub**
2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Set Source to "GitHub Actions"
   - Save the settings

3. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

4. **Access your app**:
   - Visit: `https://your-username.github.io/Pomodoro-for-Researchers/`
   - URL will be shown in repository Settings → Pages

### Manual Deployment
If you prefer manual deployment:

```bash
# Build the application
npm run build

# Install gh-pages (if not already installed)
npm install -g gh-pages

# Deploy to gh-pages branch
gh-pages -d dist
```

## 🌐 Alternative Deployment Options

### Vercel
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy automatically on push

### Netlify
1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t pomodoro-researchers .
docker run -p 8080:80 pomodoro-researchers
```

## ⚙️ Environment Configuration

### Build Configuration
The application automatically configures the base URL for GitHub Pages:

```typescript
// vite.config.ts
base: process.env.NODE_ENV === 'production' ? '/Pomodoro-for-Researchers/' : '/'
```

### Custom Domain (Optional)
For custom domains on GitHub Pages:

1. Add a `CNAME` file to the `public` directory:
   ```
   your-custom-domain.com
   ```

2. Configure DNS:
   - A record: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Or CNAME: `your-username.github.io`

## 🔍 Deployment Verification

After deployment, verify:

### ✅ Basic Functionality
- [ ] Application loads without errors
- [ ] Timer starts/stops correctly
- [ ] Dark/light mode toggle works
- [ ] Local storage persists data

### ✅ AI Features (if configured)
- [ ] AI settings panel opens
- [ ] Provider selection works
- [ ] Quick Query modal appears
- [ ] Research Assistant interface loads

### ✅ Performance
- [ ] Initial load time < 3 seconds
- [ ] Interactive elements respond quickly
- [ ] No console errors

## 🐛 Troubleshooting

### Common Issues

#### 1. **404 Errors on GitHub Pages**
**Problem**: Routes not working, getting 404 errors
**Solution**: Single Page Application needs proper routing config
```html
<!-- Add to public/index.html head -->
<script>
  // Handle GitHub Pages SPA routing
  (function(l) {
    if (l.search[1] === '/' ) {
      var decoded = l.search.slice(1).split('&').map(function(s) {
        return s.replace(/~and~/g, '&')
      }).join('?')
      window.history.replaceState(null, null,
          l.pathname.slice(0, -1) + decoded + l.hash
      )
    }
  }(window.location))
</script>
```

#### 2. **Assets Not Loading**
**Problem**: CSS/JS files return 404
**Solution**: Check base URL configuration in `vite.config.ts`

#### 3. **AI Features Not Working**
**Problem**: API calls failing
**Solution**:
- Check CORS policies
- Verify API keys are properly entered
- Ensure HTTPS deployment (required for some AI providers)

#### 4. **Build Failures**
**Problem**: GitHub Actions failing
**Solutions**:
- Check Node.js version in workflow (should be 18+)
- Verify all dependencies in package.json
- Check for TypeScript errors

### Debug Commands
```bash
# Local testing
npm run build
npm run preview

# Check bundle size
npm run build -- --analyze

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📊 Performance Optimization

### Bundle Size Optimization
```bash
# Analyze bundle
npm run build -- --analyze

# Check for large dependencies
npx vite-bundle-analyzer dist/stats.json
```

### Caching Strategy
The application uses:
- Browser caching for static assets
- Local storage for user data
- Service workers (can be added) for offline support

## 🔐 Security Considerations

### For Production Deployment:
1. **HTTPS Required**: AI providers require secure connections
2. **API Key Security**: Keys stored in browser localStorage only
3. **Content Security Policy**: Consider adding CSP headers
4. **Environment Variables**: Never commit API keys to repository

### Security Headers (Optional)
```nginx
# For nginx deployment
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

## 📈 Monitoring & Analytics

### Optional Analytics (Privacy-Friendly)
- **Plausible**: Privacy-focused analytics
- **Simple Analytics**: GDPR compliant
- **Self-hosted Umami**: Full control

### Error Monitoring
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay for debugging

## 🚀 Deployment Checklist

Before going live:

### Pre-deployment
- [ ] All features tested locally
- [ ] Build succeeds without errors
- [ ] TypeScript checks pass
- [ ] No console errors
- [ ] Responsive design verified
- [ ] AI integration tested (if using)

### Post-deployment
- [ ] Application loads successfully
- [ ] All routes work correctly
- [ ] Performance metrics acceptable
- [ ] Error monitoring set up
- [ ] SSL certificate valid
- [ ] Custom domain configured (if applicable)

## 📞 Support

If you encounter deployment issues:
1. Check the [GitHub Issues](https://github.com/your-username/Pomodoro-for-Researchers/issues)
2. Review the deployment logs
3. Test locally first with `npm run build && npm run preview`
4. Create a new issue with deployment details

---

**Ready to deploy?** Follow the GitHub Pages section above for the quickest deployment method!