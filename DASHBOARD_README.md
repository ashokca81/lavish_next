# Lavish Dashboard - MongoDB Integration

This project includes a complete business dashboard with MongoDB integration for managing projects and clients.

## Features

### 🎯 Dashboard Pages

- **Main Dashboard** (`/dashboard`) - Analytics, charts, and overview
- **Project Management** (`/projects`) - Create, edit, and manage projects
- **Client Management** (API ready) - Manage client information

### 📊 Analytics & Charts

- Revenue and expense tracking
- Project completion rates
- Client growth analytics
- Real-time project progress
- Interactive charts with Recharts

### 🗄️ MongoDB Collections

- **`lavish`** - Project data and information
- **`lavish_clients`** - Client management data

## Database Configuration

### Environment Variables

Create a `.env.local` file with:

```env
MONGODB_URI=mongodb+srv://lavishstarsoft_db_user:<db_password>@multivideos.e5msoiy.mongodb.net/?appName=Multivideos
MONGODB_DB=solar_naresh
NEXTAUTH_SECRET=your-secret-key-here
DASHBOARD_SECRET=lavish-dashboard-2025
```

### Database Structure

#### Projects Collection (`lavish`)

```javascript
{
  _id: ObjectId,
  name: String,           // Project name
  client: String,         // Client name
  description: String,    // Project description
  status: String,         // "Planning" | "In Progress" | "Completed" | "On Hold"
  progress: Number,       // 0-100 percentage
  startDate: Date,        // Project start date
  endDate: Date,          // Project end date (optional)
  budget: Number,         // Project budget in INR
  tags: [String],         // Project tags/categories
  createdAt: Date,        // Creation timestamp
  updatedAt: Date         // Last update timestamp
}
```

#### Clients Collection (`lavish_clients`)

```javascript
{
  _id: ObjectId,
  name: String,           // Client name
  email: String,          // Client email
  phone: String,          // Client phone
  company: String,        // Company name
  industry: String,       // Industry type
  address: String,        // Client address
  projects: [String],     // Array of project IDs
  totalProjects: Number,  // Total project count
  totalRevenue: Number,   // Total revenue from client
  status: String,         // "Active" | "Inactive"
  createdAt: Date,        // Creation timestamp
  updatedAt: Date         // Last update timestamp
}
```

## API Endpoints

### Projects API (`/api/projects`)

- **GET** - Fetch all projects
- **POST** - Create new project
- **PUT** - Update existing project
- **DELETE** - Delete project

### Clients API (`/api/clients`)

- **GET** - Fetch all clients
- **POST** - Create new client
- **PUT** - Update existing client
- **DELETE** - Delete client

### Analytics API (`/api/dashboard/analytics`)

- **GET** - Fetch dashboard analytics and metrics

## Installation & Setup

1. **Install Dependencies**

   ```bash
   npm install mongodb mongoose recharts
   ```

2. **Configure Environment**

   - Copy `.env.local` with your MongoDB credentials
   - Update the database password in the connection string

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Access Dashboard**
   - Main Dashboard: `http://localhost:3000/dashboard`
   - Project Management: `http://localhost:3000/projects`
   - Website: `http://localhost:3000/`

## Dashboard Features

### 📈 Analytics Dashboard

- **Overview Cards**: Total revenue, projects, clients, completion rate
- **Charts**: Revenue vs expenses, project growth, client acquisition
- **Recent Activity**: Latest projects and activities
- **Performance Metrics**: Key business indicators

### 🚀 Project Management

- **Project CRUD**: Complete create, read, update, delete operations
- **Status Tracking**: Planning → In Progress → Completed
- **Progress Monitoring**: Visual progress bars and percentages
- **Filtering & Search**: Find projects by name, client, or status
- **Tag System**: Categorize projects with custom tags

### 👥 Client Management (API Ready)

- **Client Database**: Store client information and contacts
- **Project Association**: Link clients to their projects
- **Revenue Tracking**: Track total revenue per client
- **Status Management**: Active/inactive client status

## Navigation

The dashboard includes a responsive navigation bar with:

- **Dashboard** - Main analytics view
- **Projects** - Project management interface
- **Clients** - Client management (ready for implementation)
- **Website** - Return to main website

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Database**: MongoDB with native driver
- **UI Components**: shadcn/ui, Tailwind CSS
- **Charts**: Recharts library
- **Icons**: Lucide React

## Sample Data

The dashboard includes sample data for testing:

- Mock revenue/expense data for charts
- Sample project statuses and progress
- Example client information
- Realistic analytics metrics

## Customization

### Adding New Charts

1. Install chart data from MongoDB collections
2. Use Recharts components (BarChart, LineChart, PieChart, etc.)
3. Add responsive containers for mobile compatibility

### Extending Collections

1. Update API routes in `/pages/api/`
2. Add new TypeScript interfaces
3. Create corresponding UI components

### Styling

- All components use Tailwind CSS classes
- Consistent color scheme with blue/purple/green palette
- Responsive design for all screen sizes

## Security

- Environment variables for sensitive data
- Input validation on all API routes
- Error handling for database operations
- TypeScript for type safety

## Performance

- Optimized MongoDB queries with aggregation
- Efficient data fetching with proper loading states
- Responsive charts that adapt to screen size
- Lazy loading for large datasets

## Deployment

Ready for deployment on platforms like:

- Vercel (recommended for Next.js)
- Netlify
- Railway
- Any Node.js hosting service

Make sure to:

1. Set environment variables in production
2. Configure MongoDB network access
3. Update CORS settings if needed
