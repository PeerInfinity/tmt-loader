# Contributing to The Classic+ Tree

Thanks for your interest in contributing! This guide will help you get started.

## Development Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/certainjellyfish9204/The-Modding-Tree.git
   cd The-Modding-Tree
   ```

2. **Serve locally** (any static server works):
   ```bash
   python3 -m http.server 8000
   # or
   npx serve .
   ```
   Then open `http://localhost:8000` in your browser.

3. **Branch from `dev`:**
   ```bash
   git checkout dev
   git checkout -b feature/your-feature-name
   ```

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `master` | Stable, production-ready code |
| `dev` | Active development — branch your PRs from here |
| `arena/*` | Temporary Arena.ai workspace branches |

## How to Port a New Layer

1. `git clone` the source TMT mod into `/tmp`
2. Read the layer's `layers.js` to understand its mechanics
3. Add a buyable in `js/layers/universe.js` with the ported code
4. Include a comment with the original file path for traceability
5. Test thoroughly — make sure the layer integrates with existing progression

See `js/layers/universe.js` infobox **How Porting Works** for details.

## Code Style

- Keep layer definitions in `js/layers/` (one file per major layer)
- Use `tmp.*` for computed values, `player.*` for save state
- Comment any non-obvious mechanics or formula references
- Match existing naming conventions (camelCase for variables, UPPER_CASE for constants)

## Submitting Changes

1. Push your branch to GitHub
2. Open a Pull Request against `dev`
3. Describe what you changed and why
4. Link any related issues

## Reporting Issues

Open a GitHub issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS info

## License

By contributing, you agree your code will be licensed under the same MIT license as the rest of the project.
