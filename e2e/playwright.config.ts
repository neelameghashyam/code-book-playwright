import { defineConfig } from '@playwright/test';

     export default defineConfig({
       testDir: './e2e',
       fullyParallel: true,
       reporter: 'html',
       use: {
         baseURL: 'https://angular-code-book.netlify.app',
         browserName: 'chromium',
       },
     });