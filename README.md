# Multi-Tenant SaaS Boilerplate

A production-ready, multi-tenant SaaS boilerplate built with modern web technologies. Features organization management, team collaboration, role-based permissions, and a complete invitation system.

## 🚀 Tech Stack

### Core Framework
- **SvelteKit 2** - Full-stack web framework with SSR
- **Svelte 5** - Reactive UI library with runes
- **TypeScript** - End-to-end type safety

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui (Svelte)** - Beautiful, accessible components
- **Lucide Svelte** - Modern icon library
- **svelte-sonner** - Toast notifications

### Authentication & Database
- **Supabase** - Backend-as-a-Service
  - Magic link authentication (passwordless)
  - PostgreSQL database with generated TypeScript types
  - Row Level Security (RLS) for multi-tenancy
  - Real-time subscriptions
  - Security definer functions for safe operations

### Testing & Quality
- **Vitest** - Lightning-fast unit testing
- **Playwright** - Reliable E2E testing
- **@testing-library/svelte** - Component testing utilities
- **Zod** - Runtime type validation

### Deployment & Monitoring
- **Vercel** - Serverless deployment platform
- **Sentry** - Error tracking and monitoring

## 📦 Project Structure

```
src/
├── app.html                    # App shell
├── app.css                     # Global styles
├── hooks.client.ts             # Client-side hooks
├── hooks.server.ts             # Server-side auth & session handling
├── lib/
│   ├── components/
│   │   └── ui/                 # shadcn/ui components (buttons, cards, etc.)
│   ├── types/
│   │   └── database.ts         # TypeScript database types
│   ├── database.types.ts       # Auto-generated Supabase types
│   ├── utils.ts                # Utility functions
│   └── supabase.ts             # Supabase client configuration
├── routes/
│   ├── (app)/                  # Authenticated app routes
│   │   ├── +layout.server.ts   # Load user organizations
│   │   ├── +layout.svelte      # App shell layout
│   │   └── team/               # Organization & team management
│   │       ├── +page.server.ts # Redirect to user's organization
│   │       ├── create/         # Create new organization
│   │       └── [org_id]/       # Organization dashboard & team page
│   ├── auth/                   # Authentication pages
│   │   ├── login/              # Magic link login
│   │   ├── signup/             # Account creation
│   │   ├── callback/           # Auth callback handler
│   │   └── logout/             # Session cleanup
│   ├── invite/                 # Organization invitation system
│   │   └── [token]/            # Accept team invitations
│   ├── api/                    # API endpoints
│   │   └── check-invites/      # Auto-join organizations
│   ├── +layout.server.ts       # Root server layout
│   ├── +layout.svelte          # Root layout with toast system
│   └── +page.server.ts         # Homepage (redirects to app)
├── supabase/                   # Database schema & migrations
│   ├── config.toml             # Supabase local config
│   └── migrations/             # SQL migrations
├── e2e/                        # End-to-end tests
└── tests/                      # Unit tests
```

## 🏢 Multi-Tenant Architecture

### Organizations & Teams
- **Organizations**: Top-level tenant containers
- **Members**: Users belong to organizations with roles
- **Roles**: `owner`, `admin`, `member` with different permissions
- **Invitations**: Email-based team invitation system

### Security Model
- **Row Level Security (RLS)**: Database-level multi-tenancy
- **Security Definer Functions**: Safe operations with proper authorization
- **Role-Based Access Control**: Feature access based on user roles
- **Magic Link Authentication**: Secure, passwordless login

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Git
- Supabase CLI (optional for local development)

### 1. Clone and Install
```bash
git clone <repository-url>
cd svelte-common-app
pnpm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and configure:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Sentry DSN for error tracking
SENTRY_DSN=your_sentry_dsn
```

### 3. Database Setup

#### Option A: Use Existing Supabase Project
1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env.local`
3. Run the migrations in your Supabase SQL editor (files in `supabase/migrations/`)

#### Option B: Local Development with Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > src/lib/database.types.ts
```

### 4. Development
```bash
# Start development server
pnpm dev

# Type checking
pnpm check

# Run tests
pnpm test

# Build for production
pnpm build
```

## 🧪 Testing

### Unit Tests
```bash
pnpm test:unit
```

### E2E Tests
```bash
# Install browsers
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main

## 📋 Features

### ✅ Implemented Core Features
- [x] **Magic Link Authentication** - Passwordless, secure login
- [x] **Multi-Tenant Architecture** - Organizations with RLS
- [x] **Role-Based Permissions** - Owner, Admin, Member roles  
- [x] **Team Management** - Invite users, manage members
- [x] **Organization Management** - Create, edit organization details
- [x] **Toast Notifications** - Professional user feedback
- [x] **Responsive Design** - Mobile-first UI components
- [x] **Type Safety** - Full TypeScript integration
- [x] **Database Migrations** - Version-controlled schema
- [x] **E2E Testing** - Comprehensive test coverage

### ✅ Security Features
- [x] **Row Level Security (RLS)** - Database-level isolation
- [x] **Security Definer Functions** - Safe database operations
- [x] **CSRF Protection** - SvelteKit built-in protection
- [x] **Input Validation** - Zod schema validation
- [x] **Secure Session Management** - Server-side validation

### 🔄 Ready to Extend
- [ ] **Subscription/Billing** - Stripe integration
- [ ] **Email Notifications** - Transactional emails
- [ ] **File Uploads** - Document management
- [ ] **Real-time Features** - Live collaboration
- [ ] **API Rate Limiting** - Usage controls
- [ ] **Audit Logging** - Security & compliance
- [ ] **Advanced Permissions** - Resource-level access
- [ ] **Webhooks** - Third-party integrations

## 🎯 Key Benefits

1. **Production Ready**: Comprehensive security, testing, and monitoring
2. **Scalable Architecture**: Multi-tenant design that grows with your business
3. **Developer Experience**: Hot reloading, type safety, excellent tooling
4. **Modern Stack**: Latest web technologies and best practices
5. **Secure by Default**: RLS, input validation, secure authentication
6. **Extensible**: Clean architecture ready for feature additions

## 🔧 Configuration Details

### Authentication Flow
1. **Magic Link Login**: Users enter email → receive secure login link
2. **Auto Profile Creation**: User profiles created automatically on first login
3. **Organization Routing**: Users redirected to their organization dashboard
4. **Invitation System**: Email-based team invitations with auto-join

### Database Schema
- **users** → Supabase auth users
- **user_profiles** → Extended user information
- **organizations** → Tenant containers
- **organization_members** → User-organization relationships with roles
- **organization_invites** → Pending team invitations

### Security Model
```sql
-- Example RLS Policy
CREATE POLICY "Users can only see their organization's data"
ON organizations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid()
  )
);
```

## 🧑‍💻 Development Guide

### Adding New Features
1. **Database**: Add migrations in `supabase/migrations/`
2. **Types**: Regenerate types with `supabase gen types`
3. **Server Logic**: Add server-side logic in `+page.server.ts` files
4. **UI Components**: Use existing shadcn/ui components
5. **Validation**: Add Zod schemas for form validation
6. **Tests**: Write E2E tests for user flows

### Form Actions (SvelteKit 2)
```typescript
// Example form action
export const actions: Actions = {
  create: async ({ locals, request }) => {
    // Validate input with Zod
    const result = schema.safeParse(data);
    
    // Use Supabase RPC for secure operations
    const { data, error } = await locals.supabase
      .rpc('secure_function', params);
    
    // Return success/error response
    return { success: true };
  }
};
```

### Toast Notifications
```typescript
// Show success/error toasts
import { toast } from 'svelte-sonner';

$: if (form?.success) {
  toast.success('Operation completed successfully!');
}

$: if (form?.error) {
  toast.error(form.error);
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass (`pnpm test`)
5. Commit with descriptive messages
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

---

**🚀 Ready to build your multi-tenant SaaS?**

This boilerplate provides a solid foundation with modern architecture, comprehensive security, and room to grow. Perfect for B2B SaaS products that need organization management and team collaboration.