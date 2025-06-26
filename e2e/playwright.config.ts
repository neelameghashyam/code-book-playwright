import { defineConfig } from '@playwright/test';

     export default defineConfig({
       testDir: './e2e',
       fullyParallel: true,
       reporter: 'html',
       use: {
         baseURL: 'http://localhost:4200',
         browserName: 'chromium',
       },
     });