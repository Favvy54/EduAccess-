// Firebase Configuration and Initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    sendPasswordResetEmail
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
const googleProvider = new GoogleAuthProvider();

// Helper function to show messages
function showMessage(message, isError = false) {
    // Create a message element
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
    
    // Remove message after 4 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 4000);
}

// ============================================
// SIGN UP PAGE FUNCTIONALITY
// ============================================
const signUpForm = document.getElementById('signUpForm');
const signUpBtn = document.getElementById('signUpBtn');
const googleSignUpBtn = document.getElementById('googleBtn');

if (signUpBtn) {
    signUpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('signUpEmail').value.trim();
        const password = document.getElementById('signUpPassword').value;

        // Validation
        if (!fullName) {
            showMessage('Please enter your full name', true);
            return;
        }

        if (!email) {
            showMessage('Please enter your email', true);
            return;
        }

        if (password.length < 6) {
            showMessage('Password must be at least 6 characters', true);
            return;
        }

        // Disable button to prevent double submission
        signUpBtn.disabled = true;
        signUpBtn.textContent = 'Creating Account...';

        // Create user with email and password
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                // Update user profile with full name
                return updateProfile(user, {
                    displayName: fullName
                });
            })
            .then(() => {
                showMessage('Account created successfully! Setting up your profile...');
                
                // Clear form
                signUpForm.reset();
                
                // Redirect to onboarding page after 1.5 seconds
                setTimeout(() => {
                    window.location.href = 'onboarding.html';
                }, 1500);
            })
            .catch((error) => {
                console.error('Sign up error:', error);
                
                // Handle specific error codes
                let errorMessage = 'An error occurred. Please try again.';
                
                switch(error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'This email is already registered. Please login instead.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak. Use at least 6 characters.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your connection.';
                        break;
                }
                
                showMessage(errorMessage, true);
                
                // Re-enable button
                signUpBtn.disabled = false;
                signUpBtn.textContent = 'Get Started Now';
            });
    });
}

// Google Sign Up
if (googleSignUpBtn) {
    googleSignUpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        googleSignUpBtn.disabled = true;
        
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                const user = result.user;
                console.log('Google sign in successful:', user);
                
                showMessage('Signed in with Google successfully! Setting up your profile...');
                
                // Redirect to onboarding page
                setTimeout(() => {
                    window.location.href = 'onboarding.html';
                }, 1500);
            })
            .catch((error) => {
                console.error('Google sign in error:', error);
                
                let errorMessage = 'Google sign in failed. Please try again.';
                
                if (error.code === 'auth/popup-closed-by-user') {
                    errorMessage = 'Sign in cancelled.';
                } else if (error.code === 'auth/network-request-failed') {
                    errorMessage = 'Network error. Please check your connection.';
                }
                
                showMessage(errorMessage, true);
                googleSignUpBtn.disabled = false;
            });
    });
}

// ============================================
// LOGIN PAGE FUNCTIONALITY
// ============================================
const logInForm = document.getElementById('logInForm');
const loginBtn = document.getElementById('loginBtn');
const googleLoginBtn = document.getElementById('goggleBtn');

if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('userName').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Validation
        if (!email) {
            showMessage('Please enter your email', true);
            return;
        }

        if (!password) {
            showMessage('Please enter your password', true);
            return;
        }

        // Disable button
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';

        // Sign in with email and password
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('Login successful:', user);
                
                // Handle "Remember Me" - save email if checked
                const rememberMeCheckbox = document.getElementById('checkbox');
                if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                    localStorage.setItem('savedEmail', email);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('savedEmail');
                    localStorage.setItem('rememberMe', 'false');
                }
                
                showMessage('Login successful! Redirecting...');
                
                // Clear form
                logInForm.reset();
                
                // Redirect to homepage or dashboard
                setTimeout(() => {
                    window.location.href = 'index.html'; // Change to your homepage
                }, 1500);
            })
            .catch((error) => {
                console.error('Login error:', error);
                
                let errorMessage = 'Login failed. Please try again.';
                
                switch(error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address.';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password.';
                        break;
                    case 'auth/invalid-credential':
                        errorMessage = 'Invalid email or password.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many failed attempts. Please try again later.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your connection.';
                        break;
                }
                
                showMessage(errorMessage, true);
                
                // Re-enable button
                loginBtn.disabled = false;
                loginBtn.textContent = 'Log In';
            });
    });
}

// Google Login
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        googleLoginBtn.disabled = true;
        
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                const user = result.user;
                console.log('Google login successful:', user);
                
                showMessage('Signed in with Google successfully!');
                
                // Redirect to homepage
                setTimeout(() => {
                    window.location.href = 'index.html'; // Change to your homepage
                }, 1500);
            })
            .catch((error) => {
                console.error('Google login error:', error);
                
                let errorMessage = 'Google sign in failed. Please try again.';
                
                if (error.code === 'auth/popup-closed-by-user') {
                    errorMessage = 'Sign in cancelled.';
                } else if (error.code === 'auth/network-request-failed') {
                    errorMessage = 'Network error. Please check your connection.';
                }
                
                showMessage(errorMessage, true);
                googleLoginBtn.disabled = false;
            });
    });
}

// ============================================
// PASSWORD VISIBILITY TOGGLE
// ============================================
const showPasswordBtns = document.querySelectorAll('#showPassword');
const hidePasswordBtns = document.querySelectorAll('#hidePassword');

showPasswordBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const passwordField = btn.parentElement.querySelector('.password-field');
        const hideBtn = btn.parentElement.querySelector('#hidePassword');
        
        if (passwordField) {
            passwordField.type = 'text';
            btn.style.display = 'none';
            hideBtn.style.display = 'inline';
        }
    });
});

hidePasswordBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const passwordField = btn.parentElement.querySelector('.password-field');
        const showBtn = btn.parentElement.querySelector('#showPassword');
        
        if (passwordField) {
            passwordField.type = 'password';
            btn.style.display = 'none';
            showBtn.style.display = 'inline';
        }
    });
});

// ============================================
// CHECK AUTHENTICATION STATE
// ============================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User is logged in:', user);
        
        // If user is on login or signup page and already logged in, redirect to homepage
        const currentPage = window.location.pathname;
        if (currentPage.includes('log-in.html') || currentPage.includes('sign-up.html')) {
            // Uncomment this if you want to auto-redirect logged-in users
            // window.location.href = 'index.html';
        }
    } else {
        console.log('No user logged in');
    }
});

// ============================================
// LOGOUT FUNCTIONALITY (for other pages)
// ============================================
// Add this function to any page where you have a logout button
window.logout = function() {
    signOut(auth)
        .then(() => {
            showMessage('Logged out successfully');
            setTimeout(() => {
                window.location.href = 'log-in.html';
            }, 1000);
        })
        .catch((error) => {
            console.error('Logout error:', error);
            showMessage('Error logging out', true);
        });
};

// ============================================
// FORGOT PASSWORD FUNCTIONALITY
// ============================================

// Handle "Forgot Password" link click
const forgotPasswordLinks = document.querySelectorAll('a[href=""]');

forgotPasswordLinks.forEach(link => {
    // Check if this is the forgot password link (by text content)
    if (link.textContent.toLowerCase().includes('forgot password')) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the email from the username/email input field
            const emailInput = document.getElementById('userName');
            
            if (!emailInput) {
                showMessage('Email input not found', true);
                return;
            }
            
            const email = emailInput.value.trim();
            
            if (!email) {
                showMessage('Please enter your email address first', true);
                emailInput.focus();
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Please enter a valid email address', true);
                return;
            }
            
            // Show confirmation dialog
            const confirmReset = confirm(`Send password reset email to ${email}?`);
            
            if (!confirmReset) {
                return;
            }
            
            // Disable the link temporarily
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
            
            // Send password reset email
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    showMessage(`Password reset email sent to ${email}! Check your inbox.`);
                    console.log('Password reset email sent successfully');
                })
                .catch((error) => {
                    console.error('Password reset error:', error);
                    
                    let errorMessage = 'Failed to send reset email. Please try again.';
                    
                    switch(error.code) {
                        case 'auth/user-not-found':
                            errorMessage = 'No account found with this email address. Note: Google sign-in users cannot use password reset.';
                            break;
                        case 'auth/invalid-email':
                            errorMessage = 'Invalid email address.';
                            break;
                        case 'auth/too-many-requests':
                            errorMessage = 'Too many requests. Please try again later.';
                            break;
                        case 'auth/network-request-failed':
                            errorMessage = 'Network error. Please check your connection.';
                            break;
                    }
                    
                    showMessage(errorMessage, true);
                })
                .finally(() => {
                    // Re-enable the link
                    link.style.pointerEvents = 'auto';
                    link.style.opacity = '1';
                });
        });
    }
});

// ============================================
// REMEMBER ME FUNCTIONALITY
// ============================================

// Check for "Remember Me" checkbox on login page
const rememberMeCheckbox = document.getElementById('checkbox');

if (rememberMeCheckbox) {
    // Load saved "remember me" preference
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    rememberMeCheckbox.checked = savedRememberMe;
    
    // If "remember me" was checked and we have saved credentials
    if (savedRememberMe) {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            const emailInput = document.getElementById('userName');
            if (emailInput) {
                emailInput.value = savedEmail;
            }
        }
    }
    
    // Save "remember me" preference when checkbox changes
    rememberMeCheckbox.addEventListener('change', (e) => {
        localStorage.setItem('rememberMe', e.target.checked);
        
        if (!e.target.checked) {
            // If unchecked, clear saved email
            localStorage.removeItem('savedEmail');
        }
    });
}

// When user successfully logs in, save email if "remember me" is checked
// This is integrated into the login handler above
// We'll modify the login section to save the email
