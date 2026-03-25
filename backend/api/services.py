import requests
import os
from dotenv import load_dotenv

load_dotenv()

ALOC_TOKEN = os.getenv('ALOC_TOKEN')
ALOC_BASE_URL = "https://questions.aloc.com.ng/api/v2"

class QuestionService:
    @staticmethod
    def get_questions(subject, mode='drill'):
        if not ALOC_TOKEN:
            print("ERROR: ALOC_TOKEN not set in environment variables.")
            return None
        """
        Fetches questions from ALOC API.
        mode: 'drill' (single/quick) or 'mock' (full set)
        """
        # Mapping subject names to ALOC expectations
        subject_map = {
            'english': 'english',
            'biology': 'biology',
            'chemistry': 'chemistry',
            'physics': 'physics',
            'mathematics': 'mathematics',
            'economics': 'economics',
            'government': 'government',
            'crs': 'crs',
            'irs': 'irs',
            'commerce': 'commerce',
            'accounting': 'accounting',
            'literature': 'literature'
        }
        
        mapped_subject = subject_map.get(subject.lower(), 'biology')
        
        # ALOC API v2 endpoints
        # /q for single random question
        # /m for mock exam
        endpoint = "/q" if mode == 'drill' else "/m"
        url = f"{ALOC_BASE_URL}{endpoint}?subject={mapped_subject}"
        
        headers = {
            'AccessToken': ALOC_TOKEN,
            'Accept': 'application/json',
        }
        
        print(f"DEBUG: Calling ALOC API: {url}")
        
        try:
            # Increased timeout to 90s for Mock exams as they are heavy
            timeout = 90 if mode == 'mock' else 20
            response = requests.get(url, headers=headers, timeout=timeout)
            print(f"DEBUG: ALOC Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                questions = data.get('data', [])
                
                # Sometimes ALOC /q returns a single dict instead of a list
                if isinstance(questions, dict):
                    questions = [questions]
                
                # If we asked for mock but got nothing, fallback to drill for a few questions
                if mode == 'mock' and not questions:
                    print(f"DEBUG: Mock returned empty, falling back to drill for {mapped_subject}")
                    drill_url = f"{ALOC_BASE_URL}/q?subject={mapped_subject}"
                    drill_res = requests.get(drill_url, headers=headers, timeout=15)
                    if drill_res.status_code == 200:
                        drill_data = drill_res.json()
                        drill_q = drill_data.get('data')
                        if drill_q:
                            questions = [drill_q] if isinstance(drill_q, dict) else drill_q
                
                # If it's drill mode and we only got 1 question, try to fetch more to make a set (e.g., 10)
                if mode == 'drill' and len(questions) < 10:
                    print(f"DEBUG: Drill returned {len(questions)} questions, fetching more...")
                    seen_ids = set()
                    for q in questions:
                        if isinstance(q, dict) and 'id' in q:
                            seen_ids.add(q.get('id'))

                    max_attempts = 15
                    attempts = 0
                    while len(questions) < 10 and attempts < max_attempts:
                        attempts += 1
                        extra_res = requests.get(url, headers=headers, timeout=15)
                        if extra_res.status_code == 200:
                            extra_data = extra_res.json()
                            extra_q = extra_data.get('data')
                            if extra_q:
                                # Handle both list and dict responses
                                items_to_add = extra_q if isinstance(extra_q, list) else [extra_q]
                                for item in items_to_add:
                                    q_id = item.get('id')
                                    if q_id not in seen_ids:
                                        questions.append(item)
                                        seen_ids.add(q_id)
                                        if len(questions) >= 10:
                                            break
                        else:
                            break
                    # Ensure we don't return more than 10 for drill
                    questions = questions[:10]

                print(f"DEBUG: Returning {len(questions)} questions")
                return questions
            else:
                print(f"DEBUG: ALOC Error Response: {response.text}")
                return []
                
        except requests.exceptions.RequestException as e:
            print(f"DEBUG: ALOC Request Exception: {e}")
            return []
