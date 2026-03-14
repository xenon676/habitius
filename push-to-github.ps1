# Run this script from the habitius folder (e.g. in Git Bash or PowerShell with Git in PATH)
# Replace YOUR_USERNAME and YOUR_REPO with your GitHub username and repo name.

Set-Location $PSScriptRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git not found. Install Git from https://git-scm.com/ and run this script again."
    exit 1
}

if (-not (Test-Path .git)) {
    git init
    git add .
    git commit -m "Initial commit: Habitius"
    git branch -M main
    Write-Host "Repo initialized. Add your GitHub remote and push:"
    Write-Host '  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git'
    Write-Host "  git push -u origin main"
} else {
    git add .
    git status
    Write-Host "Repo already initialized. Commit if needed, then add remote and push:"
    Write-Host '  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git'
    Write-Host "  git push -u origin main"
}
