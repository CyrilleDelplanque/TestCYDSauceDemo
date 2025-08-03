# MCP Server

Ce dossier contient un serveur Model Context Protocol (MCP) minimal en TypeScript avec Express.

## Installation

```powershell
cd mcp-server
npm install
```

## Compilation

```powershell
npm run build
```

## Lancement du serveur

```powershell
npm start
```

Le serveur écoute par défaut sur le port 3001.

## Endpoints
- `GET /health` : Vérifie que le serveur fonctionne.
- `POST /mcp` : Exemple d'endpoint MCP (à adapter selon vos besoins).
