// Admin Dashboard JavaScript

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
    const notificationBell = document.querySelector('.notification-bell');
    const notificationPanel = document.querySelector('.notification-panel');
    const clearNotificationsBtn = document.getElementById('clear-notifications');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle') || createMobileMenuToggle();
    
    // State
    let currentPage = 'dashboard';
    let notifications = [];
    
    // Initialize
    updateUserInfo();
    loadDashboardData();
    setupEventListeners();
    setupNotificationBell();
    updateDateTime();
    
    // Functions
    
    function initDashboard() {
        // Create mobile menu toggle if not exists
        if (!document.querySelector('.mobile-menu-toggle')) {
            createMobileMenuToggle();
        }
        
        // Create notification container if not exists
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
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
        
        if (userName) userName.textContent = user.name;
        if (userRole) userRole.textContent = user.role;
        
        // Update page title
        updatePageTitle('Dashboard');
    }
    
    function updatePageTitle(title) {
        const pageTitle = document.getElementById('page-title');
        const pageDescription = document.getElementById('page-description');
        
        if (pageTitle) pageTitle.textContent = title;
        
        // Update description based on page
        const descriptions = {
            dashboard: 'Manage your institute efficiently',
            timetable: 'Edit and manage timetables',
            'master-timetable': 'View consolidated timetable',
            departments: 'Manage departments and branches',
            infrastructure: 'Manage buildings, floors, and rooms',
            teachers: 'Manage teachers and assign codes',
            rooms: 'View and manage room availability',
            workload: 'Monitor teacher workload',
            export: 'Export institute data'
        };
        
        if (pageDescription) {
            pageDescription.textContent = descriptions[title.toLowerCase()] || '';
        }
    }
    
    function loadDashboardData() {
        const instituteCode = institute.code;
        
        // Load statistics
        const teachers = DataManager.getTeachers(instituteCode);
        const departments = DataManager.getDepartments(instituteCode);
        const infrastructure = DataManager.getInfrastructure(instituteCode);
        const bookings = DataManager.getRoomBookings(instituteCode);
        
        // Update stats
        document.getElementById('teacher-count').textContent = teachers.length;
        document.getElementById('department-count').textContent = departments.length;
        document.getElementById('room-count').textContent = infrastructure.rooms.length;
        
        // Count today's bookings
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = bookings.filter(b => b.date === today).length;
        document.getElementById('booking-count').textContent = todayBookings;
        
        // Load available rooms
        loadAvailableRooms();
        
        // Load timetable conflictss
        loadTimetableConflicts();
        
        // Load recent activities
        loadRecentActivities();
    }
    
    function loadAvailableRooms() {
        const instituteCode = institute.code;
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // For demo, we'll use period 3 (11:00-12:00)
        const currentPeriod = 3;
        
        const availableRooms = DataManager.getAvailableRooms(instituteCode, today, currentPeriod);
        const roomsList = document.getElementById('available-rooms-list');
        
        if (!roomsList) return;
        
        if (availableRooms.length === 0) {
            roomsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-door-closed"></i>
                    <p>No rooms available at this time</p>
                </div>
            `;
            return;
        }
        
        roomsList.innerHTML = availableRooms.map(room => `
            <div class="room-item">
                <div class="room-info">
                    <h4>Room ${room.number}</h4>
                    <p>${room.building} • Floor ${room.floor} • ${room.type}</p>
                </div>
                <div class="room-status">
                    <span class="status-dot available"></span>
                    <span class="status-text">Available</span>
                </div>
            </div>
        `).join('');
    }
    
    function loadTimetableConflicts() {
        const instituteCode = institute.code;
        const conflicts = DataManager.checkTimetableConflicts(instituteCode);
        const conflictsList = document.getElementById('conflicts-list');
        const conflictCount = document.getElementById('conflict-count');
        
        if (conflictCount) {
            conflictCount.textContent = conflicts.length;
        }
        
        if (!conflictsList) return;
        
        if (conflicts.length === 0) {
            conflictsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>No timetable conflicts found</p>
                </div>
            `;
            return;
        }
        
        conflictsList.innerHTML = conflicts.map(conflict => `
            <div class="conflict-item">
                <div class="conflict-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="conflict-details">
                    <h4>${conflict.type === 'teacher' ? 'Teacher Conflict' : 'Room Conflict'}</h4>
                    <p>${conflict.type === 'teacher' ? `Teacher ${conflict.teacher}` : `Room ${conflict.room}`} double-booked on ${conflict.day}, Period ${conflict.period}</p>
                </div>
            </div>
        `).join('');
    }
    
    function loadRecentActivities() {
        // Mock activities for now
        const activities = [
            {
                icon: 'fas fa-calendar-plus',
                title: 'Timetable Updated',
                description: 'CS 2nd Year A Division timetable modified',
                time: '2 hours ago'
            },
            {
                icon: 'fas fa-user-plus',
                title: 'New Teacher Added',
                description: 'Dr. John Doe added to Computer Science department',
                time: '5 hours ago'
            },
            {
                icon: 'fas fa-door-open',
                title: 'Room Booked',
                description: 'Room 101 booked by Prof. Sarah Johnson',
                time: '1 day ago'
            },
            {
                icon: 'fas fa-building',
                title: 'New Building Added',
                description: 'New Engineering Block added to infrastructure',
                time: '2 days ago'
            }
        ];
        
        const activitiesList = document.getElementById('activities-list');
        if (!activitiesList) return;
        
        activitiesList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-details">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                    <span class="activity-time">${activity.time}</span>
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
        
        // Quick action buttons
        document.addEventListener('click', function(e) {
            // View all rooms link
            if (e.target.classList.contains('view-all-link') || 
                e.target.closest('.view-all-link')) {
                e.preventDefault();
                const link = e.target.classList.contains('view-all-link') ? 
                    e.target : e.target.closest('.view-all-link');
                const page = link.getAttribute('data-page');
                showPage(page);
            }
            
            // Action buttons
            if (e.target.classList.contains('action-btn') || 
                e.target.closest('.action-btn')) {
                const btn = e.target.classList.contains('action-btn') ? 
                    e.target : e.target.closest('.action-btn');
                const page = btn.getAttribute('data-page');
                showPage(page);
            }
            
            // Refresh rooms
            if (e.target.id === 'refresh-rooms' || 
                e.target.closest('#refresh-rooms')) {
                loadAvailableRooms();
                Utils.showNotification('Rooms refreshed', 'success');
            }
            
            // Refresh activities
            if (e.target.id === 'refresh-activities' || 
                e.target.closest('#refresh-activities')) {
                loadRecentActivities();
                Utils.showNotification('Activities refreshed', 'success');
            }
            
            // Resolve conflicts
            if (e.target.id === 'resolve-conflicts' || 
                e.target.closest('#resolve-conflicts')) {
                showConflictResolution();
            }
        });
        
        // Notification panel
        if (notificationBell) {
            notificationBell.addEventListener('click', function() {
                notificationPanel.classList.toggle('active');
            });
        }
        
        // Clear notifications
        if (clearNotificationsBtn) {
            clearNotificationsBtn.addEventListener('click', function() {
                notifications = [];
                updateNotificationPanel();
                Utils.showNotification('All notifications cleared', 'success');
            });
        }
        
        // Close notification panel when clicking outside
        document.addEventListener('click', function(e) {
            if (!notificationPanel.contains(e.target) && 
                !notificationBell.contains(e.target) && 
                notificationPanel.classList.contains('active')) {
                notificationPanel.classList.remove('active');
            }
        });
    }
    
    function setupNotificationBell() {
        // Mock notifications for now
        notifications = [
            {
                id: 1,
                title: 'Timetable Conflict Detected',
                message: 'Room 101 is double-booked on Monday, Period 3',
                time: '10 minutes ago',
                read: false,
                type: 'warning'
            },
            {
                id: 2,
                title: 'New Booking Request',
                message: 'Prof. Chen requested Room 201 for tomorrow',
                time: '1 hour ago',
                read: false,
                type: 'info'
            },
            {
                id: 3,
                title: 'System Maintenance',
                message: 'Scheduled maintenance this weekend',
                time: '1 day ago',
                read: true,
                type: 'info'
            }
        ];
        
        updateNotificationPanel();
    }
    
    function updateNotificationPanel() {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;
        
        const unreadCount = notifications.filter(n => !n.read).length;
        const notificationCount = document.querySelector('.notification-count');
        
        if (notificationCount) {
            notificationCount.textContent = unreadCount;
            notificationCount.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
        
        if (notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }
        
        notificationList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <span class="notification-time">${notification.time}</span>
            </div>
        `).join('');
        
        // Add click handlers to mark as read
        notificationList.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const notification = notifications.find(n => n.id === id);
                if (notification && !notification.read) {
                    notification.read = true;
                    updateNotificationPanel();
                }
            });
        });
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
            case 'master-timetable':
                loadMasterTimetablePage();
                break;
            case 'departments':
                loadDepartmentsPage();
                break;
            case 'infrastructure':
                loadInfrastructurePage();
                break;
            case 'teachers':
                loadTeachersPage();
                break;
            case 'rooms':
                loadRoomsPage();
                break;
            case 'workload':
                loadWorkloadPage();
                break;
            case 'export':
                loadExportPage();
                break;
        }
    }
    
    function loadTimetablePage() {
        const page = document.getElementById('page-timetable');
        if (!page) return;
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-calendar-alt"></i> Timetable Management</h2>
                <p>Edit and manage class timetables</p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-filter"></i> Filter Timetable</h3>
                </div>
                <div class="card-content">
                    <div class="timetable-filter">
                        <select class="filter-select" id="filter-year">
                            <option value="">Select Year</option>
                            <option value="1">First Year</option>
                            <option value="2">Second Year</option>
                            <option value="3">Third Year</option>
                            <option value="4">Fourth Year</option>
                        </select>
                        
                        <select class="filter-select" id="filter-department">
                            <option value="">Select Department</option>
                            <option value="CS">Computer Science</option>
                            <option value="IT">Information Technology</option>
                            <option value="AIML">AI & ML</option>
                            <option value="ELEC">Electrical</option>
                            <option value="MECH">Mechanical</option>
                            <option value="CIVIL">Civil</option>
                        </select>
                        
                        <select class="filter-select" id="filter-division">
                            <option value="">Select Division</option>
                            ${'ABCDEFGHIJKLMNOP'.split('').map(div => 
                                `<option value="${div}">Division ${div}</option>`
                            ).join('')}
                        </select>
                        
                        <button class="btn-primary" id="load-timetable">
                            <i class="fas fa-search"></i> Load Timetable
                        </button>
                        
                        <button class="btn-success" id="new-timetable">
                            <i class="fas fa-plus"></i> Create New
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="timetable-editor-container">
                <!-- Timetable editor will be loaded here -->
                <div class="empty-state">
                    <i class="fas fa-calendar"></i>
                    <h3>No Timetable Loaded</h3>
                    <p>Use the filters above to load a timetable for editing</p>
                </div>
            </div>
        `;
        
        // Add event listeners for timetable page
        setTimeout(() => {
            document.getElementById('load-timetable')?.addEventListener('click', loadTimetableForEditing);
            document.getElementById('new-timetable')?.addEventListener('click', createNewTimetable);
        }, 100);
    }
    
    function loadMasterTimetablePage() {
        const page = document.getElementById('page-master-timetable');
        if (!page) return;
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-calendar-check"></i> Master Timetable</h2>
                <p>Consolidated view of all timetables</p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-download"></i> Export Options</h3>
                </div>
                <div class="card-content">
                    <div class="filter-bar">
                        <button class="btn-primary" id="export-json">
                            <i class="fas fa-file-code"></i> Export as JSON
                        </button>
                        <button class="btn-success" id="export-csv">
                            <i class="fas fa-file-csv"></i> Export as CSV
                        </button>
                        <button class="btn-secondary" id="refresh-master">
                            <i class="fas fa-sync-alt"></i> Refresh View
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="master-timetable-view" id="master-timetable-view">
                <!-- Master timetable cards will be loaded here -->
                <div class="empty-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading master timetable...</p>
                </div>
            </div>
        `;
        
        // Load master timetable data
        setTimeout(loadMasterTimetableData, 100);
        
        // Add event listeners
        setTimeout(() => {
            document.getElementById('export-json')?.addEventListener('click', () => exportMasterTimetable('json'));
            document.getElementById('export-csv')?.addEventListener('click', () => exportMasterTimetable('csv'));
            document.getElementById('refresh-master')?.addEventListener('click', loadMasterTimetableData);
        }, 100);
    }
    
    function loadDepartmentsPage() {
        const page = document.getElementById('page-departments');
        if (!page) return;
        
        const departments = DataManager.getDepartments(institute.code);
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-building"></i> Manage Departments</h2>
                <p>Add, edit, or remove departments/branches</p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-list"></i> Departments</h3>
                    <button class="btn-primary" id="add-department">
                        <i class="fas fa-plus"></i> Add Department
                    </button>
                </div>
                <div class="card-content">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Years</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="departments-table-body">
                                ${departments.map(dept => `
                                    <tr data-id="${dept.id}">
                                        <td>${dept.id}</td>
                                        <td>${dept.name}</td>
                                        <td>${dept.years}</td>
                                        <td class="table-actions">
                                            <button class="table-btn edit-department" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="table-btn delete-department" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    ${departments.length === 0 ? `
                        <div class="empty-state">
                            <i class="fas fa-building"></i>
                            <h3>No Departments</h3>
                            <p>Add your first department to get started</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-warehouse"></i> Manage Infrastructure</h3>
                    <button class="btn-success" id="manage-infra">
                        <i class="fas fa-cogs"></i> Manage Infrastructure
                    </button>
                </div>
                <div class="card-content">
                    <p>Infrastructure management allows you to add, edit, or remove buildings, floors, and rooms/labs.</p>
                    <p class="text-muted"><i class="fas fa-info-circle"></i> Changes made here will reflect across all timetables and bookings.</p>
                </div>
            </div>
        `;
        
        // Add event listeners
        setTimeout(() => {
            document.getElementById('add-department')?.addEventListener('click', showAddDepartmentModal);
            document.getElementById('manage-infra')?.addEventListener('click', () => showPage('infrastructure'));
            
            // Edit/Delete department buttons
            document.querySelectorAll('.edit-department').forEach(btn => {
                btn.addEventListener('click', function() {
                    const row = this.closest('tr');
                    const deptId = row.getAttribute('data-id');
                    editDepartment(deptId);
                });
            });
            
            document.querySelectorAll('.delete-department').forEach(btn => {
                btn.addEventListener('click', function() {
                    const row = this.closest('tr');
                    const deptId = row.getAttribute('data-id');
                    deleteDepartment(deptId);
                });
            });
        }, 100);
    }
    
    function loadInfrastructurePage() {
        const page = document.getElementById('page-infrastructure');
        if (!page) return;
        
        const infrastructure = DataManager.getInfrastructure(institute.code);
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-warehouse"></i> Manage Infrastructure</h2>
                <p>Add, edit, or remove buildings, floors, and rooms</p>
            </div>
            
            <div class="tabs">
                <button class="tab active" data-tab="buildings">Buildings</button>
                <button class="tab" data-tab="rooms">Rooms & Labs</button>
            </div>
            
            <div class="tab-content active" id="tab-buildings">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-building"></i> Buildings</h3>
                        <button class="btn-primary" id="add-building">
                            <i class="fas fa-plus"></i> Add Building
                        </button>
                    </div>
                    <div class="card-content">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Floors</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="buildings-table-body">
                                    ${infrastructure.buildings.map(building => `
                                        <tr data-id="${building.id}">
                                            <td>${building.id}</td>
                                            <td>${building.name}</td>
                                            <td>${building.floors}</td>
                                            <td class="table-actions">
                                                <button class="table-btn edit-building" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="table-btn delete-building" title="Delete">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="tab-rooms">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-door-open"></i> Rooms & Labs</h3>
                        <div class="filter-bar">
                            <select class="filter-select" id="filter-building">
                                <option value="">All Buildings</option>
                                ${infrastructure.buildings.map(b => 
                                    `<option value="${b.id}">${b.name}</option>`
                                ).join('')}
                            </select>
                            <button class="btn-primary" id="add-room">
                                <i class="fas fa-plus"></i> Add Room
                            </button>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Room No.</th>
                                        <th>Building</th>
                                        <th>Floor</th>
                                        <th>Type</th>
                                        <th>Capacity</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="rooms-table-body">
                                    ${infrastructure.rooms.map(room => {
                                        const building = infrastructure.buildings.find(b => b.id === room.building);
                                        return `
                                            <tr data-id="${room.id}">
                                                <td>${room.number}</td>
                                                <td>${building ? building.name : room.building}</td>
                                                <td>${room.floor}</td>
                                                <td>
                                                    <span class="badge ${room.type === 'lab' ? 'badge-warning' : 'badge-primary'}">
                                                        ${room.type}
                                                    </span>
                                                    ${room.labType ? `<small>(${room.labType})</small>` : ''}
                                                </td>
                                                <td>${room.capacity}</td>
                                                <td class="table-actions">
                                                    <button class="table-btn edit-room" title="Edit">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button class="table-btn delete-room" title="Delete">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        setTimeout(() => {
            // Tab switching
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
            
            // Building actions
            document.getElementById('add-building')?.addEventListener('click', showAddBuildingModal);
            
            document.querySelectorAll('.edit-building').forEach(btn => {
                btn.addEventListener('click', function() {
                    const row = this.closest('tr');
                    const buildingId = row.getAttribute('data-id');
                    editBuilding(buildingId);
                });
            });
            
            document.querySelectorAll('.delete-building').forEach(btn => {
                btn.addEventListener('click', function() {
                    const row = this.closest('tr');
                    const buildingId = row.getAttribute('data-id');
                    deleteBuilding(buildingId);
                });
            });
            
            // Room actions
            document.getElementById('add-room')?.addEventListener('click', showAddRoomModal);
            
            document.querySelectorAll('.edit-room').forEach(btn => {
                btn.addEventListener('click', function() {
                    const row = this.closest('tr');
                    const roomId = row.getAttribute('data-id');
                    editRoom(roomId);
                });
            });
            
            document.querySelectorAll('.delete-room').forEach(btn => {
                btn.addEventListener('click', function() {
                    const row = this.closest('tr');
                    const roomId = row.getAttribute('data-id');
                    deleteRoom(roomId);
                });
            });
            
            // Filter rooms by building
            document.getElementById('filter-building')?.addEventListener('change', filterRoomsByBuilding);
        }, 100);
    }
    
    function loadTeachersPage() {
        const page = document.getElementById('page-teachers');
        if (!page) return;
        
        const teachers = DataManager.getTeachers(institute.code);
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-chalkboard-teacher"></i> Manage Teachers</h2>
                <p>Add, edit, or remove teachers and assign codes</p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-users"></i> Teachers</h3>
                    <button class="btn-primary" id="add-teacher">
                        <i class="fas fa-plus"></i> Add Teacher
                    </button>
                </div>
                <div class="card-content">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Department</th>
                                    <th>Email</th>
                                    <th>Workload</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="teachers-table-body">
                                ${teachers.map(teacher => `
                                    <tr data-id="${teacher.id}">
                                        <td><strong>${teacher.code}</strong></td>
                                        <td>${teacher.name}</td>
                                        <td>${teacher.department}</td>
                                        <td>${teacher.email}</td>
                                        <td>
                                            <div class="workload-bar">
                                                <div class="workload-fill" style="width: ${(teacher.workload / 30) * 100}%"></div>
                                                <span>${teacher.workload} hrs/week</span>
                                            </div>
                                        </td>
                                        <td class="table-actions">
                                            <button class="table-btn edit-teacher" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="table-btn delete-teacher" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        setTimeout(() => {
            document.getElementById('add-teacher')?.addEventListener('click', showAddTeacherModal);
            
            document.querySelectorAll('.edit-teacher').forEach(btn => {
                btn.addEventListener('click', function() {
                    const row = this.closest('tr');
                    const teacherId = row.getAttribute('data-id');
                    editTeacher(teacherId);
                });
            });
            
            document.querySelectorAll('.delete-teacher').forEach(btn => {
                btn.addEventListener('click', function() {
                    const row = this.closest('tr');
                    const teacherId = row.getAttribute('data-id');
                    deleteTeacher(teacherId);
                });
            });
        }, 100);
        
        // Add workload bar styles
        if (!document.getElementById('workload-styles')) {
            const style = document.createElement('style');
            style.id = 'workload-styles';
            style.textContent = `
                .workload-bar {
                    width: 100px;
                    height: 20px;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 10px;
                    position: relative;
                    overflow: hidden;
                }
                
                .workload-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #4361ee, #7209b7);
                    border-radius: 10px;
                    transition: width 0.3s ease;
                }
                
                .workload-bar span {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function loadRoomsPage() {
        const page = document.getElementById('page-rooms');
        if (!page) return;
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-door-open"></i> Available Rooms</h2>
                <p>View and manage room availability</p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-calendar-day"></i> Check Availability</h3>
                </div>
                <div class="card-content">
                    <div class="filter-bar">
                        <div class="filter-group">
                            <label for="check-date">Date</label>
                            <input type="date" id="check-date" class="filter-select" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="filter-group">
                            <label for="check-period">Period</label>
                            <select id="check-period" class="filter-select">
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
                            <label>&nbsp;</label>
                            <button class="btn-primary" id="check-availability">
                                <i class="fas fa-search"></i> Check Availability
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="rooms-availability-container">
                <div class="empty-state">
                    <i class="fas fa-door-open"></i>
                    <h3>Select Date and Period</h3>
                    <p>Use the filters above to check room availability</p>
                </div>
            </div>
        `;
        
        // Add event listeners
        setTimeout(() => {
            document.getElementById('check-availability')?.addEventListener('click', checkRoomAvailability);
        }, 100);
    }
    
    function loadWorkloadPage() {
        const page = document.getElementById('page-workload');
        if (!page) return;
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-chart-bar"></i> Teacher Workload</h2>
                <p>Monitor teacher workload and schedule</p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-filter"></i> Filter</h3>
                    <select class="filter-select" id="filter-teacher-workload">
                        <option value="">All Teachers</option>
                        ${DataManager.getTeachers(institute.code).map(teacher => 
                            `<option value="${teacher.id}">${teacher.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="card-content">
                    <div class="workload-charts-container" id="workload-charts-container">
                        <!-- Charts will be loaded here -->
                        <div class="empty-state">
                            <i class="fas fa-chart-bar"></i>
                            <h3>Workload Overview</h3>
                            <p>Select a teacher to view detailed workload information</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        setTimeout(() => {
            document.getElementById('filter-teacher-workload')?.addEventListener('change', loadWorkloadCharts);
            // Load charts for all teachers initially
            loadWorkloadCharts();
        }, 100);
    }
    
    function loadExportPage() {
        const page = document.getElementById('page-export');
        if (!page) return;
        
        page.innerHTML = `
            <div class="page-header">
                <h2><i class="fas fa-file-export"></i> Export Data</h2>
                <p>Export institute data in various formats</p>
            </div>
            
            <div class="card-grid">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-calendar-alt"></i> Timetable Data</h3>
                    </div>
                    <div class="card-content">
                        <p>Export all timetable data for backup or analysis.</p>
                        <div class="export-options">
                            <button class="btn-primary export-btn" data-type="timetable-json">
                                <i class="fas fa-file-code"></i> Export as JSON
                            </button>
                            <button class="btn-success export-btn" data-type="timetable-csv">
                                <i class="fas fa-file-csv"></i> Export as CSV
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-users"></i> Teacher Data</h3>
                    </div>
                    <div class="card-content">
                        <p>Export teacher information and workload data.</p>
                        <div class="export-options">
                            <button class="btn-primary export-btn" data-type="teacher-json">
                                <i class="fas fa-file-code"></i> Export as JSON
                            </button>
                            <button class="btn-success export-btn" data-type="teacher-csv">
                                <i class="fas fa-file-csv"></i> Export as CSV
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-building"></i> Infrastructure Data</h3>
                    </div>
                    <div class="card-content">
                        <p>Export building and room information.</p>
                        <div class="export-options">
                            <button class="btn-primary export-btn" data-type="infra-json">
                                <i class="fas fa-file-code"></i> Export as JSON
                            </button>
                            <button class="btn-success export-btn" data-type="infra-csv">
                                <i class="fas fa-file-csv"></i> Export as CSV
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-database"></i> Complete Backup</h3>
                    </div>
                    <div class="card-content">
                        <p>Export complete institute data including all configurations.</p>
                        <div class="export-options">
                            <button class="btn-warning export-btn" data-type="complete-backup">
                                <i class="fas fa-database"></i> Complete Backup
                            </button>
                        </div>
                        <p class="text-muted mt-2"><i class="fas fa-info-circle"></i> This will export all data in JSON format for backup purposes.</p>
                    </div>
                </div>
            </div>
            
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-file-import"></i> Import Data</h3>
                </div>
                <div class="card-content">
                    <p>Import data from previously exported files.</p>
                    <div class="import-options">
                        <div class="form-group">
                            <label for="import-file">
                                <i class="fas fa-upload"></i> Select File to Import
                            </label>
                            <input type="file" id="import-file" accept=".json,.csv">
                        </div>
                        <button class="btn-primary" id="import-data">
                            <i class="fas fa-file-import"></i> Import Data
                        </button>
                    </div>
                    <p class="text-muted mt-2"><i class="fas fa-exclamation-triangle"></i> Note: Importing will overwrite existing data. Make sure to backup first.</p>
                </div>
            </div>
        `;
        
        // Add event listeners
        setTimeout(() => {
            document.querySelectorAll('.export-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const type = this.getAttribute('data-type');
                    exportData(type);
                });
            });
            
            document.getElementById('import-data')?.addEventListener('click', importData);
        }, 100);
    }
    
    // Helper functions for specific actions
    
    function showConflictResolution() {
        Utils.createModal({
            title: 'Resolve Timetable Conflicts',
            content: `
                <p>Select how you want to resolve conflicts:</p>
                <div class="form-group">
                    <label>
                        <input type="radio" name="resolve-method" value="auto" checked>
                        Auto-resolve (System will suggest changes)
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="radio" name="resolve-method" value="manual">
                        Manual resolution (You will review each conflict)
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="create-backup" checked>
                        Create backup before resolving
                    </label>
                </div>
            `,
            confirmText: 'Resolve Conflicts',
            onConfirm: function() {
                Utils.showNotification('Conflict resolution started', 'success');
                // In a real implementation, this would trigger conflict resolution logic
            }
        });
    }
    
    function showAddDepartmentModal() {
        Utils.createModal({
            title: 'Add New Department',
            content: `
                <div class="form-group">
                    <label for="dept-id">Department ID</label>
                    <input type="text" id="dept-id" placeholder="e.g., CS" maxlength="10">
                </div>
                <div class="form-group">
                    <label for="dept-name">Department Name</label>
                    <input type="text" id="dept-name" placeholder="e.g., Computer Science">
                </div>
                <div class="form-group">
                    <label for="dept-years">Number of Years</label>
                    <select id="dept-years">
                        <option value="3">3 Years</option>
                        <option value="4" selected>4 Years</option>
                        <option value="5">5 Years</option>
                    </select>
                </div>
            `,
            onConfirm: function() {
                const id = document.getElementById('dept-id').value.trim();
                const name = document.getElementById('dept-name').value.trim();
                const years = parseInt(document.getElementById('dept-years').value);
                
                if (!id || !name) {
                    Utils.showNotification('Please fill all required fields', 'error');
                    return;
                }
                
                const departments = DataManager.getDepartments(institute.code);
                if (departments.some(dept => dept.id === id)) {
                    Utils.showNotification('Department ID already exists', 'error');
                    return;
                }
                
                departments.push({ id, name, years });
                DataManager.updateDepartments(institute.code, departments);
                
                Utils.showNotification(`Department ${name} added successfully`, 'success');
                loadDepartmentsPage();
            }
        });
    }
    
    function editDepartment(deptId) {
        const departments = DataManager.getDepartments(institute.code);
        const department = departments.find(d => d.id === deptId);
        
        if (!department) return;
        
        Utils.createModal({
            title: 'Edit Department',
            content: `
                <div class="form-group">
                    <label for="edit-dept-id">Department ID</label>
                    <input type="text" id="edit-dept-id" value="${department.id}" readonly>
                    <div class="form-hint">Department ID cannot be changed</div>
                </div>
                <div class="form-group">
                    <label for="edit-dept-name">Department Name</label>
                    <input type="text" id="edit-dept-name" value="${department.name}">
                </div>
                <div class="form-group">
                    <label for="edit-dept-years">Number of Years</label>
                    <select id="edit-dept-years">
                        <option value="3" ${department.years === 3 ? 'selected' : ''}>3 Years</option>
                        <option value="4" ${department.years === 4 ? 'selected' : ''}>4 Years</option>
                        <option value="5" ${department.years === 5 ? 'selected' : ''}>5 Years</option>
                    </select>
                </div>
            `,
            onConfirm: function() {
                const name = document.getElementById('edit-dept-name').value.trim();
                const years = parseInt(document.getElementById('edit-dept-years').value);
                
                if (!name) {
                    Utils.showNotification('Department name is required', 'error');
                    return;
                }
                
                const deptIndex = departments.findIndex(d => d.id === deptId);
                if (deptIndex !== -1) {
                    departments[deptIndex] = { ...departments[deptIndex], name, years };
                    DataManager.updateDepartments(institute.code, departments);
                    
                    Utils.showNotification(`Department updated successfully`, 'success');
                    loadDepartmentsPage();
                }
            }
        });
    }
    
    function deleteDepartment(deptId) {
        Utils.createModal({
            title: 'Confirm Delete',
            content: `<p>Are you sure you want to delete this department? This action cannot be undone.</p>`,
            confirmText: 'Delete',
            onConfirm: function() {
                const departments = DataManager.getDepartments(institute.code);
                const updatedDepartments = departments.filter(d => d.id !== deptId);
                DataManager.updateDepartments(institute.code, updatedDepartments);
                
                Utils.showNotification('Department deleted successfully', 'success');
                loadDepartmentsPage();
            }
        });
    }
    
    function showAddBuildingModal() {
        Utils.createModal({
            title: 'Add New Building',
            content: `
                <div class="form-group">
                    <label for="building-id">Building ID</label>
                    <input type="text" id="building-id" placeholder="e.g., B001" maxlength="10">
                </div>
                <div class="form-group">
                    <label for="building-name">Building Name</label>
                    <input type="text" id="building-name" placeholder="e.g., Main Building">
                </div>
                <div class="form-group">
                    <label for="building-floors">Number of Floors</label>
                    <input type="number" id="building-floors" min="1" max="20" value="3">
                </div>
            `,
            onConfirm: function() {
                const id = document.getElementById('building-id').value.trim();
                const name = document.getElementById('building-name').value.trim();
                const floors = parseInt(document.getElementById('building-floors').value);
                
                if (!id || !name) {
                    Utils.showNotification('Please fill all required fields', 'error');
                    return;
                }
                
                const infrastructure = DataManager.getInfrastructure(institute.code);
                if (infrastructure.buildings.some(b => b.id === id)) {
                    Utils.showNotification('Building ID already exists', 'error');
                    return;
                }
                
                infrastructure.buildings.push({ id, name, floors });
                DataManager.updateInfrastructure(institute.code, infrastructure);
                
                Utils.showNotification(`Building ${name} added successfully`, 'success');
                loadInfrastructurePage();
            }
        });
    }
    
    function editBuilding(buildingId) {
        const infrastructure = DataManager.getInfrastructure(institute.code);
        const building = infrastructure.buildings.find(b => b.id === buildingId);
        
        if (!building) return;
        
        Utils.createModal({
            title: 'Edit Building',
            content: `
                <div class="form-group">
                    <label for="edit-building-id">Building ID</label>
                    <input type="text" id="edit-building-id" value="${building.id}" readonly>
                    <div class="form-hint">Building ID cannot be changed</div>
                </div>
                <div class="form-group">
                    <label for="edit-building-name">Building Name</label>
                    <input type="text" id="edit-building-name" value="${building.name}">
                </div>
                <div class="form-group">
                    <label for="edit-building-floors">Number of Floors</label>
                    <input type="number" id="edit-building-floors" min="1" max="20" value="${building.floors}">
                </div>
            `,
            onConfirm: function() {
                const name = document.getElementById('edit-building-name').value.trim();
                const floors = parseInt(document.getElementById('edit-building-floors').value);
                
                if (!name) {
                    Utils.showNotification('Building name is required', 'error');
                    return;
                }
                
                const buildingIndex = infrastructure.buildings.findIndex(b => b.id === buildingId);
                if (buildingIndex !== -1) {
                    infrastructure.buildings[buildingIndex] = { 
                        ...infrastructure.buildings[buildingIndex], 
                        name, 
                        floors 
                    };
                    DataManager.updateInfrastructure(institute.code, infrastructure);
                    
                    Utils.showNotification(`Building updated successfully`, 'success');
                    loadInfrastructurePage();
                }
            }
        });
    }
    
    function deleteBuilding(buildingId) {
        // Check if building has rooms
        const infrastructure = DataManager.getInfrastructure(institute.code);
        const roomsInBuilding = infrastructure.rooms.filter(r => r.building === buildingId);
        
        if (roomsInBuilding.length > 0) {
            Utils.createModal({
                title: 'Cannot Delete Building',
                content: `
                    <p>This building contains ${roomsInBuilding.length} rooms. 
                    You must delete or move all rooms before deleting the building.</p>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="move-rooms">
                            Move rooms to another building
                        </label>
                    </div>
                    <div class="form-group" id="new-building-container" style="display: none;">
                        <label for="new-building">Select New Building</label>
                        <select id="new-building">
                            ${infrastructure.buildings
                                .filter(b => b.id !== buildingId)
                                .map(b => `<option value="${b.id}">${b.name}</option>`)
                                .join('')}
                        </select>
                    </div>
                `,
                confirmText: 'Move Rooms and Delete',
                onCancel: null,
                onConfirm: function() {
                    const moveRooms = document.getElementById('move-rooms').checked;
                    
                    if (moveRooms) {
                        const newBuilding = document.getElementById('new-building').value;
                        
                        // Move rooms to new building
                        infrastructure.rooms.forEach(room => {
                            if (room.building === buildingId) {
                                room.building = newBuilding;
                            }
                        });
                    } else {
                        // Delete rooms in building
                        infrastructure.rooms = infrastructure.rooms.filter(r => r.building !== buildingId);
                    }
                    
                    // Delete building
                    infrastructure.buildings = infrastructure.buildings.filter(b => b.id !== buildingId);
                    DataManager.updateInfrastructure(institute.code, infrastructure);
                    
                    Utils.showNotification('Building deleted successfully', 'success');
                    loadInfrastructurePage();
                }
            });
            
            // Show/hide new building selector
            setTimeout(() => {
                const moveCheckbox = document.getElementById('move-rooms');
                const newBuildingContainer = document.getElementById('new-building-container');
                
                moveCheckbox.addEventListener('change', function() {
                    newBuildingContainer.style.display = this.checked ? 'block' : 'none';
                });
            }, 100);
        } else {
            Utils.createModal({
                title: 'Confirm Delete',
                content: `<p>Are you sure you want to delete this building? This action cannot be undone.</p>`,
                confirmText: 'Delete',
                onConfirm: function() {
                    infrastructure.buildings = infrastructure.buildings.filter(b => b.id !== buildingId);
                    DataManager.updateInfrastructure(institute.code, infrastructure);
                    
                    Utils.showNotification('Building deleted successfully', 'success');
                    loadInfrastructurePage();
                }
            });
        }
    }
    
    function showAddRoomModal() {
        const infrastructure = DataManager.getInfrastructure(institute.code);
        
        Utils.createModal({
            title: 'Add New Room',
            content: `
                <div class="form-group">
                    <label for="room-number">Room Number</label>
                    <input type="text" id="room-number" placeholder="e.g., 101">
                </div>
                <div class="form-group">
                    <label for="room-building">Building</label>
                    <select id="room-building">
                        ${infrastructure.buildings.map(b => 
                            `<option value="${b.id}">${b.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="room-floor">Floor</label>
                    <select id="room-floor">
                        ${Array.from({length: 10}, (_, i) => i + 1)
                            .map(floor => `<option value="${floor}">Floor ${floor}</option>`)
                            .join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="room-type">Room Type</label>
                    <select id="room-type">
                        <option value="classroom">Classroom</option>
                        <option value="lab">Laboratory</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group" id="lab-type-container" style="display: none;">
                    <label for="room-lab-type">Laboratory Type</label>
                    <input type="text" id="room-lab-type" placeholder="e.g., Computer Lab, Physics Lab">
                </div>
                <div class="form-group">
                    <label for="room-capacity">Capacity</label>
                    <input type="number" id="room-capacity" min="1" max="500" value="30">
                </div>
            `,
            onConfirm: function() {
                const number = document.getElementById('room-number').value.trim();
                const building = document.getElementById('room-building').value;
                const floor = parseInt(document.getElementById('room-floor').value);
                const type = document.getElementById('room-type').value;
                const capacity = parseInt(document.getElementById('room-capacity').value);
                let labType = '';
                
                if (type === 'lab') {
                    labType = document.getElementById('room-lab-type').value.trim();
                }
                
                if (!number) {
                    Utils.showNotification('Room number is required', 'error');
                    return;
                }
                
                // Check for duplicate room number in same building
                const existingRoom = infrastructure.rooms.find(r => 
                    r.building === building && r.number === number
                );
                
                if (existingRoom) {
                    Utils.showNotification('Room number already exists in this building', 'error');
                    return;
                }
                
                const roomId = `R${String(infrastructure.rooms.length + 1).padStart(3, '0')}`;
                const newRoom = {
                    id: roomId,
                    building,
                    floor,
                    number,
                    type,
                    capacity,
                    ...(labType && { labType })
                };
                
                infrastructure.rooms.push(newRoom);
                DataManager.updateInfrastructure(institute.code, infrastructure);
                
                Utils.showNotification(`Room ${number} added successfully`, 'success');
                loadInfrastructurePage();
            }
        });
        
        // Show/hide lab type field based on room type
        setTimeout(() => {
            const roomTypeSelect = document.getElementById('room-type');
            const labTypeContainer = document.getElementById('lab-type-container');
            
            roomTypeSelect.addEventListener('change', function() {
                labTypeContainer.style.display = this.value === 'lab' ? 'block' : 'none';
            });
        }, 100);
    }
    
    function editRoom(roomId) {
        const infrastructure = DataManager.getInfrastructure(institute.code);
        const room = infrastructure.rooms.find(r => r.id === roomId);
        
        if (!room) return;
        
        const building = infrastructure.buildings.find(b => b.id === room.building);
        
        Utils.createModal({
            title: 'Edit Room',
            content: `
                <div class="form-group">
                    <label for="edit-room-id">Room ID</label>
                    <input type="text" id="edit-room-id" value="${room.id}" readonly>
                    <div class="form-hint">Room ID cannot be changed</div>
                </div>
                <div class="form-group">
                    <label for="edit-room-number">Room Number</label>
                    <input type="text" id="edit-room-number" value="${room.number}">
                </div>
                <div class="form-group">
                    <label for="edit-room-building">Building</label>
                    <select id="edit-room-building">
                        ${infrastructure.buildings.map(b => 
                            `<option value="${b.id}" ${b.id === room.building ? 'selected' : ''}>${b.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-room-floor">Floor</label>
                    <select id="edit-room-floor">
                        ${Array.from({length: 10}, (_, i) => i + 1)
                            .map(floor => `<option value="${floor}" ${floor === room.floor ? 'selected' : ''}>Floor ${floor}</option>`)
                            .join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-room-type">Room Type</label>
                    <select id="edit-room-type">
                        <option value="classroom" ${room.type === 'classroom' ? 'selected' : ''}>Classroom</option>
                        <option value="lab" ${room.type === 'lab' ? 'selected' : ''}>Laboratory</option>
                        <option value="other" ${room.type === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group" id="edit-lab-type-container" style="${room.type === 'lab' ? 'block' : 'none'}">
                    <label for="edit-room-lab-type">Laboratory Type</label>
                    <input type="text" id="edit-room-lab-type" value="${room.labType || ''}" placeholder="e.g., Computer Lab, Physics Lab">
                </div>
                <div class="form-group">
                    <label for="edit-room-capacity">Capacity</label>
                    <input type="number" id="edit-room-capacity" min="1" max="500" value="${room.capacity}">
                </div>
            `,
            onConfirm: function() {
                const number = document.getElementById('edit-room-number').value.trim();
                const building = document.getElementById('edit-room-building').value;
                const floor = parseInt(document.getElementById('edit-room-floor').value);
                const type = document.getElementById('edit-room-type').value;
                const capacity = parseInt(document.getElementById('edit-room-capacity').value);
                let labType = '';
                
                if (type === 'lab') {
                    labType = document.getElementById('edit-room-lab-type').value.trim();
                }
                
                if (!number) {
                    Utils.showNotification('Room number is required', 'error');
                    return;
                }
                
                // Check for duplicate room number in same building (excluding current room)
                const existingRoom = infrastructure.rooms.find(r => 
                    r.id !== roomId && r.building === building && r.number === number
                );
                
                if (existingRoom) {
                    Utils.showNotification('Room number already exists in this building', 'error');
                    return;
                }
                
                const roomIndex = infrastructure.rooms.findIndex(r => r.id === roomId);
                if (roomIndex !== -1) {
                    infrastructure.rooms[roomIndex] = {
                        ...infrastructure.rooms[roomIndex],
                        building,
                        floor,
                        number,
                        type,
                        capacity,
                        ...(labType && { labType })
                    };
                    DataManager.updateInfrastructure(institute.code, infrastructure);
                    
                    Utils.showNotification(`Room ${number} updated successfully`, 'success');
                    loadInfrastructurePage();
                }
            }
        });
        
        // Show/hide lab type field based on room type
        setTimeout(() => {
            const roomTypeSelect = document.getElementById('edit-room-type');
            const labTypeContainer = document.getElementById('edit-lab-type-container');
            
            roomTypeSelect.addEventListener('change', function() {
                labTypeContainer.style.display = this.value === 'lab' ? 'block' : 'none';
            });
        }, 100);
    }
    
    function deleteRoom(roomId) {
        Utils.createModal({
            title: 'Confirm Delete',
            content: `<p>Are you sure you want to delete this room? This action cannot be undone.</p>`,
            confirmText: 'Delete',
            onConfirm: function() {
                const infrastructure = DataManager.getInfrastructure(institute.code);
                infrastructure.rooms = infrastructure.rooms.filter(r => r.id !== roomId);
                DataManager.updateInfrastructure(institute.code, infrastructure);
                
                Utils.showNotification('Room deleted successfully', 'success');
                loadInfrastructurePage();
            }
        });
    }
    
    function filterRoomsByBuilding() {
        const buildingId = document.getElementById('filter-building').value;
        const rows = document.querySelectorAll('#rooms-table-body tr');
        
        rows.forEach(row => {
            const roomBuilding = row.querySelector('td:nth-child(2)').textContent;
            const show = !buildingId || roomBuilding.includes(buildingId);
            row.style.display = show ? '' : 'none';
        });
    }
    
    function showAddTeacherModal() {
        const departments = DataManager.getDepartments(institute.code);
        
        Utils.createModal({
            title: 'Add New Teacher',
            content: `
                <div class="form-group">
                    <label for="teacher-code">Teacher Code</label>
                    <input type="text" id="teacher-code" placeholder="e.g., PROF001">
                </div>
                <div class="form-group">
                    <label for="teacher-name">Full Name</label>
                    <input type="text" id="teacher-name" placeholder="e.g., Dr. John Smith">
                </div>
                <div class="form-group">
                    <label for="teacher-department">Department</label>
                    <select id="teacher-department">
                        ${departments.map(dept => 
                            `<option value="${dept.id}">${dept.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="teacher-email">Email Address</label>
                    <input type="email" id="teacher-email" placeholder="e.g., john.smith@institute.edu">
                </div>
                <div class="form-group">
                    <label for="teacher-workload">Initial Workload (hours/week)</label>
                    <input type="number" id="teacher-workload" min="0" max="40" value="15">
                </div>
            `,
            onConfirm: function() {
                const code = document.getElementById('teacher-code').value.trim();
                const name = document.getElementById('teacher-name').value.trim();
                const department = document.getElementById('teacher-department').value;
                const email = document.getElementById('teacher-email').value.trim();
                const workload = parseInt(document.getElementById('teacher-workload').value);
                
                if (!code || !name || !email) {
                    Utils.showNotification('Please fill all required fields', 'error');
                    return;
                }
                
                if (email && !Utils.validateEmail(email)) {
                    Utils.showNotification('Please enter a valid email address', 'error');
                    return;
                }
                
                const teachers = DataManager.getTeachers(institute.code);
                if (teachers.some(t => t.code === code)) {
                    Utils.showNotification('Teacher code already exists', 'error');
                    return;
                }
                
                const teacherId = `T${String(teachers.length + 1).padStart(3, '0')}`;
                const newTeacher = {
                    id: teacherId,
                    code,
                    name,
                    department,
                    email,
                    workload
                };
                
                teachers.push(newTeacher);
                DataManager.updateTeachers(institute.code, teachers);
                
                Utils.showNotification(`Teacher ${name} added successfully`, 'success');
                loadTeachersPage();
            }
        });
    }
    
    function editTeacher(teacherId) {
        const teachers = DataManager.getTeachers(institute.code);
        const teacher = teachers.find(t => t.id === teacherId);
        const departments = DataManager.getDepartments(institute.code);
        
        if (!teacher) return;
        
        Utils.createModal({
            title: 'Edit Teacher',
            content: `
                <div class="form-group">
                    <label for="edit-teacher-id">Teacher ID</label>
                    <input type="text" id="edit-teacher-id" value="${teacher.id}" readonly>
                </div>
                <div class="form-group">
                    <label for="edit-teacher-code">Teacher Code</label>
                    <input type="text" id="edit-teacher-code" value="${teacher.code}">
                </div>
                <div class="form-group">
                    <label for="edit-teacher-name">Full Name</label>
                    <input type="text" id="edit-teacher-name" value="${teacher.name}">
                </div>
                <div class="form-group">
                    <label for="edit-teacher-department">Department</label>
                    <select id="edit-teacher-department">
                        ${departments.map(dept => 
                            `<option value="${dept.id}" ${dept.id === teacher.department ? 'selected' : ''}>${dept.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-teacher-email">Email Address</label>
                    <input type="email" id="edit-teacher-email" value="${teacher.email}">
                </div>
                <div class="form-group">
                    <label for="edit-teacher-workload">Workload (hours/week)</label>
                    <input type="number" id="edit-teacher-workload" min="0" max="40" value="${teacher.workload}">
                </div>
            `,
            onConfirm: function() {
                const code = document.getElementById('edit-teacher-code').value.trim();
                const name = document.getElementById('edit-teacher-name').value.trim();
                const department = document.getElementById('edit-teacher-department').value;
                const email = document.getElementById('edit-teacher-email').value.trim();
                const workload = parseInt(document.getElementById('edit-teacher-workload').value);
                
                if (!code || !name || !email) {
                    Utils.showNotification('Please fill all required fields', 'error');
                    return;
                }
                
                if (email && !Utils.validateEmail(email)) {
                    Utils.showNotification('Please enter a valid email address', 'error');
                    return;
                }
                
                // Check for duplicate teacher code (excluding current teacher)
                const duplicateTeacher = teachers.find(t => 
                    t.id !== teacherId && t.code === code
                );
                
                if (duplicateTeacher) {
                    Utils.showNotification('Teacher code already exists', 'error');
                    return;
                }
                
                const teacherIndex = teachers.findIndex(t => t.id === teacherId);
                if (teacherIndex !== -1) {
                    teachers[teacherIndex] = {
                        ...teachers[teacherIndex],
                        code,
                        name,
                        department,
                        email,
                        workload
                    };
                    DataManager.updateTeachers(institute.code, teachers);
                    
                    Utils.showNotification(`Teacher ${name} updated successfully`, 'success');
                    loadTeachersPage();
                }
            }
        });
    }
    
    function deleteTeacher(teacherId) {
        Utils.createModal({
            title: 'Confirm Delete',
            content: `<p>Are you sure you want to delete this teacher? This action cannot be undone.</p>`,
            confirmText: 'Delete',
            onConfirm: function() {
                const teachers = DataManager.getTeachers(institute.code);
                const updatedTeachers = teachers.filter(t => t.id !== teacherId);
                DataManager.updateTeachers(institute.code, updatedTeachers);
                
                Utils.showNotification('Teacher deleted successfully', 'success');
                loadTeachersPage();
            }
        });
    }
    
    function checkRoomAvailability() {
        const date = document.getElementById('check-date').value;
        const period = parseInt(document.getElementById('check-period').value);
        
        if (!date) {
            Utils.showNotification('Please select a date', 'error');
            return;
        }
        
        const availableRooms = DataManager.getAvailableRooms(institute.code, date, period);
        const infrastructure = DataManager.getInfrastructure(institute.code);
        const bookings = DataManager.getRoomBookings(institute.code);
        
        const container = document.getElementById('rooms-availability-container');
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
        
        // Get booked rooms for the same period
        const bookedRooms = bookings
            .filter(b => b.date === date && b.period === period)
            .map(b => b.roomId);
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-calendar-check"></i> 
                        Room Availability for ${new Date(date).toLocaleDateString()}, Period ${period}
                    </h3>
                    <span class="badge badge-success">${availableRooms.length} rooms available</span>
                </div>
                <div class="card-content">
                    <div class="rooms-availability-grid">
                        ${availableRooms.map(room => {
                            const building = infrastructure.buildings.find(b => b.id === room.building);
                            const isBooked = bookedRooms.includes(room.id);
                            
                            return `
                                <div class="room-availability-card ${isBooked ? 'booked' : 'available'}">
                                    <div class="room-availability-header">
                                        <h4>Room ${room.number}</h4>
                                        <span class="room-status ${isBooked ? 'booked' : 'available'}">
                                            ${isBooked ? 'Booked' : 'Available'}
                                        </span>
                                    </div>
                                    <div class="room-availability-details">
                                        <p><i class="fas fa-building"></i> ${building ? building.name : room.building}</p>
                                        <p><i class="fas fa-layer-group"></i> Floor ${room.floor}</p>
                                        <p><i class="fas fa-users"></i> Capacity: ${room.capacity}</p>
                                        <p><i class="fas fa-tag"></i> ${room.type} ${room.labType ? `(${room.labType})` : ''}</p>
                                    </div>
                                    ${!isBooked ? `
                                        <div class="room-availability-actions">
                                            <button class="btn-primary btn-sm book-room-btn" data-room="${room.id}">
                                                <i class="fas fa-calendar-plus"></i> Book Now
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Add booking functionality
        container.querySelectorAll('.book-room-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const roomId = this.getAttribute('data-room');
                bookRoom(roomId, date, period);
            });
        });
    }
    
    function bookRoom(roomId, date, period) {
        const infrastructure = DataManager.getInfrastructure(institute.code);
        const room = infrastructure.rooms.find(r => r.id === roomId);
        
        if (!room) return;
        
        Utils.createModal({
            title: 'Book Room',
            content: `
                <div class="form-group">
                    <label for="booking-purpose">Purpose of Booking</label>
                    <input type="text" id="booking-purpose" placeholder="e.g., Guest Lecture, Meeting">
                </div>
                <div class="form-group">
                    <label for="booking-teacher">Teacher (Optional)</label>
                    <select id="booking-teacher">
                        <option value="">Select Teacher</option>
                        ${DataManager.getTeachers(institute.code).map(teacher => 
                            `<option value="${teacher.id}">${teacher.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="booking-details">
                    <p><strong>Room:</strong> ${room.number}</p>
                    <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                    <p><strong>Period:</strong> ${period}</p>
                </div>
            `,
            onConfirm: function() {
                const purpose = document.getElementById('booking-purpose').value.trim();
                const teacherId = document.getElementById('booking-teacher').value;
                
                if (!purpose) {
                    Utils.showNotification('Please enter booking purpose', 'error');
                    return;
                }
                
                const booking = {
                    roomId,
                    teacherId,
                    date,
                    period,
                    purpose
                };
                
                DataManager.addRoomBooking(institute.code, booking);
                Utils.showNotification(`Room ${room.number} booked successfully`, 'success');
                
                // Refresh availability view
                checkRoomAvailability();
            }
        });
    }
    
    function loadWorkloadCharts() {
        const teacherId = document.getElementById('filter-teacher-workload')?.value;
        const container = document.getElementById('workload-charts-container');
        
        if (!container) return;
        
        const teachers = DataManager.getTeachers(institute.code);
        
        if (!teacherId) {
            // Show overview of all teachers
            container.innerHTML = `
                <canvas id="workloadOverviewChart" height="300"></canvas>
                <div class="mt-3">
                    <h4>Detailed Workload</h4>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Teacher</th>
                                    <th>Department</th>
                                    <th>Workload (hrs/week)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${teachers.map(teacher => {
                                    const workload = teacher.workload;
                                    let status = 'Optimal';
                                    let statusClass = 'badge-success';
                                    
                                    if (workload > 25) {
                                        status = 'Heavy';
                                        statusClass = 'badge-danger';
                                    } else if (workload > 18) {
                                        status = 'Moderate';
                                        statusClass = 'badge-warning';
                                    } else if (workload < 12) {
                                        status = 'Light';
                                        statusClass = 'badge-info';
                                    }
                                    
                                    return `
                                        <tr>
                                            <td>${teacher.name}</td>
                                            <td>${teacher.department}</td>
                                            <td>
                                                <div class="workload-bar">
                                                    <div class="workload-fill" style="width: ${(workload / 30) * 100}%"></div>
                                                    <span>${workload} hrs</span>
                                                </div>
                                            </td>
                                            <td><span class="badge ${statusClass}">${status}</span></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            // Create chart
            setTimeout(() => {
                const ctx = document.getElementById('workloadOverviewChart')?.getContext('2d');
                if (!ctx) return;
                
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: teachers.map(t => t.name),
                        datasets: [{
                            label: 'Workload (hours/week)',
                            data: teachers.map(t => t.workload),
                            backgroundColor: teachers.map(t => {
                                const workload = t.workload;
                                if (workload > 25) return 'rgba(247, 37, 133, 0.7)';
                                if (workload > 18) return 'rgba(247, 173, 37, 0.7)';
                                if (workload < 12) return 'rgba(76, 201, 240, 0.7)';
                                return 'rgba(67, 97, 238, 0.7)';
                            }),
                            borderColor: teachers.map(t => {
                                const workload = t.workload;
                                if (workload > 25) return 'rgba(247, 37, 133, 1)';
                                if (workload > 18) return 'rgba(247, 173, 37, 1)';
                                if (workload < 12) return 'rgba(76, 201, 240, 1)';
                                return 'rgba(67, 97, 238, 1)';
                            }),
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 30,
                                title: {
                                    display: true,
                                    text: 'Hours per Week'
                                }
                            },
                            x: {
                                ticks: {
                                    autoSkip: false,
                                    maxRotation: 45
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
                                        return `Workload: ${context.parsed.y} hours/week`;
                                    }
                                }
                            }
                        }
                    }
                });
            }, 100);
        } else {
            // Show detailed view for specific teacher
            const teacher = teachers.find(t => t.id === teacherId);
            if (!teacher) return;
            
            const workloadData = DataManager.getTeacherWorkload(institute.code, teacherId);
            
            container.innerHTML = `
                <div class="teacher-workload-details">
                    <div class="teacher-header">
                        <h3>${teacher.name}</h3>
                        <p>${teacher.department} • ${teacher.email}</p>
                    </div>
                    
                    <div class="workload-summary">
                        <div class="summary-card">
                            <h4>Weekly Workload</h4>
                            <div class="summary-value">${workloadData.weekly} hours</div>
                        </div>
                        <div class="summary-card">
                            <h4>Daily Average</h4>
                            <div class="summary-value">${(workloadData.weekly / 6).toFixed(1)} hours</div>
                        </div>
                    </div>
                    
                    <div class="daily-workload-chart">
                        <canvas id="dailyWorkloadChart" height="200"></canvas>
                    </div>
                    
                    <div class="teacher-schedule mt-3">
                        <h4>This Week's Schedule</h4>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Day</th>
                                        <th>Periods</th>
                                        <th>Classes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(workloadData.daily).map(([day, count]) => `
                                        <tr>
                                            <td>${day}</td>
                                            <td>${count} periods</td>
                                            <td>
                                                <div class="schedule-dots">
                                                    ${Array.from({length: Math.min(count, 7)}, (_, i) => 
                                                        `<span class="schedule-dot" style="background: ${count > 4 ? '#f72585' : '#4361ee'}"></span>`
                                                    ).join('')}
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            // Create daily workload chart
            setTimeout(() => {
                const ctx = document.getElementById('dailyWorkloadChart')?.getContext('2d');
                if (!ctx) return;
                
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(workloadData.daily),
                        datasets: [{
                            label: 'Periods per Day',
                            data: Object.values(workloadData.daily),
                            backgroundColor: Object.values(workloadData.daily).map(count => 
                                count > 4 ? 'rgba(247, 37, 133, 0.7)' : 'rgba(67, 97, 238, 0.7)'
                            ),
                            borderColor: Object.values(workloadData.daily).map(count => 
                                count > 4 ? 'rgba(247, 37, 133, 1)' : 'rgba(67, 97, 238, 1)'
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
    }
    
    function exportData(type) {
        const instituteCode = institute.code;
        let content, filename;
        
        switch (type) {
            case 'timetable-json':
                content = DataManager.exportTimetable(instituteCode, 'json');
                filename = `timetable_${instituteCode}_${new Date().toISOString().split('T')[0]}.json`;
                break;
            case 'timetable-csv':
                content = DataManager.exportTimetable(instituteCode, 'csv');
                filename = `timetable_${instituteCode}_${new Date().toISOString().split('T')[0]}.csv`;
                break;
            case 'teacher-json':
                const teachers = DataManager.getTeachers(instituteCode);
                content = JSON.stringify(teachers, null, 2);
                filename = `teachers_${instituteCode}_${new Date().toISOString().split('T')[0]}.json`;
                break;
            case 'teacher-csv':
                const teachersData = DataManager.getTeachers(instituteCode);
                content = Utils.arrayToCSV(teachersData);
                filename = `teachers_${instituteCode}_${new Date().toISOString().split('T')[0]}.csv`;
                break;
            case 'infra-json':
                const infra = DataManager.getInfrastructure(instituteCode);
                content = JSON.stringify(infra, null, 2);
                filename = `infrastructure_${instituteCode}_${new Date().toISOString().split('T')[0]}.json`;
                break;
            case 'infra-csv':
                const infraData = DataManager.getInfrastructure(instituteCode);
                const flatRooms = infraData.rooms.map(room => ({
                    id: room.id,
                    building: room.building,
                    floor: room.floor,
                    number: room.number,
                    type: room.type,
                    labType: room.labType || '',
                    capacity: room.capacity
                }));
                content = Utils.arrayToCSV(flatRooms);
                filename = `rooms_${instituteCode}_${new Date().toISOString().split('T')[0]}.csv`;
                break;
            case 'complete-backup':
                const completeData = DataManager.getInstitute(instituteCode);
                content = JSON.stringify(completeData, null, 2);
                filename = `backup_${instituteCode}_${new Date().toISOString().split('T')[0]}.json`;
                break;
            default:
                Utils.showNotification('Invalid export type', 'error');
                return;
        }
        
        Utils.downloadFile(content, filename);
        Utils.showNotification(`Data exported successfully as ${filename}`, 'success');
    }
    
    function importData() {
        const fileInput = document.getElementById('import-file');
        if (!fileInput.files.length) {
            Utils.showNotification('Please select a file to import', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                let data;
                
                if (file.name.endsWith('.json')) {
                    data = JSON.parse(content);
                } else if (file.name.endsWith('.csv')) {
                    // Basic CSV parsing (simplified)
                    const lines = content.split('\n');
                    const headers = lines[0].split(',');
                    data = lines.slice(1).map(line => {
                        const values = line.split(',');
                        const obj = {};
                        headers.forEach((header, i) => {
                            obj[header.trim()] = values[i] ? values[i].trim() : '';
                        });
                        return obj;
                    }).filter(obj => Object.values(obj).some(v => v));
                } else {
                    throw new Error('Unsupported file format');
                }
                
                // Confirm import
                Utils.createModal({
                    title: 'Confirm Import',
                    content: `
                        <p>You are about to import data from <strong>${file.name}</strong>.</p>
                        <p class="text-muted"><i class="fas fa-exclamation-triangle"></i> This will overwrite existing data. Make sure you have a backup.</p>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="import-confirm" required>
                                I understand this will overwrite existing data
                            </label>
                        </div>
                    `,
                    confirmText: 'Import Data',
                    onConfirm: function() {
                        if (!document.getElementById('import-confirm').checked) {
                            Utils.showNotification('Please confirm the import', 'error');
                            return;
                        }
                        
                        // This is a simplified import - in reality, you'd need more sophisticated logic
                        // to handle different import types and data validation
                        Utils.showNotification('Import started. This feature requires additional implementation.', 'info');
                    }
                });
            } catch (error) {
                Utils.showNotification(`Error reading file: ${error.message}`, 'error');
            }
        };
        
        reader.onerror = function() {
            Utils.showNotification('Error reading file', 'error');
        };
        
        reader.readAsText(file);
    }
    function editTimetableTimes(year, department, division, masterTimetable) {
    // Create modal for editing times
    const timeSlotsHTML = masterTimetable.periods.map((period, index) => `
        <div class="time-slot-edit">
            <div class="form-group">
                <label for="period-${index}-start">Period ${index + 1} Start Time</label>
                <input type="time" id="period-${index}-start" value="${period.start}" 
                    class="time-input" required>
            </div>
            <div class="form-group">
                <label for="period-${index}-end">Period ${index + 1} End Time</label>
                <input type="time" id="period-${index}-end" value="${period.end}" 
                    class="time-input" required>
            </div>
        </div>
    `).join('');
    
    Utils.createModal({
        title: 'Edit Timetable Times',
        content: `
            <div class="edit-times-container">
                <p>Adjust the start and end times for each period. These changes will apply to all timetables.</p>
                <div class="time-slots-edit-grid">
                    ${timeSlotsHTML}
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="update-all-timetables" checked>
                        Apply these times to all existing timetables
                    </label>
                </div>
            </div>
        `,
        confirmText: 'Save Times',
        size: 'large',
        onConfirm: function() {
            // Collect new times
            const newPeriods = [];
            let hasError = false;
            
            for (let i = 0; i < masterTimetable.periods.length; i++) {
                const start = document.getElementById(`period-${i}-start`).value;
                const end = document.getElementById(`period-${i}-end`).value;
                
                if (!start || !end) {
                    Utils.showNotification(`Please fill in times for Period ${i + 1}`, 'error');
                    hasError = true;
                    break;
                }
                
                // Validate that start time is before end time
                if (start >= end) {
                    Utils.showNotification(`Period ${i + 1}: Start time must be before end time`, 'error');
                    hasError = true;
                    break;
                }
                
                newPeriods.push({ start, end });
            }
            
            if (hasError) return;
            
            // Update master timetable
            const updatedMasterTimetable = {
                ...masterTimetable,
                periods: newPeriods
            };
            
            // Update institute data
            const instituteData = DataManager.getInstitute(institute.code);
            instituteData.masterTimetable = updatedMasterTimetable;
            DataManager.updateInstitute(institute.code, instituteData);
            
            // Optionally update all timetables if checkbox is checked
            const updateAll = document.getElementById('update-all-timetables').checked;
            if (updateAll) {
                // In a real implementation, you might want to adjust all existing timetables
                // For now, we'll just show a notification
                Utils.showNotification('Times updated for all timetables', 'success');
            } else {
                Utils.showNotification('Times updated successfully', 'success');
            }
            
            // Refresh the timetable view
            loadTimetableForEditing();
        }
    });
}
    function loadTimetableForEditing() {
    const year = document.getElementById('filter-year').value;
    const department = document.getElementById('filter-department').value;
    const division = document.getElementById('filter-division').value;
    
    if (!year || !department || !division) {
        Utils.showNotification('Please select year, department, and division', 'error');
        return;
    }
    
    const timetable = DataManager.getTimetable(institute.code, year, department, division);
    const masterTimetable = DataManager.getMasterTimetable(institute.code);
    
    const container = document.getElementById('timetable-editor-container');
    if (!container) return;
    
    if (!timetable) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>No Timetable Found</h3>
                <p>No timetable exists for ${year} Year ${department} Division ${division}</p>
                <button class="btn-primary mt-2" id="create-empty-timetable">
                    <i class="fas fa-plus"></i> Create Empty Timetable
                </button>
            </div>
        `;
        
        setTimeout(() => {
            document.getElementById('create-empty-timetable')?.addEventListener('click', () => {
                createEmptyTimetable(year, department, division);
            });
        }, 100);
        
        return;
    }
    
    // Render timetable editor with horizontal layout (periods as columns)
    container.innerHTML = `
        <div class="timetable-container">
            <div class="timetable-header">
                <h3>${year} Year ${department} - Division ${division} Timetable</h3>
                <div class="timetable-controls">
                    <button class="btn-primary" id="save-timetable">
                        <i class="fas fa-save"></i> Save Timetable
                    </button>
                    <button class="btn-secondary" id="reset-timetable">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                    <button class="btn-secondary" id="edit-times-btn">
                        <i class="fas fa-clock"></i> Edit Times
                    </button>
                </div>
            </div>
            
            <div class="timetable-main">
                <div class="timetable-horizontal-wrapper">
                    <div class="timetable-grid">
                        <!-- Time header row -->
                        <div class="timetable-header-row">
                            <div class="time-corner-cell">Time / Day</div>
                            ${masterTimetable.periods.map((period, index) => `
                                <div class="time-header-cell" data-period="${index}">
                                    <div class="time-display">
                                        <div class="period-number">Period ${index + 1}</div>
                                        <div class="time-range">
                                            <span class="start-time">${period.start}</span>
                                            <i class="fas fa-arrow-right time-arrow"></i>
                                            <span class="end-time">${period.end}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <!-- Day rows -->
                        ${masterTimetable.days.map(day => `
                            <div class="timetable-day-row">
                                <div class="day-header-cell">
                                    <strong>${day}</strong>
                                </div>
                                ${masterTimetable.periods.map((period, periodIndex) => {
                                    const slot = timetable.schedule?.[day]?.[periodIndex] || {};
                                    return `
                                        <div class="timetable-cell ${slot.subject ? 'booked' : 'empty'}" 
                                            data-day="${day}" 
                                            data-period="${periodIndex}">
                                            ${slot.subject ? `
                                                <div class="timetable-cell-content">
                                                    <div class="timetable-cell-subject">${slot.subject}</div>
                                                    <div class="timetable-cell-teacher">${slot.teacher || 'TBA'}</div>
                                                    <div class="timetable-cell-room">
                                                        <i class="fas fa-door-open"></i> ${slot.room || 'TBA'}
                                                    </div>
                                                    <span class="timetable-cell-type ${slot.type || 'theory'}">
                                                        ${slot.type || 'theory'}
                                                    </span>
                                                </div>
                                            ` : `
                                                <div class="empty-slot">
                                                    <i class="fas fa-plus"></i>
                                                    <span>Add Class</span>
                                                </div>
                                            `}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="timetable-legend">
                <div class="legend-item">
                    <span class="legend-color theory"></span>
                    <span>Theory Class</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color lab"></span>
                    <span>Laboratory</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color booked"></span>
                    <span>Booked Slot</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color empty"></span>
                    <span>Available Slot</span>
                </div>
            </div>
        </div>
        
        <div class="card mt-3">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-edit"></i> Edit Slot</h3>
            </div>
            <div class="card-content">
                <div id="slot-editor">
                    <div class="empty-state">
                        <i class="fas fa-mouse-pointer"></i>
                        <p>Click on a timetable slot to edit it</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add click handlers for timetable cells
    container.querySelectorAll('.timetable-cell').forEach(cell => {
        cell.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            const period = this.getAttribute('data-period');
            editTimetableSlot(year, department, division, day, period, this);
        });
    });
    
    // Add event handlers
    setTimeout(() => {
        // Save timetable button
        document.getElementById('save-timetable')?.addEventListener('click', () => {
            saveTimetableChanges(year, department, division, timetable);
        });
        
        // Reset timetable button
        document.getElementById('reset-timetable')?.addEventListener('click', () => {
            loadTimetableForEditing();
        });
        
        // Edit times button
        document.getElementById('edit-times-btn')?.addEventListener('click', () => {
            editTimetableTimes(year, department, division, masterTimetable);
        });
    }, 100);
}
    
    function editTimetableSlot(year, department, division, day, period, cellElement) {
        const timetable = DataManager.getTimetable(institute.code, year, department, division);
        const slot = timetable.schedule?.[day]?.[period] || {};
        const teachers = DataManager.getTeachers(institute.code);
        const infrastructure = DataManager.getInfrastructure(institute.code);
        
        // Remove selected class from all cells
        document.querySelectorAll('.timetable-cell.selected').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        // Add selected class to clicked cell
        cellElement.classList.add('selected');
        
        const editor = document.getElementById('slot-editor');
        if (!editor) return;
        
        editor.innerHTML = `
            <div class="form-group">
                <label for="slot-subject">Subject</label>
                <input type="text" id="slot-subject" value="${slot.subject || ''}" 
                    placeholder="Enter subject name">
            </div>
            
            <div class="form-group">
                <label for="slot-teacher">Teacher</label>
                <select id="slot-teacher">
                    <option value="">Select Teacher</option>
                    ${teachers.map(teacher => 
                        `<option value="${teacher.id}" ${teacher.id === slot.teacher ? 'selected' : ''}>
                            ${teacher.name} (${teacher.code})
                        </option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="slot-room">Room</label>
                <select id="slot-room">
                    <option value="">Select Room</option>
                    ${infrastructure.rooms.map(room => 
                        `<option value="${room.id}" ${room.id === slot.room ? 'selected' : ''}>
                            ${room.number} (${room.building}, Floor ${room.floor})
                        </option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="slot-type">Class Type</label>
                <select id="slot-type">
                    <option value="theory" ${slot.type === 'theory' ? 'selected' : ''}>Theory</option>
                    <option value="lab" ${slot.type === 'lab' ? 'selected' : ''}>Laboratory</option>
                    <option value="tutorial" ${slot.type === 'tutorial' ? 'selected' : ''}>Tutorial</option>
                    <option value="other" ${slot.type === 'other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="slot-merge-next" ${slot.merged ? 'checked' : ''}>
                    Merge with next period
                </label>
            </div>
            
            <div class="form-actions">
                <button class="btn-secondary" id="clear-slot">
                    <i class="fas fa-trash"></i> Clear Slot
                </button>
                <button class="btn-primary" id="update-slot">
                    <i class="fas fa-check"></i> Update Slot
                </button>
            </div>
            
            <div class="mt-3">
                <h4>Slot Information</h4>
                <p><strong>Day:</strong> ${day}</p>
                <p><strong>Period:</strong> ${parseInt(period) + 1}</p>
                <p><strong>Time:</strong> ${DataManager.getMasterTimetable(institute.code).periods[period].start} - 
                    ${DataManager.getMasterTimetable(institute.code).periods[period].end}</p>
            </div>
        `;
        
        // Add event listeners for slot editor
        setTimeout(() => {
            document.getElementById('update-slot')?.addEventListener('click', () => {
                updateTimetableSlot(year, department, division, day, period, cellElement);
            });
            
            document.getElementById('clear-slot')?.addEventListener('click', () => {
                clearTimetableSlot(year, department, division, day, period, cellElement);
            });
        }, 100);
    }
    
    function updateTimetableSlot(year, department, division, day, period, cellElement) {
        const subject = document.getElementById('slot-subject').value.trim();
        const teacher = document.getElementById('slot-teacher').value;
        const room = document.getElementById('slot-room').value;
        const type = document.getElementById('slot-type').value;
        const mergeNext = document.getElementById('slot-merge-next').checked;
        
        if (!subject) {
            Utils.showNotification('Subject is required', 'error');
            return;
        }
        
        const timetable = DataManager.getTimetable(institute.code, year, department, division);
        if (!timetable.schedule) timetable.schedule = {};
        if (!timetable.schedule[day]) timetable.schedule[day] = [];
        
        // Update the slot
        timetable.schedule[day][period] = {
            subject,
            teacher,
            room,
            type,
            merged: mergeNext
        };
        
        // Handle merging with next period
        if (mergeNext && parseInt(period) < 6) { // Assuming 7 periods per day
            const nextPeriod = parseInt(period) + 1;
            timetable.schedule[day][nextPeriod] = {
                ...timetable.schedule[day][period],
                merged: true
            };
            
            // Update the next cell visually
            const nextCell = document.querySelector(`.timetable-cell[data-day="${day}"][data-period="${nextPeriod}"]`);
            if (nextCell) {
                nextCell.innerHTML = `
                    <div class="timetable-cell-content">
                        <div class="timetable-cell-subject">${subject} (cont.)</div>
                        <div class="timetable-cell-teacher">${teacher || 'TBA'}</div>
                        <div class="timetable-cell-room">
                            <i class="fas fa-door-open"></i> ${room || 'TBA'}
                        </div>
                        <span class="timetable-cell-type ${type}">
                            ${type}
                        </span>
                        <div class="merge-indicator">
                            <i class="fas fa-link"></i> Merged
                        </div>
                    </div>
                `;
                nextCell.classList.add('merged', 'booked');
                nextCell.classList.remove('empty');
            }
        }
        
        // Update the current cell visually
        cellElement.innerHTML = `
            <div class="timetable-cell-content">
                <div class="timetable-cell-subject">${subject}</div>
                <div class="timetable-cell-teacher">${teacher || 'TBA'}</div>
                <div class="timetable-cell-room">
                    <i class="fas fa-door-open"></i> ${room || 'TBA'}
                </div>
                <span class="timetable-cell-type ${type}">
                    ${type}
                </span>
                ${mergeNext ? `
                    <div class="merge-indicator">
                        <i class="fas fa-link"></i> Merges to next
                    </div>
                ` : ''}
            </div>
        `;
        cellElement.classList.add('booked');
        cellElement.classList.remove('empty');
        
        if (mergeNext) {
            cellElement.classList.add('merged');
        }
        
        Utils.showNotification('Slot updated successfully', 'success');
    }
    
    function clearTimetableSlot(year, department, division, day, period, cellElement) {
        const timetable = DataManager.getTimetable(institute.code, year, department, division);
        
        if (timetable.schedule?.[day]?.[period]) {
            // Check if this slot is part of a merged pair
            const slot = timetable.schedule[day][period];
            
            if (slot.merged) {
                // Clear the merged slot too
                const nextPeriod = parseInt(period) + 1;
                if (timetable.schedule[day][nextPeriod]) {
                    delete timetable.schedule[day][nextPeriod];
                    
                    // Clear the next cell visually
                    const nextCell = document.querySelector(`.timetable-cell[data-day="${day}"][data-period="${nextPeriod}"]`);
                    if (nextCell) {
                        nextCell.innerHTML = 'Empty';
                        nextCell.classList.add('empty');
                        nextCell.classList.remove('booked', 'merged');
                    }
                }
            }
            
            delete timetable.schedule[day][period];
        }
        
        // Clear the current cell visually
        cellElement.innerHTML = 'Empty';
        cellElement.classList.add('empty');
        cellElement.classList.remove('booked', 'merged', 'selected');
        
        // Clear the slot editor
        const editor = document.getElementById('slot-editor');
        if (editor) {
            editor.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>Click on a timetable slot to edit it</p>
                </div>
            `;
        }
        
        Utils.showNotification('Slot cleared successfully', 'success');
    }
    
    function saveTimetableChanges(year, department, division, timetable) {
    // First, validate the timetable data
    if (!timetable || !timetable.schedule) {
        Utils.showNotification('Invalid timetable data', 'error');
        return;
    }
    
    // Save to DataManager
    const success = DataManager.updateTimetable(institute.code, year, department, division, timetable);
    
    if (success) {
        Utils.showNotification('Timetable saved successfully!', 'success');
        
        // Add to recent activities
        const activity = {
            icon: 'fas fa-calendar-plus',
            title: 'Timetable Updated',
            description: `${year} Year ${department} Division ${division} timetable modified`,
            time: 'Just now'
        };
        
        // Add to activities list if it exists
        const activitiesList = document.getElementById('activities-list');
        if (activitiesList) {
            const activityHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-details">
                        <h4>${activity.title}</h4>
                        <p>${activity.description}</p>
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            `;
            activitiesList.insertAdjacentHTML('afterbegin', activityHTML);
        }
    } else {
        Utils.showNotification('Failed to save timetable. Please try again.', 'error');
    }
}
    
    function createNewTimetable() {
        const year = document.getElementById('filter-year').value;
        const department = document.getElementById('filter-department').value;
        const division = document.getElementById('filter-division').value;
        
        if (!year || !department || !division) {
            Utils.showNotification('Please select year, department, and division first', 'error');
            return;
        }
        
        createEmptyTimetable(year, department, division);
    }
    
   function createEmptyTimetable(year, department, division) {
    const masterTimetable = DataManager.getMasterTimetable(institute.code);
    const emptySchedule = {};
    
    masterTimetable.days.forEach(day => {
        emptySchedule[day] = Array(masterTimetable.periods.length).fill({});
    });
    
    const newTimetable = {
        department,
        year: parseInt(year),
        division,
        schedule: emptySchedule
    };
    
    DataManager.updateTimetable(institute.code, year, department, division, newTimetable);
    Utils.showNotification(`New timetable created for ${year} Year ${department} Division ${division}`, 'success');
    
    // Reload the timetable editor
    loadTimetableForEditing();
}
    
    function loadMasterTimetableData() {
        const timetables = DataManager.getAllTimetables(institute.code);
        const container = document.getElementById('master-timetable-view');
        
        if (!container) return;
        
        if (Object.keys(timetables).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No Timetables Found</h3>
                    <p>Create timetables for each year, department, and division</p>
                </div>
            `;
            return;
        }
       
        // Group timetables by year
        const timetablesByYear = {};
        Object.entries(timetables).forEach(([key, timetable]) => {
            const year = timetable.year;
            if (!timetablesByYear[year]) {
                timetablesByYear[year] = [];
            }
            timetablesByYear[year].push({ key, ...timetable });
        });
        
        container.innerHTML = Object.entries(timetablesByYear).map(([year, yearTimetables]) => `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-calendar"></i> Year ${year} Timetables</h3>
                    <span class="badge badge-primary">${yearTimetables.length} timetables</span>
                </div>
                <div class="card-content">
                    <div class="timetable-list">
                        ${yearTimetables.map(tt => `
                            <div class="timetable-item">
                                <h4>${tt.department} - Division ${tt.division}</h4>
                                <p>${Object.keys(tt.schedule || {}).length} days scheduled</p>
                                <button class="btn-secondary btn-sm view-timetable-btn" data-key="${tt.key}">
                                    <i class="fas fa-eye"></i> View
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners for view buttons
        container.querySelectorAll('.view-timetable-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const key = this.getAttribute('data-key');
                viewTimetableDetails(key);
            });
        });
    }
    
    function viewTimetableDetails(timetableKey) {
        const [year, department, division] = timetableKey.split('-');
        const timetable = DataManager.getTimetable(institute.code, year, department, division);
        
        if (!timetable) return;
        
        Utils.createModal({
            title: `Timetable: ${year} Year ${department} - Division ${division}`,
            content: `
                <div class="timetable-preview">
                    <div class="table-container">
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
                                ${Object.entries(timetable.schedule || {}).map(([day, periods]) => `
                                    <tr>
                                        <td><strong>${day}</strong></td>
                                        ${periods.map((period, index) => `
                                            <td>
                                                ${period.subject ? `
                                                    <div class="compact-slot">
                                                        <strong>${period.subject}</strong><br>
                                                        <small>${period.teacher || ''}</small><br>
                                                        <small>${period.room || ''}</small>
                                                    </div>
                                                ` : '-'}
                                            </td>
                                        `).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `,
            size: 'large'
        });
    }
    
    function exportMasterTimetable(format) {
        const content = DataManager.exportTimetable(institute.code, format);
        const filename = `master_timetable_${institute.code}_${new Date().toISOString().split('T')[0]}.${format}`;
        
        Utils.downloadFile(content, filename);
        Utils.showNotification(`Master timetable exported as ${filename}`, 'success');
    }
    
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
});