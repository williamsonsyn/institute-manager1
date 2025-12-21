// Student Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check login
    if (!Utils.requireLogin()) return;
    
    const session = Utils.getCurrentSession();
    const user = session.user;
    const institute = session.institute;
    
    // Initialize dashboard
    
    
    // DOM Elements
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const logoutBtn = document.querySelector('.logout-btn');
    
    // State
    let currentPage = 'dashboard';
    let studentTimetable = null;
    
    // Initialize
    updateUserInfo();
    loadDashboardData();
    setupEventListeners();
    
    // Functions
    initDashboard();
    function initDashboard() {
        // Get student timetable based on user data
        const year = user.year || 2;
        const department = user.department || 'CS';
        const division = user.division || 'A';
        
        studentTimetable = DataManager.getTimetable(institute.code, year, department, division);
        
        // Create mobile menu toggle if not exists
        if (!document.querySelector('.mobile-menu-toggle')) {
            createMobileMenuToggle();
        }
    }
    
    function createMobileMenuToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'mobile-menu-toggle';
        toggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(toggle);
        
        toggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
        });
        
        return toggle;
    }
    
    function updateUserInfo() {
        // Update institute info
        const instituteName = document.getElementById('institute-name');
        const instituteCode = document.getElementById('institute-code');
        
        if (instituteName) instituteName.textContent = institute.name;
        if (instituteCode) instituteCode.textContent = institute.code;
        
        // Update user info
        const userName = document.getElementById('user-name');
        const userRole = document.querySelector('.user-role');
        const studentInfo = document.getElementById('student-info');
        const studentId = document.getElementById('student-id');
        
        if (userName) userName.textContent = user.name;
        if (userRole) userRole.textContent = user.role;
        
        const year = user.year || 2;
        const department = user.department || 'CS';
        const division = user.division || 'A';
        
        if (studentInfo) {
            studentInfo.textContent = `${department} ${getYearText(year)} - Division ${division}`;
        }
        
        if (studentId && user.rollNo) {
            studentId.textContent = `Roll No: ${user.rollNo}`;
        }
        
        // Update page title
        updatePageTitle('Dashboard');
    }
    
    function getYearText(year) {
        switch(year) {
            case 1: return '1st Year';
            case 2: return '2nd Year';
            case 3: return '3rd Year';
            case 4: return '4th Year';
            default: return `${year}th Year`;
        }
    }
    
    function updatePageTitle(title) {
        const pageTitle = document.getElementById('page-title');
        const pageDescription = document.getElementById('page-description');
        
        if (pageTitle) pageTitle.textContent = title;
        
        // Update description based on page
        const descriptions = {
            dashboard: 'Welcome to your student portal',
            timetable: 'View your class schedule',
            teachers: 'Check teacher availability',
            rooms: 'Find available classrooms',
            resources: 'Access study materials',
            calendar: 'View institute events'
        };
        
        if (pageDescription) {
            pageDescription.textContent = descriptions[title.toLowerCase()] || '';
        }
    }
    
    function loadDashboardData() {
        // Load today's classes
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        let todaysClasses = [];
        
        if (studentTimetable && studentTimetable.schedule && studentTimetable.schedule[today]) {
            todaysClasses = studentTimetable.schedule[today].filter(cls => cls.subject).map((cls, index) => ({
                period: index + 1,
                subject: cls.subject,
                teacher: cls.teacher,
                room: cls.room,
                type: cls.type
            }));
        }
        
        // Load tomorrow's classes
        const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long' });
        let tomorrowsClasses = [];
        
        if (studentTimetable && studentTimetable.schedule && studentTimetable.schedule[tomorrow]) {
            tomorrowsClasses = studentTimetable.schedule[tomorrow].filter(cls => cls.subject).map((cls, index) => ({
                period: index + 1,
                subject: cls.subject,
                teacher: cls.teacher,
                room: cls.room,
                type: cls.type
            }));
        }
        
        // Load dashboard page
        loadDashboardPage(todaysClasses, tomorrowsClasses);
    }
    
    function loadDashboardPage(todaysClasses, tomorrowsClasses) {
        const page = document.getElementById('page-dashboard');
        if (!page) return;
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-tachometer-alt"></i> Student Dashboard</h2>
                <p>Welcome back, ${user.name}</p>
            </div>
            
            <div class="dashboard-widgets">
                <!-- Today's Classes -->
                <div class="widget">
                    <div class="widget-header">
                        <h3 class="widget-title">
                            <i class="fas fa-calendar-day"></i> Today's Classes
                        </h3>
                        <span class="badge badge-primary">${todaysClasses.length}</span>
                    </div>
                    <div class="widget-content">
                        ${todaysClasses.length > 0 ? `
                            <div class="classes-list">
                                ${todaysClasses.map(cls => {
                                    const teacher = getTeacherName(cls.teacher);
                                    return `
                                        <div class="class-item">
                                            <div class="class-time">
                                                <strong>Period ${cls.period}</strong>
                                            </div>
                                            <div class="class-details">
                                                <h4>${cls.subject}</h4>
                                                <p>
                                                    <i class="fas fa-chalkboard-teacher"></i> ${teacher || 'TBA'}
                                                    <br>
                                                    <i class="fas fa-door-open"></i> ${cls.room || 'TBA'}
                                                </p>
                                            </div>
                                            <div class="class-type ${cls.type || 'theory'}">
                                                ${cls.type || 'theory'}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `
                            <div class="empty-state">
                                <i class="fas fa-coffee"></i>
                                <p>No classes scheduled for today</p>
                            </div>
                        `}
                    </div>
                </div>
                
                <!-- Tomorrow's Classes -->
                <div class="widget">
                    <div class="widget-header">
                        <h3 class="widget-title">
                            <i class="fas fa-calendar-check"></i> Tomorrow's Classes
                        </h3>
                        <span class="badge badge-primary">${tomorrowsClasses.length}</span>
                    </div>
                    <div class="widget-content">
                        ${tomorrowsClasses.length > 0 ? `
                            <div class="classes-list">
                                ${tomorrowsClasses.slice(0, 3).map(cls => {
                                    const teacher = getTeacherName(cls.teacher);
                                    return `
                                        <div class="class-item">
                                            <div class="class-time">
                                                <strong>Period ${cls.period}</strong>
                                            </div>
                                            <div class="class-details">
                                                <h4>${cls.subject}</h4>
                                                <p>
                                                    <i class="fas fa-chalkboard-teacher"></i> ${teacher || 'TBA'}
                                                    <br>
                                                    <i class="fas fa-door-open"></i> ${cls.room || 'TBA'}
                                                </p>
                                            </div>
                                            <div class="class-type ${cls.type || 'theory'}">
                                                ${cls.type || 'theory'}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            ${tomorrowsClasses.length > 3 ? `
                                <div class="widget-footer">
                                    <a href="#" class="view-all-link" data-page="timetable">
                                        View all ${tomorrowsClasses.length} classes <i class="fas fa-arrow-right"></i>
                                    </a>
                                </div>
                            ` : ''}
                        ` : `
                            <div class="empty-state">
                                <i class="fas fa-calendar-times"></i>
                                <p>No classes scheduled for tomorrow</p>
                            </div>
                        `}
                    </div>
                </div>
                
                <!-- Quick Stats -->
                <div class="widget">
                    <div class="widget-header">
                        <h3 class="widget-title">
                            <i class="fas fa-chart-line"></i> Weekly Overview
                        </h3>
                    </div>
                    <div class="widget-content">
                        <div class="weekly-stats">
                            <div class="stat-item">
                                <div class="stat-value" id="total-classes">0</div>
                                <div class="stat-label">Weekly Classes</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" id="attendance">95%</div>
                                <div class="stat-label">Attendance</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" id="subjects">6</div>
                                <div class="stat-label">Subjects</div>
                            </div>
                        </div>
                        <div class="attendance-chart">
                            <canvas id="attendanceChart" height="150"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="widget">
                    <div class="widget-header">
                        <h3 class="widget-title">
                            <i class="fas fa-bolt"></i> Quick Actions
                        </h3>
                    </div>
                    <div class="widget-content">
                        <div class="actions-grid">
                            <button class="action-btn" data-page="timetable">
                                <i class="fas fa-calendar-alt"></i>
                                <span>View Timetable</span>
                            </button>
                            <button class="action-btn" data-page="teachers">
                                <i class="fas fa-search"></i>
                                <span>Find Teacher</span>
                            </button>
                            <button class="action-btn" data-page="rooms">
                                <i class="fas fa-door-open"></i>
                                <span>Find Room</span>
                            </button>
                            <button class="action-btn" data-page="resources">
                                <i class="fas fa-download"></i>
                                <span>Download Notes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Next Class -->
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-clock"></i> Next Class
                    </h3>
                </div>
                <div class="card-content" id="next-class-container">
                    <!-- Next class will be loaded here -->
                    <div class="empty-state">
                        <i class="fas fa-clock"></i>
                        <p>Finding your next class...</p>
                    </div>
                </div>
            </div>
            
            <!-- Announcements -->
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-bullhorn"></i> Announcements
                    </h3>
                    <button class="btn-secondary btn-sm" id="refresh-announcements">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
                <div class="card-content">
                    <div class="announcements-list" id="announcements-list">
                        <!-- Announcements will be loaded here -->
                    </div>
                </div>
            </div>
        `;
        
        // Load data
        loadWeeklyStats();
        loadNextClass();
        loadAnnouncements();
        
        // Create attendance chart
        setTimeout(() => {
            createAttendanceChart();
        }, 100);
        
        // Add event listeners
        setTimeout(() => {
            document.getElementById('refresh-announcements')?.addEventListener('click', loadAnnouncements);
            
            // Action buttons
            document.querySelectorAll('.action-btn[data-page]').forEach(btn => {
                btn.addEventListener('click', function() {
                    const page = this.getAttribute('data-page');
                    showPage(page);
                });
            });
            
            // View all link
            document.querySelector('.view-all-link')?.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                showPage(page);
            });
        }, 100);
    }
    
    function getTeacherName(teacherId) {
        if (!teacherId) return null;
        
        const teachers = DataManager.getTeachers(institute.code);
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher ? teacher.name : null;
    }
    
    function loadWeeklyStats() {
        if (!studentTimetable || !studentTimetable.schedule) return;
        
        let totalClasses = 0;
        Object.values(studentTimetable.schedule).forEach(daySchedule => {
            totalClasses += daySchedule.filter(cls => cls.subject).length;
        });
        
        // Count unique subjects
        const subjects = new Set();
        Object.values(studentTimetable.schedule).forEach(daySchedule => {
            daySchedule.forEach(cls => {
                if (cls.subject) subjects.add(cls.subject);
            });
        });
        
        // Update stats
        const totalClassesEl = document.getElementById('total-classes');
        const subjectsEl = document.getElementById('subjects');
        
        if (totalClassesEl) totalClassesEl.textContent = totalClasses;
        if (subjectsEl) subjectsEl.textContent = subjects.size;
    }
    
    function loadNextClass() {
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        let nextClass = null;
        let nextPeriod = null;
        
        if (studentTimetable && studentTimetable.schedule && studentTimetable.schedule[currentDay]) {
            const todaySchedule = studentTimetable.schedule[currentDay];
            
            // Simple logic to find next class based on current time
            // In a real implementation, you'd compare with actual period times
            const currentPeriod = Math.floor((currentHour - 9) + (currentMinute / 60));
            
            for (let i = currentPeriod; i < todaySchedule.length; i++) {
                if (todaySchedule[i] && todaySchedule[i].subject) {
                    nextClass = todaySchedule[i];
                    nextPeriod = i + 1;
                    break;
                }
            }
        }
        
        const container = document.getElementById('next-class-container');
        if (!container) return;
        
        if (!nextClass) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>No more classes scheduled for today</p>
                </div>
            `;
            return;
        }
        
        const teacherName = getTeacherName(nextClass.teacher);
        const periodTimes = {
            1: '9:00 AM - 10:00 AM',
            2: '10:00 AM - 11:00 AM',
            3: '11:00 AM - 12:00 PM',
            4: '12:00 PM - 1:00 PM',
            5: '2:00 PM - 3:00 PM',
            6: '3:00 PM - 4:00 PM',
            7: '4:00 PM - 5:00 PM'
        };
        
        container.innerHTML = `
            <div class="next-class-card">
                <div class="next-class-time">
                    <div class="time-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="time-details">
                        <h3>Period ${nextPeriod}</h3>
                        <p>${periodTimes[nextPeriod] || 'Time not specified'}</p>
                    </div>
                </div>
                <div class="next-class-details">
                    <h3>${nextClass.subject}</h3>
                    <p>
                        <i class="fas fa-chalkboard-teacher"></i> ${teacherName || 'TBA'}
                        <br>
                        <i class="fas fa-door-open"></i> ${nextClass.room || 'TBA'}
                    </p>
                    <div class="next-class-actions">
                        <button class="btn-primary btn-sm" id="view-class-details">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                    </div>
                </div>
                <div class="next-class-type ${nextClass.type || 'theory'}">
                    ${nextClass.type || 'theory'}
                </div>
            </div>
        `;
        
        // Add event listener for details button
        setTimeout(() => {
            document.getElementById('view-class-details')?.addEventListener('click', function() {
                showClassDetails(nextClass, nextPeriod, currentDay);
            });
        }, 100);
    }
    
    function showClassDetails(cls, period, day) {
        const teacherName = getTeacherName(cls.teacher);
        
        Utils.createModal({
            title: 'Class Details',
            content: `
                <div class="class-details-modal">
                    <div class="detail-row">
                        <strong>Subject:</strong> ${cls.subject}
                    </div>
                    <div class="detail-row">
                        <strong>Teacher:</strong> ${teacherName || 'TBA'}
                    </div>
                    <div class="detail-row">
                        <strong>Room:</strong> ${cls.room || 'TBA'}
                    </div>
                    <div class="detail-row">
                        <strong>Day:</strong> ${day}
                    </div>
                    <div class="detail-row">
                        <strong>Period:</strong> ${period}
                    </div>
                    <div class="detail-row">
                        <strong>Type:</strong> ${cls.type || 'theory'}
                    </div>
                    ${cls.merged ? `
                        <div class="detail-row">
                            <strong>Duration:</strong> 2 periods (merged)
                        </div>
                    ` : ''}
                </div>
            `,
            confirmText: 'Close'
        });
    }
    
    function createAttendanceChart() {
        const ctx = document.getElementById('attendanceChart')?.getContext('2d');
        if (!ctx) return;
        
        // Mock attendance data for demo
        const attendanceData = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [{
                label: 'Attendance %',
                data: [92, 88, 95, 100, 90, 85],
                backgroundColor: 'rgba(76, 201, 240, 0.7)',
                borderColor: 'rgba(76, 201, 240, 1)',
                borderWidth: 1,
                tension: 0.4
            }]
        };
        
        new Chart(ctx, {
            type: 'line',
            data: attendanceData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 80,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Attendance: ${context.parsed.y}%`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    function loadAnnouncements() {
        // Mock announcements for demo
        const announcements = [
            {
                id: 1,
                title: 'Mid-Term Exam Schedule',
                message: 'Mid-term exams will be held from November 15-22. Check the notice board for detailed schedule.',
                date: '2 days ago',
                priority: 'high',
                icon: 'fas fa-exclamation-circle'
            },
            {
                id: 2,
                title: 'Library Extended Hours',
                message: 'Library will remain open till 8 PM during exam preparation weeks.',
                date: '3 days ago',
                priority: 'medium',
                icon: 'fas fa-book'
            },
            {
                id: 3,
                title: 'Sports Week Registration',
                message: 'Registration for annual sports week is now open. Last date: October 25.',
                date: '1 week ago',
                priority: 'medium',
                icon: 'fas fa-running'
            },
            {
                id: 4,
                title: 'New Online Portal',
                message: 'Access study materials and assignments through the new student portal.',
                date: '2 weeks ago',
                priority: 'low',
                icon: 'fas fa-laptop'
            }
        ];
        
        const container = document.getElementById('announcements-list');
        if (!container) return;
        
        container.innerHTML = announcements.map(announcement => `
            <div class="announcement-item ${announcement.priority}">
                <div class="announcement-icon">
                    <i class="${announcement.icon}"></i>
                </div>
                <div class="announcement-details">
                    <h4>${announcement.title}</h4>
                    <p>${announcement.message}</p>
                    <span class="announcement-date">${announcement.date}</span>
                </div>
            </div>
        `).join('');
    }
    
    function setupEventListeners() {
        // Navigation
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                const page = this.getAttribute('data-page');
                if (!page) return;
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Show selected page
                showPage(page);
            });
        });
        
        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                Utils.logout();
            });
        }
    }
    
    function showPage(pageName) {
        // Hide all pages
        pages.forEach(page => page.classList.remove('active'));
        
        // Show selected page
        const page = document.getElementById(`page-${pageName}`);
        if (page) {
            page.classList.add('active');
            currentPage = pageName;
            updatePageTitle(pageName.charAt(0).toUpperCase() + pageName.slice(1));
            
            // Load page-specific content
            loadPageContent(pageName);
        }
        
        // Close mobile menu if open
        document.querySelector('.sidebar').classList.remove('active');
    }
    
    function loadPageContent(pageName) {
        switch (pageName) {
            case 'timetable':
                loadTimetablePage();
                break;
            case 'teachers':
                loadTeachersPage();
                break;
            case 'rooms':
                loadRoomsPage();
                break;
            case 'resources':
                loadResourcesPage();
                break;
            case 'calendar':
                loadCalendarPage();
                break;
        }
    }
    
    function loadTimetablePage() {
        const page = document.getElementById('page-timetable');
        if (!page) return;
        
        if (!studentTimetable) {
            page.innerHTML = `
                <div class="page-header">
                    <h2><i class="fas fa-calendar-alt"></i> My Timetable</h2>
                    <p>Your class schedule is not available</p>
                </div>
                
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>Timetable Not Found</h3>
                    <p>Please contact your department for timetable information</p>
                </div>
            `;
            return;
        }
        
        const masterTimetable = DataManager.getMasterTimetable(institute.code);
        const schedule = studentTimetable.schedule || {};
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-calendar-alt"></i> My Timetable</h2>
                <p>${getYearText(studentTimetable.year)} ${studentTimetable.department} - Division ${studentTimetable.division}</p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-calendar-week"></i> Weekly Schedule
                    </h3>
                    <div class="timetable-controls">
                        <button class="btn-primary" id="export-timetable">
                            <i class="fas fa-download"></i> Export
                        </button>
                        <button class="btn-secondary" id="print-timetable">
                            <i class="fas fa-print"></i> Print
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <div class="timetable-container">
                        <div class="timetable-main">
                            <table class="timetable">
                                <thead>
                                    <tr>
                                        <th class="period-header">Period</th>
                                        <th class="time-header">Time</th>
                                        ${masterTimetable.days.map(day => `
                                            <th>${day}</th>
                                        `).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${masterTimetable.periods.map((period, periodIndex) => `
                                        <tr>
                                            <td class="period-header">${periodIndex + 1}</td>
                                            <td class="time-header">${period.start} - ${period.end}</td>
                                            ${masterTimetable.days.map(day => {
                                                const slot = schedule[day]?.[periodIndex] || {};
                                                return `
                                                    <td class="timetable-cell ${slot.subject ? 'booked' : 'empty'}">
                                                        ${slot.subject ? `
                                                            <div class="timetable-cell-content">
                                                                <div class="timetable-cell-subject">${slot.subject}</div>
                                                                <div class="timetable-cell-teacher">
                                                                    ${getTeacherName(slot.teacher) || 'TBA'}
                                                                </div>
                                                                <div class="timetable-cell-room">
                                                                    <i class="fas fa-door-open"></i> ${slot.room || 'TBA'}
                                                                </div>
                                                                <span class="timetable-cell-type ${slot.type || 'theory'}">
                                                                    ${slot.type || 'theory'}
                                                                </span>
                                                                ${slot.merged ? `
                                                                    <div class="merge-indicator">
                                                                        <i class="fas fa-link"></i>
                                                                    </div>
                                                                ` : ''}
                                                            </div>
                                                        ` : 'Free'}
                                                    </td>
                                                `;
                                            }).join('')}
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-list"></i> Subject List
                    </h3>
                </div>
                <div class="card-content">
                    <div class="subjects-grid" id="subjects-grid">
                        <!-- Subjects will be loaded here -->
                    </div>
                </div>
            </div>
        `;
        
        // Load subjects
        setTimeout(() => {
            loadSubjectsList();
            
            // Add event listeners
            document.getElementById('export-timetable')?.addEventListener('click', exportTimetable);
            document.getElementById('print-timetable')?.addEventListener('click', printTimetable);
        }, 100);
    }
    
    function loadSubjectsList() {
        if (!studentTimetable || !studentTimetable.schedule) return;
        
        // Get unique subjects with their teachers
        const subjectsMap = new Map();
        
        Object.values(studentTimetable.schedule).forEach(daySchedule => {
            daySchedule.forEach(slot => {
                if (slot.subject) {
                    if (!subjectsMap.has(slot.subject)) {
                        subjectsMap.set(slot.subject, {
                            subject: slot.subject,
                            teacher: slot.teacher,
                            type: slot.type,
                            count: 0
                        });
                    }
                    const subjectData = subjectsMap.get(slot.subject);
                    subjectData.count++;
                }
            });
        });
        
        const subjects = Array.from(subjectsMap.values());
        const container = document.getElementById('subjects-grid');
        if (!container) return;
        
        if (subjects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <p>No subjects found in your timetable</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = subjects.map(subject => {
            const teacherName = getTeacherName(subject.teacher);
            return `
                <div class="subject-card">
                    <div class="subject-header">
                        <h4>${subject.subject}</h4>
                        <span class="badge ${subject.type === 'lab' ? 'badge-warning' : 'badge-primary'}">
                            ${subject.type || 'theory'}
                        </span>
                    </div>
                    <div class="subject-details">
                        <p><i class="fas fa-chalkboard-teacher"></i> ${teacherName || 'TBA'}</p>
                        <p><i class="fas fa-clock"></i> ${subject.count} periods/week</p>
                    </div>
                    <div class="subject-actions">
                        <button class="btn-secondary btn-sm view-subject-btn" data-subject="${subject.subject}">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners for subject buttons
        container.querySelectorAll('.view-subject-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const subjectName = this.getAttribute('data-subject');
                viewSubjectDetails(subjectName);
            });
        });
    }
    
    function viewSubjectDetails(subjectName) {
        if (!studentTimetable || !studentTimetable.schedule) return;
        
        // Find all occurrences of this subject
        const occurrences = [];
        Object.entries(studentTimetable.schedule).forEach(([day, daySchedule]) => {
            daySchedule.forEach((slot, periodIndex) => {
                if (slot.subject === subjectName) {
                    occurrences.push({
                        day,
                        period: periodIndex + 1,
                        teacher: slot.teacher,
                        room: slot.room,
                        type: slot.type
                    });
                }
            });
        });
        
        const teacherName = occurrences.length > 0 ? getTeacherName(occurrences[0].teacher) : 'TBA';
        
        Utils.createModal({
            title: `Subject: ${subjectName}`,
            content: `
                <div class="subject-details-modal">
                    <div class="detail-row">
                        <strong>Teacher:</strong> ${teacherName}
                    </div>
                    <div class="detail-row">
                        <strong>Total Classes:</strong> ${occurrences.length} per week
                    </div>
                    
                    <h4>Schedule:</h4>
                    <div class="subject-schedule">
                        ${occurrences.length > 0 ? `
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Day</th>
                                        <th>Period</th>
                                        <th>Room</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${occurrences.map(occ => `
                                        <tr>
                                            <td>${occ.day}</td>
                                            <td>${occ.period}</td>
                                            <td>${occ.room || 'TBA'}</td>
                                            <td>${occ.type || 'theory'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<p>No schedule information available</p>'}
                    </div>
                </div>
            `,
            size: 'medium'
        });
    }
    
    function loadTeachersPage() {
        const page = document.getElementById('page-teachers');
        if (!page) return;
        
        const teachers = DataManager.getTeachers(institute.code);
        const allTimetables = DataManager.getAllTimetables(institute.code);
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-chalkboard-teacher"></i> Teacher Availability</h2>
                <p>Find teachers and check their availability</p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-search"></i> Find Teacher
                    </h3>
                </div>
                <div class="card-content">
                    <div class="filter-bar">
                        <div class="filter-group">
                            <label for="teacher-search">Search Teacher</label>
                            <div class="search-bar">
                                <i class="fas fa-search"></i>
                                <input type="text" id="teacher-search" placeholder="Search by name or department">
                            </div>
                        </div>
                        
                        <div class="filter-group">
                            <label for="department-filter">Department</label>
                            <select id="department-filter">
                                <option value="">All Departments</option>
                                ${Array.from(new Set(teachers.map(t => t.department))).map(dept => 
                                    `<option value="${dept}">${dept}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="day-filter">Day</label>
                            <select id="day-filter">
                                <option value="">All Days</option>
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="teachers-list-container">
                <div class="teachers-grid" id="teachers-grid">
                    <!-- Teachers will be loaded here -->
                    ${teachers.map(teacher => {
                        const workload = DataManager.getTeacherWorkload(institute.code, teacher.id);
                        return `
                            <div class="teacher-card" data-teacher="${teacher.id}" data-department="${teacher.department}">
                                <div class="teacher-avatar">
                                    <i class="fas fa-user-tie"></i>
                                </div>
                                <div class="teacher-details">
                                    <h4>${teacher.name}</h4>
                                    <p class="teacher-code">${teacher.code}</p>
                                    <p class="teacher-dept">${teacher.department} Department</p>
                                    <p class="teacher-email">${teacher.email}</p>
                                </div>
                                <div class="teacher-workload">
                                    <div class="workload-bar-small">
                                        <div class="workload-fill" style="width: ${(workload.weekly / 30) * 100}%"></div>
                                        <span>${workload.weekly} hrs/week</span>
                                    </div>
                                    <button class="btn-secondary btn-sm view-availability-btn" data-teacher="${teacher.id}">
                                        <i class="fas fa-calendar-check"></i> Check Availability
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-question-circle"></i> How to Find Teachers
                    </h3>
                </div>
                <div class="card-content">
                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fas fa-search"></i>
                            <h4>Search by Name</h4>
                            <p>Use the search bar to find teachers by name or code</p>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-filter"></i>
                            <h4>Filter by Department</h4>
                            <p>Narrow down results by selecting a specific department</p>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <h4>Check Availability</h4>
                            <p>Click "Check Availability" to see when a teacher is free</p>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-envelope"></i>
                            <h4>Contact Information</h4>
                            <p>Find teacher email addresses for communication</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for filtering
        setTimeout(() => {
            setupTeacherFilters();
            
            // Add availability button handlers
            document.querySelectorAll('.view-availability-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const teacherId = this.getAttribute('data-teacher');
                    viewTeacherAvailability(teacherId);
                });
            });
        }, 100);
    }
    
    function setupTeacherFilters() {
        const searchInput = document.getElementById('teacher-search');
        const departmentFilter = document.getElementById('department-filter');
        const dayFilter = document.getElementById('day-filter');
        const teacherCards = document.querySelectorAll('.teacher-card');
        
        const filterTeachers = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const selectedDept = departmentFilter.value;
            const selectedDay = dayFilter.value;
            
            teacherCards.forEach(card => {
                const teacherName = card.querySelector('h4').textContent.toLowerCase();
                const teacherCode = card.querySelector('.teacher-code').textContent.toLowerCase();
                const teacherDept = card.getAttribute('data-department');
                const teacherId = card.getAttribute('data-teacher');
                
                let matchesSearch = searchTerm === '' || 
                    teacherName.includes(searchTerm) || 
                    teacherCode.includes(searchTerm);
                
                let matchesDept = selectedDept === '' || teacherDept === selectedDept;
                
                // Day filter would require additional logic to check teacher's schedule
                // For now, we'll just show all if day is selected
                let matchesDay = selectedDay === ''; // Simplified for demo
                
                const shouldShow = matchesSearch && matchesDept && matchesDay;
                card.style.display = shouldShow ? 'flex' : 'none';
            });
        };
        
        searchInput.addEventListener('input', Utils.debounce(filterTeachers, 300));
        departmentFilter.addEventListener('change', filterTeachers);
        dayFilter.addEventListener('change', filterTeachers);
    }
    
    function viewTeacherAvailability(teacherId) {
        const teacher = DataManager.getTeachers(institute.code).find(t => t.id === teacherId);
        if (!teacher) return;
        
        const workload = DataManager.getTeacherWorkload(institute.code, teacherId);
        const allTimetables = DataManager.getAllTimetables(institute.code);
        const masterTimetable = DataManager.getMasterTimetable(institute.code);
        
        // Get teacher's schedule
        const teacherSchedule = {};
        masterTimetable.days.forEach(day => {
            teacherSchedule[day] = Array(masterTimetable.periods.length).fill(null);
        });
        
        Object.values(allTimetables).forEach(timetable => {
            Object.entries(timetable.schedule || {}).forEach(([day, periods]) => {
                periods.forEach((period, periodIndex) => {
                    if (period.teacher === teacherId && period.subject) {
                        teacherSchedule[day][periodIndex] = {
                            ...period,
                            department: timetable.department,
                            year: timetable.year,
                            division: timetable.division
                        };
                    }
                });
            });
        });
        
        Utils.createModal({
            title: `${teacher.name}'s Availability`,
            content: `
                <div class="teacher-availability-modal">
                    <div class="teacher-info">
                        <div class="teacher-avatar-large">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="teacher-details-large">
                            <h3>${teacher.name}</h3>
                            <p><strong>Code:</strong> ${teacher.code}</p>
                            <p><strong>Department:</strong> ${teacher.department}</p>
                            <p><strong>Email:</strong> ${teacher.email}</p>
                            <p><strong>Weekly Workload:</strong> ${workload.weekly} hours</p>
                        </div>
                    </div>
                    
                    <div class="availability-table">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    <th>Period 1</th>
                                    <th>Period 2</th>
                                    <th>Period 3</th>
                                    <th>Period 4</th>
                                    <th>Period 5</th>
                                    <th>Period 6</th>
                                    <th>Period 7</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${masterTimetable.days.map(day => `
                                    <tr>
                                        <td><strong>${day}</strong></td>
                                        ${teacherSchedule[day].map((slot, periodIndex) => `
                                            <td class="${slot ? 'busy' : 'free'}">
                                               ${slot ? `
                                                  <div class="compact-slot">
                                                      <strong>${slot.subject}</strong><br>
                                                      <small>${slot.department} ${slot.year}${slot.division}</small><br>
                                                      <small>${slot.room || ''}</small>
                                                  </div>
                                                ` : 'Free'}
                                            </td>
                                        `).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="availability-legend">
                        <div class="legend-item">
                            <span class="legend-color free"></span>
                            <span>Free / Available</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color busy"></span>
                            <span>Busy / Teaching</span>
                        </div>
                    </div>
                </div>
            `,
            size: 'large'
        });
    }
    
    function loadRoomsPage() {
        const page = document.getElementById('page-rooms');
        if (!page) return;
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-door-open"></i> Available Rooms</h2>
                <p>Find available classrooms and laboratories</p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-search"></i> Check Room Availability
                    </h3>
                </div>
                <div class="card-content">
                    <div class="filter-bar">
                        <div class="filter-group">
                            <label for="room-date">Date</label>
                            <input type="date" id="room-date" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="filter-group">
                            <label for="room-period">Period</label>
                            <select id="room-period">
                                <option value="1">Period 1 (9:00-10:00)</option>
                                <option value="2">Period 2 (10:00-11:00)</option>
                                <option value="3" selected>Period 3 (11:00-12:00)</option>
                                <option value="4">Period 4 (12:00-13:00)</option>
                                <option value="5">Period 5 (14:00-15:00)</option>
                                <option value="6">Period 6 (15:00-16:00)</option>
                                <option value="7">Period 7 (16:00-17:00)</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="room-type-filter">Room Type</label>
                            <select id="room-type-filter">
                                <option value="">All Types</option>
                                <option value="classroom">Classroom</option>
                                <option value="lab">Laboratory</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label>&nbsp;</label>
                            <button class="btn-primary" id="check-room-availability">
                                <i class="fas fa-search"></i> Check Availability
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="rooms-availability-container">
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Select Date and Period</h3>
                    <p>Use the filters above to check room availability</p>
                </div>
            </div>
            
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-building"></i> All Rooms
                    </h3>
                </div>
                <div class="card-content">
                    <div class="rooms-directory" id="rooms-directory">
                        <!-- All rooms will be loaded here -->
                    </div>
                </div>
            </div>
        `;
        
        // Load rooms directory
        setTimeout(() => {
            loadRoomsDirectory();
            
            // Add event listeners
            document.getElementById('check-room-availability')?.addEventListener('click', checkRoomAvailability);
        }, 100);
    }
    
    function loadRoomsDirectory() {
        const infrastructure = DataManager.getInfrastructure(institute.code);
        const container = document.getElementById('rooms-directory');
        
        if (!container) return;
        
        if (infrastructure.rooms.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-door-closed"></i>
                    <p>No rooms found in the institute</p>
                </div>
            `;
            return;
        }
        
        // Group rooms by building
        const roomsByBuilding = {};
        infrastructure.rooms.forEach(room => {
            const building = infrastructure.buildings.find(b => b.id === room.building);
            const buildingName = building ? building.name : room.building;
            
            if (!roomsByBuilding[buildingName]) {
                roomsByBuilding[buildingName] = [];
            }
            roomsByBuilding[buildingName].push(room);
        });
        
        container.innerHTML = Object.entries(roomsByBuilding).map(([buildingName, rooms]) => `
            <div class="building-section">
                <h4><i class="fas fa-building"></i> ${buildingName}</h4>
                <div class="rooms-list">
                    ${rooms.map(room => `
                        <div class="room-directory-item">
                            <div class="room-info">
                                <h5>Room ${room.number}</h5>
                                <p>Floor ${room.floor} • ${room.type} • Capacity: ${room.capacity}</p>
                                ${room.labType ? `<p class="lab-type">${room.labType} Lab</p>` : ''}
                            </div>
                            <div class="room-status-indicator available">
                                <i class="fas fa-check-circle"></i>
                                <span>Usually Available</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
    
    function checkRoomAvailability() {
        const date = document.getElementById('room-date').value;
        const period = parseInt(document.getElementById('room-period').value);
        const roomType = document.getElementById('room-type-filter').value;
        
        if (!date) {
            Utils.showNotification('Please select a date', 'error');
            return;
        }
        
        const availableRooms = DataManager.getAvailableRooms(institute.code, date, period);
        const infrastructure = DataManager.getInfrastructure(institute.code);
        
        // Filter by room type if specified
        let filteredRooms = availableRooms;
        if (roomType) {
            filteredRooms = availableRooms.filter(room => room.type === roomType);
        }
        
        const container = document.getElementById('rooms-availability-container');
        if (!container) return;
        
        if (filteredRooms.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-door-closed"></i>
                    <h3>No Rooms Available</h3>
                    <p>No ${roomType ? roomType + ' ' : ''}rooms are available for the selected criteria</p>
                    <button class="btn-secondary mt-2" id="try-different-search">
                        <i class="fas fa-search"></i> Try Different Search
                    </button>
                </div>
            `;
            
            setTimeout(() => {
                document.getElementById('try-different-search')?.addEventListener('click', function() {
                    // Reset filters
                    document.getElementById('room-type-filter').value = '';
                    // Keep current date and period
                });
            }, 100);
            
            return;
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-door-open"></i> Available Rooms
                    </h3>
                    <span class="badge badge-success">${filteredRooms.length} rooms available</span>
                </div>
                <div class="card-content">
                    <div class="rooms-grid">
                        ${filteredRooms.map(room => {
                            const building = infrastructure.buildings.find(b => b.id === room.building);
                            return `
                                <div class="room-card">
                                    <div class="room-card-header">
                                        <h4>Room ${room.number}</h4>
                                        <span class="room-status available">
                                            <i class="fas fa-check-circle"></i> Available
                                        </span>
                                    </div>
                                    <div class="room-card-details">
                                        <p><i class="fas fa-building"></i> ${building ? building.name : room.building}</p>
                                        <p><i class="fas fa-layer-group"></i> Floor ${room.floor}</p>
                                        <p><i class="fas fa-users"></i> Capacity: ${room.capacity}</p>
                                        <p><i class="fas fa-tag"></i> ${room.type} ${room.labType ? `(${room.labType})` : ''}</p>
                                    </div>
                                    <div class="room-card-actions">
                                        <button class="btn-secondary btn-sm view-room-details" data-room="${room.id}">
                                            <i class="fas fa-info-circle"></i> Details
                                        </button>
                                        <button class="btn-primary btn-sm get-directions" data-room="${room.id}">
                                            <i class="fas fa-directions"></i> Directions
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Add event handlers
        container.querySelectorAll('.view-room-details').forEach(btn => {
            btn.addEventListener('click', function() {
                const roomId = this.getAttribute('data-room');
                viewRoomDetails(roomId);
            });
        });
        
        container.querySelectorAll('.get-directions').forEach(btn => {
            btn.addEventListener('click', function() {
                const roomId = this.getAttribute('data-room');
                showDirections(roomId);
            });
        });
    }
    
    function viewRoomDetails(roomId) {
        const infrastructure = DataManager.getInfrastructure(institute.code);
        const room = infrastructure.rooms.find(r => r.id === roomId);
        
        if (!room) return;
        
        const building = infrastructure.buildings.find(b => b.id === room.building);
        
        Utils.createModal({
            title: `Room ${room.number} Details`,
            content: `
                <div class="room-details-modal">
                    <div class="room-info-large">
                        <div class="room-icon">
                            <i class="fas fa-door-open"></i>
                        </div>
                        <div class="room-details-text">
                            <h3>Room ${room.number}</h3>
                            <p><strong>Building:</strong> ${building ? building.name : room.building}</p>
                            <p><strong>Floor:</strong> ${room.floor}</p>
                            <p><strong>Type:</strong> ${room.type}</p>
                            ${room.labType ? `<p><strong>Lab Type:</strong> ${room.labType}</p>` : ''}
                            <p><strong>Capacity:</strong> ${room.capacity} students</p>
                        </div>
                    </div>
                    
                    <div class="room-equipment">
                        <h4>Equipment & Facilities</h4>
                        <ul>
                            ${room.type === 'lab' ? `
                                <li><i class="fas fa-check"></i> Lab equipment available</li>
                                <li><i class="fas fa-check"></i> Computer workstations</li>
                                <li><i class="fas fa-check"></i> Safety equipment</li>
                            ` : `
                                <li><i class="fas fa-check"></i> Whiteboard/Blackboard</li>
                                <li><i class="fas fa-check"></i> Projector screen</li>
                                <li><i class="fas fa-check"></i> Air conditioning</li>
                            `}
                            <li><i class="fas fa-check"></i> Wi-Fi connectivity</li>
                            <li><i class="fas fa-check"></i> Power outlets</li>
                        </ul>
                    </div>
                    
                    <div class="room-access">
                        <h4>Access Information</h4>
                        <p><i class="fas fa-info-circle"></i> This room is accessible during institute hours (8:00 AM - 6:00 PM)</p>
                        ${room.type === 'lab' ? 
                            '<p><i class="fas fa-exclamation-triangle"></i> Lab access requires faculty permission</p>' : 
                            '<p><i class="fas fa-check-circle"></i> Classroom available for study when not scheduled</p>'
                        }
                    </div>
                </div>
            `,
            confirmText: 'Close'
        });
    }
    
    function showDirections(roomId) {
        const infrastructure = DataManager.getInfrastructure(institute.code);
        const room = infrastructure.rooms.find(r => r.id === roomId);
        
        if (!room) return;
        
        const building = infrastructure.buildings.find(b => b.id === room.building);
        
        Utils.createModal({
            title: `Directions to Room ${room.number}`,
            content: `
                <div class="directions-modal">
                    <div class="directions-header">
                        <h3><i class="fas fa-map-marker-alt"></i> ${building ? building.name : room.building}</h3>
                        <p>Floor ${room.floor}, Room ${room.number}</p>
                    </div>
                    
                    <div class="directions-steps">
                        <div class="step">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h4>Enter the Main Gate</h4>
                                <p>Enter through the institute's main entrance</p>
                            </div>
                        </div>
                        
                        <div class="step">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h4>Go to ${building ? building.name : room.building}</h4>
                                <p>The building is located ${getBuildingLocation(building ? building.name : room.building)}</p>
                            </div>
                        </div>
                        
                        <div class="step">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h4>Take the Elevator/Stairs</h4>
                                <p>Go to Floor ${room.floor}</p>
                            </div>
                        </div>
                        
                        <div class="step">
                            <div class="step-number">4</div>
                            <div class="step-content">
                                <h4>Find Room ${room.number}</h4>
                                <p>Room is located ${getRoomLocationHint(room.floor, room.number)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="directions-map">
                        <div class="map-placeholder">
                            <i class="fas fa-map"></i>
                            <p>Building layout map would be displayed here</p>
                        </div>
                    </div>
                </div>
            `,
            size: 'medium'
        });
    }
    
    function getBuildingLocation(buildingName) {
        const locations = {
            'Main Building': 'in the center of the campus',
            'Science Block': 'next to the library',
            'Engineering Wing': 'behind the main building',
            'Computer Center': 'near the campus entrance'
        };
        
        return locations[buildingName] || 'on the campus';
    }
    
    function getRoomLocationHint(floor, roomNumber) {
        if (roomNumber.startsWith('1')) return 'near the elevator on the right side';
        if (roomNumber.startsWith('2')) return 'at the end of the corridor';
        if (roomNumber.startsWith('3')) return 'opposite to the washrooms';
        return 'in the main corridor';
    }
    
    function loadResourcesPage() {
        const page = document.getElementById('page-resources');
        if (!page) return;
        
        // Mock resources data
        const resources = {
            notes: [
                { id: 1, name: 'Data Structures Notes', subject: 'Data Structures', type: 'PDF', size: '2.4 MB', uploaded: '2 days ago' },
                { id: 2, name: 'Mathematics II Formula Sheet', subject: 'Mathematics', type: 'PDF', size: '1.1 MB', uploaded: '1 week ago' },
                { id: 3, name: 'Database Systems Slides', subject: 'Database Systems', type: 'PPT', size: '4.2 MB', uploaded: '3 days ago' },
                { id: 4, name: 'Computer Networks Lab Manual', subject: 'Computer Networks', type: 'DOC', size: '3.8 MB', uploaded: '2 weeks ago' }
            ],
            assignments: [
                { id: 1, name: 'DS Assignment 3', subject: 'Data Structures', dueDate: '2023-10-25', status: 'pending' },
                { id: 2, name: 'DBMS Project Proposal', subject: 'Database Systems', dueDate: '2023-10-30', status: 'submitted' },
                { id: 3, name: 'Maths II Homework', subject: 'Mathematics', dueDate: '2023-10-20', status: 'pending' }
            ],
            books: [
                { id: 1, name: 'Introduction to Algorithms', author: 'Cormen et al.', available: true, location: 'Library Shelf A12' },
                { id: 2, name: 'Database System Concepts', author: 'Silberschatz', available: false, dueDate: '2023-10-28' },
                { id: 3, name: 'Computer Networking', author: 'Kurose & Ross', available: true, location: 'Library Shelf B05' }
            ]
        };
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-book"></i> Resources</h2>
                <p>Access study materials, assignments, and library resources</p>
            </div>
            
            <div class="tabs">
                <button class="tab active" data-tab="notes">Study Notes</button>
                <button class="tab" data-tab="assignments">Assignments</button>
                <button class="tab" data-tab="books">Library Books</button>
                <button class="tab" data-tab="links">Useful Links</button>
            </div>
            
            <div class="tab-content active" id="tab-notes">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-file-pdf"></i> Study Notes & Materials
                        </h3>
                        <button class="btn-primary btn-sm" id="upload-notes">
                            <i class="fas fa-upload"></i> Upload Notes
                        </button>
                    </div>
                    <div class="card-content">
                        <div class="resources-list">
                            ${resources.notes.map(note => `
                                <div class="resource-item">
                                    <div class="resource-icon">
                                        <i class="fas fa-file-pdf"></i>
                                    </div>
                                    <div class="resource-details">
                                        <h4>${note.name}</h4>
                                        <p>${note.subject} • ${note.type} • ${note.size}</p>
                                        <span class="resource-date">Uploaded ${note.uploaded}</span>
                                    </div>
                                    <div class="resource-actions">
                                        <button class="btn-secondary btn-sm preview-resource" data-id="${note.id}">
                                            <i class="fas fa-eye"></i> Preview
                                        </button>
                                        <button class="btn-primary btn-sm download-resource" data-id="${note.id}">
                                            <i class="fas fa-download"></i> Download
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="tab-assignments">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-tasks"></i> Assignments
                        </h3>
                    </div>
                    <div class="card-content">
                        <div class="assignments-list">
                            ${resources.assignments.map(assignment => {
                                const dueDate = new Date(assignment.dueDate);
                                const now = new Date();
                                const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                                let statusClass = assignment.status === 'submitted' ? 'badge-success' : 
                                                daysRemaining < 0 ? 'badge-danger' : 
                                                daysRemaining <= 2 ? 'badge-warning' : 'badge-primary';
                                
                                let statusText = assignment.status === 'submitted' ? 'Submitted' : 
                                                daysRemaining < 0 ? 'Overdue' : 
                                                `Due in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
                                
                                return `
                                    <div class="assignment-item ${assignment.status}">
                                        <div class="assignment-details">
                                            <h4>${assignment.name}</h4>
                                            <p>${assignment.subject} • Due: ${dueDate.toLocaleDateString()}</p>
                                        </div>
                                        <div class="assignment-status">
                                            <span class="badge ${statusClass}">${statusText}</span>
                                        </div>
                                        <div class="assignment-actions">
                                            ${assignment.status !== 'submitted' ? `
                                                <button class="btn-primary btn-sm submit-assignment" data-id="${assignment.id}">
                                                    <i class="fas fa-paper-plane"></i> Submit
                                                </button>
                                            ` : ''}
                                            <button class="btn-secondary btn-sm view-assignment" data-id="${assignment.id}">
                                                <i class="fas fa-eye"></i> View
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="tab-books">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-book-open"></i> Library Books
                        </h3>
                    </div>
                    <div class="card-content">
                        <div class="books-list">
                            ${resources.books.map(book => `
                                <div class="book-item">
                                    <div class="book-cover">
                                        <i class="fas fa-book"></i>
                                    </div>
                                    <div class="book-details">
                                        <h4>${book.name}</h4>
                                        <p>by ${book.author}</p>
                                        ${book.available ? `
                                            <p class="available-text">
                                                <i class="fas fa-check-circle"></i> Available at: ${book.location}
                                            </p>
                                        ` : `
                                            <p class="unavailable-text">
                                                <i class="fas fa-clock"></i> Due back: ${new Date(book.dueDate).toLocaleDateString()}
                                            </p>
                                        `}
                                    </div>
                                    <div class="book-actions">
                                        ${book.available ? `
                                            <button class="btn-primary btn-sm reserve-book" data-id="${book.id}">
                                                <i class="fas fa-bookmark"></i> Reserve
                                            </button>
                                        ` : `
                                            <button class="btn-secondary btn-sm notify-me" data-id="${book.id}">
                                                <i class="fas fa-bell"></i> Notify Me
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="tab-links">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-link"></i> Useful Links
                        </h3>
                    </div>
                    <div class="card-content">
                        <div class="links-grid">
                            <a href="#" class="link-card" target="_blank">
                                <i class="fas fa-graduation-cap"></i>
                                <h4>Online Learning Portal</h4>
                                <p>Access online courses and tutorials</p>
                            </a>
                            <a href="#" class="link-card" target="_blank">
                                <i class="fas fa-video"></i>
                                <h4>Lecture Recordings</h4>
                                <p>Watch recorded lectures</p>
                            </a>
                            <a href="#" class="link-card" target="_blank">
                                <i class="fas fa-question-circle"></i>
                                <h4>Student Support</h4>
                                <p>Get academic and technical support</p>
                            </a>
                            <a href="#" class="link-card" target="_blank">
                                <i class="fas fa-calendar-alt"></i>
                                <h4>Academic Calendar</h4>
                                <p>View important dates and events</p>
                            </a>
                            <a href="#" class="link-card" target="_blank">
                                <i class="fas fa-newspaper"></i>
                                <h4>Campus News</h4>
                                <p>Latest updates from the institute</p>
                            </a>
                            <a href="#" class="link-card" target="_blank">
                                <i class="fas fa-users"></i>
                                <h4>Student Forums</h4>
                                <p>Connect with fellow students</p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for tabs
        setTimeout(() => {
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabName = this.getAttribute('data-tab');
                    
                    // Update active tab
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Show selected tab content
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    document.getElementById(`tab-${tabName}`).classList.add('active');
                });
            });
            
            // Add resource download handlers
            document.querySelectorAll('.download-resource').forEach(btn => {
                btn.addEventListener('click', function() {
                    const resourceId = this.getAttribute('data-id');
                    downloadResource(resourceId);
                });
            });
            
            // Add assignment submission handlers
            document.querySelectorAll('.submit-assignment').forEach(btn => {
                btn.addEventListener('click', function() {
                    const assignmentId = this.getAttribute('data-id');
                    submitAssignment(assignmentId);
                });
            });
            
            // Add book reservation handlers
            document.querySelectorAll('.reserve-book').forEach(btn => {
                btn.addEventListener('click', function() {
                    const bookId = this.getAttribute('data-id');
                    reserveBook(bookId);
                });
            });
        }, 100);
    }
    
    function downloadResource(resourceId) {
        Utils.showNotification('Download started', 'success');
        // In a real implementation, this would trigger a file download
    }
    
    function submitAssignment(assignmentId) {
        Utils.createModal({
            title: 'Submit Assignment',
            content: `
                <div class="submit-assignment-modal">
                    <div class="form-group">
                        <label for="assignment-file">Upload Assignment File</label>
                        <input type="file" id="assignment-file" accept=".pdf,.doc,.docx,.zip">
                    </div>
                    <div class="form-group">
                        <label for="assignment-notes">Additional Notes (Optional)</label>
                        <textarea id="assignment-notes" rows="3" placeholder="Any comments or notes for the teacher"></textarea>
                    </div>
                </div>
            `,
            confirmText: 'Submit Assignment',
            onConfirm: function() {
                const fileInput = document.getElementById('assignment-file');
                if (!fileInput.files.length) {
                    Utils.showNotification('Please select a file to upload', 'error');
                    return;
                }
                
                Utils.showNotification('Assignment submitted successfully', 'success');
                // In a real implementation, this would upload the file
            }
        });
    }
    
    function reserveBook(bookId) {
        Utils.createModal({
            title: 'Reserve Book',
            content: `
                <div class="reserve-book-modal">
                    <p>You are about to reserve this book from the library.</p>
                    <div class="form-group">
                        <label for="reserve-date">Pickup Date</label>
                        <input type="date" id="reserve-date" value="${new Date(Date.now() + 86400000).toISOString().split('T')[0]}">
                    </div>
                    <p class="text-muted"><i class="fas fa-info-circle"></i> Books must be picked up within 2 days of reservation</p>
                </div>
            `,
            confirmText: 'Confirm Reservation',
            onConfirm: function() {
                const pickupDate = document.getElementById('reserve-date').value;
                Utils.showNotification(`Book reserved for pickup on ${new Date(pickupDate).toLocaleDateString()}`, 'success');
            }
        });
    }
    
    function loadCalendarPage() {
        const page = document.getElementById('page-calendar');
        if (!page) return;
        
        // Mock calendar events
        const events = [
            { id: 1, title: 'Mid-Term Exams Start', date: '2023-11-15', type: 'exam', description: 'Mid-term examinations for all years' },
            { id: 2, title: 'Sports Week', date: '2023-11-20', type: 'event', description: 'Annual sports competition' },
            { id: 3, title: 'Last Day of Classes', date: '2023-12-10', type: 'academic', description: 'Regular classes end' },
            { id: 4, title: 'Final Exams Start', date: '2023-12-15', type: 'exam', description: 'End semester examinations' },
            { id: 5, title: 'Winter Break', date: '2023-12-23', type: 'holiday', description: 'Institute closed for winter holidays' },
            { id: 6, title: 'Project Submission', date: '2023-11-30', type: 'deadline', description: 'Final year project submission deadline' }
        ];
        
        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Generate calendar
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Adjust for Monday start (0 = Monday)
        const adjustedStartingDay = startingDay === 0 ? 6 : startingDay - 1;
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-calendar"></i> Institute Calendar</h2>
                <p>View important dates and events</p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-calendar-alt"></i> ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div class="calendar-controls">
                        <button class="btn-secondary btn-sm" id="prev-month">
                            <i class="fas fa-chevron-left"></i> Previous
                        </button>
                        <button class="btn-secondary btn-sm" id="today-btn">
                            Today
                        </button>
                        <button class="btn-secondary btn-sm" id="next-month">
                            Next <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <div class="calendar-container">
                        <div class="calendar-header">
                            <div class="day-header">Mon</div>
                            <div class="day-header">Tue</div>
                            <div class="day-header">Wed</div>
                            <div class="day-header">Thu</div>
                            <div class="day-header">Fri</div>
                            <div class="day-header">Sat</div>
                            <div class="day-header">Sun</div>
                        </div>
                        <div class="calendar-grid" id="calendar-grid">
                            <!-- Calendar days will be generated by JavaScript -->
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-list"></i> Upcoming Events
                    </h3>
                </div>
                <div class="card-content">
                    <div class="events-list" id="events-list">
                        ${events.map(event => {
                            const eventDate = new Date(event.date);
                            const now = new Date();
                            const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
                            
                            let badgeClass = 'badge-primary';
                            if (event.type === 'exam') badgeClass = 'badge-danger';
                            else if (event.type === 'holiday') badgeClass = 'badge-success';
                            else if (event.type === 'deadline') badgeClass = 'badge-warning';
                            
                            return `
                                <div class="event-item">
                                    <div class="event-date">
                                        <div class="event-day">${eventDate.getDate()}</div>
                                        <div class="event-month">${eventDate.toLocaleDateString('en-US', { month: 'short' })}</div>
                                    </div>
                                    <div class="event-details">
                                        <h4>${event.title}</h4>
                                        <p>${event.description}</p>
                                        <div class="event-meta">
                                            <span class="badge ${badgeClass}">${event.type}</span>
                                            <span class="event-days">${daysUntil > 0 ? `In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}` : 'Today'}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Generate calendar
        setTimeout(() => {
            generateCalendar(currentYear, currentMonth, events);
            
            // Add event listeners for calendar controls
            document.getElementById('prev-month')?.addEventListener('click', function() {
                generateCalendar(currentYear, currentMonth - 1, events);
            });
            
            document.getElementById('next-month')?.addEventListener('click', function() {
                generateCalendar(currentYear, currentMonth + 1, events);
            });
            
            document.getElementById('today-btn')?.addEventListener('click', function() {
                generateCalendar(now.getFullYear(), now.getMonth(), events);
            });
        }, 100);
    }
    
    function generateCalendar(year, month, events) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Adjust for Monday start (0 = Monday)
        const adjustedStartingDay = startingDay === 0 ? 6 : startingDay - 1;
        
        const calendarGrid = document.getElementById('calendar-grid');
        if (!calendarGrid) return;
        
        let calendarHTML = '';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < adjustedStartingDay; i++) {
            calendarHTML += `<div class="calendar-day empty"></div>`;
        }
        
        // Add cells for each day of the month
        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(event => event.date === dateStr);
            const isToday = isCurrentMonth && day === today.getDate();
            
            let dayClass = 'calendar-day';
            if (isToday) dayClass += ' today';
            if (dayEvents.length > 0) dayClass += ' has-events';
            
            calendarHTML += `
                <div class="${dayClass}" data-date="${dateStr}">
                    <div class="day-number">${day}</div>
                    ${dayEvents.length > 0 ? `
                        <div class="day-events">
                            ${dayEvents.slice(0, 2).map(event => `
                                <div class="day-event ${event.type}" title="${event.title}"></div>
                            `).join('')}
                            ${dayEvents.length > 2 ? `<div class="more-events">+${dayEvents.length - 2}</div>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        // Calculate total cells needed (6 rows * 7 days = 42 cells)
        const totalCells = 42;
        const cellsUsed = adjustedStartingDay + daysInMonth;
        const remainingCells = totalCells - cellsUsed;
        
        // Add empty cells for the remaining days
        for (let i = 0; i < remainingCells; i++) {
            calendarHTML += `<div class="calendar-day empty"></div>`;
        }
        
        calendarGrid.innerHTML = calendarHTML;
        
        // Add click handlers for days with events
        calendarGrid.querySelectorAll('.calendar-day.has-events').forEach(dayCell => {
            dayCell.addEventListener('click', function() {
                const date = this.getAttribute('data-date');
                showDayEvents(date, events);
            });
        });
        
        // Update calendar header with current month/year
        const date = new Date(year, month, 1);
        const monthYearStr = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const calendarTitle = document.querySelector('.card-title');
        if (calendarTitle) {
            calendarTitle.innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthYearStr}`;
        }
    }
    
    function showDayEvents(date, allEvents) {
        const dayEvents = allEvents.filter(event => event.date === date);
        const dateObj = new Date(date);
        
        if (dayEvents.length === 0) return;
        
        Utils.createModal({
            title: `Events on ${dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
            content: `
                <div class="day-events-modal">
                    ${dayEvents.map(event => {
                        let icon = 'fas fa-calendar';
                        let color = 'var(--primary-color)';
                        
                        switch(event.type) {
                            case 'exam': icon = 'fas fa-file-alt'; color = 'var(--danger-color)'; break;
                            case 'holiday': icon = 'fas fa-umbrella-beach'; color = 'var(--success-color)'; break;
                            case 'deadline': icon = 'fas fa-clock'; color = 'var(--warning-color)'; break;
                            case 'event': icon = 'fas fa-users'; color = 'var(--info-color)'; break;
                        }
                        
                        return `
                            <div class="event-detail">
                                <div class="event-icon" style="color: ${color};">
                                    <i class="${icon}"></i>
                                </div>
                                <div class="event-content">
                                    <h4>${event.title}</h4>
                                    <p>${event.description}</p>
                                    <span class="event-type" style="background: ${color};">${event.type}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `,
            confirmText: 'Close'
        });
    }
    
    function exportTimetable() {
        if (!studentTimetable) return;
        
        const timetableData = [];
        const masterTimetable = DataManager.getMasterTimetable(institute.code);
        
        Object.entries(studentTimetable.schedule || {}).forEach(([day, periods]) => {
            periods.forEach((slot, periodIndex) => {
                if (slot.subject) {
                    timetableData.push({
                        Day: day,
                        Period: periodIndex + 1,
                        Time: `${masterTimetable.periods[periodIndex].start} - ${masterTimetable.periods[periodIndex].end}`,
                        Subject: slot.subject,
                        Teacher: getTeacherName(slot.teacher) || 'TBA',
                        Room: slot.room || 'TBA',
                        Type: slot.type || 'theory'
                    });
                }
            });
        });
        
        const csv = Utils.arrayToCSV(timetableData);
        const filename = `timetable_${studentTimetable.department}_${studentTimetable.year}_${studentTimetable.division}_${new Date().toISOString().split('T')[0]}.csv`;
        
        Utils.downloadFile(csv, filename);
        Utils.showNotification('Timetable exported successfully', 'success');
    }
    
    function printTimetable() {
        Utils.showNotification('Printing timetable...', 'info');
        // In a real implementation, this would open a print dialog
        setTimeout(() => {
            window.print();
        }, 500);
    }
});