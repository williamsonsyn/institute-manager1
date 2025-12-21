// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const instituteForm = document.getElementById('institute-form');
    const roleForm = document.getElementById('role-form');
    const userForm = document.getElementById('user-form');
    
    const instituteCodeInput = document.getElementById('institute-code');
    const institutePasswordInput = document.getElementById('institute-password');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    const btnInstituteLogin = document.getElementById('btn-institute-login');
    const btnProceedToLogin = document.getElementById('btn-proceed-to-login');
    const btnUserLogin = document.getElementById('btn-user-login');
    const btnBackToInstitute = document.getElementById('btn-back-to-institute');
    const btnBackToRole = document.getElementById('btn-back-to-role');
    
    const roleCards = document.querySelectorAll('.role-card');
    const sampleButtons = document.querySelectorAll('.sample-btn');
    const userSamplesContainer = document.getElementById('user-samples');
    const currentRoleSpan = document.getElementById('current-role');
    const roleTitle = document.getElementById('role-title');
    const roleDescription = document.getElementById('role-description');
    
    const loginStatus = document.getElementById('login-status');
    const progressSteps = document.querySelectorAll('.progress-step');
    
    // State
    let currentStep = 1;
    let selectedInstitute = null;
    let selectedRole = null;
    let sampleUsers = {
        admin: [
            { username: "admin", password: "admin123", description: "Full access administrator" },
            { username: "director", password: "director123", description: "Institute director" }
        ],
        teacher: [
            { username: "teacher1", password: "teacher123", description: "Computer Science Professor" },
            { username: "teacher2", password: "teacher456", description: "IT Department Professor" }
        ],
        student: [
            { username: "student1", password: "student123", description: "2nd Year CS Student" },
            { username: "student2", password: "student456", description: "2nd Year IT Student" }
        ]
    };
    
    // Initialize
    updateProgressSteps();
    populateSampleUserButtons('admin'); // Default to admin
    
    // Event Listeners
    
    // Sample institute buttons
    sampleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            const password = this.getAttribute('data-password');
            
            instituteCodeInput.value = code;
            institutePasswordInput.value = password;
            
            showStatus(`Sample institute ${code} loaded`, 'success');
        });
    });
    
    // Institute login
    btnInstituteLogin.addEventListener('click', function() {
        const code = instituteCodeInput.value.trim();
        const password = institutePasswordInput.value;
        
        if (!code || !password) {
            showStatus('Please enter institute code and password', 'error');
            return;
        }
        
        // Authenticate institute
        const result = DataManager.authenticateInstitute(code, password);
        
        if (!result.success) {
            showStatus(result.message, 'error');
            return;
        }
        
        // Save institute info and proceed to role selection
        selectedInstitute = result.institute;
        showStatus(`Welcome to ${result.institute.name}`, 'success');
        
        // Move to step 2
        setTimeout(() => {
            navigateToStep(2);
        }, 1000);
    });
    
    // Role selection
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            roleCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            this.classList.add('active');
            
            // Set selected role
            selectedRole = this.getAttribute('data-role');
            
            // Update sample user buttons for selected role
            populateSampleUserButtons(selectedRole);
            
            // Update UI text
            updateRoleUI(selectedRole);
        });
    });
    
    // Proceed to user login
    btnProceedToLogin.addEventListener('click', function() {
        if (!selectedRole) {
            showStatus('Please select a role', 'error');
            return;
        }
        
        navigateToStep(3);
    });
    
    // User login
    btnUserLogin.addEventListener('click', function() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username || !password) {
            showStatus('Please enter username and password', 'error');
            return;
        }
        
        // Authenticate user
        const result = DataManager.authenticateUser(
            selectedInstitute.code,
            selectedRole,
            username,
            password
        );
        
        if (!result.success) {
            showStatus(result.message, 'error');
            return;
        }
        
        // Login successful
        showStatus(`Login successful! Redirecting...`, 'success');
        
        // Store session data
        const sessionData = {
            institute: selectedInstitute,
            user: result.user,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('currentSession', JSON.stringify(sessionData));
        
        // Redirect to appropriate dashboard
        setTimeout(() => {
            redirectToDashboard(selectedRole);
        }, 1500);
    });
    
    // Navigation back buttons
    btnBackToInstitute.addEventListener('click', function() {
        navigateToStep(1);
    });
    
    btnBackToRole.addEventListener('click', function() {
        navigateToStep(2);
    });
    
    // Sample user buttons
    userSamplesContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('sample-user-btn')) {
            const username = e.target.getAttribute('data-username');
            const password = e.target.getAttribute('data-password');
            
            usernameInput.value = username;
            passwordInput.value = password;
            
            showStatus(`Sample ${selectedRole} credentials loaded`, 'success');
        }
    });
    
    // Functions
    
    function navigateToStep(step) {
        currentStep = step;
        
        // Hide all forms
        instituteForm.classList.remove('active');
        roleForm.classList.remove('active');
        userForm.classList.remove('active');
        
        // Show current form
        if (step === 1) {
            instituteForm.classList.add('active');
        } else if (step === 2) {
            roleForm.classList.add('active');
        } else if (step === 3) {
            userForm.classList.add('active');
        }
        
        // Update progress steps
        updateProgressSteps();
        
        // Clear status
        clearStatus();
    }
    
    function updateProgressSteps() {
        progressSteps.forEach((step, index) => {
            const stepNum = index + 1;
            
            if (stepNum < currentStep) {
                step.classList.add('active');
                step.classList.remove('current');
            } else if (stepNum === currentStep) {
                step.classList.add('active', 'current');
            } else {
                step.classList.remove('active', 'current');
            }
        });
    }
    
    function populateSampleUserButtons(role) {
        const users = sampleUsers[role] || [];
        userSamplesContainer.innerHTML = '';
        
        users.forEach(user => {
            const button = document.createElement('button');
            button.className = 'sample-btn sample-user-btn';
            button.setAttribute('data-username', user.username);
            button.setAttribute('data-password', user.password);
            button.innerHTML = `
                <i class="fas fa-user-circle"></i>
                <div>
                    <strong>${user.username}</strong>
                    <small>${user.description}</small>
                </div>
            `;
            
            userSamplesContainer.appendChild(button);
        });
    }
    
    function updateRoleUI(role) {
        currentRoleSpan.textContent = role.charAt(0).toUpperCase() + role.slice(1);
        
        const roleTitles = {
            admin: 'Administrator Login',
            teacher: 'Teacher Login',
            student: 'Student Login'
        };
        
        const roleDescriptions = {
            admin: 'Enter your administrator credentials',
            teacher: 'Enter your teacher credentials',
            student: 'Enter your student credentials'
        };
        
        roleTitle.textContent = roleTitles[role];
        roleDescription.textContent = roleDescriptions[role];
    }
    
    function showStatus(message, type) {
        loginStatus.textContent = message;
        loginStatus.className = `login-status ${type}`;
        
        if (type === 'success') {
            setTimeout(clearStatus, 3000);
        }
    }
    
    function clearStatus() {
        loginStatus.textContent = '';
        loginStatus.className = 'login-status';
    }
    
    function redirectToDashboard(role) {
        const dashboards = {
            admin: 'dashboard-admin.html',
            teacher: 'dashboard-teacher.html',
            student: 'dashboard-student.html'
        };
        
        window.location.href = dashboards[role];
    }
    
    // Auto-focus first input on form show
    document.addEventListener('focusin', function(e) {
        if (e.target.tagName === 'INPUT' && e.target.value === '') {
            e.target.select();
        }
    });
    
    // Handle Enter key for forms
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            if (currentStep === 1) {
                btnInstituteLogin.click();
            } else if (currentStep === 2 && selectedRole) {
                btnProceedToLogin.click();
            } else if (currentStep === 3) {
                btnUserLogin.click();
            }
        }
    });
    
    // Pre-select first role card
    if (roleCards.length > 0) {
        roleCards[0].click();
    }
});