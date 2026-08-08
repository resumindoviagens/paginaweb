{
  "installCommand": "npm ci --no-audit --no-fund",
  "framework": "nextjs",
  "crons": [
    {
      "path": "/api/alerts/daily",
      "schedule": "0 11 * * *"
    }
  ],
  "buildCommand": "npm run build"
}
