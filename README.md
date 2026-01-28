# Mr. Taps

[![Made with AI](https://img.shields.io/badge/Made%20with-AI-lightgrey?style=for-the-badge)](https://github.com/mefengl/made-by-ai)

One of my frustrations as a musician is the lack of good free metronome apps.
Standalone metronomes cost anywhere from a few tens of dollars for the
old-school mechanical ones up to as much as $150 for a "nice" modern digital
one. Yet, none of those devices are anywhere near as powerful as the $200
computer I carry around in my pocket—one that has more computational power than
all of the Apollo missions combined. But all of the apps I've found fail for
one of a few reasons:

 1. They are overly simplistic (e.g., the metronome you get if you google "metronome")
 2. They are ad-funded and so the UI is totally cluttered with popups
 3. They are unreasonably priced (a subscription for a metronome?!?!)
 4. They look and feel like they were built in the 90s (really, I need Flash for this?)

Mr. Taps is a metronome application implemented as a Progressive Web App
(PWA). I have published this under the MIT license, and I will provide it free
of ads and free of charge as long as I am able to host it for free or for a
negligible amount.

"Free you say? But my econ professor said there is no free lunch!" And they
were right! I get why many of the metronome apps charge money. It takes time
and effort to develop something, and _even more_ time and effort to maintain
it. Fortunately for you, this didn't take much time to develop (see note below
about AI usage), so I won't charge for my development time.

And for support? Well, therein lies the hidden cost. This is free software
developed to scratch an itch and educate myself about AI coding tools.
I make NO GUARANTEES about its functionality, fitness for purpose, or security.
If you find a bug, feel free to report it, but don't expect quick solutions. If
you want a new feature, feel free to request it, but unless I happen to want it
too, it will likely not get implemented (at least by me). Pull requests are
welcome, but I might be slow reviewing them. This is published under a
permissive license, so feel free to fork it if you want to take the project in
a different direction (or any direction faster than I am).

## AI Developed 

I have been a software developer, computer scientist, and engineering manager in
various capacities over the last 25-odd years. I have taken pride in my ability
to code, analyze software, manage the software development lifecycle, and
architect solutions to real problems. With the rise of LLMs and agentic coding
tools, I recognize that some of those things that I prided myself on being able
to do well are likely skills that can be replaced by a machine. I am certainly
not bullish enough on AI (or enough of a doomer) to think that all of software
engineering can be replaced, but I also am not naive enough to think that we
won't need to learn to use and work with agentic tools as software engineers.

To that end, I have started a series of projects to help me learn the capabilities and
limitations of agentic coding tools. My goal is to develop a good intuition for
what kinds of problems they can solve, how best to use them to solve those
problems, and what the likely pitfalls are when using them for development. I would
like to be as transparent as possible that these projects are wholly or mostly
developed using AI. So, within my GitHub account, I'll name those repos
prefixed by the name of the agent primarily responsible (e.g., `claude-mr-taps`
was largely coded by Claude Code). Additionally, I will badge them with the
"Made by AI" badge you see at the top of this README as well as a section like
this that describes why they are AI-developed.

While I do read the code generated and don't believe there to be any critical
bugs or security vulnerabilities, do treat these as experiments and only use
them for non-critical, low-risk tasks.

## Features

- **Tempo Control**: Supports tempos from 1 BPM up to 300 BPM with ±1 and ±5 buttons
- **Time Signature**: Set the number of beats in a measure from 1 to 20
- **Compound Time**: Optional secondary beats for asymmetric meters (e.g., 7/4 as 3+4)
- **Subdivisions**: Independent volume controls for 8ths, 16ths, and triplets (can layer all three)
- **Color Themes**: Default (dark blue), Black (green accents), and Light themes
- **Audio**: Uses Web Audio API to generate beeps
- **Offline Support**: Works without an internet connection once installed
- **Installable**: Can be added to your home screen on mobile devices

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Running the Application

To start a local development server:

```bash
npm run start
```

This will serve the app at `http://localhost:3000` (or another available port).

Alternatively, you can use any static file server to serve the `public/` directory.

## Testing

To run the test suite:

```bash
npm run test
```

The test suite includes 150 tests covering:
- Metronome initialization and default values
- Tempo setting and validation (1-300 BPM)
- Beats per measure setting and validation (1-20)
- Subdivision volume controls
- Beat interval calculations
- Start/stop functionality
- Toggle behavior
- Callback functionality
- Sound settings

## Usage

### Controls

- **Tempo Slider**: Drag to adjust BPM (1-300)
- **+/- Buttons**: Fine-tune tempo by 1 BPM
- **±5 Buttons**: Adjust tempo by 5 BPM
- **Primary Beats**: Select 1-20 beats per measure
- **Secondary Beats**: Optional second measure for compound time (None, or 1-20)
- **Subdivision Sliders**: Independently control volume (0-100%) for:
  - 8ths (&): plays at 50% through each beat
  - 16ths (e, a): plays at 25% and 75% through each beat
  - Triplets: plays at 33% and 66% through each beat
- **Play/Stop Button**: Start or stop the metronome
- **Spacebar**: Keyboard shortcut to toggle play/stop
- **Settings**: Color theme selection and sound customization

### Sound Guide

- **Accented beat (first beat)**: 440Hz tone at full volume
- **Regular beats**: 880Hz tone at 70% volume
- **Subdivisions**: 660Hz tone at 30% volume

## PWA Installation

### On Mobile (iOS/Android)

1. Open the app in your mobile browser
2. Tap the share button (iOS) or menu button (Android)
3. Select "Add to Home Screen"
4. The app will now be available as a standalone application

### On Desktop (Chrome/Edge)

1. Open the app in Chrome or Edge
2. Click the install icon in the address bar
3. Confirm the installation

## Browser Support

Mr. Taps requires a browser with Web Audio API support:
- Chrome 35+
- Firefox 25+
- Safari 14.1+
- Edge 79+

## License

MIT
