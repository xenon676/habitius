import subprocess
import os
import sys
from pathlib import Path

def start_backend():
    backend_dir = Path(__file__).parent / 'backend'
    os.chdir(backend_dir)
    
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "localhost", "--port", "8000", "--reload"],
        cwd=backend_dir
    )

def start_frontend():
    frontend_dir = Path(__file__).parent / 'frontend'
    os.chdir(frontend_dir)
    
    return subprocess.Popen('npm run dev', shell=True, cwd=frontend_dir)

if __name__ == "__main__":
    backend_process = start_backend()
    frontend_process = start_frontend()
    
    try:
        backend_process.wait()
    except KeyboardInterrupt:
        # Ctrl+C
        backend_process.terminate()
        frontend_process.terminate()
        backend_process.wait()
        frontend_process.wait()