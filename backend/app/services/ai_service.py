import json
import httpx
from ..core.config import get_settings


GRADING_PROMPT = """你是一位专业的AI阅卷老师。请仔细查看这张试卷图片，识别所有题目并判断学生答案的对错。

请以JSON格式返回，格式如下：
{
  "questions": [
    {
      "question_text": "题目内容",
      "question_type": "choice或blank或essay",
      "options": ["A选项", "B选项", "C选项", "D选项"],
      "correct_answer": "正确答案（选择题填选项字母A/B/C/D，填空题填数值或文字）",
      "student_answer": "学生的答案（选择题填选项字母A/B/C/D，填空题填数值或文字，如果图片中没有作答则为空字符串）",
      "is_correct": true或false,
      "explanation": "简要解析为什么对或错",
      "knowledge_point": "这道题考察的知识点名称"
    }
  ]
}

注意：
1. 如果图片中有多道题，请每道题都识别出来
2. 如果学生没有作答，student_answer 应为空字符串，is_correct 为 false
3. 选择题的 options 数组要列出所有选项内容
4. 知识点名称要具体，如"一元一次方程"而不是"数学"；"一般现在时"而不是"英语"
5. 只返回JSON，不要有其他文字
"""


async def grade_exam(image_data: bytes) -> dict:
    """Send exam image to Qwen Vision API for grading."""
    settings = get_settings()

    if not settings.ai_api_key:
        # Return mock result when no API key is configured
        return _mock_grade_result()

    async with httpx.AsyncClient(timeout=120) as client:
        # Upload image as base64
        import base64
        image_b64 = base64.b64encode(image_data).decode("utf-8")

        response = await client.post(
            f"{settings.ai_api_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.ai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.ai_model,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"},
                            },
                            {"type": "text", "text": GRADING_PROMPT},
                        ],
                    }
                ],
                "max_tokens": 4096,
            },
        )

        result = response.json()
        content = result["choices"][0]["message"]["content"]

        # Try to extract JSON from response
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        return json.loads(content)


def _mock_grade_result() -> dict:
    """Mock grading result for demo purposes when AI API is not configured."""
    return {
        "questions": [
            {
                "question_text": "下列哪项是正确的英语表达？",
                "question_type": "choice",
                "options": [
                    "He go to school every day",
                    "He goes to school every day",
                    "He going to school every day",
                    "He gone to school every day",
                ],
                "correct_answer": "B",
                "student_answer": "A",
                "is_correct": False,
                "explanation": "主语 He 是第三人称单数，动词 go 需要加 -es 变成 goes。一般现在时中第三人称单数的动词变化规则：以 o 结尾的动词加 -es。",
                "knowledge_point": "一般现在时第三人称单数",
            },
            {
                "question_text": "解方程：2x + 5 = 15，求 x 的值。",
                "question_type": "blank",
                "options": None,
                "correct_answer": "5",
                "student_answer": "5",
                "is_correct": True,
                "explanation": "2x + 5 = 15 → 2x = 10 → x = 5，计算正确。",
                "knowledge_point": "一元一次方程",
            },
            {
                "question_text": "My mother ___ cooking dinner now. (用 be 动词填空)",
                "question_type": "blank",
                "options": None,
                "correct_answer": "is",
                "student_answer": "are",
                "is_correct": False,
                "explanation": "主语 mother 是第三人称单数，且为现在进行时，be 动词应使用 is。现在进行时结构：主语 + am/is/are + 动词-ing。",
                "knowledge_point": "现在进行时",
            },
            {
                "question_text": "因式分解：x² - 9 = ?",
                "question_type": "blank",
                "options": None,
                "correct_answer": "(x+3)(x-3)",
                "student_answer": "(x+3)(x-3)",
                "is_correct": True,
                "explanation": "使用平方差公式 a² - b² = (a+b)(a-b)，其中 a=x, b=3，分解结果为 (x+3)(x-3)，答案正确。",
                "knowledge_point": "平方差公式",
            },
            {
                "question_text": "-Where is Tom? -He ___ basketball on the playground.",
                "question_type": "choice",
                "options": [
                    "play",
                    "plays",
                    "is playing",
                    "are playing",
                ],
                "correct_answer": "C",
                "student_answer": "C",
                "is_correct": True,
                "explanation": "问句询问 Tom 现在在哪里，回答描述他正在操场打篮球，是现在进行时的场景。主语 He 是第三人称单数，be 动词用 is。",
                "knowledge_point": "现在进行时",
            },
        ]
    }
