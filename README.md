# ElectroMart Admin Dashboard

A custom administration interface for the ElectroMart e-commerce platform, built with Next.js and connected to Payload CMS backend.

## 🚀 Features

- **Custom Dashboard UI** - Professional admin interface matching brand design
- **Real-time Data** - Connected to Payload CMS backend for live data
- **Brand Consistent** - Same color scheme and styling as customer storefront
- **API Integration** - Full CRUD operations via Payload CMS API
- **Independent Deployment** - Separate from customer storefront for scaling

## 🏗️ Architecture

```
electromart-admin/ (Port 3002)
├── React Frontend (Next.js + TypeScript)
├── Tailwind CSS (brand-matched styling)
├── Axios (API communication)
└── Payload CMS Backend (localhost:3001)
```

## 📋 Prerequisites

- **Payload CMS Backend**: Running on `http://localhost:3001`
- **Node.js**: 18+ recommended
- **npm/yarn**: Package manager

## 🛠️ Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Edit .env.local (already configured)
   NEXT_PUBLIC_PAYLOAD_API_URL=http://localhost:3001/api
   ```

3. **Start Development Server**
   ```bash
   # Option 1: Standard dev (uses PORT from env)
   npm run dev

   # Option 2: Explicit port
   npm run dev:admin  # Port 3002
   ```

## 🎨 Brand Design

Matching the customer storefront with:
- **Brand Colors**: Orange theme (#f97316, #ea580c, #fff7ed, etc.)
- **Neon Accents**: Blue (#00f3ff) and yellow (#fcee0a)
- **Smooth Animations**: Float effects, shimmers, slides
- **Professional Layout**: Modern card-based design

## 🔗 API Integration

### Collections Available
- **Products** (`/products`)
- **Categories** (`/categories`)
- **Users** (`/users`)
- **Media** (`/media`)

### Usage Examples
```typescript
import { fetchCollection, createDocument } from '@/lib/api';

// Fetch all products
const products = await fetchCollection('products');

// Create new product
const newProduct = await createDocument('products', {
  name: "New Laptop",
  price: 1299,
  category_id: categoryId
});
```

## 🌐 Development URLs

- **Admin Dashboard**: `http://localhost:3002`
- **Payload CMS Admin**: `http://localhost:3001/admin`
- **GraphQL Playground**: `http://localhost:3001/graphql`
- **API Endpoints**: `http://localhost:3001/api/*`

## 📦 Build & Production

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🚀 Deployment

This admin interface can be deployed independently of the customer storefront:

### Railway Deployment
```bash
# Build and deploy separately
npm run build
railway up
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

## 🤝 Contributing

Since this is a separate project, contributions follow:
1. **Independent Commits** - Separate from storefront
2. **Brand Consistency** - Match design patterns
3. **API Contracts** - Follow Payload CMS schemas
4. **Testing** - Unit tests for admin-specific logic

## 📄 License

Same as main ElectroMart project.

---

**ElectroMart Admin Dashboard** - Independent, custom admin interface for seamless e-commerce management.
