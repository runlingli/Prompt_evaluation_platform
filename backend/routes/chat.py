import asyncio
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from models.message import Message
from models.database import get_db
from models.llm_message import LLMMessage
from services.llm_services import get_llm_response
from utils.website_summary import website_user_prompt

router = APIRouter()

model_map = {
    "OpenAI-4-mini": "openai/gpt-4o-mini",
    "OpenAI-4": "openai/gpt-4",
    "Deepseek-chat": "deepseek/deepseek-chat",
    "Deepseek-reasoner": "deepseek/deepseek-reasoner",
    "Claude-haiku-3": "anthropic/claude-3-haiku-20240307",
    "Claude-sonnet-4": "anthropic/claude-sonnet-4-20250514",
    "Gemini-3-pro": "gemini/gemini-3-pro-preview",
    "Gemini-3-flash": "gemini/gemini-3-flash-preview",
}

@router.post("/chat")
async def chat(message: Message, db: AsyncSession = Depends(get_db)):
    if message.mode == "website_summary":
        message.user_prompt = website_user_prompt(message.user_prompt)

    tasks = {k: get_llm_response(model_id, message.sys_prompt, message.user_prompt)
             for k, model_id in model_map.items() if message.enable.get(k)}

    if not tasks:
        return {"error": "No models enabled"}

    try:
        keys = list(tasks.keys())
        results = await asyncio.gather(*tasks.values())
        response_dict = dict(zip(keys, results))

        for model_name, result in response_dict.items():
            llm_message = LLMMessage(
                mode=message.mode,
                model_name=model_name,
                sys_prompt=message.sys_prompt,
                user_prompt=message.user_prompt,
                response=result["content"],
                cost=result["cost"]
            )
            db.add(llm_message)
        await db.commit()

        return response_dict
    except Exception as e:
        print("Chat error:", e)
        return {"error": str(e)}
