
// FIREBASE CONFIGURATION AND INITIALIZATION

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    doc,
    setDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCb_ECsj7T7_WrM9z-_NTjuhRXlHJCx_BY",
    authDomain: "edu-access-484005.firebaseapp.com",
    projectId: "edu-access-484005",
    storageBucket: "edu-access-484005.firebasestorage.app",
    messagingSenderId: "1051127518868",
    appId: "1:1051127518868:web:9a567909f559edaac74681",
    measurementId: "G-1C8M8SHZ34"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================
// SUBJECT LISTS BY STREAM
// ============================================

const subjectsByStream = {
    science: [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'Agricultural Science',
        'Geography',
        'Technical Drawing',
        'Health Education',
        'Physical Education',
        'Computer Studies/Data Processing'
    ],
    commercial: [
        'Economics',
        'Commerce',
        'Principles of Accounts/Book Keeping',
        'Civic Education',
        'Insurance',
        'Marketing',
        'Government',
        'Geography',
        'Mathematics'
    ],
    arts: [
        'Literature in English',
        'Government',
        'Christian Religious Knowledge (CRK)',
        'Islamic Religious Knowledge (IRK)',
        'History',
        'Music',
        'Fine Arts',
        'French',
        'Arabic',
        'Hausa',
        'Igbo',
        'Yoruba',
        'Economics',
        'Geography'
    ]
};

// ============================================
// HELPER FUNCTION - SHOW MESSAGES
// ============================================

function showMessage(message, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${isError ? '#f44336' : '#4CAF50'};
        color: white;
        border-radius: 5px;
        z-index: 10001;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 4000);
}

// ============================================
// GLOBAL VARIABLES FOR MODAL
// ============================================

let selectedSubjects = [];
let availableSubjects = [];

// ============================================
// WAIT FOR DOM TO LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - initializing onboarding');
    initializeOnboarding();
});

function initializeOnboarding() {
    // Get all DOM elements
    const subjectModal = document.getElementById('subjectModal');
    const subjectSelectorBtn = document.getElementById('subjectSelectorBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalOverlay = document.querySelector('.modal-overlay');
    const doneBtn = document.getElementById('doneBtn');
    const modalSubjectsList = document.getElementById('modalSubjectsList');
    const subjectSearch = document.getElementById('subjectSearch');
    const selectedSubjectsDisplay = document.getElementById('selectedSubjectsDisplay');
    const subjectCount = document.getElementById('subjectCount');
    const modalSubjectCount = document.getElementById('modalSubjectCount');
    const streamRadios = document.querySelectorAll('input[name="stream"]');
    const onboardingForm = document.getElementById('onboardingForm');

    // Check if all elements exist
    if (!subjectModal || !subjectSelectorBtn) {
        console.error('Modal elements not found!');
        console.log('subjectModal:', subjectModal);
        console.log('subjectSelectorBtn:', subjectSelectorBtn);
        return;
    }

    console.log('All elements found - setting up event listeners');

    // ============================================
    // MODAL FUNCTIONS
    // ============================================

    function openSubjectModal() {
        console.log('Opening modal...');

        // Check if department is selected
        const selectedStream = document.querySelector('input[name="stream"]:checked');

        if (!selectedStream) {
            showMessage('Please select your department first', true);
            return;
        }

        // Get subjects for selected stream
        availableSubjects = subjectsByStream[selectedStream.value];
        console.log('Available subjects:', availableSubjects);

        // Populate modal with subjects
        populateSubjectModal();

        // Show modal
        subjectModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Focus search input
        setTimeout(() => {
            if (subjectSearch) {
                subjectSearch.focus();
            }
        }, 100);
    }

    function closeSubjectModal() {
        console.log('Closing modal...');
        subjectModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (subjectSearch) {
            subjectSearch.value = '';
        }
    }

    function populateSubjectModal() {
        if (!modalSubjectsList) return;

        modalSubjectsList.innerHTML = '';

        availableSubjects.forEach(subject => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'subject-option';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `modal-${subject.replace(/\s+/g, '-')}`;
            checkbox.value = subject;

            // Check if already selected
            if (selectedSubjects.includes(subject)) {
                checkbox.checked = true;
                optionDiv.classList.add('selected');
            }

            // Disable if 3 subjects already selected and this isn't one of them
            if (selectedSubjects.length >= 3 && !selectedSubjects.includes(subject)) {
                checkbox.disabled = true;
                optionDiv.classList.add('disabled');
            }

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = subject;

            // Handle checkbox change
            checkbox.addEventListener('change', (e) => {
                handleSubjectSelection(subject, e.target.checked);
            });

            optionDiv.appendChild(checkbox);
            optionDiv.appendChild(label);
            modalSubjectsList.appendChild(optionDiv);
        });

        updateSelectionCount();
    }

    function handleSubjectSelection(subject, isChecked) {
        if (isChecked) {
            // Add subject if less than 3 selected
            if (selectedSubjects.length < 3) {
                selectedSubjects.push(subject);
            }
        } else {
            // Remove subject
            selectedSubjects = selectedSubjects.filter(s => s !== subject);
        }

        // Re-populate to update disabled states
        populateSubjectModal();

        // Update display
        updateSubjectDisplay();
        updateSelectionCount();
    }

    function updateSubjectDisplay() {
        if (!selectedSubjectsDisplay) return;

        if (selectedSubjects.length === 0) {
            selectedSubjectsDisplay.textContent = 'Click to select subjects';
            selectedSubjectsDisplay.classList.remove('has-subjects');
        } else {
            selectedSubjectsDisplay.textContent = selectedSubjects.join(', ');
            selectedSubjectsDisplay.classList.add('has-subjects');
        }

        // Update hidden inputs
        const subject1Input = document.getElementById('subject1');
        const subject2Input = document.getElementById('subject2');
        const subject3Input = document.getElementById('subject3');

        if (subject1Input) subject1Input.value = selectedSubjects[0] || '';
        if (subject2Input) subject2Input.value = selectedSubjects[1] || '';
        if (subject3Input) subject3Input.value = selectedSubjects[2] || '';
    }

    function updateSelectionCount() {
        const count = selectedSubjects.length;

        if (subjectCount) {
            subjectCount.textContent = `${count}/3 subjects selected`;

            // Change color based on count
            if (count === 3) {
                subjectCount.style.color = '#4CAF50';
            } else {
                subjectCount.style.color = '#666';
            }
        }

        if (modalSubjectCount) {
            modalSubjectCount.textContent = count;

            if (count === 3) {
                modalSubjectCount.parentElement.style.color = '#4CAF50';
            } else {
                modalSubjectCount.parentElement.style.color = '#667eea';
            }
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    // Open modal when button clicked
    if (subjectSelectorBtn) {
        subjectSelectorBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Subject selector button clicked');
            openSubjectModal();
        });
        console.log('Subject selector button listener added');
    }

    // Close modal handlers
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeSubjectModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeSubjectModal);
    }

    if (doneBtn) {
        doneBtn.addEventListener('click', closeSubjectModal);
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && subjectModal && subjectModal.style.display === 'flex') {
            closeSubjectModal();
        }
    });

    // Search functionality
    if (subjectSearch) {
        subjectSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const options = modalSubjectsList.querySelectorAll('.subject-option');

            let visibleCount = 0;

            options.forEach(option => {
                const label = option.querySelector('label').textContent.toLowerCase();
                if (label.includes(searchTerm)) {
                    option.classList.remove('hidden');
                    visibleCount++;
                } else {
                    option.classList.add('hidden');
                }
            });

            // Show empty state if no results
            const existingEmptyState = modalSubjectsList.querySelector('.empty-state');
            if (existingEmptyState) {
                existingEmptyState.remove();
            }

            if (visibleCount === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.innerHTML = `
                    <p>No subjects found</p>
                    <p style="font-size: 14px; color: #999;">Try a different search term</p>
                `;
                modalSubjectsList.appendChild(emptyState);
            }
        });
    }

    // Clear selections when department changes
    streamRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const selectedStream = e.target.value;
            console.log('Stream selected:', selectedStream);

            // Clear previous subject selections
            selectedSubjects = [];
            updateSubjectDisplay();
            updateSelectionCount();

            showMessage(`Department changed to ${selectedStream}. Please reselect your subjects.`, false);
        });
    });

    // ============================================
    // HANDLE "OTHER" SCORE INPUT
    // ============================================

    const scoreRadios = document.querySelectorAll('input[name="targetScore"]');
    const customScoreInput = document.getElementById('customScore');

    if (scoreRadios && customScoreInput) {
        scoreRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    customScoreInput.style.display = 'block';
                    customScoreInput.required = true;
                    customScoreInput.focus();
                } else {
                    customScoreInput.style.display = 'none';
                    customScoreInput.required = false;
                    customScoreInput.value = '';
                }
            });
        });

        // Auto-select "Other" when user clicks on custom score input
        customScoreInput.addEventListener('focus', () => {
            const scoreCustomRadio = document.getElementById('scoreCustom');
            if (scoreCustomRadio) {
                scoreCustomRadio.checked = true;
                customScoreInput.style.display = 'block';
            }
        });
    }

    // ============================================
    // FORM SUBMISSION
    // ============================================

    if (onboardingForm) {
        onboardingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form values
            const stream = document.querySelector('input[name="stream"]:checked');
            const subject1 = document.getElementById('subject1').value.trim();
            const subject2 = document.getElementById('subject2').value.trim();
            const subject3 = document.getElementById('subject3').value.trim();
            const targetScoreRadio = document.querySelector('input[name="targetScore"]:checked');
            const studyTime = document.querySelector('input[name="studyTime"]:checked');
            const studyFrequency = document.querySelector('input[name="studyFrequency"]:checked');

            // VALIDATION 1: Check if stream is selected
            if (!stream) {
                showMessage('Please select your department', true);
                return;
            }

            // VALIDATION 2: Check if exactly 3 subjects are selected
            if (!subject1 || !subject2 || !subject3) {
                showMessage('Please select exactly 3 subjects', true);
                return;
            }

            // VALIDATION 3: Check for duplicate subjects
            const subjects = [subject1, subject2, subject3];
            const uniqueSubjects = new Set(subjects);

            if (uniqueSubjects.size !== 3) {
                showMessage('Please select 3 different subjects', true);
                return;
            }

            // VALIDATION 4: Check if target score is selected
            if (!targetScoreRadio) {
                showMessage('Please select your target score', true);
                return;
            }

            // Get target score value
            let targetScore;
            if (targetScoreRadio.value === 'custom') {
                const customScore = customScoreInput ? customScoreInput.value : '';
                if (!customScore || customScore < 0 || customScore > 400) {
                    showMessage('Please enter a valid target score (0-400)', true);
                    return;
                }
                targetScore = customScore;
            } else {
                targetScore = targetScoreRadio.value;
            }

            // VALIDATION 5: Check other preferences
            if (!studyTime || !studyFrequency) {
                showMessage('Please complete all study preferences', true);
                return;
            }

            // Get current user
            const user = auth.currentUser;

            if (!user) {
                showMessage('Session expired. Please login again.', true);
                setTimeout(() => {
                    window.location.href = 'log-in.html';
                }, 2000);
                return;
            }

            // Prepare data to save
            const userData = {
                stream: stream.value,
                subjects: [
                    'Use of English', // Compulsory
                    subject1,
                    subject2,
                    subject3
                ],
                targetScore: targetScore,
                studyTime: studyTime.value,
                studyFrequency: studyFrequency.value,
                onboardingCompleted: true,
                createdAt: new Date().toISOString()
            };

            // Disable submit button
            const submitBtn = onboardingForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Saving...';
            }

            try {
                // Save to Firestore
                await setDoc(doc(db, 'users', user.uid), userData);

                console.log('User data saved:', userData);
                showMessage('Profile setup complete! Redirecting to dashboard...');

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);

            } catch (error) {
                console.error('Error saving user data:', error);
                showMessage('Error saving profile. Please try again.', true);

                // Re-enable button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Setup';
                }
            }
        });
    }
}

// ============================================
// CHECK IF USER IS LOGGED IN
// ============================================

onAuthStateChanged(auth, (user) => {
    if (!user) {
        showMessage('Please sign in first', true);
        setTimeout(() => {
            window.location.href = 'log-in.html';
        }, 1500);
    } else {
        console.log('User logged in:', user.email);
    }
});
