// ============================================
// FIREBASE CONFIGURATION AND INITIALIZATION
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    getDoc 
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
// HELPER FUNCTION - GET USER INITIALS
// ============================================

function getInitials(fullName) {
    if (!fullName) return 'U'; // Default if no name
    
    const names = fullName.trim().split(' ');
    
    if (names.length === 1) {
        // Only one name, use first letter
        return names[0].charAt(0).toUpperCase();
    } else {
        // First name + Last name initials
        const firstInitial = names[0].charAt(0).toUpperCase();
        const lastInitial = names[names.length - 1].charAt(0).toUpperCase();
        return firstInitial + lastInitial;
    }
}

// ============================================
// HELPER FUNCTION - GET FIRST NAME
// ============================================

function getFirstName(fullName) {
    if (!fullName) return 'User';
    
    const names = fullName.trim().split(' ');
    return names[0];
}

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
// CHECK AUTHENTICATION & LOAD USER DATA
// ============================================

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        // No user logged in, redirect to login
        showMessage('Please login to access dashboard', true);
        setTimeout(() => {
            window.location.href = 'log-in.html';
        }, 1500);
        return;
    }
    
    console.log('User logged in:', user.email);
    
    // Get user's display name from Firebase Auth
    const displayName = user.displayName || user.email;
    
    // Get initials
    const initials = getInitials(displayName);
    const firstName = getFirstName(displayName);
    
    // Update avatar section
    updateAvatar(initials, firstName);
    
    // Update welcome banner
    updateWelcomeBanner(firstName);
    
    // Load user data from Firestore
    await loadUserData(user.uid);
});

// ============================================
// UPDATE AVATAR IN SIDEBAR
// ============================================

function updateAvatar(initials, firstName) {
    // Find avatar elements
    const initialBox = document.querySelector('.initial-box');
    const nameHeading = document.querySelector('.avatar-placeholder h6');
    
    if (initialBox) {
        initialBox.textContent = initials;
    }
    
    if (nameHeading) {
        nameHeading.textContent = firstName;
    }
    
    // Add sign out button if it doesn't exist
    addSignOutButton();
}

// ============================================
// ADD SIGN OUT BUTTON
// ============================================

function addSignOutButton() {
    const avatarPlaceholder = document.querySelector('.avatar-placeholder');
    
    if (!avatarPlaceholder) return;
    
    // Check if sign out button already exists
    let signOutBtn = document.getElementById('signOutBtn');
    
    if (!signOutBtn) {
        // Create sign out button
        signOutBtn = document.createElement('button');
        signOutBtn.id = 'signOutBtn';
        signOutBtn.textContent = 'Sign Out';
        signOutBtn.className = 'sign-out-btn';
        
        // Add styling
        signOutBtn.style.cssText = `
            width: 100%;
            padding: 10px 20px;
            margin-top: 15px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background 0.3s;
        `;
        
        // Add hover effect
        signOutBtn.addEventListener('mouseenter', () => {
            signOutBtn.style.background = '#d32f2f';
        });
        
        signOutBtn.addEventListener('mouseleave', () => {
            signOutBtn.style.background = '#f44336';
        });
        
        // Add click handler
        signOutBtn.addEventListener('click', handleSignOut);
        
        // Append to avatar section
        avatarPlaceholder.appendChild(signOutBtn);
    }
}

// ============================================
// HANDLE SIGN OUT
// ============================================

function handleSignOut() {
    const confirmSignOut = confirm('Are you sure you want to sign out?');
    
    if (!confirmSignOut) return;
    
    signOut(auth)
        .then(() => {
            showMessage('Signed out successfully!');
            setTimeout(() => {
                window.location.href = 'log-in.html';
            }, 1000);
        })
        .catch((error) => {
            console.error('Sign out error:', error);
            showMessage('Error signing out. Please try again.', true);
        });
}

// ============================================
// UPDATE WELCOME BANNER
// ============================================

function updateWelcomeBanner(firstName) {
    const welcomeHeading = document.querySelector('.welcome-banner h4');
    
    if (welcomeHeading) {
        welcomeHeading.textContent = `Welcome back, ${firstName} 👋`;
    }
}

// ============================================
// LOAD USER DATA FROM FIRESTORE
// ============================================

async function loadUserData(userId) {
    try {
        // Get user document from Firestore
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data loaded:', userData);
            
            // Update dashboard with user's subjects
            if (userData.subjects) {
                updateSubjectCards(userData.subjects);
            }
            
            // Update today's focus based on user preferences
            if (userData.studyTime) {
                updateTodaysFocus(userData);
            }
            
            // Store user data globally for other functions to use
            window.currentUserData = userData;
        } else {
            console.log('No user data found in Firestore');
            // User hasn't completed onboarding
            showMessage('Please complete your profile setup', true);
            setTimeout(() => {
                window.location.href = 'onboarding.html';
            }, 2000);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showMessage('Error loading user data', true);
    }
}

// ============================================
// UPDATE SUBJECT CARDS WITH USER'S SUBJECTS
// ============================================

function updateSubjectCards(userSubjects) {
    const subjectGrid = document.querySelector('.subject-grid');
    
    if (!subjectGrid) return;
    
    // Clear existing cards
    subjectGrid.innerHTML = '';
    
    // Create a card for each of user's subjects
    userSubjects.forEach((subject, index) => {
        const card = createSubjectCard(subject, index);
        subjectGrid.appendChild(card);
    });
}

// ============================================
// CREATE SUBJECT CARD
// ============================================

function createSubjectCard(subjectName, index) {
    const card = document.createElement('div');
    card.className = `subject-card card-${index + 1}`;
    
    // Random progress for now (you can make this dynamic later)
    const progress = Math.floor(Math.random() * 100);
    
    card.innerHTML = `
        <h4 class="subject-title">${subjectName}</h4>
        <div class="subject-meta">
            <span class="status active">Active</span>
            <span class="days-left">87 days left</span>
        </div>
        <div class="progress-bar">
            <div class="progress" style="width: ${progress}%"></div>
        </div>
        <a href="" class="primary-btn">Continue Studying</a>
    `;
    
    return card;
}

// ============================================
// UPDATE TODAY'S FOCUS
// ============================================

function updateTodaysFocus(userData) {
    const focusSubject = document.querySelector('.focus-subject');
    
    if (focusSubject && userData.subjects && userData.subjects.length > 0) {
        // Set first subject as today's focus (you can make this smarter later)
        focusSubject.textContent = userData.subjects[1] || userData.subjects[0];
    }
}

// ============================================
// CALENDAR FUNCTIONALITY
// ============================================

const monthYearElement = document.getElementById('monthYear');
const calendarBodyElement = document.getElementById('calendarBody');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');

let currentDate = new Date();

function renderCalendar() {
    if (!calendarBodyElement || !monthYearElement) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Set month and year header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    monthYearElement.textContent = `${monthNames[month]} ${year}`;
    
    // Clear calendar body
    calendarBodyElement.innerHTML = '';
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let date = 1;
    
    // Create 6 rows (weeks)
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');
        
        // Create 7 cells (days)
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            
            if (i === 0 && j < firstDay) {
                // Empty cells before first day
                cell.textContent = '';
            } else if (date > daysInMonth) {
                // Empty cells after last day
                break;
            } else {
                cell.textContent = date;
                
                // Highlight today
                const today = new Date();
                if (date === today.getDate() && 
                    month === today.getMonth() && 
                    year === today.getFullYear()) {
                    cell.classList.add('today');
                    cell.style.background = '#4CAF50';
                    cell.style.color = 'white';
                    cell.style.borderRadius = '50%';
                    cell.style.fontWeight = 'bold';
                }
                
                date++;
            }
            
            row.appendChild(cell);
        }
        
        calendarBodyElement.appendChild(row);
    }
}

// Calendar navigation
if (prevMonthButton) {
    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
}

if (nextMonthButton) {
    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}

// Render calendar on page load
renderCalendar();

// ============================================
// CODE EXPLANATION
// ============================================

/*
HOW THIS CODE WORKS:

1. AUTHENTICATION CHECK:
   - When page loads, checks if user is logged in
   - If not logged in → redirect to login page
   - If logged in → load user data

2. GET USER INFO:
   - Gets user's display name from Firebase Auth
   - Extracts initials (First + Last name)
   - Extracts first name

3. UPDATE AVATAR:
   - Updates the initials in the circle (FA → becomes user's initials)
   - Updates the name display (Favour → becomes user's first name)
   - Keeps "Student" text as is

4. ADD SIGN OUT BUTTON:
   - Creates a red "Sign Out" button
   - Adds it below the avatar
   - When clicked, shows confirmation dialog
   - Signs user out and redirects to login

5. LOAD USER DATA FROM FIRESTORE:
   - Fetches user's onboarding data (subjects, preferences, etc.)
   - If no data found → redirect to onboarding page
   - If data exists → update dashboard

6. UPDATE SUBJECT CARDS:
   - Clears the hardcoded subject cards
   - Creates new cards for user's selected subjects
   - Shows only their 4 subjects (English + 3 they chose)

7. UPDATE WELCOME BANNER:
   - Changes "Welcome back, Favour" to user's actual first name

8. TODAY'S FOCUS:
   - Sets today's focus to one of user's subjects

9. CALENDAR:
   - Renders current month
   - Highlights today's date
   - Navigate between months

EXAMPLE DATA FLOW:

User: "John Doe" signed up with subjects: ["Use of English", "Physics", "Chemistry", "Biology"]

1. Dashboard loads
2. Gets "John Doe" from Firebase Auth
3. Extracts initials: "JD"
4. Extracts first name: "John"
5. Updates avatar: Shows "JD" in circle, "John" below
6. Fetches Firestore data: Gets subjects array
7. Creates 4 subject cards: English, Physics, Chemistry, Biology
8. Updates welcome: "Welcome back, John 👋"
9. Sets focus: "Physics" (or whichever subject)
10. Adds Sign Out button at bottom
*/
