# ResumeHub - Professional Resume Upload Website

A beautiful, modern, and responsive website where users can upload and manage their resumes with an elegant user interface.

## ✨ Features

### 🎨 **Modern Design**
- Beautiful gradient background with glassmorphism effects
- Responsive design that works on all devices
- Smooth animations and transitions
- Professional color scheme and typography

### 📁 **File Upload Functionality**
- **Drag & Drop**: Simply drag your resume files onto the upload area
- **Click to Upload**: Click the upload area to select files from your computer
- **Multiple File Support**: Upload multiple resumes at once
- **File Validation**: Supports PDF, DOC, DOCX, and TXT files
- **Size Limit**: Maximum file size of 10MB per file
- **AI Analysis**: Google Gemini AI analyzes your resume and provides detailed feedback

### 🚀 **AI-Powered Resume Improvement**
- **Smart Feedback**: Get comprehensive analysis and actionable suggestions
- **Auto-Generation**: Generate improved resume versions based on AI feedback
- **Professional Enhancement**: AI rewrites your resume with better wording and structure
- **ATS Optimization**: Improved formatting and keywords for Applicant Tracking Systems

### 🔒 **File Management**
- **Upload Progress**: Real-time progress bar during uploads
- **File List**: View all uploaded resumes with file details
- **File Actions**: Download or delete uploaded files
- **File Information**: Display file name, size, and upload date
- **AI Feedback**: View comprehensive AI analysis with actionable insights

### 📱 **Responsive Design**
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface
- Smooth scrolling navigation

### 🎯 **User Experience**
- **Smooth Navigation**: Sticky header with smooth scrolling
- **Interactive Elements**: Hover effects and animations
- **Notifications**: Success, error, and info notifications
- **Contact Form**: Built-in contact form for user inquiries

## 🚀 **Getting Started**

### **Prerequisites**
1. **Python 3.7+** installed on your system
2. **Google Gemini API Key** - Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)

### **Option 1: Full Setup with AI Backend (Recommended)**
1. Install Python dependencies: `pip install -r requirements.txt`
2. Set your Google API key: `export GOOGLE_API_KEY="your_api_key_here"`
3. Start the backend: `python backend.py`
4. Open `index.html` in your browser
5. Upload resumes to get AI-powered feedback!
6. Use the feedback to generate improved resume versions!

### **Workflow**
1. **Upload Resume**: Upload your resume file (PDF, DOC, DOCX, or TXT)
2. **Get AI Analysis**: Receive comprehensive feedback and suggestions
3. **Generate Improved Version**: Use the feedback to create an enhanced resume
4. **Download & Use**: Copy or download your improved resume

### **Option 2: Frontend Only**
1. Download all files to a folder
2. Double-click `index.html` to open in your web browser
3. Basic upload functionality will work (without AI analysis)

### **Option 2: Local Server (Recommended)**
1. Install a local server (like Live Server in VS Code)
2. Open the project folder in your code editor
3. Start the local server
4. Navigate to the local URL in your browser

### **Option 3: Deploy to Web Server**
1. Upload all files to your web hosting service
2. Ensure the server supports static files
3. Access your website through the domain

## 📁 **File Structure**

```
ResumeHub/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
├── backend.py          # Flask backend with Gemini AI integration
├── requirements.txt    # Python dependencies
└── README.md           # This documentation
```

## 🎨 **Customization**

### **Colors**
The website uses a beautiful gradient background. You can customize the colors in `styles.css`:

```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### **Fonts**
The website uses Inter font from Google Fonts. You can change this in `styles.css`:

```css
body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

### **File Types**
To add support for more file types, modify the `validateFile` function in `script.js`:

```javascript
const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    // Add your file types here
];
```

## 🔧 **Technical Details**

### **Technologies Used**
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python Flask with Google Gemini AI integration
- **AI**: Google Gemini 2.5 Flash model for resume analysis
- **Styling**: Modern CSS with Flexbox, Grid, and animations
- **Icons**: Font Awesome for better visual appeal
- **Typography**: Inter font family from Google Fonts

### **API Endpoints**
- **POST /upload-resume**: Upload and analyze a resume with AI feedback
- **POST /generate-improved-resume**: Generate improved resume based on feedback
- **GET /health**: Check server health status
- **GET /supported-formats**: Get supported file formats and size limits

### **Browser Support**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### **Performance Features**
- Optimized CSS animations
- Efficient file handling
- Responsive images and layouts
- Minimal JavaScript bundle

## 📱 **Mobile Experience**

The website is fully optimized for mobile devices:
- Touch-friendly upload area
- Responsive navigation
- Optimized layouts for small screens
- Fast loading on mobile networks

## 🎯 **Use Cases**

### **Job Seekers**
- Upload multiple resume versions
- Organize resumes by job type
- Quick access to all career documents

### **Recruiters**
- Professional interface for client presentations
- Easy file management
- Modern design for brand credibility

### **HR Professionals**
- Streamlined resume collection
- Professional appearance
- Easy integration with existing systems

## 🔮 **Future Enhancements**

Potential features for future versions:
- User authentication and accounts
- Cloud storage integration
- Advanced resume parsing and analysis
- Template customization
- API integration
- Advanced search and filtering
- Multiple AI model support
- Resume comparison tools
- Industry-specific feedback
- **Resume versioning and history** ✅ (Implemented)
- **AI-powered resume rewriting** ✅ (Implemented)
- **Multiple improvement iterations**
- **Industry-specific templates**
- **Resume scoring and ranking**

## 📞 **Support**

For questions or support:
- Email: support@resumehub.com
- Phone: +1 (555) 123-4567
- Address: 123 Business St, Tech City, TC 12345

## 📄 **License**

This project is open source and available under the MIT License.

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

**Built with ❤️ for modern web development**
# resume-helper-
