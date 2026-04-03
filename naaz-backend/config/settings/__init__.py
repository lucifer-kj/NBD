import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import base settings
from .base import *

# Override with development or production settings based on DEBUG
if DEBUG:
    try:
        from .development import *
    except ImportError:
        pass
else:
    try:
        from .production import *
    except ImportError:
        pass
