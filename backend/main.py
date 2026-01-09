import asyncio
import os
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict
from fastapi.middleware.cors import CORSMiddleware
from litellm import completion
from dotenv import load_dotenv

from website_summary import website_user_prompt

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    mode: str
    sys_prompt: str
    user_prompt: str
    enable: Dict[str, bool]

async def get_llm_response(litellm_model: str, sys_prompt: str, user_prompt: str):
    print(f"Processing {litellm_model}...")
    response = await asyncio.to_thread(
        completion,
        model=litellm_model,
        messages=[
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": user_prompt}
        ],
    )
    return {
        "content": response.choices[0].message.content,
        "cost": response._hidden_params.get("response_cost", 0) * 100
    }

@app.post("/chat")
async def chat(message: Message):
    # mapping
    model_map = {
        "OpenAI-4-mini": "openai/gpt-4o-mini",
        "OpenAI-5-mini": "openai/gpt-5o-mini",
        "Deepseek-chat": "deepseek/deepseek-chat",
        "Deepseek-reasoner": "deepseek/deepseek-reasoner",
        "Claude-haiku-3": "anthropic/claude-3-haiku-20240307",
        "Claude-sonnet-4": "anthropic/claude-sonnet-4-20250514",
        "Gemini-3-pro": "gemini/gemini-3-pro-preview",
        "Gemini-3-flash": "gemini/gemini-3-flash-preview",
    }
    print(message)

    if message.mode == 'website_summary':
        message.user_prompt = website_user_prompt(message.user_prompt)

    tasks = {}
    for key, model_id in model_map.items():
        if message.enable.get(key):
            tasks[key] = get_llm_response(model_id, message.sys_prompt, message.user_prompt)

    if not tasks:
        return {"error": "No models enabled"}

    try:
        keys = list(tasks.keys())
        results = await asyncio.gather(*tasks.values())
        return dict(zip(keys, results))
        
    except Exception as e:
        print("Chat error:", e)
        return {"error": str(e)}