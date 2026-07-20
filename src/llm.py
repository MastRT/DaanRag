from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM
)

import torch


class LLMService:

    def __init__(self):

            
        self.tokenizer = AutoTokenizer.from_pretrained(
            "Qwen/Qwen2.5-1.5B-Instruct",
        )

            
        self.model = AutoModelForCausalLM.from_pretrained(
            "Qwen/Qwen2.5-1.5B-Instruct",
            torch_dtype="auto",
            device_map="auto"
        )

    def generate_answer(
        self,
        context,
        question
    ):

        messages = [
            {
            "role": "system",
            "content": """
تو یک سیستم پاسخ‌گویی مبتنی بر سند هستی.

قوانین:

1. فقط از CONTEXT استفاده کن.
2. از دانش قبلی خودت استفاده نکن.
3. چیزی را حدس نزن.
4. اگر پاسخ در CONTEXT وجود ندارد، دقیقاً بنویس:
اطلاعات کافی در سند پیدا نشد.
5. پاسخ را به زبان فارسی بنویس.
6. مستقیم به سؤال پاسخ بده.
7. سؤال را تکرار نکن.
8. اگر سؤال درباره چند مورد است، پاسخ را به صورت فهرست شماره‌دار بنویس.
9. فقط پاسخ نهایی را بنویس و توضیح اضافه نده.

پاسخ باید از اطلاعات موجود در CONTEXT استخراج شود.
"""
        },
            {
            "role": "user",
            "content": f"""
CONTEXT:
{context}

QUESTION:
{question}

ANSWER:
"""
        }
        ]

        prompt = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        inputs = self.tokenizer(
            prompt,
            return_tensors="pt",
            truncation = True,
            max_length = 4096
        ).to(self.model.device)

        with torch.no_grad():

            outputs = self.model.generate(
                **inputs,
                max_new_tokens=200,
                do_sample=False,
                repetition_penalty=1.1,
                pad_token_id=self.tokenizer.eos_token_id
            )

        new_tokens = outputs[
            0
        ][
            inputs["input_ids"].shape[1]:
        ]

        answer = self.tokenizer.decode(
            new_tokens,
            skip_special_tokens=True
        )

        return answer