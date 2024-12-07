# Be My Girlfriend

A cute interactive webpage to ask someone to be your girlfriend.

## Deployment to Cloudflare Pages

1. First, create a GitHub repository and push this code to it:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)

3. Click "Create a project"

4. Connect your GitHub account if you haven't already

5. Select your repository

6. Configure your build settings:
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: /
   - Root directory: /

7. Click "Save and Deploy"

8. Once deployed, you can set up your custom domain:
   - Go to your project's "Custom domains" section
   - Click "Set up a custom domain"
   - Enter your domain name
   - Follow the DNS configuration instructions

## Local Development
To run locally:
```bash
npm install
npm start
```
