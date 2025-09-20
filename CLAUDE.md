# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript-based Pomodoro application for researchers. The project appears to be in early development with minimal files present.

## Project Structure

- `components/` - React/TypeScript components (currently contains empty Dashboard.tsx)
- `services/` - Service layer files (currently contains empty geminiService.ts)
- `public/` - Static assets
- `dist/` - Build output directory
- `hooks/` - Custom React hooks (empty)
- `node_modules/` - Dependencies

## Architecture

The project follows a standard React TypeScript structure with:
- React components in the `components/` directory
- Service layer for external API integration (Gemini AI service)
- Separation of concerns with dedicated directories for different layers

## Key Technologies

Based on the node_modules directory and file structure:
- React/TypeScript for the frontend
- Vite as the build tool
- Recharts for data visualization
- Google Gemini AI integration

## Development Notes

- The project currently has empty placeholder files in `components/Dashboard.tsx` and `services/geminiService.ts`
- No package.json found in root directory - may need to be created
- No build/test scripts configured yet as the project appears to be in initial setup phase
- Uses TypeScript throughout the codebase