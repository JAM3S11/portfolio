# Portfolio Website

A modern, responsive portfolio website showcasing my work as a Full-Stack Developer. Built with React and Vite, featuring smooth animations, dark mode support, and a clean, professional design.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with smooth animations powered by Framer Motion
- **Dark Mode**: Toggle between light and dark themes with persistent preference
- **Smooth Navigation**: Single-page application with smooth scrolling between sections
- **Contact Form**: Integrated contact form using Web3Forms API
- **Project Showcase**: Interactive project cards with live demos and GitHub links
- **Experience Timeline**: Visual timeline displaying professional experience
- **Responsive Design**: Fully responsive across all device sizes
- **Performance Optimized**: Built with Vite for fast development and optimized production builds

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth transitions
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Headless UI** - Accessible UI components

### Backend & Tools
- **Web3Forms** - Contact form API integration
- **Environment Variables** - Secure configuration management

## 📁 Project Structure

```
PORTFOLIO/
├── src/
│   ├── assets/          # Images and SVG files
│   ├── common/          # Reusable components (Header, Footer, ScrollToTop)
│   ├── content/         # Theme provider and context
│   ├── pages/           # Page components
│   │   ├── HomePage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── ExperiencePage.jsx
│   │   ├── ProjectsPage.jsx
│   │   └── ContactPage.jsx
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json
└── vite.config.js
```

## 🎯 Sections

1. **Home** - Hero section with introduction and call-to-action buttons
2. **About** - Personal bio and technology stack showcase
3. **Experience** - Professional experience timeline
4. **Projects** - Portfolio projects with descriptions, tech stacks, and links
5. **Contact** - Contact form and social media links

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_GITHUB_URL=your_github_url
VITE_LINKEDIN_URL=your_linkedin_url
VITE_WHATSAPP_URL=your_whatsapp_url
VITE_WEB3FORMS_COM_KEY=your_web3forms_api_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Customization

### Updating Personal Information

1. **Home Page**: Edit `src/pages/HomePage.jsx` to update hero text and name
2. **About Page**: Modify `src/pages/AboutPage.jsx` to update bio and tech stack
3. **Experience**: Update experience entries in `src/pages/ExperiencePage.jsx`
4. **Projects**: Add or modify projects in `src/pages/ProjectsPage.jsx`
5. **Contact**: Update contact information in `src/pages/ContactPage.jsx`

### Styling

The project uses Tailwind CSS. Customize colors, spacing, and other design tokens in `tailwind.config.js` or directly in component classes.

### Theme

Dark mode is managed through the `ThemeProvider` context. The theme preference is stored in localStorage and persists across sessions.

## 🔧 Environment Variables

Create a `.env` file with the following variables:

- `VITE_GITHUB_URL` - Your GitHub profile URL
- `VITE_LINKEDIN_URL` - Your LinkedIn profile URL
- `VITE_WHATSAPP_URL` - Your WhatsApp contact URL
- `VITE_WEB3FORMS_COM_KEY` - Your Web3Forms API key (get one at [web3forms.com](https://web3forms.com))

## 📱 Responsive Design

The portfolio is fully responsive and optimized for:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktops (1024px+)
- Large screens (1440px+)

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 👤 Author

**James Daniel**

- Email: jdndirangu2020@gmail.com
- Phone: +254 716 041419
- GitHub: [@JAM3S11](https://github.com/JAM3S11)

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) for the amazing build tool
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Lucide](https://lucide.dev/) for beautiful icons
- [Web3Forms](https://web3forms.com/) for contact form handling

---

⭐ If you like this project, please give it a star!
