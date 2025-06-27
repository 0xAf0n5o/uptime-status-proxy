# Uptime Status Framer Component

A responsive status page component built with Next.js, TypeScript, and Tailwind CSS that displays the status of your services by connecting to the Uptime Status Proxy API.

## Features

- 🚀 Real-time status updates
- 📱 Responsive design
- 🎨 Beautiful UI with smooth animations
- ⚡ Fast and lightweight
- 🔄 Auto-refreshing status

## Prerequisites

- Node.js 18 or later
- npm or yarn
- Access to the Uptime Status Proxy API

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd uptime-status-proxy/framer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure the API endpoint**
   Update the `next.config.js` file to point to your Uptime Status Proxy API:
   ```javascript
   // In next.config.js
   async rewrites() {
     return [
       {
         source: '/api/status',
         destination: 'http://your-api-url/api/status',
       },
     ];
   },
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000) to see the status page.

## Components

### StatusBadge
A reusable badge component that shows the current status with appropriate colors and animations.

### StatusIndicator
A component that fetches and displays the current status from the API.

### StatusPage
A complete status page layout that includes the status indicator and additional information.

## Customization

### Styling
You can customize the styling by modifying the Tailwind CSS configuration in `tailwind.config.js`.

### API Response
Make sure your API returns data in the following format:

```json
{
  "status": "operational",
  "isGreen": true,
  "isDegraded": false,
  "isOutage": false,
  "isMaintenance": false,
  "statusText": "All services operational (100.00% uptime)",
  "timestamp": "2025-06-27T01:41:15.864Z",
  "responseTime": "757.22ms",
  "monitors": 6
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Import the project to Vercel
3. Set up environment variables if needed
4. Deploy!

### Netlify

1. Push your code to a Git repository
2. Create a new site in Netlify and link your repository
3. Set the build command to `npm run build` or `yarn build`
4. Set the publish directory to `.next`
5. Deploy!

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Production-ready animation library for React
