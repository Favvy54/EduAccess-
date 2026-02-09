// ============================================
// FIREBASE CONFIGURATION AND INITIALIZATION
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

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

// ============================================
// GLOBAL STATE
// ============================================

let isUserLoggedIn = false;
let currentUser = null;

// ============================================
// HELPER FUNCTION - GET INITIALS
// ============================================

function getInitials(fullName) {
    if (!fullName) return 'U';
    
    const names = fullName.trim().split(' ');
    
    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    } else {
        const firstInitial = names[0].charAt(0).toUpperCase();
        const lastInitial = names[names.length - 1].charAt(0).toUpperCase();
        return firstInitial + lastInitial;
    }
}

// ============================================
// CREATE MODAL HTML
// ============================================

function createLockModal() {
    // Check if modal already exists
    if (document.getElementById('lockModal')) return;
    
    const modalHTML = `
        <div id="lockModal" class="lock-modal" style="display: none;">
            <div class="lock-modal-overlay"></div>
            <div class="lock-modal-content">
                <button class="lock-modal-close" id="closeLockModal">×</button>
                <div class="lock-modal-icon">🔒</div>
                <h3 class="lock-modal-title">Content Locked</h3>
                <p class="lock-modal-message" id="lockModalMessage">
                    Sign in to access this JAMB resource
                </p>
                <a href="sign-up.html" class="lock-modal-signup-btn">Sign Up</a>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add modal styles
    addModalStyles();
    
    // Add close button functionality
    const closeBtn = document.getElementById('closeLockModal');
    const modalOverlay = document.querySelector('.lock-modal-overlay');
    
    closeBtn.addEventListener('click', closeLockModal);
    modalOverlay.addEventListener('click', closeLockModal);
}

// ============================================
// MODAL STYLES
// ============================================

function addModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .lock-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .lock-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
        }
        
        .lock-modal-content {
            position: relative;
            background: white;
            border-radius: 16px;
            padding: 40px 30px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            text-align: center;
            animation: modalSlideIn 0.3s ease-out;
        }
        
        @keyframes modalSlideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .lock-modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: transparent;
            border: none;
            font-size: 28px;
            color: #666;
            cursor: pointer;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s;
        }
        
        .lock-modal-close:hover {
            background: #f0f0f0;
            color: #333;
        }
        
        .lock-modal-icon {
            font-size: 50px;
            margin-bottom: 20px;
        }
        
        .lock-modal-title {
            font-size: 24px;
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
        }
        
        .lock-modal-message {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.5;
        }
        
        .lock-modal-signup-btn {
            display: inline-block;
            padding: 12px 40px;
            background: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            transition: background 0.3s;
        }
        
        .lock-modal-signup-btn:hover {
            background: #45a049;
        }
        
        .locked-card {
            position: relative;
            cursor: not-allowed;
            opacity: 0.7;
        }
        
        .locked-card::after {
            content: '🔒';
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 20px;
        }
        
        .avatar-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #4CAF50;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// SHOW/HIDE MODAL
// ============================================

function showLockModal(resourceName) {
    const modal = document.getElementById('lockModal');
    const message = document.getElementById('lockModalMessage');
    
    if (modal) {
        message.textContent = `Sign in to access this JAMB ${resourceName} resource`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

function closeLockModal() {
    const modal = document.getElementById('lockModal');
    
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    }
}

// ============================================
// LOCK ALL RESOURCE CARDS
// ============================================

function lockAllResources() {
    // Lock flashcards
    const flashcards = document.querySelectorAll('.flashcard');
    flashcards.forEach(card => {
        card.classList.add('locked-card');
        
        const cardTitle = card.querySelector('.card-title')?.textContent || 'this';
        
        card.addEventListener('click', (e) => {
            e.preventDefault();
            showLockModal(cardTitle);
        });
    });
    
    // Lock syllabus cards
    const syllabusCards = document.querySelectorAll('.card[data-name="syllabus"]');
    syllabusCards.forEach(card => {
        card.classList.add('locked-card');
        
        const cardTitle = card.querySelector('h4')?.textContent || 'this';
        
        card.addEventListener('click', (e) => {
            e.preventDefault();
            showLockModal(cardTitle);
        });
    });
    
    // Lock all "View details" buttons
    const viewButtons = document.querySelectorAll('.view-syllabus-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const subject = btn.getAttribute('data-subject') || 'this';
            showLockModal(subject);
        });
    });
}

// ============================================
// UNLOCK ALL RESOURCES
// ============================================

function unlockAllResources() {
    // Remove locked class from all cards
    const lockedCards = document.querySelectorAll('.locked-card');
    lockedCards.forEach(card => {
        card.classList.remove('locked-card');
        
        // Remove the lock click event by cloning and replacing
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
    });
}

// ============================================
// UPDATE NAVBAR FOR LOGGED-IN USER
// ============================================

function updateNavbarForLoggedInUser(user) {
    const navbarNav = document.querySelector('.navbar-nav');
    
    // Find login/signup links
    const loginLink = document.getElementById('logIn');
    const signupLink = document.getElementById('signUp');
    
    if (loginLink && signupLink) {
        // Hide login and signup links
        loginLink.style.display = 'none';
        signupLink.style.display = 'none';
        
        // Create avatar if it doesn't exist
        let avatarContainer = document.getElementById('userAvatar');
        
        if (!avatarContainer) {
            avatarContainer = document.createElement('div');
            avatarContainer.id = 'userAvatar';
            avatarContainer.className = 'nav-item';
            
            const displayName = user.displayName || user.email;
            const initials = getInitials(displayName);
            
            avatarContainer.innerHTML = `
                <div class="avatar-circle" title="${displayName}">
                    ${initials}
                </div>
            `;
            
            // Add click to go to dashboard
            avatarContainer.addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
            
            // Insert avatar after navbar-nav
            const navbarNavDiv = loginLink.parentElement;
            navbarNavDiv.appendChild(avatarContainer);
        }
    }
}

// ============================================
// UPDATE NAVBAR FOR NON-LOGGED USER
// ============================================

function updateNavbarForNonLoggedUser() {
    const loginLink = document.getElementById('logIn');
    const signupLink = document.getElementById('signUp');
    const avatarContainer = document.getElementById('userAvatar');
    
    // Show login/signup
    if (loginLink) loginLink.style.display = 'block';
    if (signupLink) signupLink.style.display = 'block';
    
    // Remove avatar if exists
    if (avatarContainer) {
        avatarContainer.remove();
    }
}

// ============================================
// CHECK AUTHENTICATION STATE
// ============================================

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        isUserLoggedIn = true;
        currentUser = user;
        console.log('User logged in:', user.email);
        
        // Unlock all resources
        unlockAllResources();
        
        // Update navbar
        updateNavbarForLoggedInUser(user);
        
    } else {
        // User is NOT logged in
        isUserLoggedIn = false;
        currentUser = null;
        console.log('No user logged in');
        
        // Lock all resources
        lockAllResources();
        
        // Update navbar
        updateNavbarForNonLoggedUser();
    }
});

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Create modal
    createLockModal();
    
    // If no user is logged in yet, lock resources by default
    if (!isUserLoggedIn) {
        lockAllResources();
    }
});

// ============================================
// CODE EXPLANATION
// ============================================

/*
HOW THIS WORKS:

1. PAGE LOADS:
   - Firebase checks if user is logged in
   - Modal HTML is created and hidden
   - Modal styles are added to page

2. IF USER NOT LOGGED IN:
   - All resource cards get "locked-card" class
   - 🔒 icon appears on top right of each card
   - Cards become slightly transparent (opacity: 0.7)
   - When user clicks any card → Modal appears
   
3. MODAL BEHAVIOR:
   - Shows: "Sign in to access this JAMB [Subject] resource"
   - [Subject] changes based on what they clicked
   - "Sign Up" button takes them to sign-up.html
   - X button closes modal
   - Clicking outside (overlay) also closes modal

4. IF USER IS LOGGED IN:
   - All locks removed
   - Cards work normally
   - Login/Signup buttons hidden
   - Avatar with initials appears in navbar
   - Clicking avatar → goes to dashboard

5. DYNAMIC MODAL MESSAGE:
   - Click Chemistry card → "Sign in to access this JAMB Chemistry resource"
   - Click Physics syllabus → "Sign in to access this JAMB Physics resource"
   - Click Mathematics → "Sign in to access this JAMB Mathematics resource"

EXAMPLE FLOW:

User (not logged in) clicks "Chemistry flashcard":
1. Event intercepted
2. Default action prevented (link doesn't work)
3. Modal appears with: "Sign in to access this JAMB Chemistry resource"
4. User clicks "Sign Up" → Goes to sign-up page
5. User signs up → Returns to homepage
6. Now all cards are unlocked! ✅

FIREBASE AUTH STATES:
- onAuthStateChanged fires whenever login state changes
- User logs in → Unlock everything
- User logs out → Lock everything again
- Happens automatically in real-time!
*/
