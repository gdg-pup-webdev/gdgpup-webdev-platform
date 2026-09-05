# GDGPUP Webdev Platform (legacy)

Legacy GDG PUP Web Development platform scaffold: a Next.js app under `client/` and an Express + TypeScript API under `server/`.

This repository is **archived** relative to the live flagship monorepo **[gdg-pup-platform](https://github.com/gdg-pup-webdev/gdg-pup-platform)** (Nexus). Use Nexus for active platform development.

## Table of Contents

- [About](#about)
- [Layout](#layout)
- [Quick start](#quick-start)
- [Documentation](#documentation)
- [Contributors](#contributors)

## About

Historical split-stack scaffold for GDG PUP web development: Next.js frontend and Express + TypeScript API. Kept for reference; new platform work belongs in **gdg-pup-platform** (Nexus).

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

This project is made possible by the GDG PUP community:

| Role | Name |
| --- | --- |
| 💻 **Development** | [Erwin Daguinotas](https://www.linkedin.com/in/erwin-daguinotas) - Web Development Lead |
