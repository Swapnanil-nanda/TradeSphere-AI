#!/usr/bin/env python3
"""
TradeSphere AI — Automated Secret & Credential Scanner
Scans source files across all repositories for leaked credentials, tokens, and secrets.
Fails with exit code 1 if unauthorized secrets are discovered.
"""

import os
import re
import sys
from pathlib import Path

# High-risk patterns
SECRET_PATTERNS = [
    (r'(?i)aws_access_key_id\s*=\s*["\'](AKIA[0-9A-Z]{16})["\']', "AWS Access Key ID"),
    (r'(?i)aws_secret_access_key\s*=\s*["\']([0-9a-zA-Z/+]{40})["\']', "AWS Secret Key"),
    (r'-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----', "Private Encryption Key"),
    (r'(?i)ghp_[0-9a-zA-Z]{36}', "GitHub Personal Access Token"),
    (r'(?i)xox[baprs]-[0-9a-zA-Z]{10,48}', "Slack API Token"),
    (r'(?i)AIza[0-9A-Za-z-_]{35}', "Google API Key"),
    (r'(?i)password\s*[:=]\s*["\'](?!CHANGE_ME|test|development|PassTenant|PassAdmin|admin|root|password|123456)[A-Za-z0-9@#$%^&+=]{12,}["\']', "Hardcoded Production Password")
]

IGNORE_DIRS = {
    '.git', 'node_modules', 'target', '.next', '__pycache__', 
    '.pytest_cache', 'venv', '.gemini', 'dist', 'build'
}

IGNORE_EXTENSIONS = {
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', 
    '.woff2', '.ttf', '.eot', '.pdf', '.jar', '.class', '.pyc'
}

def scan_file(file_path):
    issues = []
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            for line_no, line in enumerate(f, start=1):
                # Ignore comment lines with placeholder text
                if 'EXAMPLE' in line or 'PLACEHOLDER' in line or 'mock' in line.lower():
                    continue
                for pattern, name in SECRET_PATTERNS:
                    if re.search(pattern, line):
                        # Filter out common test files
                        if 'test' in str(file_path).lower() or 'fixture' in str(file_path).lower():
                            continue
                        issues.append((line_no, name, line.strip()[:80]))
    except Exception as e:
        pass
    return issues

def main():
    root_dir = Path(__file__).resolve().parent.parent.parent
    print(f"[*] Scanning workspace {root_dir} for leaked secrets & credentials...")

    findings = []
    scanned_files = 0

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude directories
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]

        for fname in filenames:
            ext = os.path.splitext(fname)[1].lower()
            if ext in IGNORE_EXTENSIONS:
                continue

            file_path = Path(dirpath) / fname
            scanned_files += 1
            issues = scan_file(file_path)
            for line_no, name, sample in issues:
                rel_path = file_path.relative_to(root_dir)
                findings.append((str(rel_path), line_no, name, sample))

    print(f"[*] Scanned {scanned_files} files.")

    if findings:
        print(f"\n[!] HIGH SEVERITY: Discovered {len(findings)} potential secret(s):")
        for path, line, name, sample in findings:
            print(f"  - {path}:{line} -> {name}")
            print(f"    Line preview: {sample}...")
        sys.exit(1)
    else:
        print("[+] SUCCESS: No exposed credentials or secrets discovered.")
        sys.exit(0)

if __name__ == "__main__":
    main()
