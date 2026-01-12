import asyncio
from litellm import completion

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
