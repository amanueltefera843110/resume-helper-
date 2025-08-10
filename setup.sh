#!/bin/bash

echo "🚀 ResumeHub Setup Script"
echo "=========================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7+ first."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

echo "✅ pip3 found: $(pip3 --version)"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt

# Check if API key is set
if [ -z "$GOOGLE_API_KEY" ]; then
    echo ""
    echo "⚠️  GOOGLE_API_KEY environment variable is not set!"
    echo ""
    echo "To get your API key:"
    echo "1. Go to https://makersuite.google.com/app/apikey"
    echo "2. Create a new API key"
    echo "3. Set it as an environment variable:"
    echo "   export GOOGLE_API_KEY='your_api_key_here'"
    echo ""
    echo "Or add it to your ~/.bashrc or ~/.zshrc file for persistence."
    echo ""
    echo "You can still run the frontend without the backend, but AI features won't work."
    echo ""
else
    echo "✅ GOOGLE_API_KEY is set"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Activate the virtual environment: source venv/bin/activate"
echo "2. Set your API key: export GOOGLE_API_KEY='your_api_key_here'"
echo "3. Start the backend: python backend.py"
echo "4. Open index.html in your browser"
echo ""
echo "Or run: ./start.sh (if you have the start script)"
