# 🦆 Duck Race Derby

An interactive racing simulation game where you can race ducks, horses, cars, or marbles with realistic racing behaviors and strategies!

**Live Demo**: https://ibmer921150.github.io/duck-race-derby/

## 💭 Author's Note

This is my **vibe coding project** - a creative playground where I explore new ideas and technologies while having fun! 🎨

**Development Journey:**
- 🎯 **Initial UI**: Built with [Lovable](https://lovable.dev) for rapid prototyping
- 🤖 **AI-Assisted Development**: Enhanced and optimized with GitHub Copilot
- 🔧 **Hands-on Coding**: Custom features, troubleshooting, and debugging done with passion
- 🎵 **Latest Addition**: Integrated Howler.js for immersive audio experience

This project represents the perfect blend of AI-assisted tools and traditional coding skills. It's proof that modern development can be both efficient and enjoyable when you combine the right tools with creative vision!

## 🎮 Features

- Support for up to 2000 racers
- Multiple racing themes: 🦆 Duck, 🐴 Horse, 🏎️ Car, 🔮 Marble
- Theme-based background music and sound effects ([Audio Setup Guide](public/audio/README.md))
- Configurable countdown timer
- Toggle audio on/off during races
- 15+ unique racing behaviors (sprint, burnout, clutch comeback, etc.)
- Real-time leaderboard
- Animated race results with confetti celebration

## 🚀 Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Local Development

```sh
# Clone the repository
git clone https://github.com/ibmer921150/duck-race-derby.git

# Navigate to the project directory
cd duck-race-derby

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 🛠️ Technologies

This project is built with:

- **Vite** - Fast build tool and dev server
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components built on Radix UI
- **React Router** - Client-side routing
- **Tanstack Query** - Data fetching and state management
- **canvas-confetti** - Celebration animations
- **Howler.js** - Cross-browser audio library for music and sound effects

## 📦 Duck Race Derby Code Structure & Architecture Overview

```
src/
├── components/          # React components
│   ├── Duck.tsx        # Duck character component
│   ├── RaceCharacter.tsx    # Generic race character renderer
│   ├── PoolRaceTrack.tsx    # Main race track with lanes
│   ├── RaceControls.tsx     # Start/reset controls
│   ├── Leaderboard.tsx      # Final standings display
│   ├── RaceResults.tsx      # Winner/loser announcements
│   ├── NameInput.tsx        # Racer name input
│   ├── ThemeSelector.tsx    # Theme selection UI
│   └── ui/                  # shadcn/ui components
├── hooks/
│   ├── usePoolRace.ts       # Main racing logic with 15+ behaviors
│   ├── useRace.ts           # Alternative racing implementation
│   └── use-toast.ts         # Toast notification hook
├── lib/
│   ├── utils.ts             # Utility functions
│   └── audioManager.ts      # Audio management singleton
├── pages/
│   ├── Index.tsx            # Main game page
│   └── NotFound.tsx         # 404 page
├── App.tsx                   # Root component with routing
└── main.tsx                  # Application entry point

public/
└── audio/                    # Audio assets
    ├── music/                # Background music for each theme
    │   ├── duck.mp3          # Duck theme music
    │   ├── horse.mp3         # Horse theme music
    │   ├── car.mp3           # Car theme music
    │   └── marble.mp3        # Marble theme music
    ├── sfx/                  # Sound effects
    │   ├── start.mp3         # Race start sound
    │   └── winner.mp3        # Winner celebration sound
    └── README.md             # Audio setup guide
```

### Key Architecture Features

- **Racing Behaviors**: 15+ unique racing strategies including sprint start, slow burn, comeback kid, burnout, clutch performance, and more
- **Audio System**: Theme-based background music with sound effects for race start and winner celebrations, powered by Howler.js singleton pattern
- **Configurable Settings**: Adjustable countdown timer and racer count
- **Theme System**: Multiple character themes with animated sprites
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Type Safety**: Full TypeScript coverage for better development experience

## 🌐 Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages.

### Deploy Your Own Copy

1. **Fork or clone this repository**

2. **Update the base path** in `vite.config.ts`:
   ```typescript
   base: mode === "production" ? "/your-repo-name/" : "/"
   ```

3. **Install dependencies and deploy**:
   ```bash
   npm install
   npm run deploy
   ```

4. **Enable GitHub Pages**:
   - Go to your repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` → `/ (root)`
   - Save

5. **Access your site**:
   ```
   https://your-username.github.io/your-repo-name/
   ```

### Update Deployed Site

```bash
# Make your changes, then:
git add .
git commit -m "Your changes"
git push origin main

# Deploy to GitHub Pages
npm run deploy
```

The site will update in 1-2 minutes after deployment.

## 📝 Available Scripts

```bash
npm run dev          # Start development server on port 8080
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run deploy       # Deploy to GitHub Pages
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🎯 Custom Domain (Optional)

You can connect a custom domain to your GitHub Pages site:

1. Purchase a domain from Namecheap, Google Domains, etc.
2. Configure DNS records to point to GitHub Pages
3. Add your domain in repository Settings → Pages → Custom domain
4. Create a `public/CNAME` file with your domain name

Read more: [GitHub Pages Custom Domain Documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for learning or building your own racing games!

## 🔗 Repository

**GitHub Repository**: https://github.com/ibmer921150/duck-race-derby

---

**Have fun racing! 🏁🦆**

https://ibmer921150.github.io/duck-race-derby/
