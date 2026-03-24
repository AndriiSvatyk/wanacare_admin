# Wanacare Admin Panel

Next.js admin panel for managing Wanacare platform.

## Features

- **Authentication**: Secure login with JWT tokens
- **Dashboard**: Overview of platform statistics
- **Professionals Management**: View, validate, and manage professionals
- **Clients Management**: View and manage client accounts
- **Services Management**: Monitor and manage services
- **Invoices**: View and manage invoices
- **Notifications**: View system notifications
- **Logs**: View and manage log files

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (default: http://localhost:3000)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
Admin/
├── app/
│   ├── admin/          # Admin pages
│   │   ├── dashboard/
│   │   ├── profesionales/
│   │   ├── clientes/
│   │   ├── servicios/
│   │   ├── facturas/
│   │   ├── notificaciones/
│   │   └── logs/
│   ├── login/          # Login page
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
├── components/         # Reusable components
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── MainLayout.tsx
│   ├── DataTable.tsx
│   └── Pagination.tsx
├── contexts/          # React contexts
│   └── AuthContext.tsx
├── lib/                # Utilities
│   └── api.ts         # API client
└── package.json
```

## API Integration

The admin panel connects to the Node.js backend API. Make sure the backend is running and accessible at the configured API URL.

### Authentication

The admin panel uses JWT tokens stored in cookies for authentication. After login, the token is automatically included in all API requests.

## Building for Production

```bash
npm run build
npm start
```

## Technologies

- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **js-cookie**: Cookie management



