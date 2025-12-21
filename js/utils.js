// Utility Functions for Institute Manager

const Utils = {
    // Format date to readable string
    formatDate: function(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },
    
    // Format time to 12-hour format
    formatTime: function(date) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    },
    
    // Get current session data
    getCurrentSession: function() {
        const session = localStorage.getItem('currentSession');
        return session ? JSON.parse(session) : null;
    },
    
    // Check if user is logged in
    isLoggedIn: function() {
        const session = this.getCurrentSession();
        return session !== null;
    },
    
    // Redirect to login if not logged in
    requireLogin: function() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },
    
    // Get current user role
    getUserRole: function() {
        const session = this.getCurrentSession();
        return session ? session.user.role : null;
    },
    
    // Logout user
    logout: function() {
        localStorage.removeItem('currentSession');
        window.location.href = 'index.html';
    },
    
    // Show notification
    showNotification: function(message, type = 'info', duration = 5000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to notification container or create one
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('hiding');
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
        
        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-width: 400px;
                }
                
                .notification {
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    animation: slideIn 0.3s ease;
                    transform: translateX(0);
                    transition: all 0.3s ease;
                }
                
                .notification.hiding {
                    transform: translateX(100%);
                    opacity: 0;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                }
                
                .notification i {
                    font-size: 1.2rem;
                }
                
                .notification-success i {
                    color: #4cc9f0;
                }
                
                .notification-error i {
                    color: #f72585;
                }
                
                .notification-info i {
                    color: #4361ee;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    padding: 4px;
                    transition: color 0.3s ease;
                }
                
                .notification-close:hover {
                    color: white;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    // Show loading overlay
    showLoading: function(message = 'Loading...') {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="spinner"></div>
                <div class="loading-text">${message}</div>
            `;
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
    },
    
    // Hide loading overlay
    hideLoading: function() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    },
    
    // Create modal
    createModal: function(options) {
        const {
            title,
            content,
            onConfirm,
            onCancel,
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            showCancel = true,
            size = 'medium'
        } = options;
        
        // Remove existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = `modal modal-${size}`;
        
        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                ${showCancel ? `<button class="btn-secondary" id="modal-cancel">${cancelText}</button>` : ''}
                <button class="btn-primary" id="modal-confirm">${confirmText}</button>
            </div>
        `;
        
        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
        
        // Show modal
        setTimeout(() => modalOverlay.classList.add('active'), 10);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('#modal-cancel');
        const confirmBtn = modal.querySelector('#modal-confirm');
        
        const closeModal = () => {
            modalOverlay.classList.remove('active');
            setTimeout(() => modalOverlay.remove(), 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (onCancel) onCancel();
                closeModal();
            });
        }
        
        confirmBtn.addEventListener('click', () => {
            if (onConfirm) onConfirm();
            closeModal();
        });
        
        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        return {
            close: closeModal,
            updateContent: (newContent) => {
                const modalBody = modal.querySelector('.modal-body');
                modalBody.innerHTML = newContent;
            }
        };
    },
    
    // Generate random ID
    generateId: function(prefix = '') {
        return prefix + Math.random().toString(36).substr(2, 9);
    },
    
    // Validate email
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Get query parameter
    getQueryParam: function(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },
    
    // Set query parameter
    setQueryParam: function(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    },
    
    // Download file
    downloadFile: function(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // Copy to clipboard
    copyToClipboard: function(text) {
        return navigator.clipboard.writeText(text);
    },
    
    // Format file size
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // Get current academic year
    getAcademicYear: function() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        // Assuming academic year starts in August
        if (month >= 7) { // August or later
            return `${year}-${year + 1}`;
        } else {
            return `${year - 1}-${year}`;
        }
    },
    
    // Calculate teacher workload
    calculateWorkload: function(teacherId, timetableData) {
        let workload = 0;
        Object.values(timetableData).forEach(timetable => {
            Object.values(timetable.schedule || {}).forEach(daySchedule => {
                daySchedule.forEach(slot => {
                    if (slot.teacher === teacherId) {
                        workload++;
                    }
                });
            });
        });
        return workload;
    },
    
    // Check for time conflicts
    checkTimeConflict: function(schedule1, schedule2) {
        // Simple time conflict check
        // This would need to be more sophisticated for actual time ranges
        return schedule1.day === schedule2.day && 
               schedule1.period === schedule2.period;
    },
    
    // Generate color from string (for avatars, etc.)
    stringToColor: function(string) {
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 60%)`;
    },
    
    // Get initials from name
    getInitials: function(name) {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },
    
    // Parse time string to minutes
    timeToMinutes: function(timeString) {
        const [time, modifier] = timeString.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        
        return hours * 60 + minutes;
    },
    
    // Format minutes to time string
    minutesToTime: function(minutes, format24 = false) {
        let hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (format24) {
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        }
        
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${mins.toString().padStart(2, '0')} ${period}`;
    },
    
    // Create CSV from array of objects
    arrayToCSV: function(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value;
            }).join(','))
        ];
        
        return csv.join('\n');
    }
};

// Initialize utilities on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function() {
        // Update date and time in dashboard headers
        function updateDateTime() {
            const now = new Date();
            const dateElements = document.querySelectorAll('#current-date');
            const timeElements = document.querySelectorAll('#current-time');
            
            dateElements.forEach(el => {
                if (el) el.textContent = Utils.formatDate(now);
            });
            
            timeElements.forEach(el => {
                if (el) el.textContent = Utils.formatTime(now);
            });
        }
        
        // Update immediately and then every minute
        updateDateTime();
        setInterval(updateDateTime, 60000);
        
        // Check login status on dashboard pages
        if (window.location.pathname.includes('dashboard')) {
            if (!Utils.requireLogin()) {
                return;
            }
        }
    });
}