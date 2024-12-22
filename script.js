let currentSection = 0;
const sections = document.querySelectorAll('.survey-section');
let surveyData = {};

// Initialize the survey
function startSurvey() {
    currentSection = 1;
    updateSection();
}

// Handle navigation between sections
function nextSection() {
    if (validateCurrentSection()) {
        saveCurrentSectionData();
        currentSection++;
        updateSection();
    }
}

function previousSection() {
    currentSection--;
    updateSection();
}

// Update visible section and progress bar
function updateSection() {
    sections.forEach((section, index) => {
        section.classList.remove('active');
        if (index === currentSection) {
            section.classList.add('active');
        }
    });

    // Update progress bar
    const progress = (currentSection / (sections.length - 1)) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;

    // Handle button visibility
    const buttonGroups = document.querySelectorAll('.button-group');
    buttonGroups.forEach(group => {
        const backButton = group.querySelector('button:first-child');
        if (backButton) {
            backButton.style.visibility = currentSection === 0 ? 'hidden' : 'visible';
        }
    });
}

// Validate current section before proceeding
function validateCurrentSection() {
    const currentSectionElement = sections[currentSection];
    const requiredFields = currentSectionElement.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });

    return isValid;
}

// Handle primary reason selection and branching logic
function handlePrimaryReasonChange() {
    const reason = document.getElementById('primaryReason').value;
    surveyData.primaryReason = reason;

    // Set up next section based on selection
    switch(reason) {
        case 'personal':
            surveyData.branchSection = '2A';
            break;
        case 'supporter':
            surveyData.branchSection = '2B';
            break;
        case 'professional':
            surveyData.branchSection = '2C';
            break;
        case 'organization':
            surveyData.branchSection = '2D';
            break;
    }
}

// Handle conditional fields
function handleGenderChange() {
    const genderSelect = document.getElementById('gender');
    const genderDescription = document.getElementById('genderDescription');
    genderDescription.style.display = 
        genderSelect.value === 'self-describe' ? 'block' : 'none';
}

function handleEthnicityChange() {
    const ethnicitySelect = document.getElementById('ethnicity');
    const ethnicityDescription = document.getElementById('ethnicityDescription');
    ethnicityDescription.style.display = 
        ethnicitySelect.value === 'other' ? 'block' : 'none';
}

function handleLocationChange() {
    const locationSelect = document.getElementById('location');
    const locationDescription = document.getElementById('locationDescription');
    locationDescription.style.display = 
        locationSelect.value === 'other' ? 'block' : 'none';
}

// Save section data
function saveCurrentSectionData() {
    const currentSectionElement = sections[currentSection];
    const inputs = currentSectionElement.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            if (!surveyData[input.name]) {
                surveyData[input.name] = [];
            }
            if (input.checked) {
                surveyData[input.name].push(input.value);
            }
        } else {
            surveyData[input.id || input.name] = input.value;
        }
    });
}

// Submit survey
function submitSurvey() {
    if (validateCurrentSection()) {
        saveCurrentSectionData();
        
        // Convert survey data to JSON
        const jsonData = JSON.stringify(surveyData, null, 2);
        
        // Create CSV data
        const csvData = convertToCSV(surveyData);
        
        // Save data (you can modify this to send to a server)
        downloadData('survey_response.json', jsonData);
        downloadData('survey_response.csv', csvData);
        
        // Show completion message
        alert('Thank you for completing the survey!');
        
        // Reset survey
        window.location.reload();
    }
}

// Utility function to convert data to CSV
function convertToCSV(data) {
    const headers = Object.keys(data);
    const csvRows = [headers.join(',')];
    const values = headers.map(header => {
        const value = data[header];
        return Array.isArray(value) ? value.join(';') : value;
    });
    csvRows.push(values.join(','));
    return csvRows.join('\n');
}

// Utility function to download data
function downloadData(filename, data) {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Initialize event listeners when the document loads
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for conditional fields
    document.getElementById('gender')?.addEventListener('change', handleGenderChange);
    document.getElementById('ethnicity')?.addEventListener('change', handleEthnicityChange);
    document.getElementById('location')?.addEventListener('change', handleLocationChange);
    
    // Initialize the first section
    updateSection();
});
