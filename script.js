const jobRoles = {
    "frontend": {
        keywords: [
            "html", "css", "javascript", "react", "typescript", "git", "redux", "webpack", "responsive design", "sass", "accessibility", "api", "json", "debugging", "dom manipulation", "bootstrap", "tailwind"
        ]
    },
    "backend": {
        keywords: [
            "python", "java", "nodejs", "sql", "postgresql", "mongodb", "docker", "aws", "api", "rest", "graphql", "authentication", "redis", "linux", "git", "ci/cd", "microservices", "testing"
        ]
    },
    "fullstack": {
        keywords: [
            "javascript", "react", "nodejs", "html", "css", "sql", "database", "api", "git", "deployment", "aws", "docker", "frontend", "backend", "typescript", "orm", "mvc"
        ]
    },
    "data-scientist": {
        keywords: [
            "python", "sql", "machine learning", "pandas", "numpy", "statistics", "data visualization", "scikit-learn", "tensorflow", "pytorch", "jupyter", "tableau", "aws", "etl", "big data"
        ]
    },
    "product-manager": {
        keywords: [
            "roadmap", "agile", "scrum", "user stories", "stakeholder management", "analytics", "jira", "product lifecycle", "strategy", "market research", "requirements", "collaboration", "prioritization", "ux"
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    const jobRoleSelect = document.getElementById('job-role');
    const resumeTextarea = document.getElementById('resume-text');
    const resultsSection = document.getElementById('results-section');
    const scoreText = document.getElementById('score-text');
    const scoreCircle = document.getElementById('score-circle-path');
    const missingKeywordsContainer = document.getElementById('missing-keywords');

    // PDF Handling elements
    const pdfUpload = document.getElementById('pdf-upload');
    const fileNameDisplay = document.getElementById('file-name');

    // Initialize PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    pdfUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }

        fileNameDisplay.textContent = file.name;
        resumeTextarea.placeholder = "Extracting text from PDF...";
        resumeTextarea.disabled = true;

        try {
            const text = await extractTextFromPDF(file);
            resumeTextarea.value = text;
            resumeTextarea.placeholder = "PDF content extracted.";
            resumeTextarea.disabled = false;
        } catch (error) {
            console.error('Error parsing PDF:', error);
            alert('Failed to extract text from PDF. Please check if the file is valid.');
            resumeTextarea.placeholder = "Paste your resume content here...";
            resumeTextarea.disabled = false;
            fileNameDisplay.textContent = "Error loading file";
        }
    });

    async function extractTextFromPDF(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    }

    analyzeBtn.addEventListener('click', () => {
        const roleKey = jobRoleSelect.value;
        const text = resumeTextarea.value.trim();

        if (!roleKey) {
            alert("Please select a job role.");
            return;
        }

        if (!text) {
            alert("Please paste your resume text.");
            return;
        }

        analyzeResume(roleKey, text);
    });

    function analyzeResume(roleKey, text) {
        const roleData = jobRoles[roleKey];
        if (!roleData) return;

        const keywords = roleData.keywords;
        const normalizedText = text.toLowerCase();

        let matchCount = 0;
        const missingKeywords = [];

        // Simple tokenization: remove punctuation and split by whitespace
        // For better matching, we just check if the keyword string exists in the text
        // This handles multi-word keywords like "machine learning"

        keywords.forEach(keyword => {
            if (normalizedText.includes(keyword.toLowerCase())) {
                matchCount++;
            } else {
                missingKeywords.push(keyword);
            }
        });

        const score = Math.round((matchCount / keywords.length) * 100);
        displayResults(score, missingKeywords);
    }

    function displayResults(score, missing) {
        // Show results section
        resultsSection.classList.remove('hidden');

        // Animate Score
        animateScore(score);

        // Update color based on score
        let color = '#ef4444'; // red
        let ratingLabel = "Weak Match 😟";

        if (score >= 80) {
            color = '#10b981'; // green
            ratingLabel = "Excellent Match 🚀";
        } else if (score >= 60) {
            color = '#10b981'; // green (using same green for good, or could be distinct)
            ratingLabel = "Good Match 👍";
        } else if (score >= 40) {
            color = '#f59e0b'; // orange
            ratingLabel = "Average Match 🤔";
        }

        scoreCircle.style.stroke = color;
        scoreText.style.fill = color;

        // Update Rating Text
        const ratingTextElement = document.getElementById('rating-text');
        ratingTextElement.textContent = ratingLabel;
        ratingTextElement.style.color = color;

        // Render Missing Keywords
        renderMissingKeywords(missing);

        // scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function animateScore(finalScore) {
        let currentScore = 0;
        const duration = 1000;
        const stepTime = Math.abs(Math.floor(duration / finalScore));

        const pathLength = 100; // Since dasharray is 100 in SVG

        // CSS transition handles the circle animation via stroke-dasharray
        // We calculate the dasharray value: (score, 100)
        setTimeout(() => {
            scoreCircle.setAttribute('stroke-dasharray', `${finalScore}, 100`);
        }, 100);

        // Counter animation
        const timer = setInterval(() => {
            currentScore += 1;
            scoreText.textContent = `${currentScore}%`;
            if (currentScore >= finalScore) {
                clearInterval(timer);
                if (finalScore === 0) scoreText.textContent = "0%";
            }
        }, stepTime < 10 ? 10 : stepTime);

        if (finalScore === 0) {
            scoreCircle.setAttribute('stroke-dasharray', `0, 100`);
            scoreText.textContent = "0%";
        }
    }

    function renderMissingKeywords(keywords) {
        missingKeywordsContainer.innerHTML = '';

        if (keywords.length === 0) {
            missingKeywordsContainer.innerHTML = '<p style="color: var(--success-color)">Great job! You hit multiple key terms.</p>';
            return;
        }

        keywords.forEach(kw => {
            const span = document.createElement('span');
            span.className = 'tag';
            // Capitalize first letter of each word for display
            span.textContent = kw.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            missingKeywordsContainer.appendChild(span);
        });
    }
});
