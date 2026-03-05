import re
import html as html_module
from datetime import datetime
from urllib.parse import urlparse, urlunparse

# UI/DOM artifact strings that leak into scraped text
_UI_BLOCKLIST = [
    'Title Background',
    'Employee',
    'Students',
    'Student Crew',
    'Benefit Icon',
    'Istraži ovo zanimanje',
    'Idi na profil poslodavca',
]

def clean_description(html_str: str) -> str:
    """Cleans scraped HTML into readable plain text.

    1. Decode HTML entities  (html.unescape)
    2. Replace tags with newlines (preserve paragraph breaks)
    3. Remove UI artifact lines (blocklist)
    4. Strip each line, drop lines < 3 chars
    5. Collapse 3+ consecutive blank lines to 2
    """
    if not html_str:
        return ""

    # 1. Decode HTML entities (&rsquo; → ', &ndash; → –, &nbsp; → ' ', etc.)
    text = html_module.unescape(html_str)

    # 2. Replace block-level tags with newlines, inline tags with space
    text = re.sub(r'<br\s*/?\s*>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</(p|div|li|tr|h[1-6])>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)

    # Replace non-breaking spaces that survived unescape
    text = text.replace('\xa0', ' ')

    # 3-5. Per-line cleanup
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        line = line.strip()
        # Collapse multiple spaces within a line
        line = re.sub(r' {2,}', ' ', line)
        # Skip short lines (likely artifacts)
        if len(line) < 3:
            continue
        # Skip UI artifact lines
        if line in _UI_BLOCKLIST:
            continue
        cleaned_lines.append(line)

    result = '\n'.join(cleaned_lines)

    # 6. Collapse 3+ consecutive newlines to 2
    result = re.sub(r'\n{3,}', '\n\n', result)

    return result.strip()

def extract_skills(text_or_list) -> list[str]:
    """Extracts skills as a clean string array. Splits on delimiters if string."""
    skills = []
    if not text_or_list:
        return skills
        
    if isinstance(text_or_list, list):
        items = text_or_list
    else:
        # Split on commas, semicolons, newlines, and bullet characters
        # Common bullet chars: •, -, *, ·, ▪, ◦
        items = re.split(r'[,;\n•\-*·▪◦]+', str(text_or_list))

    for item in items:
        cleaned = item.strip()
        # Remove trailing/leading punctuation
        cleaned = re.sub(r'^[^a-zA-Z0-9]+|[^a-zA-Z0-9+]+$', '', cleaned).strip()
        # Ensure length is between 2 and 50 characters
        if 2 <= len(cleaned) <= 50:
            skills.append(cleaned)
            
    # Remove duplicates while preserving order
    seen = set()
    return [x for x in skills if not (x.lower() in seen or seen.add(x.lower()))]

def extract_languages(text: str) -> list[dict]:
    """
    Extracts required languages and levels.
    Finds mentions like 'English B2', 'fluent in English'.
    Returns [{"lang": "English", "level": "B2"}].
    """
    languages = []
    if not text:
        return languages
        
    text_lower = text.lower()
    
    lang_map = {
        'engleski': 'English',
        'english': 'English',
        'nemacki': 'German',
        'nemački': 'German',
        'german': 'German',
        'srpski': 'Serbian',
        'serbian': 'Serbian',
        'ruski': 'Russian',
        'russian': 'Russian',
        'francuski': 'French',
        'french': 'French',
        'spanski': 'Spanish',
        'španski': 'Spanish',
        'spanish': 'Spanish',
        'italijanski': 'Italian',
        'italian': 'Italian'
    }
    
    # regex for levels like A1, B2, C1 etc. Optional descriptors.
    level_pattern = re.compile(r'\b([abc][12])\b', re.IGNORECASE)
    
    for term, lang_name in lang_map.items():
        if term in text_lower:
            # Check context window (e.g., +/- 30 chars from language mention) for level
            mentions = [m.start() for m in re.finditer(term, text_lower)]
            best_level = None
            
            for start_idx in mentions:
                window_start = max(0, start_idx - 30)
                window_end = min(len(text_lower), start_idx + len(term) + 30)
                window_text = text_lower[window_start:window_end]
                
                level_match = level_pattern.search(window_text)
                if level_match:
                    best_level = level_match.group(1).upper()
                    break
                    
            # Avoid adding the same language twice
            if not any(l.get('lang') == lang_name for l in languages):
                languages.append({
                    "lang": lang_name,
                    "level": best_level
                })
                
    return languages

def parse_deadline(date_str: str) -> str | None:
    """Parses date to ISO YYYY-MM-DD. Handles various formats."""
    if not date_str:
        return None
        
    clean_str = date_str.strip().rstrip('.')
    
    formats_to_try = [
        '%d.%m.%Y',
        '%d.%m.%Y.',
        '%Y-%m-%d',
        '%d/%m/%Y'
    ]
    
    for fmt in formats_to_try:
        try:
            return datetime.strptime(clean_str, fmt).strftime('%Y-%m-%d')
        except ValueError:
            continue
            
    return None

def clean_url(url: str) -> str:
    """Removes query parameters from URL to deduplicate correctly."""
    if not url:
        return ""
    parsed = urlparse(url)
    clean = urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', '', ''))
    return clean
