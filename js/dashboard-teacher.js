// Teacher Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check login
    if (!Utils.requireLogin()) return;
    
    const session = Utils.getCurrentSession();
    const user = session.user;
    const institute = session.institute;
    
    // Initialize dashboard
    initDashboard();
    
    // DOM Elements
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const logoutBtn = document.querySelector('.logout-btn');
    
    // State
    let currentPage = 'dashboard';
    let teacherData = null;
    
    // Initialize
    updateUserInfo();
    loadDashboardData();
    setupEventListeners();
    
    // Functions
    
    function initDashboard() {
        // Get teacher data
        const teachers = DataManager.getTeachers(institute.code);
        teacherData = teachers.find(t => t.id === user.teacherId);
        
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
        const teacherCode = document.getElementById('teacher-code');
        
        if (userName) userName.textContent = user.name;
        if (userRole) userRole.textContent = user.role;
        if (teacherCode && teacherData) teacherCode.textContent = teacherData.code;
        
        // Update page title
        updatePageTitle('Dashboard');
    }
    
    function updatePageTitle(title) {
        const pageTitle = document.getElementById('page-title');
        const pageDescription = document.getElementById('page-description');
        
        if (pageTitle) pageTitle.textContent = title;
        
        // Update description based on page
        const descriptions = {
            dashboard: 'View your schedule and upcoming classes',
            timetable: 'View your complete timetable',
            booking: 'Book available classrooms',
            availability: 'Check teacher and room availability',
            workload: 'View your workload statistics'
        };
        
        if (pageDescription) {
            pageDescription.textContent = descriptions[title.toLowerCase()] || '';
        }
    }
    
    function loadDashboardData() {
        // Load teacher's timetable
        const allTimetables = DataManager.getAllTimetables(institute.code);
        const teacherSchedule = [];
        
        // Find all classes for this teacher
        Object.values(allTimetables).forEach(timetable => {
            Object.entries(timetable.schedule || {}).forEach(([day, periods]) => {
                periods.forEach((period, periodIndex) => {
                    if (period.teacher === user.teacherId) {
                        teacherSchedule.push({
                            day,
                            period: periodIndex + 1,
                            subject: period.subject,
                            room: period.room,
                            type: period.type,
                            department: timetable.department,
                            year: timetable.year,
                            division: timetable.division
                        });
                    }
                });
            });
        });
        
        // Sort by day and period
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        teacherSchedule.sort((a, b) => {
            if (dayOrder.indexOf(a.day) !== dayOrder.indexOf(b.day)) {
                return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
            }
            return a.period - b.period;
        });
        
        // Get today's classes
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todaysClasses = teacherSchedule.filter(cls => cls.day === today);
        
        // Get upcoming bookings
        const bookings = DataManager.getRoomBookings(institute.code);
        const teacherBookings = bookings.filter(b => b.teacherId === user.teacherId);
        
        // Load dashboard page
        loadDashboardPage(teacherSchedule, todaysClasses, teacherBookings);
    }
    
    function loadDashboardPage(schedule, todaysClasses, bookings) {
        const page = document.getElementById('page-dashboard');
        if (!page) return;
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-tachometer-alt"></i> Teacher Dashboard</h2>
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
                                ${todaysClasses.map(cls => `
                                    <div class="class-item">
                                        <div class="class-time">
                                            <strong>Period ${cls.period}</strong>
                                        </div>
                                        <div class="class-details">
                                            <h4>${cls.subject}</h4>
                                            <p>
                                                <i class="fas fa-door-open"></i> ${cls.room || 'TBA'} 
                                                • ${cls.department} Year ${cls.year}${cls.division}
                                            </p>
                                        </div>
                                        <div class="class-type ${cls.type}">
                                            ${cls.type}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="empty-state">
                                <i class="fas fa-coffee"></i>
                                <p>No classes scheduled for today</p>
                            </div>
                        `}
                    </div>
                </div>
                
                <!-- Upcoming Bookings -->
                <div class="widget">
                    <div class="widget-header">
                        <h3 class="widget-title">
                            <i class="fas fa-calendar-check"></i> My Bookings
                        </h3>
                        <button class="btn-primary btn-sm" id="new-booking">
                            <i class="fas fa-plus"></i> New
                        </button>
                    </div>
                    <div class="widget-content">
                        ${bookings.length > 0 ? `
                            <div class="bookings-list">
                                ${bookings.slice(0, 3).map(booking => {
                                    const infrastructure = DataManager.getInfrastructure(institute.code);
                                    const room = infrastructure.rooms.find(r => r.id === booking.roomId);
                                    return `
                                        <div class="booking-item">
                                            <div class="booking-date">
                                                <strong>${new Date(booking.date).toLocaleDateString()}</strong>
                                                <small>Period ${booking.period}</small>
                                            </div>
                                            <div class="booking-details">
                                                <h4>${room ? `Room ${room.number}` : 'Unknown Room'}</h4>
                                                <p>${booking.purpose}</p>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            ${bookings.length > 3 ? `
                                <div class="widget-footer">
                                    <a href="#" class="view-all-link" data-page="booking">
                                        View all ${bookings.length} bookings <i class="fas fa-arrow-right"></i>
                                    </a>
                                </div>
                            ` : ''}
                        ` : `
                            <div class="empty-state">
                                <i class="fas fa-calendar-plus"></i>
                                <p>No bookings yet</p>
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
                                <div class="stat-value">${schedule.length}</div>
                                <div class="stat-label">Total Classes</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${teacherData?.workload || 0}</div>
                                <div class="stat-label">Hours/Week</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${new Set(schedule.map(c => c.day)).size}</div>
                                <div class="stat-label">Teaching Days</div>
                            </div>
                        </div>
                        <div class="workload-chart-small">
                            <canvas id="workloadChart" height="150"></canvas>
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
                            <button class="action-btn" data-page="booking">
                                <i class="fas fa-calendar-plus"></i>
                                <span>Book Room</span>
                            </button>
                            <button class="action-btn" data-page="timetable">
                                <i class="fas fa-calendar-alt"></i>
                                <span>View Timetable</span>
                            </button>
                            <button class="action-btn" data-page="availability">
                                <i class="fas fa-search"></i>
                                <span>Check Availability</span>
                            </button>
                            <button class="action-btn" id="print-timetable">
                                <i class="fas fa-print"></i>
                                <span>Print Schedule</span>
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
        `;
        
        // Load next class
        loadNextClass();
        
        // Create workload chart
        setTimeout(() => {
            createWorkloadChart(schedule);
        }, 100);
        
        // Add event listeners
        setTimeout(() => {
            document.getElementById('new-booking')?.addEventListener('click', () => {
                showPage('booking');
            });
            
            document.getElementById('print-timetable')?.addEventListener('click', printTimetable);
            
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
    
    function loadNextClass() {
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Simple logic to find next class
        // In a real implementation, you'd use the actual timetable periods
        
        const container = document.getElementById('next-class-container');
        if (!container) return;
        
        // Mock next class for demo
        const nextClass = {
            subject: "Data Structures",
            room: "Room 301",
            time: "2:00 PM",
            duration: "1 hour",
            building: "Main Building"
        };
        
        container.innerHTML = `
            <div class="next-class-card">
                <div class="next-class-time">
                    <div class="time-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="time-details">
                        <h3>${nextClass.time}</h3>
                        <p>${nextClass.duration}</p>
                    </div>
                </div>
                <div class="next-class-details">
                    <h3>${nextClass.subject}</h3>
                    <p><i class="fas fa-door-open"></i> ${nextClass.room} • ${nextClass.building}</p>
                    <div class="next-class-actions">
                        <button class="btn-primary btn-sm">
                            <i class="fas fa-directions"></i> Get Directions
                        </button>
                        <button class="btn-secondary btn-sm">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                    </div>
                </div>
                <div class="next-class-countdown">
                    <div class="countdown-value">45</div>
                    <div class="countdown-label">minutes</div>
                </div>
            </div>
        `;
    }
    
    function createWorkloadChart(schedule) {
        const ctx = document.getElementById('workloadChart')?.getContext('2d');
        if (!ctx) return;
        
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayCounts = {};
        
        dayOrder.forEach(day => {
            dayCounts[day] = schedule.filter(cls => cls.day === day).length;
        });
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dayOrder,
                datasets: [{
                    label: 'Classes per Day',
                    data: dayOrder.map(day => dayCounts[day]),
                    backgroundColor: 'rgba(67, 97, 238, 0.7)',
                    borderColor: 'rgba(67, 97, 238, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
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
            case 'booking':
                loadBookingPage();
                break;
            case 'availability':
                loadAvailabilityPage();
                break;
            case 'workload':
                loadWorkloadPage();
                break;
        }
    }
    
    function loadTimetablePage() {
        const page = document.getElementById('page-timetable');
        if (!page) return;
        
        // Get teacher's timetable
        const allTimetables = DataManager.getAllTimetables(institute.code);
        const masterTimetable = DataManager.getMasterTimetable(institute.code);
        const teacherSchedule = {};
        
        // Initialize empty schedule
        masterTimetable.days.forEach(day => {
            teacherSchedule[day] = Array(masterTimetable.periods.length).fill(null);
        });
        
        // Fill teacher's schedule
        Object.values(allTimetables).forEach(timetable => {
            Object.entries(timetable.schedule || {}).forEach(([day, periods]) => {
                periods.forEach((period, periodIndex) => {
                    if (period.teacher === user.teacherId && period.subject) {
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
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-calendar-alt"></i> My Timetable</h2>
                <p>Your complete teaching schedule</p>
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
                        <button class="btn-secondary" id="print-timetable-page">
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
                                                const slot = teacherSchedule[day][periodIndex];
                                                return `
                                                    <td class="timetable-cell ${slot ? 'booked' : 'empty'}">
                                                        ${slot ? `
                                                            <div class="timetable-cell-content">
                                                                <div class="timetable-cell-subject">${slot.subject}</div>
                                                                <div class="timetable-cell-teacher">
                                                                    ${slot.department} Year ${slot.year}${slot.division}
                                                                </div>
                                                                <div class="timetable-cell-room">
                                                                    <i class="fas fa-door-open"></i> ${slot.room || 'TBA'}
                                                                </div>
                                                                <span class="timetable-cell-type ${slot.type || 'theory'}">
                                                                    ${slot.type || 'theory'}
                                                                </span>
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
                        <i class="fas fa-list"></i> Class List
                    </h3>
                </div>
                <div class="card-content">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    <th>Period</th>
                                    <th>Time</th>
                                    <th>Subject</th>
                                    <th>Class</th>
                                    <th>Room</th>
                                    <th>Type</th>
                                </tr>
                            </thead>
                            <tbody id="class-list-body">
                                <!-- Class list will be populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        // Populate class list
        setTimeout(() => {
            populateClassList(teacherSchedule, masterTimetable);
            
            // Add event listeners
            document.getElementById('export-timetable')?.addEventListener('click', exportTimetable);
            document.getElementById('print-timetable-page')?.addEventListener('click', printTimetable);
        }, 100);
    }
    
    function populateClassList(schedule, masterTimetable) {
        const tbody = document.getElementById('class-list-body');
        if (!tbody) return;
        
        let classList = [];
        
        Object.entries(schedule).forEach(([day, periods]) => {
            periods.forEach((slot, periodIndex) => {
                if (slot) {
                    classList.push({
                        day,
                        period: periodIndex + 1,
                        time: `${masterTimetable.periods[periodIndex].start} - ${masterTimetable.periods[periodIndex].end}`,
                        subject: slot.subject,
                        class: `${slot.department} Year ${slot.year}${slot.division}`,
                        room: slot.room || 'TBA',
                        type: slot.type || 'theory'
                    });
                }
            });
        });
        
        // Sort by day and period
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        classList.sort((a, b) => {
            if (dayOrder.indexOf(a.day) !== dayOrder.indexOf(b.day)) {
                return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
            }
            return a.period - b.period;
        });
        
        tbody.innerHTML = classList.map(cls => `
            <tr>
                <td>${cls.day}</td>
                <td>${cls.period}</td>
                <td>${cls.time}</td>
                <td><strong>${cls.subject}</strong></td>
                <td>${cls.class}</td>
                <td>${cls.room}</td>
                <td>
                    <span class="badge ${cls.type === 'lab' ? 'badge-warning' : 'badge-primary'}">
                        ${cls.type}
                    </span>
                </td>
            </tr>
        `).join('');
    }
    
    function loadBookingPage() {
        const page = document.getElementById('page-booking');
        if (!page) return;
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-calendar-plus"></i> Book Classroom</h2>
                <p>Book available classrooms for your needs</p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-search"></i> Check Availability
                    </h3>
                </div>
                <div class="card-content">
                    <div class="filter-bar">
                        <div class="filter-group">
                            <label for="booking-date">Date</label>
                            <input type="date" id="booking-date" value="${new Date().toISOString().split('T')[0]}" 
                                min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="filter-group">
                            <label for="booking-period">Period</label>
                            <select id="booking-period">
                                <option value="1">Period 1 (9:00-10:00)</option>
                                <option value="2">Period 2 (10:00-11:00)</option>
                                <option value="3">Period 3 (11:00-12:00)</option>
                                <option value="4">Period 4 (12:00-13:00)</option>
                                <option value="5">Period 5 (14:00-15:00)</option>
                                <option value="6">Period 6 (15:00-16:00)</option>
                                <option value="7">Period 7 (16:00-17:00)</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="booking-building">Building</label>
                            <select id="booking-building">
                                <option value="">All Buildings</option>
                                <!-- Buildings will be populated by JavaScript -->
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label>&nbsp;</label>
                            <button class="btn-primary" id="check-availability-btn">
                                <i class="fas fa-search"></i> Check Availability
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="availability-results">
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Select Date and Period</h3>
                    <p>Use the filters above to check room availability</p>
                </div>
            </div>
            
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-history"></i> My Bookings
                    </h3>
                </div>
                <div class="card-content">
                    <div id="my-bookings-list">
                        <!-- Bookings will be loaded by JavaScript -->
                        <div class="empty-state">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Loading your bookings...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Load buildings and bookings
        setTimeout(() => {
            loadBuildings();
            loadMyBookings();
            
            // Add event listeners
            document.getElementById('check-availability-btn')?.addEventListener('click', checkRoomAvailability);
        }, 100);
    }
    
    function loadBuildings() {
        const infrastructure = DataManager.getInfrastructure(institute.code);
        const buildingSelect = document.getElementById('booking-building');
        
        if (!buildingSelect) return;
        
        buildingSelect.innerHTML = `
            <option value="">All Buildings</option>
            ${infrastructure.buildings.map(building => 
                `<option value="${building.id}">${building.name}</option>`
            ).join('')}
        `;
    }
    
    function loadMyBookings() {
        const bookings = DataManager.getRoomBookings(institute.code);
        const teacherBookings = bookings.filter(b => b.teacherId === user.teacherId);
        const container = document.getElementById('my-bookings-list');
        
        if (!container) return;
        
        if (teacherBookings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <p>You haven't made any bookings yet</p>
                </div>
            `;
            return;
        }
        
        const infrastructure = DataManager.getInfrastructure(institute.code);
        
        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Period</th>
                            <th>Room</th>
                            <th>Purpose</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${teacherBookings.map(booking => {
                            const room = infrastructure.rooms.find(r => r.id === booking.roomId);
                            return `
                                <tr>
                                    <td>${new Date(booking.date).toLocaleDateString()}</td>
                                    <td>${booking.period}</td>
                                    <td>${room ? `Room ${room.number}` : 'Unknown'}</td>
                                    <td>${booking.purpose}</td>
                                    <td>
                                        <button class="table-btn delete-booking" data-id="${booking.id}" title="Cancel Booking">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Add delete booking handlers
        container.querySelectorAll('.delete-booking').forEach(btn => {
            btn.addEventListener('click', function() {
                const bookingId = this.getAttribute('data-id');
                cancelBooking(bookingId);
            });
        });
    }
    
    function checkRoomAvailability() {
        const date = document.getElementById('booking-date').value;
        const period = parseInt(document.getElementById('booking-period').value);
        const buildingId = document.getElementById('booking-building').value;
        
        if (!date) {
            Utils.showNotification('Please select a date', 'error');
            return;
        }
        
        const availableRooms = DataManager.getAvailableRooms(institute.code, date, period);
        const infrastructure = DataManager.getInfrastructure(institute.code);
        
        // Filter by building if specified
        let filteredRooms = availableRooms;
        if (buildingId) {
            filteredRooms = availableRooms.filter(room => room.building === buildingId);
        }
        
        const container = document.getElementById('availability-results');
        if (!container) return;
        
        if (filteredRooms.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-door-closed"></i>
                    <h3>No Rooms Available</h3>
                    <p>No rooms are available for the selected criteria</p>
                    <button class="btn-secondary mt-2" id="try-different-search">
                        <i class="fas fa-search"></i> Try Different Search
                    </button>
                </div>
            `;
            
            setTimeout(() => {
                document.getElementById('try-different-search')?.addEventListener('click', function() {
                    // Reset filters
                    document.getElementById('booking-building').value = '';
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
                                        <button class="btn-primary book-room-now" data-room="${room.id}">
                                            <i class="fas fa-calendar-plus"></i> Book Now
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Add booking handlers
        container.querySelectorAll('.book-room-now').forEach(btn => {
            btn.addEventListener('click', function() {
                const roomId = this.getAttribute('data-room');
                showBookingModal(roomId, date, period);
            });
        });
    }
    
    function showBookingModal(roomId, date, period) {
        const infrastructure = DataManager.getInfrastructure(institute.code);
        const room = infrastructure.rooms.find(r => r.id === roomId);
        
        if (!room) return;
        
        Utils.createModal({
            title: 'Book Room',
            content: `
                <div class="booking-details-summary">
                    <p><strong>Room:</strong> ${room.number}</p>
                    <p><strong>Building:</strong> ${room.building}</p>
                    <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                    <p><strong>Period:</strong> ${period}</p>
                    <p><strong>Time:</strong> ${getPeriodTime(period)}</p>
                </div>
                
                <div class="form-group">
                    <label for="booking-purpose-modal">Purpose of Booking</label>
                    <input type="text" id="booking-purpose-modal" placeholder="e.g., Guest Lecture, Project Work, Meeting">
                </div>
                
                <div class="form-group">
                    <label for="booking-notes">Additional Notes (Optional)</label>
                    <textarea id="booking-notes" rows="3" placeholder="Any special requirements or notes"></textarea>
                </div>
                
                <div class="booking-confirmation">
                    <p><i class="fas fa-info-circle"></i> The booking will be confirmed immediately and added to your schedule.</p>
                </div>
            `,
            confirmText: 'Confirm Booking',
            onConfirm: function() {
                const purpose = document.getElementById('booking-purpose-modal').value.trim();
                const notes = document.getElementById('booking-notes').value.trim();
                
                if (!purpose) {
                    Utils.showNotification('Please enter booking purpose', 'error');
                    return;
                }
                
                const booking = {
                    roomId,
                    teacherId: user.teacherId,
                    date,
                    period,
                    purpose,
                    notes: notes || undefined
                };
                
                DataManager.addRoomBooking(institute.code, booking);
                Utils.showNotification(`Room ${room.number} booked successfully`, 'success');
                
                // Refresh bookings list
                loadMyBookings();
                // Refresh availability results
                checkRoomAvailability();
            }
        });
    }
    
    function getPeriodTime(period) {
        const periods = {
            1: '9:00 AM - 10:00 AM',
            2: '10:00 AM - 11:00 AM',
            3: '11:00 AM - 12:00 PM',
            4: '12:00 PM - 1:00 PM',
            5: '2:00 PM - 3:00 PM',
            6: '3:00 PM - 4:00 PM',
            7: '4:00 PM - 5:00 PM'
        };
        
        return periods[period] || 'Time not specified';
    }
    
    function cancelBooking(bookingId) {
        Utils.createModal({
            title: 'Cancel Booking',
            content: `<p>Are you sure you want to cancel this booking? This action cannot be undone.</p>`,
            confirmText: 'Cancel Booking',
            onConfirm: function() {
                DataManager.cancelRoomBooking(institute.code, bookingId);
                Utils.showNotification('Booking cancelled successfully', 'success');
                loadMyBookings();
            }
        });
    }
    
    function loadAvailabilityPage() {
        const page = document.getElementById('page-availability');
        if (!page) return;
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-search"></i> Check Availability</h2>
                <p>Check teacher and room availability</p>
            </div>
            
            <div class="card">
                <div class="tabs">
                    <button class="tab active" data-tab="teachers">Teacher Availability</button>
                    <button class="tab" data-tab="rooms">Room Availability</button>
                </div>
                
                <div class="tab-content active" id="tab-teachers">
                    <div class="card-content">
                        <div class="filter-bar">
                            <div class="filter-group">
                                <label for="teacher-select">Select Teacher</label>
                                <select id="teacher-select">
                                    <option value="">Select a teacher</option>
                                    <!-- Teachers will be populated by JavaScript -->
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label for="day-select">Select Day</label>
                                <select id="day-select">
                                    <option value="Monday">Monday</option>
                                    <option value="Tuesday">Tuesday</option>
                                    <option value="Wednesday">Wednesday</option>
                                    <option value="Thursday">Thursday</option>
                                    <option value="Friday">Friday</option>
                                    <option value="Saturday">Saturday</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label>&nbsp;</label>
                                <button class="btn-primary" id="check-teacher-availability">
                                    <i class="fas fa-search"></i> Check Availability
                                </button>
                            </div>
                        </div>
                        
                        <div id="teacher-availability-results" class="mt-3">
                            <!-- Results will be shown here -->
                        </div>
                    </div>
                </div>
                
                <div class="tab-content" id="tab-rooms">
                    <div class="card-content">
                        <div class="filter-bar">
                            <div class="filter-group">
                                <label for="room-date">Date</label>
                                <input type="date" id="room-date" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            
                            <div class="filter-group">
                                <label for="room-period">Period</label>
                                <select id="room-period">
                                    <option value="1">Period 1</option>
                                    <option value="2">Period 2</option>
                                    <option value="3">Period 3</option>
                                    <option value="4">Period 4</option>
                                    <option value="5">Period 5</option>
                                    <option value="6">Period 6</option>
                                    <option value="7">Period 7</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label>&nbsp;</label>
                                <button class="btn-primary" id="check-room-availability-tab">
                                    <i class="fas fa-search"></i> Check Availability
                                </button>
                            </div>
                        </div>
                        
                        <div id="room-availability-results" class="mt-3">
                            <!-- Results will be shown here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Load teachers for dropdown
        setTimeout(() => {
            loadTeachersForAvailability();
            
            // Add event listeners
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
            
            document.getElementById('check-teacher-availability')?.addEventListener('click', checkTeacherAvailability);
            document.getElementById('check-room-availability-tab')?.addEventListener('click', checkRoomAvailabilityTab);
        }, 100);
    }
    
    function loadTeachersForAvailability() {
        const teachers = DataManager.getTeachers(institute.code);
        const select = document.getElementById('teacher-select');
        
        if (!select) return;
        
        select.innerHTML = `
            <option value="">Select a teacher</option>
            ${teachers.map(teacher => 
                `<option value="${teacher.id}">${teacher.name} (${teacher.code})</option>`
            ).join('')}
        `;
    }
    
    function checkTeacherAvailability() {
        const teacherId = document.getElementById('teacher-select').value;
        const day = document.getElementById('day-select').value;
        
        if (!teacherId) {
            Utils.showNotification('Please select a teacher', 'error');
            return;
        }
        
        const teacher = DataManager.getTeachers(institute.code).find(t => t.id === teacherId);
        if (!teacher) return;
        
        const allTimetables = DataManager.getAllTimetables(institute.code);
        const masterTimetable = DataManager.getMasterTimetable(institute.code);
        
        // Get teacher's schedule for the selected day
        const daySchedule = Array(masterTimetable.periods.length).fill(null);
        
        Object.values(allTimetables).forEach(timetable => {
            const periods = timetable.schedule?.[day] || [];
            periods.forEach((period, periodIndex) => {
                if (period.teacher === teacherId && period.subject) {
                    daySchedule[periodIndex] = {
                        ...period,
                        department: timetable.department,
                        year: timetable.year,
                        division: timetable.division
                    };
                }
            });
        });
        
        const container = document.getElementById('teacher-availability-results');
        if (!container) return;
        
        // Count available periods
        const availablePeriods = daySchedule.filter(period => period === null).length;
        const busyPeriods = daySchedule.filter(period => period !== null).length;
        
        container.innerHTML = `
            <div class="availability-card">
                <div class="availability-header">
                    <h3>${teacher.name}'s Availability on ${day}</h3>
                    <div class="availability-stats">
                        <span class="badge badge-success">${availablePeriods} periods free</span>
                        <span class="badge badge-warning">${busyPeriods} periods busy</span>
                    </div>
                </div>
                
                <div class="availability-schedule">
                    <h4>Schedule for ${day}:</h4>
                    ${daySchedule.map((period, index) => {
                        const periodTime = masterTimetable.periods[index];
                        return `
                            <div class="schedule-item ${period ? 'busy' : 'free'}">
                                <div class="schedule-time">
                                    <strong>Period ${index + 1}</strong>
                                    <small>${periodTime.start} - ${periodTime.end}</small>
                                </div>
                                <div class="schedule-status">
                                    ${period ? `
                                        <span class="status-busy">
                                            <i class="fas fa-chalkboard-teacher"></i> 
                                            ${period.subject} (${period.department} Year ${period.year}${period.division})
                                        </span>
                                    ` : `
                                        <span class="status-free">
                                            <i class="fas fa-check-circle"></i> Available
                                        </span>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    function checkRoomAvailabilityTab() {
        const date = document.getElementById('room-date').value;
        const period = parseInt(document.getElementById('room-period').value);
        
        if (!date) {
            Utils.showNotification('Please select a date', 'error');
            return;
        }
        
        const availableRooms = DataManager.getAvailableRooms(institute.code, date, period);
        const infrastructure = DataManager.getInfrastructure(institute.code);
        
        const container = document.getElementById('room-availability-results');
        if (!container) return;
        
        if (availableRooms.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-door-closed"></i>
                    <h3>No Rooms Available</h3>
                    <p>All rooms are booked for the selected date and period</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="availability-card">
                <div class="availability-header">
                    <h3>Room Availability</h3>
                    <span class="badge badge-success">${availableRooms.length} rooms available</span>
                </div>
                
                <div class="rooms-availability-list">
                    ${availableRooms.map(room => {
                        const building = infrastructure.buildings.find(b => b.id === room.building);
                        return `
                            <div class="room-availability-item">
                                <div class="room-info">
                                    <h4>Room ${room.number}</h4>
                                    <p>${building ? building.name : room.building} • Floor ${room.floor}</p>
                                </div>
                                <div class="room-details">
                                    <span class="badge ${room.type === 'lab' ? 'badge-warning' : 'badge-primary'}">
                                        ${room.type}
                                    </span>
                                    <span class="capacity">Capacity: ${room.capacity}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    function loadWorkloadPage() {
        const page = document.getElementById('page-workload');
        if (!page) return;
        
        // Calculate workload
        const allTimetables = DataManager.getAllTimetables(institute.code);
        const workloadData = DataManager.getTeacherWorkload(institute.code, user.teacherId);
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-chart-bar"></i> My Workload</h2>
                <p>View your teaching workload statistics</p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-chart-pie"></i> Workload Overview
                    </h3>
                </div>
                <div class="card-content">
                    <div class="workload-summary-grid">
                        <div class="summary-card-large">
                            <div class="summary-icon">
                                <i class="fas fa-chalkboard-teacher"></i>
                            </div>
                            <div class="summary-content">
                                <h3>${workloadData.weekly} hours</h3>
                                <p>Weekly Workload</p>
                            </div>
                        </div>
                        
                        <div class="summary-card-large">
                            <div class="summary-icon">
                                <i class="fas fa-calendar-day"></i>
                            </div>
                            <div class="summary-content">
                                <h3>${(workloadData.weekly / 6).toFixed(1)} hours</h3>
                                <p>Daily Average</p>
                            </div>
                        </div>
                        
                        <div class="summary-card-large">
                            <div class="summary-icon">
                                <i class="fas fa-balance-scale"></i>
                            </div>
                            <div class="summary-content">
                                <h3>${getWorkloadStatus(workloadData.weekly)}</h3>
                                <p>Workload Status</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="workload-chart-container mt-3">
                        <canvas id="workloadDetailedChart" height="300"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-calendar-week"></i> Daily Breakdown
                    </h3>
                </div>
                <div class="card-content">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    <th>Periods</th>
                                    <th>Hours</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(workloadData.daily).map(([day, count]) => {
                                    const hours = count; // Assuming 1 period = 1 hour
                                    let status = 'Optimal';
                                    let statusClass = 'badge-success';
                                    
                                    if (count > 4) {
                                        status = 'Heavy';
                                        statusClass = 'badge-danger';
                                    } else if (count === 0) {
                                        status = 'Free';
                                        statusClass = 'badge-info';
                                    }
                                    
                                    return `
                                        <tr>
                                            <td>${day}</td>
                                            <td>${count}</td>
                                            <td>${hours} hours</td>
                                            <td><span class="badge ${statusClass}">${status}</span></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        // Create detailed workload chart
        setTimeout(() => {
            const ctx = document.getElementById('workloadDetailedChart')?.getContext('2d');
            if (!ctx) return;
            
            const days = Object.keys(workloadData.daily);
            const counts = Object.values(workloadData.daily);
            
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Periods per Day',
                        data: counts,
                        backgroundColor: counts.map(count => 
                            count > 4 ? 'rgba(247, 37, 133, 0.7)' : 
                            count === 0 ? 'rgba(76, 201, 240, 0.7)' : 'rgba(67, 97, 238, 0.7)'
                        ),
                        borderColor: counts.map(count => 
                            count > 4 ? 'rgba(247, 37, 133, 1)' : 
                            count === 0 ? 'rgba(76, 201, 240, 1)' : 'rgba(67, 97, 238, 1)'
                        ),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 7,
                            ticks: {
                                stepSize: 1
                            },
                            title: {
                                display: true,
                                text: 'Number of Periods'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }, 100);
    }
    
    function getWorkloadStatus(weeklyHours) {
        if (weeklyHours > 25) return 'Heavy';
        if (weeklyHours > 18) return 'Moderate';
        if (weeklyHours < 12) return 'Light';
        return 'Optimal';
    }
    
    function exportTimetable() {
        const allTimetables = DataManager.getAllTimetables(institute.code);
        const teacherSchedule = [];
        
        // Get all classes for this teacher
        Object.values(allTimetables).forEach(timetable => {
            Object.entries(timetable.schedule || {}).forEach(([day, periods]) => {
                periods.forEach((period, periodIndex) => {
                    if (period.teacher === user.teacherId && period.subject) {
                        teacherSchedule.push({
                            Day: day,
                            Period: periodIndex + 1,
                            Subject: period.subject,
                            Class: `${timetable.department} Year ${timetable.year}${timetable.division}`,
                            Room: period.room || 'TBA',
                            Type: period.type || 'theory'
                        });
                    }
                });
            });
        });
        
        const csv = Utils.arrayToCSV(teacherSchedule);
        const filename = `timetable_${teacherData?.code || 'teacher'}_${new Date().toISOString().split('T')[0]}.csv`;
        
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