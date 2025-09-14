# Hospital Management System

A comprehensive, production-grade hospital management system built with modern technologies. This system provides a complete solution for managing hospitals, staff, patients, and medical records with role-based access control.

## 🏥 Features

### Core Functionality
- **Hierarchical Structure**: City → Centers → Hospitals
- **User Management**: Admin, Doctors, and Staff roles
- **Patient Management**: Complete patient profiles with medical history
- **Medical Records**: Visits, Tests, Treatments, Operations, and Diseases
- **File Management**: Profile photos and medical attachments via Supabase Storage
- **Role-Based Access**: Secure access control based on user roles

### Patient Profile Features
- Personal information and contact details
- Medical history and allergies tracking
- Visit scheduling and management
- Medical test scheduling and results
- Treatment planning and tracking
- Operation scheduling and records
- Disease history and management
- Profile photo upload
- Medical document attachments

### Admin Features
- Complete system management
- Add cities, centers, and hospitals
- Manage doctors and staff
- Full access to all patient records
- Dashboard with comprehensive statistics

### Staff/Doctor Features
- Manage patients within their hospital only
- Schedule visits, tests, treatments, and operations
- View patient medical history
- Upload and manage medical documents

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Beautiful, accessible components
- **React Hook Form** - Form management
- **TanStack Query** - Data fetching and caching
- **Zod** - Schema validation

### Backend
- **Hono** - Fast, lightweight web framework
- **RPC Style API** - Clean, type-safe API design
- **Prisma ORM** - Database toolkit
- **Supabase** - PostgreSQL database and storage

### Database
- **PostgreSQL** - Primary database
- **Supabase Storage** - File storage for images and documents

### Validation & Security
- **Zod** - End-to-end type validation
- **Role-based Access Control** - Secure permissions
- **Input Sanitization** - XSS protection
- **File Upload Validation** - Secure file handling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hospital_nextJS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your actual values:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Database URLs
   DATABASE_URL="postgresql://postgres.xaejzihqngxuexkeymya:9D4ryuy@KgK!27@aws-1-eu-central-1.pooler.supabase.com:6543/postgres"
   DIRECT_DATABASE_URL="postgresql://postgres.xaejzihqngxuexkeymya:9D4ryuy@KgK!27@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"

   # Next.js
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # API
   API_BASE_URL=http://localhost:3000/api
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Set up Supabase Storage**
   ```bash
   npm run setup:storage
   ```

6. **Seed the database with demo data**
   ```bash
   npm run seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── auth/              # Authentication components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
│   ├── auth.ts            # Authentication logic
│   ├── db.ts              # Database connection
│   ├── storage.ts         # File upload utilities
│   ├── supabase.ts        # Supabase client
│   ├── utils.ts           # General utilities
│   └── validations.ts     # Zod schemas
├── types/                 # TypeScript type definitions
└── api/                   # Hono API routes
    └── rpc.ts             # Main API router
```

## 🔐 Authentication & Roles

### User Roles
- **Admin**: Full system access, can manage all entities
- **Doctor**: Can manage patients within their hospital
- **Staff**: Can manage patients within their hospital

### Demo Credentials
- **Admin**: admin@hospital.com / admin123
- **Doctor**: doctor@hospital.com / doctor123  
- **Staff**: staff@hospital.com / staff123

## 📊 Database Schema

The system uses a comprehensive Prisma schema with the following main entities:

- **User** - System users with role-based access
- **City** - Geographic locations
- **Center** - Medical centers within cities
- **Hospital** - Individual hospitals within centers
- **Doctor** - Medical professionals
- **Staff** - Hospital staff members
- **Patient** - Patient records and profiles
- **Visit** - Patient visits and appointments
- **Test** - Medical tests and procedures
- **Treatment** - Treatment plans and schedules
- **Operation** - Surgical operations
- **Disease** - Patient disease history
- **Attachment** - Medical documents and files

## 🎨 UI/UX Design

### Design System
- **Color Palette**: Professional hospital theme with white, black, and blue
- **Typography**: Clean, readable fonts optimized for medical staff
- **Layout**: Responsive design that works on all devices
- **Components**: Consistent, accessible UI components

### Key Features
- Clean, professional interface
- Intuitive navigation
- Responsive design
- Accessibility compliance
- Fast loading times
- Mobile-friendly

## 🔧 API Documentation

The system uses a RESTful API with RPC-style endpoints:

### Authentication
- `POST /api/auth/login` - User login

### Admin Endpoints
- `POST /api/admin/users` - Create user
- `POST /api/cities` - Create city
- `POST /api/centers` - Create center
- `POST /api/hospitals` - Create hospital
- `POST /api/doctors` - Create doctor
- `POST /api/staff` - Create staff

### Patient Management
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient details

### Medical Records
- `POST /api/visits` - Schedule visit
- `POST /api/tests` - Schedule test
- `POST /api/treatments` - Schedule treatment
- `POST /api/operations` - Schedule operation
- `POST /api/diseases` - Record disease
- `POST /api/attachments` - Upload attachment

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production environment variables**
   - Update all environment variables for production
   - Ensure database URLs point to production database
   - Set up proper CORS and security headers

3. **Deploy to your preferred platform**
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS
   - DigitalOcean

4. **Set up monitoring and logging**
   - Error tracking (Sentry)
   - Performance monitoring
   - Database monitoring

## 🔒 Security Features

- **Role-based Access Control**: Secure permissions system
- **Input Validation**: Zod schemas for all inputs
- **File Upload Security**: Type and size validation
- **SQL Injection Protection**: Prisma ORM
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Built-in Next.js protection

## 📈 Performance Optimizations

- **Server-side Rendering**: Fast initial page loads
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic bundle optimization
- **Caching**: TanStack Query for data caching
- **Database Indexing**: Optimized queries
- **CDN**: Supabase CDN for file delivery

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Future Enhancements

- Real-time notifications
- Advanced reporting and analytics
- Mobile app development
- Integration with medical devices
- AI-powered diagnostics
- Telemedicine features
- Multi-language support

---

**Built with ❤️ for the healthcare industry**
# hospitalSystem
# NEXT_HO_SYS
# NEXT_HO_SY
