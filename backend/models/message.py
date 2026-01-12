from pydantic import BaseModel
from typing import Dict

class Message(BaseModel):
    mode: str
    sys_prompt: str
    user_prompt: str
    enable: Dict[str, bool]