# YouTube Project Migration Implementation Guide

## Overview
This guide provides step-by-step instructions for migrating all mux video functionality from the web project to a new dedicated YouTube application while maintaining feature parity and ensuring clean separation.

## Migration Checklist

### Phase 1: Project Setup ✅
- [ ] Create new youtube project structure
- [ ] Copy configuration files from web project
- [ ] Install dependencies and verify build
- [ ] Set up development environment

### Phase 2: Frontend Migration ✅
- [ ] Migrate app/mux directory structure
- [ ] Update component imports and references
- [ ] Migrate stores and state management
- [ ] Update routing and navigation
- [ ] Test all frontend functionality

### Phase 3: Backend Migration ✅
- [ ] Migrate video controller and services
- [ ] Update API routes and middleware
- [ ] Migrate webhook handling
- [ ] Update database models
- [ ] Test all backend endpoints

### Phase 4: Integration & Cleanup ✅
- [ ] Remove mux dependencies from web project
- [ ] Update navigation links
- [ ] Test cross-project references
- [ ] Verify no broken functionality
- [ ] Deploy and validate

## Step-by-Step Implementation

### Step 1: Create Project Structure

```bash
# Create youtube project directory
mkdir -p apps/youtube

# Copy package.json from web project and modify
cp apps/web/package.json apps/youtube/

# Update package.json name and dependencies
sed -i 's/"name": "web"/"name": "youtube"/' apps/youtube/package.json
```

### Step 2: Copy Configuration Files

```bash
# Copy essential configuration files
cp apps/web/next.config.mjs apps/youtube/
cp apps/web/tsconfig.json apps/youtube/
cp apps/web/postcss.config.mjs apps/youtube/
cp apps/web/components.json apps/youtube/
cp apps/web/next-env.d.ts apps/youtube/
cp apps/web/eslint.config.js apps/youtube/

# Create app directory structure
mkdir -p apps/youtube/app
cp -r apps/web/app/* apps/youtube/app/
```

### Step 3: Migrate Frontend Code

#### 3.1 Copy Mux Directory
```bash
# Copy all mux-related code
cp -r apps/web/app/mux apps/youtube/app/

# Rename mux directory to youtube for consistency
mv apps/youtube/app/mux apps/youtube/app/youtube
```

#### 3.2 Update Store References
```typescript
// Update store imports in all components
// Before: import { useMuxYouTubeStore } from "../stores/useMuxYouTubeStore"
// After: import { useYouTubeStore } from "../stores/useYouTubeStore"

// Rename store files
mv apps/youtube/app/youtube/stores/useMuxYouTubeStore.ts apps/youtube/app/youtube/stores/useYouTubeStore.ts
mv apps/youtube/app/youtube/stores/useMuxShortsStore.ts apps/youtube/app/youtube/stores/useShortsStore.ts
```

#### 3.3 Update Component Imports
```typescript
// Update all component imports to use new structure
// Update api imports
// Before: import api from "/lib/api"
// After: import api from "@/lib/api"

// Update UI component imports
// Before: import { Button } from "@workspace/ui/components/button"
// After: Keep as is - workspace imports remain the same
```

#### 3.4 Update Routing Structure
```typescript
// Create new app structure
apps/youtube/app/
├── layout.tsx          # Root layout with providers
├── page.tsx            # Home page with video feed
├── watch/
│   └── [id]
│       └── page.tsx    # Video detail page
├── upload/
│   └── page.tsx        # Upload page
├── shorts/
│   └── page.tsx        # Shorts page
├── channel/
│   └── [id]
│       └── page.tsx    # Channel page
├── search/
│   └── page.tsx        # Search page
└── api/                # API routes if needed
```

### Step 4: Migrate Backend Code

#### 4.1 Create Video Service Package
```bash
# Create new package for video services
mkdir -p packages/video-service

# Copy and migrate video controller
cp packages/server/controllers/videoController.ts packages/video-service/
cp packages/server/controllers/muxWebhookController.ts packages/video-service/
```

#### 4.2 Update Video Controller
```typescript
// Update imports and structure
import { supabase } from '@workspace/database';
import { Mux } from '@mux/mux-node';

// Update all database operations to use Supabase client
// Instead of: Video.findById(id)
// Use: supabase.from('videos').select('*').eq('id', id).single()
```

#### 4.3 Create New API Routes
```typescript
// Create dedicated video API routes
// packages/video-service/routes/videoRoutes.ts

import express from 'express';
import {
  initDirectUpload,
  finalizeUpload,
  listVideos,
  listShorts,
  getVideo,
  updateVideo,
  deleteVideo,
  trackVideoView,
  toggleVideoLike,
} from '../controllers/videoController';
import { handleMuxWebhook } from '../controllers/muxWebhookController';

const videoRouter = express.Router();

// Apply same route structure as before
videoRouter.post('/uploads', authenticate, initDirectUpload);
videoRouter.post('/uploads/finalize', authenticate, finalizeUpload);
videoRouter.get('/', listVideos);
videoRouter.get('/shorts', listShorts);
videoRouter.get('/:id', getVideo);
videoRouter.patch('/:id', authenticate, updateVideo);
videoRouter.delete('/:id', authenticate, deleteVideo);
videoRouter.post('/:id/view', authenticate, trackVideoView);
videoRouter.post('/:id/like', authenticate, toggleVideoLike);
videoRouter.post('/webhook', handleMuxWebhook);

export default videoRouter;
```

### Step 5: Update Database Schema

#### 5.1 Create Migration Script
```sql
-- Create youtube-specific tables
CREATE TABLE IF NOT EXISTS video_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO video_categories (name, slug, description) VALUES
('Gaming', 'gaming', 'Gaming content and gameplay videos'),
('Music', 'music', 'Music videos and audio content'),
('Education', 'education', 'Educational and tutorial content'),
('Entertainment', 'entertainment', 'Entertainment and comedy content'),
('Technology', 'technology', 'Technology reviews and tutorials'),
('Sports', 'sports', 'Sports highlights and analysis');

-- Update videos table with youtube-specific fields
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES video_categories(id),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
```

### Step 6: Update Environment Configuration

#### 6.1 Create Environment Variables
```bash
# Create .env.example for youtube project
# apps/youtube/.env.example

NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_YOUTUBE_URL=http://localhost:3002
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
MUX_WEBHOOK_SIGNING_SECRET=your_webhook_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 6.2 Update Package Scripts
```json
// Update apps/youtube/package.json scripts
{
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start -p 3002",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### Step 7: Clean Up Web Project

#### 7.1 Remove Mux Dependencies
```bash
# Remove mux-related dependencies from web project
cd apps/web
pnpm remove @mux/mux-player-react @mux/mux-uploader-react

# Remove mux directory
rm -rf apps/web/app/mux
```

#### 7.2 Update Navigation
```typescript
// Update navigation components to remove video references
// Update Header.tsx or navigation components
// Remove any links to /mux/* routes

// Update any components that reference video functionality
// Remove Video icon from navigation if present
```

#### 7.3 Update Package Configuration
```json
// Update root package.json workspaces
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}

// Update turbo.json to include youtube project
{
  "pipeline": {
    "dev": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    }
  }
}
```

### Step 8: Testing and Validation

#### 8.1 Test Frontend Functionality
```bash
# Start youtube project
cd apps/youtube
pnpm dev

# Test all pages:
# - Home page loads video feed
# - Upload functionality works
# - Video playback works
# - Shorts navigation works
# - Search functionality works
```

#### 8.2 Test Backend APIs
```bash
# Test video upload endpoint
curl -X POST http://localhost:3001/api/videos/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"fileSize": 5242880, "fileName": "test.mp4", "fileType": "video/mp4"}'

# Test video listing
curl http://localhost:3001/api/videos

# Test video playback (requires Mux setup)
```

#### 8.3 Integration Testing
```bash
# Test cross-project isolation
# Ensure web project runs without video functionality
cd apps/web && pnpm dev

# Verify no broken references
# Check for any console errors related to missing video components
```

## Common Issues and Solutions

### Issue 1: Import Path Errors
**Problem**: Components can't find imported modules after migration
**Solution**: Update all relative imports to use absolute paths with `@/` prefix

### Issue 2: State Management Conflicts
**Problem**: Store names conflicting between projects
**Solution**: Rename stores with youtube-specific prefixes: `useYouTubeStore`, `useShortsStore`

### Issue 3: API Endpoint Changes
**Problem**: Frontend can't find backend endpoints
**Solution**: Update API base URL configuration and ensure proper CORS setup

### Issue 4: Database Connection Issues
**Problem**: Supabase connection fails in new project
**Solution**: Verify environment variables and database permissions for youtube project

### Issue 5: Build Configuration Errors
**Problem**: TypeScript or build errors after migration
**Solution**: Ensure all configuration files are properly copied and paths are updated

## Deployment Considerations

### Environment Variables
Ensure all required environment variables are set for production:
- Mux API credentials
- Supabase connection details
- JWT secrets for authentication
- CORS origins for cross-domain requests

### Database Migrations
Run database migrations before deployment:
```bash
# Apply migrations to production database
supabase db push
```

### CDN and Storage
Configure Supabase storage for:
- Video thumbnail storage
- User avatar storage
- Channel banner storage

### Monitoring and Analytics
Set up monitoring for:
- Video upload success rates
- Playback performance metrics
- Error tracking and logging
- User engagement analytics

## Post-Migration Checklist

### Performance Optimization
- [ ] Implement video lazy loading
- [ ] Optimize thumbnail generation
- [ ] Add caching for frequently accessed data
- [ ] Implement pagination for large datasets

### Security Hardening
- [ ] Validate all file uploads
- [ ] Implement rate limiting for API endpoints
- [ ] Add content moderation for uploads
- [ ] Secure webhook endpoints

### Feature Enhancements
- [ ] Add video transcoding options
- [ ] Implement adaptive bitrate streaming
- [ ] Add closed caption support
- [ ] Implement video chapters

### Documentation
- [ ] Update API documentation
- [ ] Create user guides for creators
- [ ] Document deployment procedures
- [ ] Create troubleshooting guides

## Conclusion

This migration creates a fully independent YouTube platform while preserving all existing functionality. The new architecture provides better separation of concerns, improved scalability, and easier maintenance for both the chat application and video platform.

The migration maintains backward compatibility where possible while establishing clean boundaries between the two applications. Regular testing throughout the process ensures no functionality is lost during the transition.