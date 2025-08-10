from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import pathlib
import os
import tempfile
import base64
import json
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Google Gemini API
# Get API key from environment variable for security
api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    print("Warning: GOOGLE_API_KEY environment variable not set!")
    print("Please set your Google Gemini API key:")
    print("export GOOGLE_API_KEY='your_api_key_here'")
    print("Or create a .env file with: GOOGLE_API_KEY=your_api_key_here")
    exit(1)

client = genai.Client(api_key=api_key)

# Initialize Gemini client
# client = genai.GenerativeModel('gemini-2.0-flash-exp') # This line is no longer needed

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload-resume', methods=['POST'])
def upload_resume():
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Secure filename and save file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            # Analyze resume with Gemini AI
            feedback = analyze_resume_with_gemini(file_path)
            
            # Clean up uploaded file
            os.remove(file_path)
            
            return jsonify({
                'success': True,
                'filename': filename,
                'feedback': feedback
            })
            
        except Exception as e:
            # Clean up file on error
            if os.path.exists(file_path):
                os.remove(file_path)
            raise e
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def analyze_resume_with_gemini(file_path):
    """Analyze resume using Google Gemini AI"""
    try:
        # Convert file path to pathlib.Path
        file_path_obj = pathlib.Path(file_path)
        
        # Upload file to Gemini
        sample_file = client.files.upload(file=file_path_obj)
        
        # Create comprehensive prompt for resume analysis
        prompt = """
        Please analyze this resume and provide comprehensive feedback. Include:

        1. **Overall Assessment**: Rate the resume from 1-10 and provide a brief summary
        2. **Strengths**: Identify 3-5 key strengths
        3. **Areas for Improvement**: Suggest 3-5 specific improvements
        4. **Content Analysis**: 
           - Contact information completeness
           - Professional summary quality
           - Work experience descriptions
           - Education and certifications
           - Skills presentation
        5. **Formatting Feedback**: Comment on layout, readability, and professional appearance
        6. **Action Items**: Provide 3 specific, actionable steps to improve the resume
        7. **ATS Optimization**: Suggest keywords and formatting for Applicant Tracking Systems

        Please be constructive and specific in your feedback. Format the response in a clear, structured manner.
        """
        
        # Generate content with Gemini
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[sample_file, prompt]
        )
        
        return response.text
        
    except Exception as e:
        return f"Error analyzing resume with Gemini AI: {str(e)}"

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'ResumeHub backend is running'})

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': 'Welcome to ResumeHub API',
        'description': 'AI-powered resume analysis using Google Gemini',
        'endpoints': {
            'POST /upload-resume': 'Upload and analyze a resume',
            'GET /health': 'Check server health',
            'GET /supported-formats': 'Get supported file formats'
        },
        'supported_formats': list(ALLOWED_EXTENSIONS),
        'max_file_size_mb': MAX_FILE_SIZE // (1024 * 1024)
    })

@app.route('/supported-formats', methods=['GET'])
def get_supported_formats():
    return jsonify({
        'formats': list(ALLOWED_EXTENSIONS),
        'max_size_mb': MAX_FILE_SIZE // (1024 * 1024)
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
