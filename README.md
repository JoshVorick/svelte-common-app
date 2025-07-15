# Vertical SaaS Boilerplate

A modern, production-ready SaaS boilerplate built with the latest technologies for rapid development and deployment.

## 🚀 Tech Stack

### Core Framework
- **SvelteKit 2** - Fast, modern web framework
- **Svelte 5** - Reactive UI library with runes
- **TypeScript** - Type-safe JavaScript

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui (Svelte)** - Beautiful, accessible components
- **Lucide Svelte** - Icon library

### Authentication & Database
- **Supabase** - Backend-as-a-Service
  - Authentication with email/password
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)

### Testing
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **@testing-library/svelte** - Component testing utilities

### Deployment & Monitoring
- **Vercel** - Serverless deployment platform
- **Sentry** - Error tracking and monitoring
- **Vercel Analytics** - Performance monitoring

### Developer Experience
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Hot Module Replacement** - Fast development

## 📦 Project Structure

```
src/
├── app.html              # App shell
├── app.css               # Global styles
├── hooks.client.ts       # Client-side hooks
├── hooks.server.ts       # Server-side hooks
├── lib/
│   ├── components/
│   │   ├── auth/         # Authentication components
│   │   ├── dashboard/    # Dashboard components
│   │   └── ui/           # shadcn/ui components
│   ├── utils.ts          # Utility functions
│   └── supabase.ts       # Supabase client configuration
├── routes/
│   ├── (protected)/      # Protected routes group
│   │   ├── dashboard/    # Dashboard pages
│   │   └── +layout.svelte
│   ├── auth/             # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── logout/
│   ├── +layout.svelte    # Root layout
│   └── +page.svelte      # Homepage
├── e2e/                  # End-to-end tests
└── tests/                # Unit tests
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Git

### 1. Clone and Install
```bash
git clone <repository-url>
cd svelte-common-app
pnpm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Sentry DSN for error tracking
SENTRY_DSN=your_sentry_dsn
```

### 3. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env.local`
3. Set up authentication in your Supabase dashboard
4. Configure email templates for auth confirmation

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
# Run unit tests
pnpm test:unit

# Run with coverage
pnpm test:unit -- --coverage
```

### E2E Tests
```bash
# Install browsers
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests in headed mode
pnpm test:e2e -- --headed
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main

### Manual Deployment
```bash
# Build the application
pnpm build

# Preview the build
pnpm preview
```

## 📋 Features

### ✅ Implemented
- [x] SvelteKit 2 with Svelte 5 runes
- [x] TypeScript configuration
- [x] Tailwind CSS 4 with shadcn/ui
- [x] Supabase authentication (login/signup/logout)
- [x] Protected routes with server-side auth
- [x] Responsive dashboard layout
- [x] Unit tests with Vitest
- [x] E2E tests with Playwright
- [x] Vercel deployment ready
- [x] Sentry error tracking setup

### 🔄 Ready to Extend
- [ ] User profile management
- [ ] Team/organization features
- [ ] Subscription/billing integration
- [ ] Email notifications
- [ ] File uploads
- [ ] Real-time features
- [ ] API rate limiting
- [ ] Admin dashboard

## 🎯 Key Benefits

1. **Fast Development**: Modern tooling and hot reloading
2. **Type Safety**: Full TypeScript support throughout
3. **Production Ready**: Error tracking, monitoring, and testing
4. **Scalable**: Serverless architecture with Vercel
5. **Secure**: Row Level Security with Supabase
6. **Maintainable**: Clean architecture and comprehensive tests

## 🔧 Configuration

### Tailwind CSS
Configured with shadcn/ui components and custom utilities.

### Supabase
- Server-side rendering compatible
- Automatic session management
- Cookie-based authentication

### Testing
- Component tests run in browser environment
- E2E tests use Playwright with Chromium
- Test coverage reporting available

## 📚 Documentation

### Key Files
- `src/app.d.ts` - TypeScript app declarations
- `src/hooks.server.ts` - Server-side request handling
- `src/hooks.client.ts` - Client-side error handling
- `src/lib/supabase.ts` - Supabase client configuration
- `vite.config.ts` - Vite/Vitest configuration
- `playwright.config.ts` - Playwright configuration

### Authentication Flow
1. User visits app → redirected to login if not authenticated
2. Login/signup forms handle authentication via Supabase
3. Successful auth → redirected to dashboard
4. Protected routes check authentication server-side
5. Logout clears session and redirects to login

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Ready to build your SaaS? This boilerplate provides everything you need to get started quickly while maintaining production-quality code.**