// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const uploadedFiles = document.getElementById('uploadedFiles');

// File storage
let uploadedFilesList = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateActiveNavLink();
});

// Initialize all event listeners
function initializeEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Contact form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Scroll event for header
    window.addEventListener('scroll', handleScroll);
}

// Handle file selection from input
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    processFiles(files);
}

// Handle drag over
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Handle file drop
function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
}

// Process uploaded files
function processFiles(files) {
    files.forEach(file => {
        if (validateFile(file)) {
            uploadFile(file);
        }
    });
}

// Validate file
function validateFile(file) {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
        showNotification(`File type not supported: ${file.name}`, 'error');
        return false;
    }
    
    if (file.size > maxSize) {
        showNotification(`File too large: ${file.name}`, 'error');
        return false;
    }
    
    return true;
}

// Upload file to backend with Gemini AI analysis
function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Show progress
    uploadProgress.style.display = 'block';
    progressText.textContent = 'Uploading file...';
    
    // Upload file to backend
    fetch('http://localhost:5001/upload-resume', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            progressText.textContent = 'Analyzing with AI...';
            updateProgress(50);
            
            // Simulate AI processing time for better UX
            setTimeout(() => {
                updateProgress(100);
                progressText.textContent = 'Analysis complete!';
                
                setTimeout(() => {
                    completeUploadWithFeedback(file, data.feedback);
                    resetProgress();
                }, 500);
            }, 1500);
        } else {
            throw new Error(data.error || 'Upload failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        progressText.textContent = 'Upload failed';
        showNotification(`Upload failed: ${error.message}`, 'error');
        resetProgress();
    });
}

// Update progress bar
function updateProgress(progress) {
    progressFill.style.width = `${progress}%`;
    progressPercent.textContent = `${Math.round(progress)}%`;
}

// Complete upload with AI feedback
function completeUploadWithFeedback(file, aiFeedback) {
    // Complete progress
    progressFill.style.width = '100%';
    progressPercent.textContent = '100%';
    progressText.textContent = 'Analysis complete!';
    
    // Hide progress after a moment
    setTimeout(() => {
        uploadProgress.style.display = 'none';
        resetProgress();
        
        // Add file to list with AI feedback
        addFileToListWithFeedback(file, aiFeedback);
        
        // Show success notification
        showNotification(`Successfully analyzed: ${file.name}`, 'success');
        
        // Clear file input
        fileInput.value = '';
    }, 1000);
}

// Complete upload (fallback)
function completeUpload(file) {
    // Hide progress
    uploadProgress.style.display = 'none';
    resetProgress();
    
    // Add file to list
    addFileToList(file);
    
    // Show success notification
    showNotification(`Successfully uploaded: ${file.name}`, 'success');
    
    // Clear file input
    fileInput.value = '';
}

// Reset progress
function resetProgress() {
    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';
}

// Add file to the uploaded files list with AI feedback
function addFileToListWithFeedback(file, aiFeedback) {
    const fileItem = createFileItemWithFeedback(file, aiFeedback);
    uploadedFiles.appendChild(fileItem);
    uploadedFilesList.push(file);
}

// Add file to the uploaded files list
function addFileToList(file) {
    const fileItem = createFileItem(file);
    uploadedFiles.appendChild(fileItem);
    uploadedFilesList.push(file);
}

// Create file item element with AI feedback
function createFileItemWithFeedback(file, aiFeedback) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item with-feedback';
    
    const fileIcon = getFileIcon(file.type);
    const fileSize = formatFileSize(file.size);
    
    fileItem.innerHTML = `
        <div class="file-info">
            <i class="file-icon ${fileIcon}"></i>
            <div class="file-details">
                <h4>${file.name}</h4>
                <p>${fileSize} • ${new Date().toLocaleDateString()}</p>
                <div class="ai-status">
                    <i class="fas fa-robot"></i>
                    <span>AI Analyzed</span>
                </div>
            </div>
        </div>
        <div class="file-actions">
            <button class="file-action-btn feedback-btn" onclick="toggleFeedback(this)" title="View AI Feedback">
                <i class="fas fa-robot"></i>
                <span>View AI Analysis</span>
            </button>
            <button class="file-action-btn" onclick="downloadFile('${file.name}')" title="Download">
                <i class="fas fa-download"></i>
            </button>
            <button class="file-action-btn" onclick="deleteFile(this)" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="ai-feedback" style="display: none;">
            <div class="feedback-header">
                <div class="feedback-title">
                    <h5><i class="fas fa-robot"></i> AI Resume Analysis</h5>
                    <p class="feedback-subtitle">Powered by Google Gemini AI</p>
                </div>
                <button class="close-feedback" onclick="toggleFeedback(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="feedback-content">
                ${formatFeedback(aiFeedback)}
            </div>
        </div>
    `;
    
    return fileItem;
}

// Create file item element
function createFileItem(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const fileIcon = getFileIcon(file.type);
    const fileSize = formatFileSize(file.size);
    
    fileItem.innerHTML = `
        <div class="file-info">
            <i class="file-icon ${fileIcon}"></i>
            <div class="file-details">
                <h4>${file.name}</h4>
                <p>${fileSize} • ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
        <div class="file-actions">
            <button class="file-action-btn" onclick="downloadFile('${file.name}')" title="Download">
                <i class="fas fa-download"></i>
            </button>
            <button class="file-action-btn" onclick="deleteFile(this)" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return fileItem;
}

// Get file icon based on type
function getFileIcon(type) {
    switch (type) {
        case 'application/pdf':
            return 'fas fa-file-pdf';
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return 'fas fa-file-word';
        case 'text/plain':
            return 'fas fa-file-alt';
        default:
            return 'fas fa-file';
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Download file (simulated)
function downloadFile(fileName) {
    showNotification(`Downloading: ${fileName}`, 'info');
    // In a real application, this would trigger an actual download
}

// Toggle AI feedback visibility
function toggleFeedback(button) {
    const fileItem = button.closest('.file-item');
    const feedbackSection = fileItem.querySelector('.ai-feedback');
    const isVisible = feedbackSection.style.display !== 'none';
    
    if (isVisible) {
        feedbackSection.style.display = 'none';
        button.innerHTML = '<i class="fas fa-robot"></i> <span>View AI Analysis</span>';
        button.title = 'View AI Feedback';
    } else {
        feedbackSection.style.display = 'block';
        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
        button.title = 'Hide AI Feedback';
    }
}

// Format AI feedback for display
function formatFeedback(feedback) {
    // Parse the feedback and create a structured display
    const sections = parseFeedbackSections(feedback);
    
    let html = '<div class="feedback-container">';
    
    // Overall Assessment Section
    if (sections.overall) {
        html += `
            <div class="feedback-section overall-section">
                <div class="section-header">
                    <i class="fas fa-star"></i>
                    <h4>Overall Assessment</h4>
                    ${sections.rating ? `<div class="rating">${sections.rating}/10</div>` : ''}
                </div>
                <div class="section-content">
                    <p>${sections.overall}</p>
                </div>
            </div>
        `;
    }
    
    // Strengths Section
    if (sections.strengths) {
        html += `
            <div class="feedback-section strengths-section">
                <div class="section-header">
                    <i class="fas fa-thumbs-up"></i>
                    <h4>Key Strengths</h4>
                </div>
                <div class="section-content">
                    ${formatList(sections.strengths)}
                </div>
            </div>
        `;
    }
    
    // Areas for Improvement Section
    if (sections.improvements) {
        html += `
            <div class="feedback-section improvements-section">
                <div class="section-header">
                    <i class="fas fa-lightbulb"></i>
                    <h4>Areas for Improvement</h4>
                </div>
                <div class="section-content">
                    ${formatList(sections.improvements)}
                </div>
            </div>
        `;
    }
    
    // Content Analysis Section
    if (sections.content) {
        html += `
            <div class="feedback-section content-section">
                <div class="section-header">
                    <i class="fas fa-search"></i>
                    <h4>Content Analysis</h4>
                </div>
                <div class="section-content">
                    ${sections.content}
                </div>
            </div>
        `;
    }
    
    // Formatting Feedback Section
    if (sections.formatting) {
        html += `
            <div class="feedback-section formatting-section">
                <div class="section-header">
                    <i class="fas fa-paint-brush"></i>
                    <h4>Formatting & Design</h4>
                </div>
                <div class="section-content">
                    <p>${sections.formatting}</p>
                </div>
            </div>
        `;
    }
    
    // Action Items Section
    if (sections.actions) {
        html += `
            <div class="feedback-section actions-section">
                <div class="section-header">
                    <i class="fas fa-tasks"></i>
                    <h4>Action Items</h4>
                </div>
                <div class="section-content">
                    ${formatList(sections.actions)}
                </div>
            </div>
        `;
    }
    
    // ATS Optimization Section
    if (sections.ats) {
        html += `
            <div class="feedback-section ats-section">
                <div class="section-header">
                    <i class="fas fa-robot"></i>
                    <h4>ATS Optimization</h4>
                </div>
                <div class="section-content">
                    <p>${sections.ats}</p>
                </div>
            </div>
        `;
    }
    
    // If no sections were parsed, show the original feedback
    if (Object.keys(sections).length === 0) {
        html += `
            <div class="feedback-section">
                <div class="section-content">
                    ${feedback.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// Parse feedback into structured sections
function parseFeedbackSections(feedback) {
    const sections = {};
    
    // Extract rating if present
    const ratingMatch = feedback.match(/(?:rate|rating|score).*?(\d+)(?:\s*[-/]\s*10)/i);
    if (ratingMatch) {
        sections.rating = ratingMatch[1];
    }
    
    // Extract overall assessment
    const overallMatch = feedback.match(/(?:overall assessment|summary|brief summary)[:.\s]*([^]*?)(?=\d+\.|strengths|areas for improvement|key strengths|improvements|content analysis|formatting|action items|ats optimization)/i);
    if (overallMatch) {
        sections.overall = overallMatch[1].trim();
    }
    
    // Extract strengths
    const strengthsMatch = feedback.match(/(?:strengths|key strengths)[:.\s]*([^]*?)(?=\d+\.|areas for improvement|improvements|content analysis|formatting|action items|ats optimization)/i);
    if (strengthsMatch) {
        sections.strengths = strengthsMatch[1].trim();
    }
    
    // Extract improvements
    const improvementsMatch = feedback.match(/(?:areas for improvement|improvements|suggestions)[:.\s]*([^]*?)(?=\d+\.|content analysis|formatting|action items|ats optimization)/i);
    if (improvementsMatch) {
        sections.improvements = improvementsMatch[1].trim();
    }
    
    // Extract content analysis
    const contentMatch = feedback.match(/(?:content analysis|content review)[:.\s]*([^]*?)(?=\d+\.|formatting|action items|ats optimization)/i);
    if (contentMatch) {
        sections.content = contentMatch[1].trim();
    }
    
    // Extract formatting feedback
    const formattingMatch = feedback.match(/(?:formatting feedback|formatting|design|layout)[:.\s]*([^]*?)(?=\d+\.|action items|ats optimization)/i);
    if (formattingMatch) {
        sections.formatting = formattingMatch[1].trim();
    }
    
    // Extract action items
    const actionsMatch = feedback.match(/(?:action items|actionable steps|specific steps)[:.\s]*([^]*?)(?=\d+\.|ats optimization)/i);
    if (actionsMatch) {
        sections.actions = actionsMatch[1].trim();
    }
    
    // Extract ATS optimization
    const atsMatch = feedback.match(/(?:ats optimization|applicant tracking|keywords)[:.\s]*([^]*?)$/i);
    if (atsMatch) {
        sections.ats = atsMatch[1].trim();
    }
    
    return sections;
}

// Format lists with bullet points
function formatList(text) {
    if (!text) return '';
    
    // Split by common list indicators and format
    const items = text.split(/(?:\n|•|\*|\-)\s*/).filter(item => item.trim().length > 0);
    
    if (items.length > 1) {
        return `<ul>${items.map(item => `<li>${item.trim()}</li>`).join('')}</ul>`;
    } else {
        return `<p>${text}</p>`;
    }
}

// Delete file
function deleteFile(button) {
    const fileItem = button.closest('.file-item');
    const fileName = fileItem.querySelector('h4').textContent;
    
    if (confirm(`Are you sure you want to delete ${fileName}?`)) {
        fileItem.remove();
        uploadedFilesList = uploadedFilesList.filter(file => file.name !== fileName);
        showNotification(`Deleted: ${fileName}`, 'success');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 10000;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease;
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Get notification icon
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'check-circle';
        case 'error':
            return 'exclamation-circle';
        case 'warning':
            return 'exclamation-triangle';
        default:
            return 'info-circle';
    }
}

// Get notification color
function getNotificationColor(type) {
    switch (type) {
        case 'success':
            return '#4CAF50';
        case 'error':
            return '#f44336';
        case 'warning':
            return '#ff9800';
        default:
            return '#2196F3';
    }
}

// Handle contact form submission
function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = formData.get('name') || event.target.querySelector('input[type="text"]').value;
    const email = formData.get('email') || event.target.querySelector('input[type="email"]').value;
    const message = formData.get('message') || event.target.querySelector('textarea').value;
    
    if (name && email && message) {
        // Simulate form submission
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        event.target.reset();
    } else {
        showNotification('Please fill in all fields.', 'error');
    }
}

// Update active navigation link
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Handle scroll for header
function handleScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .file-item {
        animation: fadeInUp 0.5s ease;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .feature-card {
        animation: fadeInUp 0.6s ease;
    }
    
    .feature-card:nth-child(1) { animation-delay: 0.1s; }
    .feature-card:nth-child(2) { animation-delay: 0.2s; }
    .feature-card:nth-child(3) { animation-delay: 0.3s; }
    .feature-card:nth-child(4) { animation-delay: 0.4s; }
`;
document.head.appendChild(style);

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .file-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Initialize improve resume functionality
    initializeImproveResume();
});

// Improve Resume Functionality
function initializeImproveResume() {
    const improveFileInput = document.getElementById('improveFileInput');
    const feedbackInput = document.getElementById('feedbackInput');
    const generateBtn = document.getElementById('generateImprovedBtn');
    const improveProgress = document.getElementById('improveProgress');
    const improveProgressFill = document.getElementById('improveProgressFill');
    const improveProgressPercent = document.getElementById('improveProgressPercent');
    const improvedResumeResult = document.getElementById('improvedResumeResult');
    const resumeContent = document.getElementById('resumeContent');
    const copyResumeBtn = document.getElementById('copyResumeBtn');
    const downloadResumeBtn = document.getElementById('downloadResumeBtn');

    // Enable/disable generate button based on inputs
    function updateGenerateButton() {
        const hasFile = improveFileInput.files.length > 0;
        const hasFeedback = feedbackInput.value.trim().length > 0;
        generateBtn.disabled = !(hasFile && hasFeedback);
    }

    // Event listeners
    improveFileInput.addEventListener('change', updateGenerateButton);
    feedbackInput.addEventListener('input', updateGenerateButton);

    generateBtn.addEventListener('click', handleGenerateImprovedResume);
    copyResumeBtn.addEventListener('click', copyResumeToClipboard);
    downloadResumeBtn.addEventListener('click', downloadResumeAsText);

    function handleGenerateImprovedResume() {
        const file = improveFileInput.files[0];
        const feedback = feedbackInput.value.trim();

        if (!file || !feedback) {
            showNotification('Please select a file and provide feedback', 'error');
            return;
        }

        // Show progress
        improveProgress.style.display = 'block';
        improvedResumeResult.style.display = 'none';
        generateBtn.disabled = true;

        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            updateImproveProgress(progress);
        }, 200);

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('feedback', feedback);

        // Send request to backend
        fetch('/generate-improved-resume', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            clearInterval(progressInterval);
            updateImproveProgress(100);
            
            setTimeout(() => {
                if (data.success) {
                    showImprovedResume(data.improved_resume);
                    showNotification('Improved resume generated successfully!', 'success');
                } else {
                    showNotification(data.error || 'Failed to generate improved resume', 'error');
                }
                hideImproveProgress();
                generateBtn.disabled = false;
            }, 500);
        })
        .catch(error => {
            clearInterval(progressInterval);
            hideImproveProgress();
            generateBtn.disabled = false;
            showNotification('Error generating improved resume: ' + error.message, 'error');
        });
    }

    function updateImproveProgress(percent) {
        improveProgressFill.style.width = percent + '%';
        improveProgressPercent.textContent = Math.round(percent) + '%';
    }

    function hideImproveProgress() {
        improveProgress.style.display = 'none';
    }

    function showImprovedResume(resumeText) {
        resumeContent.textContent = resumeText;
        improvedResumeResult.style.display = 'block';
        
        // Scroll to result
        improvedResumeResult.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }

    function copyResumeToClipboard() {
        const text = resumeContent.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Resume copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy to clipboard', 'error');
        });
    }

    function downloadResumeAsText() {
        const text = resumeContent.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'improved_resume.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('Resume downloaded successfully!', 'success');
    }
}
