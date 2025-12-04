#!/bin/bash

echo "Running post-deployment script..."
npm install
npx prisma migrate deploy
npm run dev