import os
import sys
import re

# Constants for Paths
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "naaz-backend")
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "naaz-frontend")

# Colors for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
CYAN = '\033[96m'
RESET = '\033[0m'
BOLD = '\033[1m'

# Expected Requirements Checklist Based on Meta Prompt Blueprint
backend_models = {
    "users": ["CustomUser", "UserAddress"],
    "catalog": ["Book", "Atar", "AtarVariant"],
    "orders": ["PromoCode", "Order", "OrderItem", "Refund"],
    "payments": ["PaymentRecord"],
}

backend_apps = [
    "users", "catalog", "orders", "payments", "notifications", "search", "ai_assistant", "core"
]

frontend_pages = [
    "app/page.tsx",
    "app/(shop)/books/page.tsx",
    "app/(shop)/books/[slug]/page.tsx",
    "app/(shop)/atar/page.tsx",
    "app/(shop)/atar/[slug]/page.tsx",
    "app/(shop)/search/page.tsx",
    "app/(shop)/cart/page.tsx",
    "app/(auth)/login/page.tsx",
    "app/(auth)/register/page.tsx",
    "app/account/orders/page.tsx",
    "app/account/loyalty/page.tsx",
    "app/account/addresses/page.tsx",
]

frontend_components = [
    "components/layout/Navbar.tsx",
    "components/layout/Footer.tsx",
    "components/catalog/BookCard.tsx",
    "components/catalog/AtarCard.tsx",
    "components/cart/CartDrawer.tsx",
    "components/search/SearchBar.tsx",
    "components/home/HeroBanner.tsx",
]

def check_file_exists(path):
    return os.path.exists(path)

def check_model_in_file(file_path, model_name):
    if not os.path.exists(file_path):
        return False
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        return bool(re.search(rf"class\s+{model_name}\b", content))

def print_header(title):
    print(f"\n{BOLD}{CYAN}=== {title} ==={RESET}")

def report_item(name, is_found, optional_text=""):
    status = f"{GREEN}[OK]{RESET}" if is_found else f"{RED}[FAIL]{RESET}"
    print(f" {status} {name} {optional_text}")

def calculate_progress(found, total):
    if total == 0:
        return 100.0
    return (found / total) * 100

def check_backend_progress():
    print_header("BACKEND PROGRESS (Django Ninja)")
    if not check_file_exists(BACKEND_DIR):
        print(f"{RED}Backend directory 'naaz-backend' not found.{RESET}")
        return 0, sum(len(m) for m in backend_models.values()) + len(backend_apps)
    
    total_checks = 0
    passed_checks = 0

    print(f"\n{BOLD}1. Apps Structure:{RESET}")
    for app in backend_apps:
        app_path = os.path.join(BACKEND_DIR, "apps", app)
        found = check_file_exists(app_path)
        total_checks += 1
        passed_checks += 1 if found else 0
        report_item(f"App: {app}", found)

    print(f"\n{BOLD}2. Database Models:{RESET}")
    for app, models in backend_models.items():
        models_file = os.path.join(BACKEND_DIR, "apps", app, "models.py")
        file_exists = check_file_exists(models_file)
        if not file_exists:
            for model in models:
                total_checks += 1
                report_item(f"Model: {model} (in {app})", False, " - models.py missing")
        else:
            for model in models:
                found = check_model_in_file(models_file, model)
                total_checks += 1
                passed_checks += 1 if found else 0
                report_item(f"Model: {model} (in {app})", found)
                
    # Also check endpoints (heuristics based on api.py)
    print(f"\n{BOLD}3. API Scaffolding (api.py):{RESET}")
    for app in backend_apps:
        api_file = os.path.join(BACKEND_DIR, "apps", app, "api.py")
        if check_file_exists(api_file):
            print(f" {GREEN}[OK]{RESET} {app}/api.py exists")
            # We don't add to strict total_checks for this simple heuristic, just reporting
            
    return passed_checks, total_checks

def check_frontend_progress():
    print_header("FRONTEND PROGRESS (Next.js 14 App Router)")
    if not check_file_exists(FRONTEND_DIR):
        print(f"{RED}Frontend directory 'naaz-frontend' not found.{RESET}")
        return 0, len(frontend_pages) + len(frontend_components)

    total_checks = 0
    passed_checks = 0

    print(f"\n{BOLD}1. Next.js Routes & Pages:{RESET}")
    for page in frontend_pages:
        page_path = os.path.join(FRONTEND_DIR, *page.split('/'))  # Cross-platform safe
        found = check_file_exists(page_path)
        total_checks += 1
        passed_checks += 1 if found else 0
        report_item(page, found)

    print(f"\n{BOLD}2. Core React Components:{RESET}")
    for comp in frontend_components:
        comp_path = os.path.join(FRONTEND_DIR, *comp.split('/'))
        found = check_file_exists(comp_path)
        total_checks += 1
        passed_checks += 1 if found else 0
        report_item(comp, found)

    return passed_checks, total_checks

def main():
    print(f"\n{BOLD}{YELLOW}NAAZ BOOK DEPOT - PROGRESS TRACKER{RESET}")
    print(f"Targeting root: {PROJECT_ROOT}\n")

    b_passed, b_total = check_backend_progress()
    f_passed, f_total = check_frontend_progress()

    total_passed = b_passed + f_passed
    total_checks = b_total + f_total

    print_header("OVERALL COMPLETION SUMMARY")
    print(f"Backend Completion:  {calculate_progress(b_passed, b_total):.1f}% ({b_passed}/{b_total} critical requirements met)")
    print(f"Frontend Completion: {calculate_progress(f_passed, f_total):.1f}% ({f_passed}/{f_total} critical requirements met)")
    
    overall_progress = calculate_progress(total_passed, total_checks)
    print(f"\n{BOLD}Total Project Progress: {overall_progress:.1f}%{RESET}")
    
    if overall_progress == 100:
        print(f"\n{GREEN}[SUCCESS] All blueprint checks passed! The structural skeleton is complete.{RESET}")
    else:
        print(f"\n{YELLOW}[WARNING] Keep working! Check the items marked with [FAIL] above.{RESET}")
    print()

if __name__ == "__main__":
    main()
