import requests
import os
import sys
from dotenv import load_dotenv

load_dotenv()

ALOC_TOKEN = os.getenv('ALOC_TOKEN')
ALOC_BASE_URL = "https://questions.aloc.com.ng/api/v2"

class QuestionService:
    @staticmethod
    def get_questions(subject, mode='drill'):
        # Force logs to appear in PythonAnywhere error logs
        sys.stderr.write(f"DEBUG: QuestionService called for {subject} ({mode})\n")
        sys.stderr.write(f"DEBUG: ALOC_TOKEN length: {len(ALOC_TOKEN) if ALOC_TOKEN else 0}\n")

        if not ALOC_TOKEN:
            sys.stderr.write("ERROR: ALOC_TOKEN not set in environment variables.\n")
            raise Exception("ALOC_TOKEN not configured on server")
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
            'maths': 'mathematics',
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
            'User-Agent': 'Lambda-JAMB-Portal/1.0'
        }
        
        sys.stderr.write(f"DEBUG: Calling ALOC API: {url} with Token: {ALOC_TOKEN[:8]}...\n")
        
        try:
            # Increased timeout to 90s for Mock exams as they are heavy
            timeout = 90 if mode == 'mock' else 20
            response = requests.get(url, headers=headers, timeout=timeout, verify=True)
            sys.stderr.write(f"DEBUG: ALOC Response Status: {response.status_code}\n")
            
            if response.status_code == 200:
                data = response.json()
                questions = data.get('data', [])
                
                # Sometimes ALOC /q returns a single dict instead of a list
                if isinstance(questions, dict):
                    questions = [questions]
                
                # If we asked for mock but got nothing, fallback to drill for a few questions
                if mode == 'mock' and not questions:
                    sys.stderr.write(f"DEBUG: Mock returned empty, falling back to drill for {mapped_subject}\n")
                    drill_url = f"{ALOC_BASE_URL}/q?subject={mapped_subject}"
                    drill_res = requests.get(drill_url, headers=headers, timeout=15)
                    if drill_res.status_code == 200:
                        drill_data = drill_res.json()
                        drill_q = drill_data.get('data')
                        if drill_q:
                            questions = [drill_q] if isinstance(drill_q, dict) else drill_q
                
                # If it's drill mode and we only got 1 question, try to fetch more to make a set (e.g., 10)
                if mode == 'drill' and len(questions) < 10:
                    sys.stderr.write(f"DEBUG: Drill returned {len(questions)} questions, fetching more...\n")
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
                
                sys.stderr.write(f"DEBUG: Returning {len(questions)} questions for {mapped_subject}\n")
                return questions
            else:
                sys.stderr.write(f"DEBUG: ALOC Error: {response.status_code} - {response.text}\n")
                raise Exception(f"ALOC API Error: {response.status_code}")
                
        except requests.exceptions.Timeout:
            sys.stderr.write("ERROR: ALOC API Timeout\n")
            raise Exception("ALOC API Timeout")
        except Exception as e:
            sys.stderr.write(f"ERROR: QuestionService failure: {e}\n")
            raise e
