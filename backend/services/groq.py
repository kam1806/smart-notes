import os
import json
import re
from groq import Groq
from dotenv import load_dotenv
from schemas.note import QuizQuestionBase

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY not found in .env")

client = Groq(api_key=GROQ_API_KEY)
MODEL = "llama-3.1-8b-instant"

def clean_json_text(text: str) -> str:
    # Removes markdown code fences if present
    text = re.sub(r"^```(json)?\s*", "", text.strip())
    text = re.sub(r"\s*```$", "", text)
    return text

async def generate_structured_output(prompt: str) -> dict:
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant that outputs ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model=MODEL,
            response_format={"type": "json_object"}, 
        )
        response_content = chat_completion.choices[0].message.content
        if response_content:
            # DEBUG: Print what the AI actually sent to catch errors
            # print(f"\n--- AI RAW RESPONSE ---\n{response_content[:200]}...\n-----------------------")
            return json.loads(clean_json_text(response_content))
        return {}
    except Exception as e:
        print(f"Groq API Error: {e}")
        return {} 

async def generate_summary_and_bullets(text: str) -> dict:
    # 1. Calculate Word Count
    word_count = len(text.split())
    
    # 2. Determine Logic based on your Table
    if word_count < 300:
        length_instruction = (
            "The source is short (under 300 words). "
            "Provide a very brief summary (1-2 sentences). "
            "Provide exactly 2-3 bullet point capturing the main idea."
        )
    elif word_count < 700:
        length_instruction = (
            "The source is moderate length (300-700 words). "
            "Provide a concise summary (approx 80 words). "
            "Provide exactly 5 key bullet points."
        )
    elif word_count < 1500:
        length_instruction = (
            "The source is standard length (700-1500 words). "
            "Provide a solid summary (approx 150 words). "
            "Provide exactly 7 distinct bullet points."
        )
    elif word_count < 4000:
        length_instruction = (
            "The source is long (1500-4000 words). "
            "Provide a detailed summary (approx 300 words). "
            "Provide 9 comprehensive bullet points."
        )
    elif word_count < 7000:
        length_instruction = (
            "The source is very long (4000-7000 words). "
            "Provide an in-depth summary (approx 400 words). "
            "Provide 10 detailed bullet points."
        )
    else:
        length_instruction = (
            "The source is extensive (7000+ words). "
            "Provide an extensive summary (approx 500 words). "
            "Provide 12-15 in-depth bullet points."
        )

    # 3. Construct the Prompt
    prompt = f"""
    Analyze the following text (Word Count: {word_count}):
    "{text[:10000]}" 
    
    INSTRUCTIONS:
    {length_instruction}
    
    Output JSON structure: 
    {{ 
        "summary": "The summary paragraph string...", 
        "bullet_points": "• Point 1\\n• Point 2..." 
    }}
    """
    
    return await generate_structured_output(prompt)

async def generate_quizzes_and_flashcards(text: str) -> list[QuizQuestionBase]:
    # 1. Calculate Word Count
    word_count = len(text.split())
    print(f"\n📢 [QUIZ] Received {word_count} words.\n")
    
    # 2. Determine Questions based on your Table
    if word_count < 300:
        num_flashcards, num_mcqs = 3, 1
    elif word_count < 700:
        num_flashcards, num_mcqs = 4, 3
    elif word_count < 1500:
        num_flashcards, num_mcqs = 6, 4
    elif word_count < 4000:
        num_flashcards, num_mcqs = 8, 6
    elif word_count < 7000:
        num_flashcards, num_mcqs = 10, 8
    else:
        num_flashcards, num_mcqs = 12, 10
    
    total_items = num_flashcards + num_mcqs

    # 3. Dynamic Prompt with ONE-SHOT EXAMPLE (Forces compliance)
    prompt = f"""
    Create a quiz based on the notes below.
    
    CRITICAL RULES:
    1. You MUST generate EXACTLY {num_mcqs} Multiple Choice Questions (is_flashcard=false).
    2. You MUST generate EXACTLY {num_flashcards} Flashcards (is_flashcard=true).
    3. FOR MCQs: You MUST provide 3 distinct incorrect options (distractor_1, distractor_2, distractor_3). 
       - NEVER return null for MCQ distractors.
    4. FOR FLASHCARDS: Set all distractors to null.

    EXAMPLE OUTPUT FORMAT:
    {{
      "questions": [
        {{
          "question_text": "What is the capital of France?",
          "correct_answer": "Paris",
          "distractor_1": "London",
          "distractor_2": "Berlin",
          "distractor_3": "Madrid",
          "is_flashcard": false
        }},
        {{
          "question_text": "Define photosynthesis.",
          "correct_answer": "Process by which plants make food.",
          "distractor_1": null,
          "distractor_2": null,
          "distractor_3": null,
          "is_flashcard": true
        }}
      ]
    }}
    Notes Source (Words: {word_count}): 
    {text[:60000]} 
    """
    data = await generate_structured_output(prompt)
    questions_list = []
    # 1. Try standard keys
    if "questions" in data:
        questions_list = data["questions"]
    elif "quiz" in data:
        questions_list = data["quiz"]
    # 2. If empty, search VALUES for any list
    if not questions_list:
        print("⚠️ Standard keys missing. Searching all values...")
        for key, value in data.items():
            if isinstance(value, list) and len(value) > 0:
                questions_list = value
                print(f"   -> Found list under key: '{key}'")
                break
    
    # 3. If still empty, check if data ITSELF is a list
    if isinstance(data, list):
        questions_list = data
    
    # 4. Extract List
    questions_list = data.get("questions") or data.get("quiz") or []
    if isinstance(data, list):
        questions_list = data
    print(f"--- FOUND {len(questions_list)} QUESTIONS (Target: {total_items}) ---") 
    valid_questions = []
    for q in questions_list:
        try:
            # Clean up flashcards (just to be safe)
            if q.get('is_flashcard'):
                q['distractor_1'] = None
                q['distractor_2'] = None
                q['distractor_3'] = None            
            # NO SAFETY NET HERE. We trust the Prompt.
            valid_questions.append(QuizQuestionBase(**q))
        except Exception as e:
            print(f"Skipping invalid question: {q} | Error: {e}")

    return valid_questions