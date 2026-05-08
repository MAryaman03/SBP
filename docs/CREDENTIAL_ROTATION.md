# Credential Rotation Procedure

## When to Rotate Credentials

- ✅ After any suspected exposure
- ✅ Quarterly as a security best practice
- ✅ Before major releases
- ✅ When team members leave
- ✅ If monitoring detects suspicious activity

---

## MongoDB URI Rotation

### Step 1: Create New Credentials in MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Select your cluster → Database Access
3. Click "+ Add New Database User"
4. Create new user with strong password (20+ characters):
   - Username: `sbp_prod_v2` (increment version)
   - Password: Generate strong password
5. Grant permissions: "Read and write to any database"
6. Click "Add User"

### Step 2: Generate New Connection String

1. In MongoDB Atlas, go to Clusters → Connect
2. Click "Drivers" → "Connection String"
3. Copy the connection string
4. Update placeholder with new username/password

**Example:**
```
mongodb+srv://sbp_prod_v2:NewStrongPassword123@cluster.mongodb.net/sbp?retryWrites=true&w=majority
```

### Step 3: Update Production Environment

#### Option A: Vercel Dashboard (Recommended)

1. Go to your Vercel project
2. Settings → Environment Variables
3. Edit the `MONGO_URI` variable
4. Paste new connection string
5. Select "Production" environment
6. Click "Save"
7. Redeploy the application

```bash
git push origin main  # Or use Vercel dashboard to trigger redeploy
```

#### Option B: Using Vercel CLI

```bash
# Login to Vercel
vercel login

# Set environment variable
vercel env add MONGO_URI

# Enter new connection string when prompted

# Pull latest config
vercel env pull

# Verify in .env.local (don't commit!)
cat .env.local
```

### Step 4: Test New Credentials Locally

```bash
# Update local .env.local with new MONGO_URI
MONGO_URI=mongodb+srv://sbp_prod_v2:NewPassword@cluster.mongodb.net/sbp_dev?retryWrites=true&w=majority

# Test connection
npm run dev

# Should see:
# ✅ MongoDB Connected
```

### Step 5: Verify Production Deployment

1. Go to https://sbp-ldj7.vercel.app
2. Test login functionality
3. Create a test booking
4. Check Vercel logs for any connection errors:
   ```bash
   vercel logs --tail
   ```

### Step 6: Revoke Old Credentials

1. Go back to MongoDB Atlas → Database Access
2. Find old user (e.g., `sbp_prod_v1`)
3. Click the trash icon → Delete User
4. Confirm deletion

---

## JWT_SECRET Rotation

### Step 1: Generate New Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output example:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Step 2: Update in Vercel

1. Vercel Dashboard → Settings → Environment Variables
2. Edit `JWT_SECRET`
3. Paste new secret
4. Select "Production"
5. Save and redeploy

### Step 3: Important Note

⚠️ **Existing JWT tokens will become invalid** when you change the secret.

- Users will need to log in again
- This is expected and secure behavior
- Plan rotation for off-peak hours

### Step 4: Monitor Login Issues

```bash
vercel logs --tail

# Look for JWT errors:
# "jwt malformed"
# "jwt expired"
```

If users report login issues, ensure JWT_SECRET is updated in all environments.

---

## Automated Monitoring

### GitHub Secret Scanning

Enable to catch accidental commits:

1. Settings → Code security and analysis
2. Enable "Secret scanning"
3. Enable "Push protection"

When enabled, GitHub will block commits containing:
- MongoDB URIs
- API keys
- JWT secrets

### Vercel Deployment Monitoring

Check deployment logs regularly:

```bash
# View logs in real-time
vercel logs --tail

# Check for:
# - Connection timeouts
# - Authentication failures
# - "MONGO_URI undefined" errors
```

---

## Incident Response - If Credentials Exposed

### Immediate Actions (< 1 hour)

1. **Stop exposure:**
   ```bash
   # Delete secret from git history (see SECURITY.md)
   git filter-repo --replace-text <(echo "old_secret==>REDACTED")
   git push -f origin main
   ```

2. **Rotate immediately:**
   - Follow steps above for MongoDB URI
   - Generate new JWT_SECRET
   - Update Vercel environment variables

3. **Notify team:**
   - Email team about rotation
   - Users will need to log in again
   - Monitor for suspicious activity

### Follow-up (24 hours)

- [ ] Review access logs in MongoDB Atlas
- [ ] Check Vercel logs for anomalies
- [ ] Enable additional monitoring
- [ ] Document incident
- [ ] Update security practices

---

## Credential Rotation Schedule

**Recommended:**

- **JWT_SECRET**: Every 90 days or quarterly
- **MongoDB URI**: Every 6 months or after personnel changes
- **API Keys**: Every 3 months
- **Emergency**: Immediately after suspected exposure

---

## Checklist

**Before Rotation:**
- [ ] Generate new credentials
- [ ] Test locally with new credentials
- [ ] Notify team of upcoming downtime

**During Rotation:**
- [ ] Update Vercel environment variables
- [ ] Verify deployment completes
- [ ] Test application functionality
- [ ] Revoke old credentials

**After Rotation:**
- [ ] Monitor logs for errors
- [ ] Verify users can log in
- [ ] Update documentation
- [ ] Document in security log

---

## Resources

- **MongoDB Atlas Security:** https://docs.mongodb.com/atlas/security/
- **Vercel Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables
- **Security Best Practices:** ../SECURITY.md

Last Updated: May 8, 2026
