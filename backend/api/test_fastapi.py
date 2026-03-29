"""
Vercel Serverless Function for FastAPI
参考：https://github.com/vercel/examples/tree/main/python/fastapi
"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/auth/google/url")
async def google_auth_url():
    return {
        "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=test",
        "state": "test"
    }

def handler(request, response):
    return app(request.scope, request.receive, response)
