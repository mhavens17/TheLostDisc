# PS1-Style Horror Game

A first-person exploration game inspired by classic PlayStation 1 horror games, built with Three.js.

## Features

- PS1-style graphics with low resolution and pixelation
- First-person controls with mouse look
- Flashlight mechanics
- Dense fog for atmosphere
- Ambient audio support
- Retro-style environment with placeholder objects

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:5173`

## Controls

- Click to start/lock mouse pointer
- WASD to move
- Mouse to look around
- ESC to pause/unlock mouse pointer

## Project Structure

```
├── assets/
│   ├── models/     # 3D models
│   ├── sounds/     # Audio files
│   └── textures/   # Texture files
├── index.html      # Main HTML file
├── main.js         # Game logic
└── package.json    # Project dependencies
```

## Adding Assets

1. Place 3D models in the `assets/models` directory
2. Add sound files to `assets/sounds`
3. Put textures in `assets/textures`

## Development

The game uses Vite as a development server and build tool. The main game logic is in `main.js`, where you can modify the scene, controls, and game mechanics.

## Credits

Built with Three.js and inspired by classic PS1 horror games. 