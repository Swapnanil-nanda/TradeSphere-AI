"""
Pytest Configuration and Fixtures
"""
import sys
import os

# Ensure quant-engine root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
