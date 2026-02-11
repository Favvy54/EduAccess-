// ============================================
// FIREBASE IMPORTS
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCb_ECsj7T7_WrM9z-_NTjuhRXlHJCx_BY",
    authDomain: "edu-access-484005.firebaseapp.com",
    projectId: "edu-access-484005",
    storageBucket: "edu-access-484005.firebasestorage.app",
    messagingSenderId: "1051127518868",
    appId: "1:1051127518868:web:9a567909f559edaac74681",
    measurementId: "G-1C8M8SHZ34"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ============================================
// STATE VARIABLES
// ============================================

let isUserLoggedIn = false;

// ============================================
// CREATE LOCK MODAL (Hidden by default)
// ============================================

function createLockModal() {
    // Check if modal already exists
    if (document.getElementById('lockModal')) {
        console.log('Modal already exists');
        return;
    }
    
    console.log('Creating lock modal...');
    
    const modalHTML = `
        <div id="lockModal" class="lock-modal" style="display: none;">
            <div class="lock-modal-overlay"></div>
            <div class="lock-modal-content">
                <button class="lock-modal-close" id="closeLockModal">×</button>
                <div class="lock-modal-icon">🔒</div>
                <h3 class="lock-modal-title">Content Locked</h3>
                <p class="lock-modal-message" id="lockModalMessage">
                    Sign in to access this resource
                </p>
                <a href="sign-up.html" class="lock-modal-signup-btn">Sign Up</a>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    addModalStyles();
    setupModalCloseHandlers();
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
    `;
    document.head.appendChild(style);
}

// ============================================
// SETUP MODAL CLOSE HANDLERS
// ============================================

function setupModalCloseHandlers() {
    setTimeout(() => {
        const closeBtn = document.getElementById('closeLockModal');
        const overlay = document.querySelector('.lock-modal-overlay');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeLockModal);
            console.log('Close button listener added');
        }
        
        if (overlay) {
            overlay.addEventListener('click', closeLockModal);
            console.log('Overlay click listener added');
        }
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeLockModal();
            }
        });
    }, 0);
}

// ============================================
// SHOW/CLOSE MODAL FUNCTIONS
// ============================================

function showLockModal(resourceName) {
    console.log('Showing lock modal for:', resourceName);
    const modal = document.getElementById('lockModal');
    const message = document.getElementById('lockModalMessage');
    
    if (modal && message) {
        message.textContent = `Sign in to access this JAMB ${resourceName} resource`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeLockModal() {
    console.log('Closing modal...');
    const modal = document.getElementById('lockModal');
    
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ============================================
// ADD CLICK INTERCEPTORS (Only for non-logged users)
// ============================================

function interceptResourceClicks() {
    console.log('Adding click interceptors for non-logged users...');
    
    // Intercept flashcard clicks
    const flashcards = document.querySelectorAll('.flashcard');
    flashcards.forEach(card => {
        const title = card.querySelector('.card-title')?.textContent || 'this';
        
        card.addEventListener('click', (e) => {
            if (!isUserLoggedIn) {
                e.preventDefault();
                e.stopPropagation();
                showLockModal(title);
            }
        });
    });
    
    // Intercept syllabus card clicks
    const syllabusCards = document.querySelectorAll('.card[data-name="syllabus"]');
    syllabusCards.forEach(card => {
        const title = card.querySelector('h4')?.textContent || 'this';
        
        card.addEventListener('click', (e) => {
            if (!isUserLoggedIn) {
                e.preventDefault();
                e.stopPropagation();
                showLockModal(title);
            }
        });
    });
    
    // Intercept view button clicks
    const viewButtons = document.querySelectorAll('.view-syllabus-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!isUserLoggedIn) {
                e.preventDefault();
                e.stopPropagation();
                const subject = btn.getAttribute('data-subject') || 'this';
                showLockModal(subject);
            }
        });
    });
    
    console.log(`Interceptors added to ${flashcards.length + syllabusCards.length + viewButtons.length} elements`);
}

// ============================================
// UPDATE NAVBAR
// ============================================

function updateNavbar(user) {
    const loginLink = document.getElementById('logIn');
    const signupLink = document.getElementById('signUp');
    
    if (user) {
        // User is logged in - hide login/signup, show avatar
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
        
        // Add avatar (optional - you can customize this)
        const navbarNav = document.querySelector('.navbar-nav');
        if (navbarNav && !document.getElementById('userAvatar')) {
            const initials = getInitials(user.displayName || user.email);
            const avatarHTML = `
                <li class="nav-item" id="userAvatar">
                    <a href="dashboard.html" class="nav-link">
                        <div style="width: 35px; height: 35px; border-radius: 50%; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                            ${initials}
                        </div>
                    </a>
                </li>
            `;
            navbarNav.insertAdjacentHTML('beforeend', avatarHTML);
        }
    } else {
        // User not logged in - show login/signup
        if (loginLink) loginLink.style.display = 'block';
        if (signupLink) signupLink.style.display = 'block';
        
        // Remove avatar if exists
        const avatar = document.getElementById('userAvatar');
        if (avatar) avatar.remove();
    }
}

function getInitials(name) {
    if (!name) return '?';
    const names = name.split(' ').filter(n => n.length > 0);
    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
}

// ============================================
// FIREBASE AUTH STATE LISTENER
// ============================================

onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed. User:', user ? user.email : 'None');
    
    if (user) {
        // User IS logged in
        isUserLoggedIn = true;
        console.log('User authenticated - resources unlocked');
    } else {
        // User NOT logged in
        isUserLoggedIn = false;
        console.log('No user - click interceptors active');
    }
    
    // Update navbar regardless
    updateNavbar(user);
});

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded - initializing...');
    
    // Create modal (hidden)
    createLockModal();
    
    // Add click interceptors to all resources
    // These check isUserLoggedIn before showing modal
    interceptResourceClicks();
    
    console.log('Initialization complete');
});
