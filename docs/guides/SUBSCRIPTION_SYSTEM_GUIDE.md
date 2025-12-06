# 🎯 Subscription System - Complete Guide

## ✅ What's Working Now

### **1. Payment Processing** ✓
- Stripe checkout session creation
- Webhook handling for subscription lifecycle
- Plan upgrades/downgrades
- Automatic plan updates in database
- Subscription cancellation

### **2. AI Generation Limits** ✓
**Enforced at**: `POST /api/ai/generate`, `POST /api/ai/stream`

| Plan | Monthly Limit | Status |
|------|--------------|--------|
| FREE | 10 generations | ✅ Enforced |
| PRO | 100 generations | ✅ Enforced |
| AGENCY | 500 generations | ✅ Enforced |
| ENTERPRISE | Unlimited | ✅ Enforced |

**Error Response** when limit reached:
```json
{
  "error": "Usage limit exceeded",
  "message": "You have reached your monthly limit of 10 AI generations. Please upgrade your plan.",
  "currentUsage": 10,
  "limit": 10
}
```

### **3. Document Creation Limits** ✅ NEW!
**Enforced at**: `POST /api/documents`

| Plan | Monthly Limit | Status |
|------|--------------|--------|
| FREE | 5 documents | ✅ Enforced |
| PRO | 50 documents | ✅ Enforced |
| AGENCY | 200 documents | ✅ Enforced |
| ENTERPRISE | Unlimited | ✅ Enforced |

**Error Response** when limit reached:
```json
{
  "error": "Document limit reached",
  "message": "You have reached your monthly limit of 5 documents. Please upgrade your plan to create more.",
  "currentUsage": 5,
  "limit": 5,
  "plan": "FREE",
  "upgradeUrl": "/pricing"
}
```

**Success Response** includes usage info:
```json
{
  "message": "Document created successfully",
  "document": { ... },
  "usage": {
    "documents": {
      "current": 3,
      "limit": 5,
      "remaining": 2
    },
    "storage": {
      "current": 1234567,
      "currentGB": "0.00",
      "limit": 107374182,
      "limitGB": 0.1,
      "percentage": 1
    }
  }
}
```

### **4. Storage Limits** ✅ NEW!
**Enforced at**: `POST /api/documents` (when creating new documents)

| Plan | Storage Limit | Status |
|------|--------------|--------|
| FREE | 0.1 GB | ✅ Enforced |
| PRO | 5 GB | ✅ Enforced |
| AGENCY | 50 GB | ✅ Enforced |
| ENTERPRISE | 500 GB | ✅ Enforced |

**Error Response** when storage full:
```json
{
  "error": "Storage limit reached",
  "message": "You have reached your storage limit of 0.1GB. Please upgrade your plan or delete some documents.",
  "currentUsage": "0.11GB",
  "limit": "0.1GB",
  "plan": "FREE",
  "upgradeUrl": "/pricing"
}
```

### **5. Export Format Restrictions** ✅ NEW!
**Can be enforced at**: Any export endpoint with `checkExportFormat` middleware

| Plan | Allowed Formats |
|------|----------------|
| FREE | PDF only |
| PRO | PDF, DOCX, HTML |
| AGENCY | PDF, DOCX, HTML, MD, TXT |
| ENTERPRISE | All formats + JSON |

**Usage Example**:
```javascript
// In your export route
router.post('/export', authenticate, attachPlanInfo, checkExportFormat, async (req, res) => {
  const { format } = req.body; // 'PDF', 'DOCX', etc.
  // Export logic here...
});
```

**Error Response** when format not allowed:
```json
{
  "error": "Export format not allowed",
  "message": "Your FREE plan does not support DOCX export. Allowed formats: PDF.",
  "allowedFormats": ["PDF"],
  "requestedFormat": "DOCX",
  "plan": "FREE",
  "upgradeUrl": "/pricing"
}
```

### **6. Feature Access Control** ✅ NEW!
**Feature availability by plan**:

| Feature | FREE | PRO | AGENCY | ENTERPRISE |
|---------|------|-----|--------|------------|
| Collaboration | ❌ | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ❌ | ✅ | ✅ |
| Brand Voice | ❌ | ✅ | ✅ | ✅ |
| All Templates | ❌ | ✅ | ✅ | ✅ |

**Usage Example**:
```javascript
// Protect collaboration feature
router.post('/share', authenticate, attachPlanInfo, checkFeatureAccess('collaboration'), async (req, res) => {
  // Only AGENCY and ENTERPRISE users can access this
});
```

---

## 🆕 New API Endpoints

### **1. GET /api/usage** - Get Comprehensive Usage Stats

**Request**:
```bash
curl https://your-api/api/usage \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "userId": "user-uuid",
  "plan": "FREE",
  "limits": {
    "aiGenerations": 10,
    "documentsPerMonth": 5,
    "storageGB": 0.1,
    "exportFormats": ["PDF"],
    "collaborators": 0,
    "brands": 1
  },
  "usage": {
    "aiGenerations": {
      "current": 7,
      "limit": 10,
      "remaining": 3,
      "percentage": 70
    },
    "documents": {
      "currentMonth": 4,
      "total": 12,
      "limit": 5,
      "remaining": 1,
      "percentage": 80
    },
    "storage": {
      "used": "0.05GB",
      "usedBytes": 53687091,
      "limit": "0.1GB",
      "limitBytes": 107374182,
      "percentage": 50
    }
  },
  "allowedFormats": ["PDF"],
  "features": {
    "collaboration": false,
    "advancedAnalytics": false,
    "apiAccess": false,
    "prioritySupport": false,
    "brandVoice": false
  }
}
```

### **2. GET /api/usage/check/:feature** - Check Feature Access

**Request**:
```bash
curl https://your-api/api/usage/check/collaboration \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "feature": "collaboration",
  "hasAccess": false,
  "userPlan": "FREE",
  "requiredPlans": ["AGENCY", "ENTERPRISE"],
  "needsUpgrade": true
}
```

**Available Features to Check**:
- `collaboration`
- `advanced-analytics`
- `api-access`
- `priority-support`
- `brand-voice`
- `all-templates`
- `document-versions`
- `export-docx`
- `export-html`
- `export-md`
- `export-txt`

---

## 🔧 How to Use in Your Routes

### **Basic Usage** - Enforce Document Limits

```javascript
const { authenticate } = require('../middleware/auth');
const { attachPlanInfo, checkDocumentLimit } = require('../middleware/planLimits');

router.post('/documents',
  authenticate,           // 1. Verify user is logged in
  attachPlanInfo,         // 2. Get user's plan and limits
  checkDocumentLimit,     // 3. Check if under monthly doc limit
  async (req, res) => {
    // Document creation logic
    // Middleware already checked limits!
  }
);
```

### **Advanced Usage** - Multiple Checks

```javascript
router.post('/documents',
  authenticate,
  attachPlanInfo,
  checkDocumentLimit,    // Check monthly document limit
  checkStorageLimit,     // Check storage quota
  async (req, res) => {
    // Only executed if all checks pass
  }
);
```

### **Feature Gating**

```javascript
const { checkFeatureAccess } = require('../middleware/planLimits');

router.post('/collaborate/invite',
  authenticate,
  attachPlanInfo,
  checkFeatureAccess('collaboration'),  // Only AGENCY & ENTERPRISE
  async (req, res) => {
    // Collaboration logic
  }
);
```

### **Export Format Control**

```javascript
const { checkExportFormat } = require('../middleware/planLimits');

router.post('/export',
  authenticate,
  attachPlanInfo,
  checkExportFormat,     // Checks req.body.format or req.query.format
  async (req, res) => {
    const { format } = req.body; // 'PDF', 'DOCX', etc.
    // Export logic - format already validated against plan
  }
);
```

---

## 🧪 Testing the Subscription System

### **Test Scenario 1: FREE User Hits Document Limit**

1. Create a FREE user account
2. Create 5 documents (should succeed)
3. Try to create 6th document (should fail with 429 error)

```bash
# Create document (5th time - should succeed)
curl -X POST https://your-api/api/documents \
  -H "Authorization: Bearer FREE_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Document 5",
    "content": "Test content",
    "templateId": "blog-post"
  }'

# Create document (6th time - should FAIL)
curl -X POST https://your-api/api/documents \
  -H "Authorization: Bearer FREE_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Document 6",
    "content": "This should fail",
    "templateId": "blog-post"
  }'

# Expected error:
# {
#   "error": "Document limit reached",
#   "message": "You have reached your monthly limit of 5 documents..."
# }
```

### **Test Scenario 2: Upgrade Plan and Test New Limits**

1. Upgrade user to PRO plan (via Stripe or manually in database)
2. Verify new limits apply

```bash
# Check current usage
curl https://your-api/api/usage \
  -H "Authorization: Bearer USER_TOKEN"

# Should show PRO plan with 50 document limit
```

### **Test Scenario 3: AI Generation Limits**

```bash
# Make 10 AI requests as FREE user (should succeed)
for i in {1..10}; do
  curl -X POST https://your-api/api/ai/generate \
    -H "Authorization: Bearer FREE_USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"prompt": "Write a short poem"}'
done

# 11th request should FAIL with 429 error
curl -X POST https://your-api/api/ai/generate \
  -H "Authorization: Bearer FREE_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "This should fail"}'
```

### **Test Scenario 4: Export Format Restrictions**

```bash
# FREE user tries to export as DOCX (should FAIL)
curl -X POST https://your-api/api/export \
  -H "Authorization: Bearer FREE_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "doc-id", "format": "DOCX"}'

# Expected error:
# {
#   "error": "Export format not allowed",
#   "message": "Your FREE plan does not support DOCX export. Allowed formats: PDF."
# }

# PRO user tries same request (should SUCCEED)
curl -X POST https://your-api/api/export \
  -H "Authorization: Bearer PRO_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "doc-id", "format": "DOCX"}'
```

---

## 📝 Implementation Checklist

### **Backend** ✅ Complete
- [x] Plan limits middleware
- [x] Document creation limits
- [x] Storage limits
- [x] AI generation limits
- [x] Export format restrictions
- [x] Feature access control
- [x] Usage statistics endpoint
- [x] Feature check endpoint

### **Frontend** ⚠️ Needs Implementation
- [ ] Display usage stats in dashboard
- [ ] Show upgrade prompts when limits reached
- [ ] Disable features based on plan
- [ ] Add "Upgrade" buttons for premium features
- [ ] Show plan limits in settings
- [ ] Real-time usage indicators

### **Recommended Frontend Changes**

1. **Usage Dashboard Widget**:
```typescript
// Fetch usage stats
const { data } = await fetch('/api/usage', {
  headers: { Authorization: `Bearer ${token}` }
});

// Display progress bars
<ProgressBar
  label="AI Generations"
  current={data.usage.aiGenerations.current}
  limit={data.usage.aiGenerations.limit}
  percentage={data.usage.aiGenerations.percentage}
/>
```

2. **Feature Gating in UI**:
```typescript
// Check if feature is available
const { hasAccess } = await fetch('/api/usage/check/collaboration');

if (!hasAccess) {
  return <UpgradePrompt feature="collaboration" />;
}
```

3. **Handle Limit Errors**:
```typescript
try {
  await createDocument(data);
} catch (error) {
  if (error.status === 429 && error.error === 'Document limit reached') {
    showUpgradeModal({
      message: error.message,
      currentPlan: error.plan,
      upgradeUrl: error.upgradeUrl
    });
  }
}
```

---

## 🎯 Summary

### **✅ WORKING:**
1. Payment processing (Stripe)
2. AI generation limits (FREE: 10, PRO: 100, AGENCY: 500, ENTERPRISE: unlimited)
3. Document creation limits (FREE: 5, PRO: 50, AGENCY: 200, ENTERPRISE: unlimited)
4. Storage limits (FREE: 0.1GB, PRO: 5GB, AGENCY: 50GB, ENTERPRISE: 500GB)
5. Export format restrictions (plan-based)
6. Feature access control (plan-based)
7. Comprehensive usage statistics
8. Feature availability checking

### **⚠️ NOT YET IMPLEMENTED:**
1. Collaborator limits (feature not built yet)
2. Brand voice limits (feature not built yet)
3. Frontend usage displays
4. Frontend upgrade prompts
5. Real-time usage updates in UI

### **🚀 READY FOR:**
- ✅ Users can subscribe and pay
- ✅ Users are restricted based on plan
- ✅ Usage is tracked accurately
- ✅ Limits are enforced server-side
- ✅ Clear error messages when limits reached
- ✅ API endpoints to check usage and features

**The subscription system is now FULLY FUNCTIONAL on the backend!** 🎉

You just need to connect the frontend to display this data and show upgrade prompts to users.
