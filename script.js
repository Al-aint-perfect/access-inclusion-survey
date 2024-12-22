let currentSection = 0;
const sections = document.querySelectorAll('.survey-section');
let userPath = '';

function updateProgress() {
    const progress = document.getElementById('progress');
    const percentage = (currentSection / (sections.length - 1)) * 100;
    progress.style.width = `${percentage}%`;
}

function showSection(index) {
    sections.forEach(section => section.classList.remove('active'));
    sections[index].classList.add('active');
    updateProgress();
}

function startSurvey() {
    currentSection = 1;
    showSection(currentSection);
}

function previousSection() {
    if (currentSection > 0) {
        currentSection--;
        showSection(currentSection);
    }
}

function nextSection() {
    const currentSectionElement = sections[currentSection];
    
    // Validate required fields
    const requiredFields = currentSectionElement.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (field.type === 'radio') {
            const name = field.name;
            const checked = currentSectionElement.querySelector(`input[name="${name}"]:checked`);
            if (!checked) {
                isValid = false;
                showError(field, 'Please select an option');
            }
        } else if (!field.value.trim()) {
            isValid = false;
            showError(field, 'This field is required');
        }
    });

    if (!isValid) return;

    // Handle branching logic based on Q1 response
    if (currentSection === 1) {
        const selectedOption = document.querySelector('input[name="primary_reason"]:checked').value;
        switch(selectedOption) {
            case 'personal':
                userPath = '2a';
                currentSection = 2;
                break;
            case 'supporter':
                userPath = '2b';
                currentSection = 3;
                break;
            case 'professional':
                userPath = '2c';
                currentSection = 4;
                break;
            case 'organization':
                userPath = '2d';
                currentSection = 5;
                break;
            case 'collaborative':
                userPath = '2e';
                currentSection = 6;
                break;
        }
    } else {
        currentSection++;
    }

    if (currentSection < sections.length) {
        showSection(currentSection);
    }
}

function showError(element, message) {
    // Remove any existing error messages
    const existingError = element.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create and add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    element.parentElement.appendChild(errorDiv);

    // Remove error message when user interacts with the field
    element.addEventListener('input', function() {
        errorDiv.remove();
    });
}

function submitSurvey() {
    // Validate final section
    const finalSection = sections[sections.length - 1];
    const requiredFields = finalSection.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            showError(field, 'This field is required');
        }
    });

    if (!isValid) return;

    // Collect all form data
    const formData = new FormData();
    document.querySelectorAll('input, textarea').forEach(element => {
        if (element.type === 'radio' && element.checked) {
            formData.append(element.name, element.value);
        } else if (element.type === 'checkbox' && element.checked) {
            formData.append(element.name, element.value);
        } else if (element.type !== 'radio' && element.type !== 'checkbox') {
            formData.append(element.name, element.value);
        }
    });

    // Convert form data to JSON
    const jsonData = {};
    formData.forEach((value, key) => {
        if (jsonData[key]) {
            if (!Array.isArray(jsonData[key])) {
                jsonData[key] = [jsonData[key]];
            }
            jsonData[key].push(value);
        } else {
            jsonData[key] = value;
        }
    });

    // Save to localStorage (temporary storage)
    const responses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    responses.push(jsonData);
    localStorage.setItem('surveyResponses', JSON.stringify(responses));

    // Show success message
    alert('Thank you for completing the survey!');
    
    // Reset to beginning
    currentSection = 0;
    showSection(currentSection);
}

// Initialize progress bar
updateProgress();

// Handle email field visibility
document.querySelectorAll('input[name="contact_usage"], input[name="contact_training"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const emailSection = document.getElementById('email-section');
        const showEmail = document.querySelector('input[name="contact_usage"][value="yes"]:checked') ||
                         document.querySelector('input[name="contact_training"][value="yes"]:checked');
        emailSection.style.display = showEmail ? 'block' : 'none';
    });
});
