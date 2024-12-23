let currentSection = 0;
const sections = document.getElementsByClassName('survey-section');
const surveyData = {};

// Initialize the survey
function startSurvey() {
    // Hide the welcome section
    document.getElementById('welcome').classList.remove('active');
    
    // Show the first section
    document.getElementById('section1').classList.add('active');
    
    // Initialize the progress bar
    document.getElementById('progressBar').style.width = '0%';
    
    // Reset currentSection to 0
    currentSection = 0;
}

// Handle navigation between sections
function nextSection() {
    if (validateCurrentSection()) {
        saveCurrentSectionData();

        const currentSectionElement = sections[currentSection];

        // Branching Right After Section 1
        if (currentSectionElement.id === 'section1') {
            // Hide Section 1
            currentSectionElement.classList.remove('active');

            // Show the chosen Section 2 variant based on Q1 answer
            const branchSectionId = surveyData.nextSection;
            document.getElementById(branchSectionId).classList.add('active');

            // Update currentSection index to match the branch section
            currentSection = Array.from(sections).findIndex(
                (section) => section.id === branchSectionId
            );
        } 
        // After Section 2A, 2B, 2C, 2D, converge on Section 3
        else if (
            currentSectionElement.id === 'section2A' ||
            currentSectionElement.id === 'section2B' ||
            currentSectionElement.id === 'section2C' ||
            currentSectionElement.id === 'section2D'
        ) {
            // Hide the current Section 2 variant
            currentSectionElement.classList.remove('active');

            // Show Section 3
            document.getElementById('section3').classList.add('active');

            // Update currentSection index to Section 3
            currentSection = Array.from(sections).findIndex(
                (section) => section.id === 'section3'
            );
        } 
        // Normal progression for all other sections
        else {
            currentSection++;
            updateSection();
        }

        // Update progress bar
        const progress = (currentSection / (sections.length - 1)) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
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

    // Hide all Section 2 variants initially
    document.getElementById('section2A').classList.remove('active');
    document.getElementById('section2B').classList.remove('active');
    document.getElementById('section2C').classList.remove('active');
    document.getElementById('section2D').classList.remove('active');

    // Set the ID of the Section 2 variant to show next
    switch(reason) {
        case 'personal':
            surveyData.nextSection = 'section2A';
            break;
        case 'supporter':
            surveyData.nextSection = 'section2B';
            break;
        case 'professional':
            surveyData.nextSection = 'section2C';
            break;
        case 'organization':
            surveyData.nextSection = 'section2D';
            break;
        default:
            surveyData.nextSection = 'section2A'; // fallback if not selected
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
function submitSurveyData(data) {
    const scriptURL = https://script.google.com/macros/s/AKfycbyDB7Zx-hYjn-GiGveXjuQ8jD5OH82n7lDyCpjszo9y1Q7nrWwb-Mh7tzNB5svJMV8ggQ/exec; // Replace with your Google Apps Script URL

    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((response) => response.json())
    .then((json) => {
        console.log('Success:', json);
        alert('Your responses have been submitted successfully!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('There was an error submitting your responses. Please try again.');
    });
}

function submitSurvey() {
    // Collect all survey data
    const data = {
        q1: surveyData.primaryReason || '',
        q2: document.querySelector('#section2A textarea')?.value || '',
        q3: document.querySelector('#section2A textarea:nth-of-type(2)')?.value || '',
        q4: Array.from(document.querySelectorAll('#section2A input[name="challenges"]:checked')).map(input => input.value).join(', ') || '',
        q5: document.querySelector('#section2A textarea:nth-of-type(3)')?.value || '',
        // Add similar logic for other sections (2B, 2C, 2D, Section 3, etc.)
    };

    // Send the data to the Google Apps Script
    submitSurveyData(data);
}
    // Initialize the first section
    updateSection();
});
