# Contributing to chat-app

Thank you for your interest in contributing to chat-app! This guide will help you understand our project structure, coding standards, and contribution process.

## Table of Contents
- [Project Structure Guidelines](#project-structure-guidelines)
- [Styling Requirements](#styling-requirements)
- [Code Reusability Policy](#code-reusability-policy)
- [Project Familiarization Process](#project-familiarization-process)
- [Contribution Workflow](#contribution-workflow)
- [Technical Onboarding](#technical-onboarding)

---

## Project Structure Guidelines

### Monorepo Structure
```
chat-app/
├── apps/
│   └── web/                    # Next.js frontend application
├── packages/
│   ├── database/              # MongoDB schemas and types
│   ├── server/                # Express.js backend API
│   ├── ui/                    # Shared UI components
│   ├── eslint-config/         # ESLint configuration
│   └── typescript-config/   # TypeScript configuration
├── pnpm-workspace.yaml      # Workspace configuration
└── turbo.json               # Build system configuration
```

### Directory Purposes

**apps/web/** - Next.js frontend application
- Contains all UI components, pages, and client-side logic
- Uses TypeScript, Tailwind CSS, and modern React patterns
- Implements real-time messaging with Socket.io

**packages/server/** - Express.js backend API
- RESTful API endpoints for authentication, messaging, and user management
- WebSocket server for real-time communication
- Middleware for authentication, error handling, and file uploads

**packages/database/** - MongoDB schemas and types
- Mongoose schemas for User, Chat, Message, and OTP models
- TypeScript type definitions shared across the project
- Database connection utilities

**packages/ui/** - Shared UI components
- Reusable React components built with Radix UI
- Consistent styling with Tailwind CSS
- Component library for the entire application

**⚠️ IMPORTANT:** Maintain the existing folder structure exactly as shown. Do not create new directories or move files without prior discussion.

---

## Styling Requirements

### CSS Guidelines
- **USE ONLY** the global CSS styles provided in the project
- **NO NEW CSS FILES** - Do not create additional CSS files
- **NO INLINE STYLES** - Avoid using `style={{}}` unless absolutely necessary
- **TAILWIND ONLY** - Use Tailwind CSS classes for all styling needs

### ✅ Correct Styling Examples
```tsx
// Good: Using Tailwind classes
<div className="flex items-center justify-between p-4 bg-background">
  <h1 className="text-lg font-semibold text-foreground">Chat Room</h1>
</div>

// Good: Using UI components with Tailwind
<Button className="w-full" variant="outline">
  Send Message
</Button>
```

### ❌ Incorrect Styling Examples
```tsx
// Bad: Inline styles
<div style={{ display: 'flex', padding: '16px' }}>
  <h1 style={{ fontSize: '18px' }}>Chat Room</h1>
</div>

// Bad: New CSS files
// Don't create: styles/ChatRoom.css
// Don't import: import './ChatRoom.css'
```

### Global CSS Location
The main global CSS file is located at:
- `packages/ui/src/styles/globals.css` - Contains all global styles and Tailwind directives

---

## Code Reusability Policy

### Understanding Existing Code
Before implementing any new features:
1. **EXPLORE** the entire codebase to understand existing patterns
2. **SEARCH** for similar functionality before creating new code
3. **REUSE** existing components, functions, and utilities
4. **EXTEND** current implementations rather than duplicating

### Reusable Patterns Examples

**API Client Reuse:**
```tsx
// Good: Reuse existing api client
import api from '@/lib/api';

// Use existing patterns
const response = await api.get('/api/users');
```

**Component Reuse:**
```tsx
// Good: Import existing components
import { Button } from '@workspace/ui/components';
import { Input } from '@workspace/ui/components';

// Don't create new button components
```

**Socket Reuse:**
```tsx
// Good: Use existing socket utilities
import { getSocket } from '@/lib/socket';

const socket = getSocket();
```

**Hook Reuse:**
```tsx
// Good: Use existing hooks
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
```

### Before Creating New Code
Ask yourself:
- [ ] Does a similar component/function already exist?
- [ ] Can I extend an existing implementation?
- [ ] Have I searched the codebase for similar patterns?
- [ ] Can I reuse existing types/interfaces?

---

## Project Familiarization Process

### Website Exploration Checklist
Before contributing, **YOU MUST** explore the entire website:

**Authentication Features:**
- [ ] Register a new account
- [ ] Login with email/password
- [ ] Test Google OAuth login
- [ ] Verify email functionality
- [ ] Test logout functionality

**Chat Features:**
- [ ] Create a new chat
- [ ] Send text messages
- [ ] Send media files (images)
- [ ] Test typing indicators
- [ ] Test message read receipts
- [ ] Test reply functionality
- [ ] Test emoji picker

**User Management:**
- [ ] Update profile information
- [ ] Upload avatar image
- [ ] Search for other users
- [ ] Test online/offline status

**Responsive Design:**
- [ ] Test on mobile devices
- [ ] Test on tablet devices
- [ ] Test on desktop screens
- [ ] Verify touch interactions

### Technical Architecture Review
**Frontend Technologies:**
- Next.js 15 with App Router
- React 19 with TypeScript
- Tailwind CSS for styling
- Socket.io for real-time communication
- Zustand for state management

**Backend Technologies:**
- Express.js with TypeScript
- MongoDB with Mongoose
- JWT authentication
- WebSocket server
- Cloudflare R2 for file storage

**Key Files to Review:**
- `apps/web/lib/api.ts` - API client configuration
- `apps/web/lib/socket.ts` - Socket connection utilities
- `packages/server/app.ts` - Express server setup
- `packages/server/sockets/` - WebSocket event handlers
- `packages/database/src/schemas/` - Database models

---

## Contribution Workflow

### Issue Selection
1. **Browse Issues** - Look for issues labeled `good first issue` or `help wanted`
2. **Match Skills** - Select issues that align with your expertise
3. **Ask Questions** - Comment on issues for clarification
4. **Claim Issue** - Ask to be assigned before starting work

### Git Workflow
```bash
# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/mani254/chat-app.git
cd chat-app

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make your changes
# 5. Test thoroughly
# 6. Commit with clear messages
git commit -m "feat: add typing indicator animation"

# 7. Push to your fork
git push origin feature/your-feature-name

# 8. Create a Pull Request
```

### Testing Requirements
Before submitting a PR:
- [ ] Test all authentication flows
- [ ] Test messaging functionality
- [ ] Test file uploads
- [ ] Test responsive design
- [ ] Test on multiple browsers
- [ ] Run linting: `pnpm lint`
- [ ] Run type checking: `pnpm check-types`

### Code Review Expectations
- All PRs require at least one review
- Address all review comments
- Keep PRs focused and small
- Include screenshots for UI changes
- Update documentation if needed

---

## Technical Onboarding

### Setup Instructions
```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp apps/web/.env.local.example apps/web/.env.local
cp packages/server/.env.example packages/server/.env

# 3. Start MongoDB (ensure it's running)
# 4. Start development servers
pnpm dev
```

### Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_BACKEND_URL=http://localhost:5000
```

**Backend (.env):**
```
MONGO_URI=mongodb://localhost:27017/chat-app
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
# ... other variables. Check in README.md for more details
```

### Common Troubleshooting

**Port Already in Use:**
```bash
# Kill process on port 3000
npx kill-port 3000
# Kill process on port 5000
npx kill-port 5000
```

**MongoDB Connection Issues:**
- Ensure MongoDB is running: `mongod`
- Check connection string in .env file
- Verify MongoDB is accessible on port 27017

**Socket Connection Issues:**
- Check CORS configuration in server
- Verify frontend URL matches backend CORS settings
- Check browser console for WebSocket errors

### Testing
```bash
# Run linting
pnpm lint

# Run type checking
pnpm check-types

# Build all packages
pnpm build
```

### Build & Deployment
```bash
# Build for production
pnpm build

# Start production server
cd packages/server && pnpm start

# Start production frontend
cd apps/web && pnpm start
```

---

## Need Help?

If you need assistance:
1. Check existing issues and documentation
2. Ask questions in issue comments
3. Join our community discussions
4. Be patient and respectful

**Happy Contributing! 🚀**