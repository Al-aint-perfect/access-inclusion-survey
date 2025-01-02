// script.js

// Global variables
let currentSection = 'intro';
const sections = ['intro', 'section1', 'section2A', 'section2B', 'section2C', 'section2D', 'section3', 'section4', 'section5'];
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyDB7Zx-hYjn-GiGveXjuQ8jD5OH82n7lDyCpjszo9y1Q7nrWwb-Mh7tzNB5svJMV8ggQ/exec';

// Initialize the survey
document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
    document.getElementById('surveyForm').addEventListener('submit', handleSubmit);
});

// Handle section 1 branching logic
function handleSection1() {
    const selected = document.querySelector('input[name="section1_q1"]:checked');
    if (!selected) {
        alert('Please select an option to continue.');
        return;
    }

    let nextSection;
    switch (selected.value) {
        case 'personal':
            nextSection = 'section2A';
            break;
        case 'supporter':
            nextSection = 'section2B';
            break;
        case 'professional':
            nextSection = 'section2C';
            break;
        case 'organization':
            nextSection = 'section2D';
            break;
    }
    nextSection(nextSection);
}

// Navigation functions
function nextSection(sectionId) {
    if (!validateCurrentSection()) {
        return;
    }

    document.querySelector(`#${currentSection}`).classList.remove('active');
    document.querySelector(`#${sectionId}`).classList.add('active');
    currentSection = sectionId;
    updateProgress();
}

function previousSection() {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex > 0) {
        const previousSectionId = sections[currentIndex - 1];
        document.querySelector(`#${currentSection}`).classList.remove('active');
        document.querySelector(`#${previousSectionId}`).classList.add('active');
        currentSection = previousSectionId;
        updateProgress();
    }
}

// Progress bar update
function updateProgress() {
    const currentIndex = sections.indexOf(currentSection);
    const progress = (currentIndex / (sections.length - 1)) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

// Form validation
function validateCurrentSection() {
    const currentSectionElement = document.querySelector(`#${currentSection}`);
    const requiredInputs = currentSectionElement.querySelectorAll('[required]');
    
    for (const input of requiredInputs) {
        if (!input.value.trim()) {
            alert('Please fill in all required fields.');
            input.focus();
            return false;
        }
    }
    return true;
}

// Handle checkbox groups
function getCheckboxValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value).join(', ');
}

// Form submission
async function handleSubmit(event) {
    event.preventDefault();

    if (!validateCurrentSection()) {
        return;
    }

    const formData = new FormData(event.target);
    const data = {};

    // Convert FormData to JSON object
    for (const [key, value] of formData.entries()) {
        if (key.includes('q4') && document.querySelectorAll(`input[name="${key}"]`)[0]?.type === 'checkbox') {
            data[key] = getCheckboxValues(key);
        } else {
            data[key] = value;
        }
    }

    try {
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert('Thank you for completing the survey!');
            window.location.reload();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        alert('There was an error submitting your response. Please try again.');
        console.error('Submission error:', error);
    }
}

// Accessibility enhancements
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.tagName === 'BUTTON') {
        event.target.click();
    }
});

// Add hover effects for buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mouseover', () => {
        button.style.transform = 'scale(1.05)';
    });
    button.addEventListener('mouseout', () => {
        button.style.transform = 'scale(1)';
    });
});

// Handle radio button groups
document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const group = radio.getAttribute('name');
        document.querySelectorAll(`input[name="${group}"]`).forEach(r => {
            r.parentElement.classList.remove('selected');
        });
        radio.parentElement.classList.add('selected');
    });
});
