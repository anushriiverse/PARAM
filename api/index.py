import os
import sys
from pathlib import Path

# Ensure api directory is on sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

try:
    from main import app
except ImportError:
    from api.main import app

# Vercel entrypoint handler
app = app
