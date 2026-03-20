# Gallery App

A photo gallery built with Vue 3, Pinia, and Vue Router, powered by the [Picsum Photos](https://picsum.photos) API.

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- npm

## Setup

```bash
cd gallery-app
npm install
```

## Running locally

```bash
npm run dev
```

Opens at `http://localhost:5173`.



## Running tests

```bash
npm run test:unit          # watch mode
npm run test:unit -- --run # run once and exit
```

## Building for production

```bash
npm run build
```

Output goes to `gallery-app/dist/`.

```bash
npm run preview
```
Opens at `http://localhost:4173`.
---

## Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)

### Build and run

```bash
cd gallery-app
docker build -t gallery-app .
docker run -p 8080:80 gallery-app
```

Opens at `http://localhost:8080`.

### Stop the container

```bash
docker ps                        # find the container ID
docker stop <container-id>
```
