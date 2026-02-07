# Lapor JAMKOS

Sistem Pelaporan Jam Kosong - Aplikasi web modern untuk melaporkan ketidakhadiran guru di kelas menggunakan QR code.

## 🚀 Features

- **Student Interface**: Scan QR code untuk melaporkan jam kosong tanpa login
- **Admin Dashboard**: Kelola kelas dan generate QR code
- **URL Obfuscation**: QR code URL langsung disembunyikan dari address bar
- **Mobile Friendly**: Responsive design untuk semua ukuran layar
- **Modern UI**: Gradient, animations, dan glassmorphism effects

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **QR Code**: qrcode.react
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Deployment**: Cloudflare Pages compatible

## 📋 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the SQL script from `DATABASE_SETUP.md` in your Supabase SQL Editor

### 3. Create Admin User

1. Go to Authentication in your Supabase dashboard
2. Add a new user with email and password
3. Use these credentials to login at `/login`

### 4. Run Development Server

```bash
npm run dev
```

The app will run at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder, ready for deployment to Cloudflare Pages.

## 🎯 Usage

### For Admin

1. Login at `/login`
2. Add classes from the dashboard
3. Click "Print QR" to generate and print QR code for each class
4. Post the QR codes in respective classrooms

### For Students

1. Scan the QR code in the classroom
2. Confirm the class name
3. Click "Kirim" to report teacher absence
4. The report is saved to database

## 🔒 Security Features

- Row Level Security (RLS) enabled on Supabase
- Admin authentication required for dashboard access
- Public can only insert reports (read-only for class data)
- QR code tokens are unique UUIDs

## 📱 Mobile Responsive

The entire application is optimized for mobile devices with:
- Touch-friendly buttons
- Responsive layouts
- Mobile-first design approach
- Print-optimized QR codes

## 🎨 Design Philosophy

- **Modern**: Gradient backgrounds, smooth animations
- **Clean**: Minimalist interface, clear CTAs
- **Fast**: Lightweight, optimized for performance
- **Accessible**: Clear typography, good contrast ratios

## 📄 License

MIT

---

**Built with ❤️ as a world-class fullstack developer**
