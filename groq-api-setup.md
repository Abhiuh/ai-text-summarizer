# Setting up GROQ API Key for SumaRise

## Local Development
1. Create a `.env` file in the root directory of your project with the following content:
```
GROQ_API_KEY=your_actual_api_key_here
```
2. Replace `your_actual_api_key_here` with your actual GROQ API key.
3. Restart your local server.

## Netlify Deployment
1. Log in to your Netlify dashboard
2. Navigate to your SumaRise project
3. Go to Site settings > Environment variables
4. Add a new variable with:
   - Key: `GROQ_API_KEY`
   - Value: Your actual GROQ API key
5. Redeploy your site

Note: Keep your API key secure and never commit it to version control.
