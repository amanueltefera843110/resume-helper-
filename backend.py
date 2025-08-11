from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google import genai
import pathlib
import os
import tempfile
import base64
import json
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import stripe

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Google Gemini API
# Get API key from environment variable for security
api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    print("❌ Error: GOOGLE_API_KEY environment variable not set!")
    print("\n🔑 To get your Google Gemini API key:")
    print("1. Go to: https://makersuite.google.com/app/apikey")
    print("2. Sign in with your Google account")
    print("3. Click 'Create API Key'")
    print("4. Copy the generated API key")
    print("\n💡 Then set it in your terminal:")
    print("export GOOGLE_API_KEY='your_actual_api_key_here'")
    print("\n🔄 Or create a .env file in this directory with:")
    print("GOOGLE_API_KEY=your_actual_api_key_here")
    print("\n❌ Cannot start without a valid API key!")
    exit(1)
 
try:
    client = genai.Client(api_key=api_key)
    print(f"✅ Google Gemini API connected successfully!")
except Exception as e:
    print(f"❌ Error connecting to Google Gemini API: {e}")
    print("Please check your API key and try again.")
    exit(1)

# Stripe config
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_PRICE_ONE_TIME = os.getenv('STRIPE_PRICE_ONE_TIME', '')
STRIPE_PRICE_SUBSCRIPTION = os.getenv('STRIPE_PRICE_SUBSCRIPTION', '')

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

# Serve static files (CSS, JS, images) explicitly
@app.route('/styles.css')
def styles():
    return send_from_directory('.', 'styles.css')

@app.route('/script.js')
def script():
    return send_from_directory('.', 'script.js')

@app.route('/favicon.svg')
def favicon_svg():
    return send_from_directory('.', 'favicon.svg')

@app.route('/favicon.ico')
def favicon_ico():
    # If no .ico, serve svg as fallback; browsers that require .ico will still request this path
    # You can replace with a real .ico later if desired
    return send_from_directory('.', 'favicon.svg')

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
        error_msg = str(e)
        if "API key not valid" in error_msg or "INVALID_ARGUMENT" in error_msg:
            return f"❌ API Key Error: Your Google Gemini API key is invalid or expired. Please check your API key and try again."
        elif "quota" in error_msg.lower() or "limit" in error_msg.lower():
            return f"❌ Quota Error: You've reached your API usage limit. Please check your Google Gemini quota."
        elif "file" in error_msg.lower():
            return f"❌ File Error: There was an issue processing your file. Please try a different file format."
        else:
            return f"❌ Error analyzing resume: {error_msg}"

@app.route('/generate-improved-resume', methods=['POST'])
def generate_improved_resume():
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
        
        # Get feedback from request
        feedback = request.form.get('feedback', '')
        if not feedback:
            return jsonify({'error': 'No feedback provided'}), 400
        
        # Secure filename and save file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            # Generate improved resume with Gemini AI
            improved_resume = generate_improved_resume_with_gemini(file_path, feedback)
            
            # Clean up uploaded file
            os.remove(file_path)
            
            return jsonify({
                'success': True,
                'filename': filename,
                'improved_resume': improved_resume
            })
            
        except Exception as e:
            # Clean up file on error
            if os.path.exists(file_path):
                os.remove(file_path)
            raise e
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_improved_resume_with_gemini(file_path, feedback):
    """Generate an improved resume using Google Gemini AI based on feedback"""
    try:
        # Convert file path to pathlib.Path
        file_path_obj = pathlib.Path(file_path)
        
        # Upload file to Gemini
        sample_file = client.files.upload(file=file_path_obj)
        
        # Create comprehensive prompt for resume improvement
        prompt = f"""
        Based on the following feedback, please generate an improved version of this resume:

        FEEDBACK:
        {feedback}

        INSTRUCTIONS:
        Please create a completely rewritten, improved version of this resume that addresses all the feedback points. The new resume should:

        1. **Incorporate all feedback suggestions** from the analysis
        2. **Maintain the same basic structure** but with enhanced content
        3. **Use strong action verbs** and quantifiable achievements
        4. **Optimize for ATS systems** with relevant keywords
        5. **Improve formatting and readability** while maintaining professionalism
        6. **Enhance the professional summary** to be more compelling
        7. **Strengthen work experience descriptions** with specific achievements
        8. **Improve skills presentation** and organization
        9. **Ensure contact information** is complete and professional
        10. **Make the resume more engaging** and impactful

        Please return the complete improved resume in a clean, professional format that's ready to use. Focus on making it significantly better than the original while maintaining the same level of detail and structure.
        """
        
        # Generate content with Gemini
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[sample_file, prompt]
        )
        
        return response.text
        
    except Exception as e:
        error_msg = str(e)
        if "API key not valid" in error_msg or "INVALID_ARGUMENT" in error_msg:
            return f"❌ API Key Error: Your Google Gemini API key is invalid or expired. Please check your API key and try again."
        elif "quota" in error_msg.lower() or "limit" in error_msg.lower():
            return f"❌ Quota Error: You've reached your API usage limit. Please check your Google Gemini quota."
        elif "file" in error_msg.lower():
            return f"❌ File Error: There was an issue processing your file. Please try a different file format."
        else:
            return f"❌ Error generating improved resume: {error_msg}"

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'ResumeHub backend is running'})

@app.route('/', methods=['GET'])
def root():
    return send_from_directory('.', 'index.html')

@app.route('/api', methods=['GET'])
def api_info():
    return jsonify({
        'message': 'Welcome to ResumeHub API',
        'description': 'AI-powered resume analysis using Google Gemini',
        'endpoints': {
            'POST /upload-resume': 'Upload and analyze a resume',
            'POST /generate-improved-resume': 'Generate improved resume based on feedback',
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

# Create a Stripe Checkout Session
@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.get_json(silent=True) or {}
        mode = data.get('mode', 'payment')  # 'payment' or 'subscription'
        price = STRIPE_PRICE_ONE_TIME if mode == 'payment' else STRIPE_PRICE_SUBSCRIPTION
        if not stripe.api_key or not price:
            return jsonify({'error': 'Payment not configured'}), 400

        domain = request.headers.get('Origin') or request.host_url.rstrip('/')
        success_url = f"{domain}/?payment=success"
        cancel_url = f"{domain}/?payment=cancel"

        session = stripe.checkout.Session.create(
            mode=mode,
            line_items=[{'price': price, 'quantity': 1}],
            success_url=success_url,
            cancel_url=cancel_url,
            automatic_tax={'enabled': True}
        )
        return jsonify({'id': session.id, 'url': session.url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Use PORT from environment if provided (Railway/Heroku style), fallback to 5001
    port = int(os.environ.get('PORT', 5001))
    debug_env = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=debug_env, host='0.0.0.0', port=port)
