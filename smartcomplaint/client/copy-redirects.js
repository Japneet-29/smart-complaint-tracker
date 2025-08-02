import { copyFileSync } from 'fs';
copyFileSync('public/_redirects', 'dist/_redirects');
