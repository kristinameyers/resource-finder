#!/usr/bin/env node
// Simple wrapper to run the server without watch mode
// This avoids the tsx watcher restart loop issue with Vite temp files

require('tsx/cjs').register();
require('./src/index.ts');