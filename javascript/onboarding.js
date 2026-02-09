// ============================================
// FIREBASE CONFIGURATION AND INITIALIZATION
// ============================================

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

// Complete JAMB subject lists based on official JAMB subjects
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
        z-index: 1000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 4000);
}

// ============================================
// CHECK IF USER IS LOGGED IN
// ============================================

onAuthStateChanged(auth, (user) => {
    if (!user) {
        // If no user is logged in, redirect to login page
        showMessage('Please sign in first', true);
        setTimeout(() => {
            window.location.href = 'log-in.html';
        }, 1500);
    } else {
        console.log('User logged in:', user.email);
    }
});

// ============================================
// POPULATE SUBJECTS BASED ON STREAM SELECTION
// ============================================

const streamRadios = document.querySelectorAll('input[name="stream"]');
const subjectDatalist = document.getElementById('subjectOptions');

streamRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        const selectedStream = e.target.value;
        console.log('Stream selected:', selectedStream);
        
        // Clear existing options
        subjectDatalist.innerHTML = '';
        
        // Get subjects for selected stream
        const subjects = subjectsByStream[selectedStream];
        
        // Populate datalist with subjects
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            subjectDatalist.appendChild(option);
        });
        
        // Clear previous subject selections
        document.getElementById('subject1').value = '';
        document.getElementById('subject2').value = '';
        document.getElementById('subject3').value = '';
        
        showMessage(`Subjects loaded for ${selectedStream}`, false);
    });
});

// ============================================
// HANDLE "OTHER" SCORE INPUT
// ============================================

const scoreRadios = document.querySelectorAll('input[name="targetScore"]');
const customScoreInput = document.getElementById('customScore');

scoreRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            // Show custom input field
            customScoreInput.style.display = 'block';
            customScoreInput.required = true;
            customScoreInput.focus();
        } else {
            // Hide custom input field
            customScoreInput.style.display = 'none';
            customScoreInput.required = false;
            customScoreInput.value = '';
        }
    });
});

// Auto-select "Other" when user clicks on custom score input
customScoreInput.addEventListener('focus', () => {
    document.getElementById('scoreCustom').checked = true;
    customScoreInput.style.display = 'block';
});

// ============================================
// FORM SUBMISSION
// ============================================

const onboardingForm = document.getElementById('onboardingForm');

onboardingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const stream = document.querySelector('input[name="stream"]:checked');
    const subject1 = document.getElementById('subject1').value.trim();
    const subject2 = document.getElementById('subject2').value.trim();
    const subject3 = document.getElementById('subject3').value.trim();
    const targetScoreRadio = document.querySelector('input[name="targetScore"]:checked');
    const studyTime = document.querySelector('input[name="studyTime"]:checked');
    const studyType = document.querySelector('input[name="studyType"]:checked');
    const studyFrequency = document.querySelector('input[name="studyFrequency"]:checked');
    
    // VALIDATION 1: Check if stream is selected
    if (!stream) {
        showMessage('Please select your department', true);
        return;
    }
    
    // VALIDATION 2: Check if all 3 subjects are filled
    if (!subject1 || !subject2 || !subject3) {
        showMessage('Please select all 3 subjects', true);
        return;
    }
    
    // VALIDATION 3: Check for duplicate subjects
    const subjects = [subject1, subject2, subject3];
    const uniqueSubjects = new Set(subjects);
    
    if (uniqueSubjects.size !== 3) {
        showMessage('Please select 3 different subjects', true);
        return;
    }
    
    // VALIDATION 4: Check if subjects are valid for selected stream
    const validSubjects = subjectsByStream[stream.value];
    const invalidSubjects = subjects.filter(subj => !validSubjects.includes(subj));
    
    if (invalidSubjects.length > 0) {
        showMessage(`Invalid subject(s): ${invalidSubjects.join(', ')}. Please select from the list.`, true);
        return;
    }
    
    // VALIDATION 5: Check if target score is selected
    if (!targetScoreRadio) {
        showMessage('Please select your target score', true);
        return;
    }
    
    // Get target score value
    let targetScore;
    if (targetScoreRadio.value === 'custom') {
        const customScore = customScoreInput.value;
        if (!customScore || customScore < 0 || customScore > 400) {
            showMessage('Please enter a valid target score (0-400)', true);
            return;
        }
        targetScore = customScore;
    } else {
        targetScore = targetScoreRadio.value;
    }
    
    // VALIDATION 6: Check other preferences
    if (!studyTime || !studyType || !studyFrequency) {
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
        studyType: studyType.value,
        studyFrequency: studyFrequency.value,
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
    };
    
    // Disable submit button to prevent double submission
    const submitBtn = onboardingForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        // Save to Firestore
        // This creates a document in the 'users' collection with the user's UID as the document ID
        await setDoc(doc(db, 'users', user.uid), userData);
        
        console.log('User data saved:', userData);
        showMessage('Profile setup complete! Redirecting to dashboard...');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
            window.location.href = 'dashboard.html'; // Change to your dashboard file
        }, 2000);
        
    } catch (error) {
        console.error('Error saving user data:', error);
        showMessage('Error saving profile. Please try again.', true);
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Setup';
    }
});

// ============================================
// CODE EXPLANATION FOR YOU
// ============================================

/*
HOW THIS CODE WORKS:

1. FIREBASE SETUP:
   - We import Firebase Auth (for checking logged-in user) and Firestore (for saving data)
   - Initialize Firebase with your config

2. SUBJECT LISTS:
   - We have all JAMB subjects organized by stream (science, commercial, arts)
   - Some subjects appear in multiple streams (like Economics) - that's intentional!

3. CHECK USER LOGIN:
   - onAuthStateChanged checks if user is logged in
   - If not logged in, redirect to login page
   - This prevents unauthorized access to onboarding

4. POPULATE SUBJECTS:
   - When user selects a department (Science/Commercial/Arts)
   - We populate the datalist with relevant subjects
   - User can then type or select from the list

5. HANDLE "OTHER" SCORE:
   - When user clicks "Other" for target score
   - Show the custom input field
   - Hide it if they select a preset score

6. FORM VALIDATION:
   - Check if all required fields are filled
   - Make sure 3 different subjects are selected
   - Validate subjects are appropriate for chosen stream
   - Check target score is valid (0-400 if custom)

7. SAVE TO FIRESTORE:
   - Create a document in 'users' collection
   - Document ID = user's UID (unique identifier)
   - Save all preferences: stream, subjects, target score, study preferences
   - Mark onboarding as completed

8. REDIRECT:
   - After successful save, redirect to dashboard
   - User can now see personalized content

FIRESTORE STRUCTURE:
users (collection)
  └── [user_uid] (document)
        ├── stream: "science"
        ├── subjects: ["Use of English", "Physics", "Chemistry", "Biology"]
        ├── targetScore: "300"
        ├── studyTime: "evening"
        ├── studyType: "all"
        ├── studyFrequency: "daily"
        ├── onboardingCompleted: true
        └── createdAt: "2025-02-02T..."
*/
