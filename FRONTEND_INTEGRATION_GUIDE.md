# Frontend Integration Guide - Subscription System

## 🎯 Overview

The frontend now has complete integration with the subscription system backend. This guide shows you how to use all the new components and services.

---

## 📦 New Files Created

### **Services**
- `src/services/usageService.ts` - Track usage and check limits
- `src/services/documentServiceAPI.ts` - Backend-integrated document service

### **Components**
- `src/components/dashboard/UsageStats.tsx` - Full usage statistics dashboard
- `src/components/UsageIndicator.tsx` - Compact usage widget
- `src/components/UpgradeModal.tsx` - Beautiful upgrade prompts
- `src/components/FeatureGate.tsx` - Restrict premium features
- `src/components/DocumentCreationExample.tsx` - Integration example

### **Hooks**
- `src/hooks/useUpgradePrompt.ts` - Handle limit errors and show upgrade prompts

---

## 🚀 Quick Start

### **1. Display Usage Stats in Dashboard**

Add to your `Dashboard.tsx` or `UserDashboard.tsx`:

```typescript
import { UsageStats } from '../components/dashboard/UsageStats';

function Dashboard() {
  return (
    <div>
      {/* Existing dashboard content */}

      {/* Add usage stats */}
      <UsageStats />
    </div>
  );
}
```

### **2. Add Compact Usage Indicator to Header**

Add to your `Navbar.tsx` or sidebar:

```typescript
import { UsageIndicator } from '../components/UsageIndicator';

function Navbar() {
  return (
    <nav>
      {/* Existing nav items */}

      {/* Compact indicator */}
      <UsageIndicator compact={true} />
    </nav>
  );
}
```

### **3. Handle Document Creation with Limits**

Update your document creation code:

```typescript
import { documentServiceAPI } from '../services/documentServiceAPI';
import { useUpgradePrompt } from '../hooks/useUpgradePrompt';
import { UpgradeModal } from '../components/UpgradeModal';

function DocumentEditor() {
  const { promptState, handleApiError, closeUpgradePrompt } = useUpgradePrompt();

  const saveDocument = async () => {
    try {
      const result = await documentServiceAPI.create({
        title: 'My Document',
        content: 'Document content',
        templateId: 'blog-post',
      });

      // Success! Show usage info
      console.log('Documents remaining:', result.usage?.documents?.remaining);
    } catch (error) {
      // Handle limit errors automatically
      const wasLimitError = handleApiError(error);

      if (!wasLimitError) {
        // Handle other errors
        console.error('Failed to create document:', error);
      }
    }
  };

  return (
    <>
      <button onClick={saveDocument}>Save</button>

      {/* Upgrade modal shows automatically when limit is hit */}
      <UpgradeModal
        isOpen={promptState.isOpen}
        onClose={closeUpgradePrompt}
        {...promptState}
      />
    </>
  );
}
```

### **4. Gate Premium Features**

Wrap premium features with `FeatureGate`:

```typescript
import { FeatureGate, FeatureLock } from '../components/FeatureGate';

function CollaborationPanel() {
  return (
    <FeatureGate feature="collaboration">
      {/* This content only shows for AGENCY & ENTERPRISE users */}
      <div>
        <h3>Team Collaboration</h3>
        <p>Invite team members...</p>
      </div>
    </FeatureGate>
  );
}

// Or show a lock icon inline
function FeatureList() {
  return (
    <div>
      <h3>
        Advanced Analytics
        <FeatureLock feature="advanced-analytics" requiredPlan="AGENCY" compact />
      </h3>
    </div>
  );
}
```

---

## 📊 Usage Service API

### **Get Current Usage Stats**

```typescript
import { usageService } from '../services/usageService';

const stats = await usageService.getUsageStats();

console.log('AI Generations:', stats.usage.aiGenerations);
// { current: 7, limit: 10, remaining: 3, percentage: 70 }

console.log('Documents:', stats.usage.documents);
// { currentMonth: 4, total: 12, limit: 5, remaining: 1, percentage: 80 }

console.log('Storage:', stats.usage.storage);
// { used: "0.05GB", limit: "0.1GB", percentage: 50 }

console.log('Features:', stats.features);
// { collaboration: false, brandVoice: true, ... }
```

### **Check Feature Access**

```typescript
const result = await usageService.checkFeatureAccess('collaboration');

if (result.hasAccess) {
  // User can access collaboration
} else {
  // Show upgrade prompt
  console.log('Requires:', result.requiredPlans); // ['AGENCY', 'ENTERPRISE']
}
```

### **Check Specific Limits**

```typescript
const aiLimit = await usageService.checkLimit('aiGenerations');
console.log(aiLimit);
// { withinLimit: true, current: 7, limit: 10, percentage: 70 }

if (!aiLimit.withinLimit) {
  // Show upgrade prompt
}
```

### **Check Export Format Availability**

```typescript
const canExportDocx = await usageService.canExportFormat('DOCX');

if (!canExportDocx) {
  alert('DOCX export requires PRO plan');
}
```

---

## 🎨 Component Examples

### **UsageStats Component**

Full-featured usage dashboard:

```typescript
import { UsageStats } from '../components/dashboard/UsageStats';

<UsageStats />
```

Features:
- ✅ Real-time usage tracking
- ✅ Progress bars with color coding
- ✅ Feature availability list
- ✅ Automatic upgrade prompts when nearing limits
- ✅ Refresh button

### **UsageIndicator Component**

Compact widget for header/sidebar:

```typescript
import { UsageIndicator } from '../components/UsageIndicator';

// Compact version (one line)
<UsageIndicator compact={true} />

// Full version (card)
<UsageIndicator />
```

### **UpgradeModal Component**

Beautiful upgrade prompts:

```typescript
import { UpgradeModal } from '../components/UpgradeModal';

<UpgradeModal
  isOpen={true}
  onClose={() => setOpen(false)}
  limitType="documents" // or 'aiGenerations', 'storage', 'feature'
  message="You've reached your monthly document limit"
  currentPlan="FREE"
/>
```

### **FeatureGate Component**

Conditional rendering based on plan:

```typescript
import { FeatureGate } from '../components/FeatureGate';

// Option 1: Hide completely (shows fallback or upgrade prompt)
<FeatureGate feature="collaboration">
  <CollaborationPanel />
</FeatureGate>

// Option 2: Show blurred with lock overlay
<FeatureGate feature="api-access" showUpgradeButton={true}>
  <ApiAccessPanel />
</FeatureGate>

// Option 3: Custom fallback
<FeatureGate
  feature="advanced-analytics"
  fallback={<div>Upgrade to PRO to access analytics</div>}
>
  <AnalyticsDashboard />
</FeatureGate>
```

---

## 🔧 Document Service API

Replace `documentService` with `documentServiceAPI` for backend integration:

### **Create Document**

```typescript
import { documentServiceAPI } from '../services/documentServiceAPI';

try {
  const result = await documentServiceAPI.create({
    title: 'My Blog Post',
    content: 'Content here...',
    templateId: 'blog-post',
    folderId: 'optional-folder-id',
    tags: ['tech', 'ai'],
  });

  console.log('Document created:', result.document);
  console.log('Usage:', result.usage);
  // usage: {
  //   documents: { current: 5, limit: 10, remaining: 5 },
  //   storage: { currentGB: "0.05", limitGB: 5, percentage: 1 }
  // }
} catch (error) {
  if (error.status === 429) {
    // Limit reached - show upgrade modal
  }
}
```

### **List Documents**

```typescript
const { documents, pagination } = await documentServiceAPI.getAll({
  page: 1,
  limit: 20,
  search: 'keyword',
  templateId: 'blog-post',
  includeDeleted: false,
});
```

### **Update Document**

```typescript
await documentServiceAPI.update('doc-id', {
  title: 'Updated Title',
  content: 'Updated content',
  createVersion: true, // Save as new version
  versionDescription: 'Added conclusion',
});
```

### **Get Document Versions**

```typescript
const { versions } = await documentServiceAPI.getVersions('doc-id');

// Restore to a previous version
await documentServiceAPI.restoreVersion('doc-id', 'version-id');
```

### **Delete & Restore**

```typescript
// Soft delete
await documentServiceAPI.delete('doc-id');

// Restore
await documentServiceAPI.restore('doc-id');

// Permanent delete
await documentServiceAPI.hardDelete('doc-id');
```

---

## 🎯 Integration Patterns

### **Pattern 1: Document Creation with Error Handling**

```typescript
import { documentServiceAPI } from '../services/documentServiceAPI';
import { useUpgradePrompt } from '../hooks/useUpgradePrompt';
import { UpgradeModal } from '../components/UpgradeModal';

function MyComponent() {
  const { promptState, handleApiError, closeUpgradePrompt } = useUpgradePrompt();

  const createDoc = async () => {
    try {
      await documentServiceAPI.create({ /* ... */ });
    } catch (error) {
      if (!handleApiError(error)) {
        // Handle non-limit errors
        showToast(error.message);
      }
    }
  };

  return (
    <>
      <button onClick={createDoc}>Create</button>
      <UpgradeModal {...promptState} onClose={closeUpgradePrompt} />
    </>
  );
}
```

### **Pattern 2: Feature Gate with Custom Fallback**

```typescript
<FeatureGate
  feature="collaboration"
  fallback={
    <div className="text-center p-6">
      <p>Collaboration requires Agency plan</p>
      <a href="/pricing" className="btn-primary">Upgrade Now</a>
    </div>
  }
>
  <TeamCollaboration />
</FeatureGate>
```

### **Pattern 3: Manual Limit Checking**

```typescript
import { usageService } from '../services/usageService';

async function handleAction() {
  const { withinLimit, percentage } = await usageService.checkLimit('aiGenerations');

  if (!withinLimit) {
    alert('You\'ve reached your AI generation limit. Please upgrade.');
    return;
  }

  if (percentage >= 80) {
    // Warn user they're running low
    showToast('You\'re running low on AI generations. Consider upgrading.');
  }

  // Proceed with action
  await generateAIContent();
}
```

### **Pattern 4: Export with Format Checking**

```typescript
async function exportDocument(format: 'PDF' | 'DOCX' | 'HTML') {
  const canExport = await usageService.canExportFormat(format);

  if (!canExport) {
    showUpgradeModal({
      limitType: 'feature',
      feature: `${format} Export`,
      message: `Your plan doesn't support ${format} export`,
    });
    return;
  }

  // Proceed with export
  await performExport(format);
}
```

---

## 🎨 Styling & Theming

All components support dark mode and use Tailwind CSS:

```typescript
// Light mode
<UsageStats />

// Dark mode (automatically detected from parent theme)
<div className="dark">
  <UsageStats />
</div>
```

Color coding:
- 🟢 Green: 0-49% usage
- 🟡 Yellow: 50-74% usage
- 🟠 Orange: 75-89% usage
- 🔴 Red: 90-100% usage

---

## 🧪 Testing

### **Test Limit Errors Locally**

1. Create a FREE user account
2. Create 5 documents (should work)
3. Try to create 6th document (should show upgrade modal)

```typescript
// Manually trigger upgrade modal for testing
import { useUpgradePrompt } from '../hooks/useUpgradePrompt';

const { showUpgradePrompt } = useUpgradePrompt();

// Test different limit types
showUpgradePrompt('documents', {
  message: 'Test: Document limit reached',
  currentPlan: 'FREE',
});

showUpgradePrompt('aiGenerations', {
  message: 'Test: AI generation limit reached',
});

showUpgradePrompt('feature', {
  feature: 'Collaboration',
  message: 'Test: Feature not available',
});
```

---

## 📋 Migration Checklist

To fully integrate the subscription system:

- [ ] Add `<UsageStats />` to dashboard
- [ ] Add `<UsageIndicator compact />` to header
- [ ] Replace `documentService` with `documentServiceAPI`
- [ ] Add `useUpgradePrompt` hook to document creation
- [ ] Wrap premium features with `<FeatureGate>`
- [ ] Add export format checking before export
- [ ] Update AI generation to use backend proxy (separate guide)
- [ ] Test all limit scenarios
- [ ] Add usage warnings before limits are reached
- [ ] Update pricing page links

---

## 🚀 Next Steps

1. **Add to Dashboard**: Include `UsageStats` component
2. **Update Document Flows**: Use `documentServiceAPI` with error handling
3. **Gate Premium Features**: Wrap features with `FeatureGate`
4. **Test Limits**: Create test accounts and verify limits work
5. **Polish UX**: Add toast notifications, loading states, etc.

---

## 💡 Best Practices

1. **Always use `handleApiError`** to catch limit errors
2. **Show usage stats proactively** - don't wait for users to hit limits
3. **Warn before limits** - show warnings at 80% usage
4. **Make upgrades obvious** - clear CTAs when limits approached
5. **Handle offline gracefully** - fallback to localStorage if backend unavailable
6. **Cache usage stats** - refresh every 5 minutes, not on every render
7. **Provide clear messaging** - explain why upgrade is needed

---

## 🐛 Troubleshooting

### Upgrade modal not showing

```typescript
// Make sure you're calling handleApiError
catch (error) {
  const wasLimitError = handleApiError(error);
  if (!wasLimitError) {
    // Your error handling
  }
}
```

### Usage stats not loading

```typescript
// Check authentication
const token = localStorage.getItem('auth_token');
if (!token) {
  // User not logged in
}

// Check API URL
console.log(import.meta.env.VITE_API_URL);
```

### Feature gate not working

```typescript
// Check feature name matches backend
const validFeatures = [
  'collaboration',
  'advanced-analytics',
  'api-access',
  'priority-support',
  'brand-voice',
];
```

---

## 📚 Additional Resources

- Backend API Documentation: `SUBSCRIPTION_SYSTEM_GUIDE.md`
- Deployment Guide: `DEPLOYMENT_GUIDE.md`
- Pricing Configuration: `src/config/pricing.ts`

---

**The frontend is now fully integrated with the subscription system! 🎉**

Users will see beautiful upgrade prompts, real-time usage tracking, and seamless limit enforcement.
