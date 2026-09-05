# GDGPUP Webdev Platform (legacy)

[![Status: Archive](https://img.shields.io/badge/Status-Archive-lightgrey)](docs/state.md)
[![Stack: Next.js](https://img.shields.io/badge/Stack-Next.js-black)](#about)
[![FMD philosophy: 1.31.0](https://img.shields.io/badge/FMD%20philosophy-1.31.0-blue)](AGENTS.md)


Legacy GDG PUP Web Development platform scaffold: a Next.js app under `client/` and an Express + TypeScript API under `server/`.

This repository is **archived** relative to the live flagship monorepo **[gdg-pup-platform](https://github.com/gdg-pup-webdev/gdg-pup-platform)** (Nexus). Use Nexus for active platform development.

## Table of Contents

- [About](#about)
- [Start here](#start-here)
- [Layout](#layout)
- [Quick start](#quick-start)
- [Documentation](#documentation)
- [Contributors](#contributors)

## About

Historical split-stack scaffold for GDG PUP web development: Next.js frontend and Express + TypeScript API. Kept for reference; new platform work belongs in **gdg-pup-platform** (Nexus).

## Start here

- **Humans:** this README, then [docs/state.md](docs/state.md)
- **Agents:** [AGENTS.md](AGENTS.md) (state → index → FLAGS)
- **Contributors:** table below

## Layout

```text
client/   Next.js frontend (starter app)
server/   Express + TypeScript API (hello route)
```

## Quick start

Legacy local run (API and web in separate terminals):

```bash
# API
cd server
npm install
npm run dev

# Web
cd client
npm install
npm run dev
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [State](docs/state.md) | Operating position / handover |
| [Index](docs/index.md) | Doc inventory |
| [FLAGS](FLAGS.md) | Improvement register |
| [AGENTS](AGENTS.md) | Agent load order |

## Contributors

This project is made possible by the GDG PUP community.

| Name | Role | GitHub |
| --- | --- | --- |
| [Carlos Jerico Dela Torre](https://www.linkedin.com/in/delatorrecj) | Chief Technology Officer (2025-2026) | [@delatorrecj](https://github.com/delatorrecj) |
| [Erwin Daguinotas](https://www.linkedin.com/in/erwin-daguinotas) | Web Development Lead | [@SauceCode01](https://github.com/SauceCode01) |

