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
// STATE (Global so accessible everywhere)
// ============================================

window.isUserLoggedIn = false;

// ============================================
// MODAL FUNCTIONS
// ============================================

// Make closeModal global so it can be called from anywhere
window.closeModal = function() {
    console.log('Closing modal...');
    const modal = document.getElementById('lockModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log('Modal closed');
    } else {
        console.error('Modal not found!');
    }
};

function showModal(resourceName) {
    console.log('Showing modal for:', resourceName);
    const modal = document.getElementById('lockModal');
    const message = document.getElementById('lockModalMessage');
    
    if (modal && message) {
        message.textContent = `Sign in to access this JAMB ${resourceName} resource`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        console.log('Modal shown');
    } else {
        console.error('Modal elements not found!');
        console.log('Modal:', modal);
        console.log('Message:', message);
    }
}

// ============================================
// BLOCK RESOURCES
// ============================================

function blockAllResources() {
    console.log('Blocking all resources...');
    
    const flashcards = document.querySelectorAll('.flashcard');
    const syllabusCards = document.querySelectorAll('.card[data-name="syllabus"]');
    const viewButtons = document.querySelectorAll('.view-syllabus-btn');
    const allResources = [...flashcards, ...syllabusCards, ...viewButtons];
    
    allResources.forEach(element => {
        // Store original href
        if (element.tagName === 'A' && element.href) {
            element.dataset.originalHref = element.href;
            element.href = 'javascript:void(0)';
            console.log('Stored href:', element.dataset.originalHref);
        }
        
        // Add click handler
        element.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Resource clicked. User logged in:', window.isUserLoggedIn);
            
            if (!window.isUserLoggedIn) {
                const resourceName = 
                    element.querySelector('.card-title')?.textContent ||
                    element.querySelector('h4')?.textContent ||
                    element.dataset.subject ||
                    'this';
                
                console.log('Showing modal for:', resourceName);
                showModal(resourceName);
            } else {
                // User IS logged in - navigate!
                const originalHref = element.dataset.originalHref;
                console.log('User logged in! Original href:', originalHref);
                
                if (originalHref && originalHref !== 'javascript:void(0)' && originalHref !== '') {
                    console.log('Navigating to:', originalHref);
                    window.location.href = originalHref;
                } else {
                    console.warn('No valid href found! Element:', element);
                    console.warn('This resource might not have a link!');
                    alert('This resource is under construction. Coming soon!');
                }
            }
        }, true);
    });
    
    console.log(`Blocked ${allResources.length} resources`);
}

// ============================================
// UPDATE NAVBAR
// ============================================

function updateNavbar(user) {
    const loginLink = document.getElementById('logIn');
    const signupLink = document.getElementById('signUp');
    
    if (user) {
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
        
        const navbarNav = document.querySelector('.navbar-nav');
        if (navbarNav && !document.getElementById('userAvatar')) {
            const initials = getInitials(user.displayName || user.email);
            const avatarHTML = `
                <li class="nav-item" id="userAvatar">
                    <a href="dashboard.html" class="nav-link" style="padding: 0;">
                        <div style="width: 35px; height: 35px; border-radius: 50%; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                            ${initials}
                        </div>
                    </a>
                </li>
            `;
            navbarNav.insertAdjacentHTML('beforeend', avatarHTML);
        }
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (signupLink) signupLink.style.display = 'block';
        
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
// AUTH LISTENER
// ============================================

onAuthStateChanged(auth, (user) => {
    console.log('Auth state:', user ? user.email : 'No user');
    
    // Update global variable
    window.isUserLoggedIn = !!user;
    
    updateNavbar(user);
    
    console.log('window.isUserLoggedIn:', window.isUserLoggedIn);
});

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded - initializing...');
    
    // Block resources immediately
    blockAllResources();
    
    console.log('Initialization complete');
});
