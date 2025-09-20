# 🔧 GitHub Pages Deployment Troubleshooting

## Common Issues and Solutions

### 1. **GitHub Pages Not Enabled**
**Check**: Go to your repository → Settings → Pages
**Fix**:
- Source should be set to **"GitHub Actions"**
- NOT "Deploy from a branch"

### 2. **GitHub Actions Not Running**
**Check**: Go to your repository → Actions tab
**Symptoms**: No workflows showing, or workflows failing

**Fixes**:
- Ensure Actions are enabled: Settings → Actions → General → "Allow all actions"
- Check if you have sufficient GitHub Actions minutes
- Verify workflow file is in `.github/workflows/deploy.yml`

### 3. **Build Failing in Actions**
**Check**: Actions tab → Click on failed workflow → View logs

**Common Issues**:
```bash
# Node version mismatch
Solution: Workflow uses Node 18, should work

# npm ci failing
Solution: Delete package-lock.json and regenerate:
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push

# Build errors
Solution: Test build locally first:
npm run build
```

### 4. **Page Shows 404 or Wrong Content**
**Symptoms**:
- `https://tamoghna12.github.io/Pomodoro-for-Researchers/` shows 404
- Shows old content or GitHub default page

**Fixes**:
1. **Wait for deployment**: Can take 5-10 minutes after successful build
2. **Clear browser cache**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. **Check deployment URL**: Should be exactly `https://tamoghna12.github.io/Pomodoro-for-Researchers/`

### 5. **Assets Not Loading (CSS/JS 404s)**
**Symptoms**: Page loads but no styling, functionality broken

**Fix**: Base URL issue in vite.config.ts
```typescript
// Current config (should be correct):
base: process.env.NODE_ENV === 'production' ? '/Pomodoro-for-Researchers/' : '/'

// If still having issues, try:
base: '/Pomodoro-for-Researchers/'
```

### 6. **Repository Name Mismatch**
**Check**: Repository name should be exactly `Pomodoro-for-Researchers`
**Fix**: If name is different, either:
- Rename repository in GitHub settings
- Or update vite.config.ts base path to match

## 🔍 Step-by-Step Debugging

### Step 1: Check GitHub Actions
1. Go to `https://github.com/Tamoghna12/Pomodoro-for-Researchers/actions`
2. Look for workflow runs
3. If no runs: Actions might be disabled
4. If failed runs: Click to see error details

### Step 2: Check Pages Settings
1. Go to `https://github.com/Tamoghna12/Pomodoro-for-Researchers/settings/pages`
2. Source should be "GitHub Actions"
3. Should show: "Your site is live at https://tamoghna12.github.io/Pomodoro-for-Researchers/"

### Step 3: Verify Build Works Locally
```bash
# Test production build
npm run build
npm run preview

# Should open http://localhost:4173 and work correctly
```

### Step 4: Force Redeploy
```bash
# Make a small change and push
echo "# Deployment test" >> README.md
git add README.md
git commit -m "Trigger deployment"
git push
```

## 🚨 Emergency Fixes

### If Nothing Works - Manual Deploy
```bash
# Build locally and push to gh-pages branch
npm run build
npx gh-pages -d dist
```

### Reset Everything
```bash
# Delete and recreate workflow
rm -rf .github/workflows/deploy.yml
# Copy the working workflow back
# Commit and push
```

## ✅ Successful Deployment Checklist

When working correctly, you should see:

1. **Actions Tab**: ✅ Green checkmark on latest workflow
2. **Pages Settings**: ✅ "Your site is live" message
3. **URL Access**: ✅ `https://tamoghna12.github.io/Pomodoro-for-Researchers/` loads the app
4. **Functionality**: ✅ Timer works, dark mode toggles, everything functional

## 🆘 Still Not Working?

### Common Solutions That Work:
1. **Disable and re-enable Pages**: Settings → Pages → Source: None → Save → Source: GitHub Actions → Save
2. **Force new deployment**: Make any small commit and push
3. **Check repository visibility**: Must be public for free GitHub Pages
4. **Wait longer**: Sometimes takes up to 30 minutes for first deployment

### Debug Commands:
```bash
# Check if remote is correct
git remote -v

# Check current branch
git branch

# Force push (last resort)
git push --force origin main
```

---

**Need more help?** Check the GitHub Actions logs for specific error messages, or post the error details for further assistance.