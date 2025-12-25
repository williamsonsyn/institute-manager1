// Data Manager - Handles all data storage and retrieval using localStorage

const DataManager = {
    // Initialize sample data if not exists
    initSampleData: function() {
        if (!localStorage.getItem('institutes')) {
            const sampleData = {
                // Institute 1: With Sample Data
                INST001: {
                    name: "Sample Institute of Technology",
                    password: "inst@123", // Non-changeable institute password
                    created: new Date().toISOString(),
                    hasSampleData: true,
                    
                    // Infrastructure
                    infrastructure: {
                        buildings: [
                            { id: "B001", name: "Main Building", floors: 5 },
                            { id: "B002", name: "Science Block", floors: 4 },
                            { id: "B003", name: "Engineering Wing", floors: 3 }
                        ],
                        rooms: [
                            { id: "R001", building: "B001", floor: 1, number: "101", type: "classroom", capacity: 60 },
                            { id: "R002", building: "B001", floor: 1, number: "102", type: "classroom", capacity: 60 },
                            { id: "R003", building: "B001", floor: 1, number: "103", type: "lab", capacity: 40, labType: "Computer" },
                            { id: "R004", building: "B001", floor: 2, number: "201", type: "classroom", capacity: 80 },
                            { id: "R005", building: "B001", floor: 2, number: "202", type: "lab", capacity: 30, labType: "Physics" },
                            { id: "R006", building: "B002", floor: 1, number: "S101", type: "lab", capacity: 35, labType: "Chemistry" },
                            { id: "R007", building: "B002", floor: 2, number: "S201", type: "classroom", capacity: 70 },
                            { id: "R008", building: "B003", floor: 1, number: "E101", type: "lab", capacity: 25, labType: "Electrical" },
                            { id: "R009", building: "B003", floor: 1, number: "E102", type: "lab", capacity: 25, labType: "Mechanical" },
                            { id: "R010", building: "B003", floor: 2, number: "E201", type: "classroom", capacity: 50 }
                        ]
                    },
                    
                    // Departments/Branches
                    departments: [
                        { id: "CS", name: "Computer Science", years: 4 },
                        { id: "IT", name: "Information Technology", years: 4 },
                        { id: "AIML", name: "AI & Machine Learning", years: 4 },
                        { id: "ELEC", name: "Electrical Engineering", years: 4 },
                        { id: "MECH", name: "Mechanical Engineering", years: 4 },
                        { id: "CIVIL", name: "Civil Engineering", years: 4 }
                    ],
                    
                    // Teachers
                    teachers: [
                        { id: "T001", code: "PROF001", name: "Dr. Sarah Johnson", department: "CS", email: "sarah@institute.edu", workload: 18 },
                        { id: "T002", code: "PROF002", name: "Prof. Michael Chen", department: "IT", email: "michael@institute.edu", workload: 16 },
                        { id: "T003", code: "PROF003", name: "Dr. Emily Williams", department: "AIML", email: "emily@institute.edu", workload: 20 },
                        { id: "T004", code: "PROF004", name: "Prof. Robert Kim", department: "ELEC", email: "robert@institute.edu", workload: 15 },
                        { id: "T005", code: "PROF005", name: "Dr. Lisa Rodriguez", department: "MECH", email: "lisa@institute.edu", workload: 17 },
                        { id: "T006", code: "PROF006", name: "Prof. James Wilson", department: "CIVIL", email: "james@institute.edu", workload: 19 }
                    ],
                    
                    // Users
                    users: {
                        admin: [
                            { username: "admin", password: "admin123", name: "System Administrator", role: "admin" },
                            { username: "director", password: "director123", name: "Institute Director", role: "admin" }
                        ],
                        teacher: [
                            { username: "teacher1", password: "teacher123", name: "Dr. Sarah Johnson", teacherId: "T001", role: "teacher" },
                            { username: "teacher2", password: "teacher456", name: "Prof. Michael Chen", teacherId: "T002", role: "teacher" }
                        ],
                        student: [
                            { username: "student1", password: "student123", name: "John Smith", rollNo: "CS2001", year: 2, department: "CS", division: "A", role: "student" },
                            { username: "student2", password: "student456", name: "Emma Davis", rollNo: "IT2002", year: 2, department: "IT", division: "B", role: "student" }
                        ]
                    },
                    
                    // Master Timetable Structure
                    masterTimetable: {
                        years: [1, 2, 3, 4],
                        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        periods: [
                            { start: "09:00", end: "10:00" },
                            { start: "10:00", end: "11:00" },
                            { start: "11:00", end: "12:00" },
                            { start: "12:00", end: "13:00" },
                            { start: "14:00", end: "15:00" },
                            { start: "15:00", end: "16:00" },
                            { start: "16:00", end: "17:00" }
                        ]
                    },
                    
                    // Sample Timetable Data
                    timetables: {
                        // Year 1 CS
                       "1-CS-A": {
    department: "CS",
    year: 1,
    division: "A",
    schedule: {
        Monday: [
            { subject: "Mathematics-I", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Physics", teacher: "T003", room: "R005", type: "lab" },
            { subject: "Programming Basics", teacher: "T002", room: "R003", type: "lab" },
            { subject: "English", teacher: "T004", room: "R002", type: "theory" },
            { subject: "Mathematics-I", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Engineering Drawing", teacher: "T005", room: "R004", type: "theory" },
            { subject: "Library", teacher: "", room: "LIB", type: "other" }
        ],
        Tuesday: [
            { subject: "Physics", teacher: "T003", room: "R002", type: "theory" },
            { subject: "Chemistry", teacher: "T006", room: "R006", type: "lab" },
            { subject: "Programming Basics", teacher: "T002", room: "R001", type: "theory" },
            { subject: "Mathematics-I", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Workshop", teacher: "T005", room: "WS001", type: "lab" },
            { subject: "Physics", teacher: "T003", room: "R005", type: "lab" },
            { subject: "Sports", teacher: "", room: "Ground", type: "other" }
        ],
        Wednesday: [
            { subject: "Chemistry", teacher: "T006", room: "R002", type: "theory" },
            { subject: "Mathematics-I", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Programming Basics Lab", teacher: "T002", room: "R003", type: "lab" },
            { subject: "Physics", teacher: "T003", room: "R002", type: "theory" },
            { subject: "English", teacher: "T004", room: "R005", type: "theory" },
            { subject: "Tutorial", teacher: "T001", room: "R001", type: "tutorial" },
            { subject: "Project Work", teacher: "T002", room: "R003", type: "lab" }
        ],
        Thursday: [
            { subject: "Mathematics-I", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Physics Lab", teacher: "T003", room: "R005", type: "lab" },
            { subject: "Programming Basics", teacher: "T002", room: "R001", type: "theory" },
            { subject: "Chemistry", teacher: "T006", room: "R004", type: "theory" },
            { subject: "English Lab", teacher: "T004", room: "R002", type: "lab" },
            { subject: "Chemistry Lab", teacher: "T006", room: "R006", type: "lab" },
            { subject: "Club Activity", teacher: "", room: "Auditorium", type: "other" }
        ],
        Friday: [
            { subject: "Physics", teacher: "T003", room: "R002", type: "theory" },
            { subject: "Chemistry", teacher: "T006", room: "R001", type: "theory" },
            { subject: "Mathematics-I", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Programming Basics", teacher: "T002", room: "R001", type: "theory" },
            { subject: "Tutorial", teacher: "T003", room: "R002", type: "tutorial" },
            { subject: "Engineering Drawing Lab", teacher: "T005", room: "R004", type: "lab" },
            { subject: "Mentor Session", teacher: "", room: "R005", type: "other" }
        ],
        Saturday: [
            { subject: "Physics Lab", teacher: "T003", room: "R005", type: "lab" },
            { subject: "Chemistry Lab", teacher: "T006", room: "R006", type: "lab" },
            { subject: "Programming Basics Lab", teacher: "T002", room: "R003", type: "lab" },
            { subject: "English", teacher: "T004", room: "R002", type: "theory" },
            { subject: "Tutorial", teacher: "T006", room: "R004", type: "tutorial" },
            { subject: "Project Work", teacher: "T002", room: "R003", type: "lab" },
            { subject: "Library", teacher: "", room: "LIB", type: "other" }
        ]
    }
},
                        // More timetable data would be here
                        // Add this code in the timetables object after the "1-CS-A" timetable
"2-CS-A": {
    department: "CS",
    year: 2,
    division: "A",
    schedule: {
        Monday: [
            { subject: "Data Structures", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Data Structures Lab", teacher: "T001", room: "R003", type: "lab" },
            { subject: "Discrete Mathematics", teacher: "T002", room: "R002", type: "theory" },
            { subject: "Digital Electronics", teacher: "T004", room: "R004", type: "theory" },
            { subject: "Digital Electronics Lab", teacher: "T004", room: "R008", type: "lab" },
            { subject: "Communication Skills", teacher: "T003", room: "R005", type: "theory" },
            { subject: "Library", teacher: "", room: "LIB", type: "other" }
        ],
        Tuesday: [
            { subject: "Discrete Mathematics", teacher: "T002", room: "R001", type: "theory" },
            { subject: "Data Structures", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Object Oriented Programming", teacher: "T001", room: "R003", type: "lab" },
            { subject: "Digital Electronics", teacher: "T004", room: "R004", type: "theory" },
            { subject: "Workshop", teacher: "T005", room: "WS001", type: "lab" },
            { subject: "Physics Lab", teacher: "T003", room: "R005", type: "lab" },
            { subject: "Sports", teacher: "", room: "Ground", type: "other" }
        ],
        Wednesday: [
            { subject: "Data Structures", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Discrete Mathematics", teacher: "T002", room: "R002", type: "theory" },
            { subject: "Digital Electronics Lab", teacher: "T004", room: "R008", type: "lab" },
            { subject: "Object Oriented Programming", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Communication Skills", teacher: "T003", room: "R005", type: "theory" },
            { subject: "Tutorial", teacher: "T001", room: "R001", type: "tutorial" },
            { subject: "Project Work", teacher: "T002", room: "R003", type: "lab" }
        ],
        Thursday: [
            { subject: "Discrete Mathematics", teacher: "T002", room: "R001", type: "theory" },
            { subject: "Data Structures Lab", teacher: "T001", room: "R003", type: "lab" },
            { subject: "Digital Electronics", teacher: "T004", room: "R004", type: "theory" },
            { subject: "Object Oriented Programming", teacher: "T001", room: "R003", type: "lab" },
            { subject: "Communication Skills Lab", teacher: "T003", room: "R002", type: "lab" },
            { subject: "Digital Electronics Lab", teacher: "T004", room: "R008", type: "lab" },
            { subject: "Club Activity", teacher: "", room: "Auditorium", type: "other" }
        ],
        Friday: [
            { subject: "Data Structures", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Discrete Mathematics", teacher: "T002", room: "R002", type: "theory" },
            { subject: "Digital Electronics", teacher: "T004", room: "R004", type: "theory" },
            { subject: "Object Oriented Programming", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Tutorial", teacher: "T002", room: "R002", type: "tutorial" },
            { subject: "Project Work", teacher: "T001", room: "R003", type: "lab" },
            { subject: "Mentor Session", teacher: "", room: "R005", type: "other" }
        ],
        Saturday: [
            { subject: "Data Structures Lab", teacher: "T001", room: "R003", type: "lab" },
            { subject: "Digital Electronics Lab", teacher: "T004", room: "R008", type: "lab" },
            { subject: "Object Oriented Programming Lab", teacher: "T001", room: "R003", type: "lab" },
            { subject: "Communication Skills", teacher: "T003", room: "R005", type: "theory" },
            { subject: "Tutorial", teacher: "T004", room: "R004", type: "tutorial" },
            { subject: "Project Work", teacher: "T002", room: "R003", type: "lab" },
            { subject: "Library", teacher: "", room: "LIB", type: "other" }
        ]
    }
},
"2-IT-B": {
    department: "IT",
    year: 2,
    division: "B",
    schedule: {
        Monday: [
            { subject: "Database Management Systems", teacher: "T002", room: "R001", type: "theory" },
            { subject: "DBMS Lab", teacher: "T002", room: "R003", type: "lab" },
            { subject: "Computer Networks", teacher: "T001", room: "R002", type: "theory" },
            { subject: "Operating Systems", teacher: "T003", room: "R004", type: "theory" },
            { subject: "OS Lab", teacher: "T003", room: "R003", type: "lab" },
            { subject: "Soft Skills", teacher: "T004", room: "R005", type: "theory" },
            { subject: "Library", teacher: "", room: "LIB", type: "other" }
        ],
        Tuesday: [
            { subject: "Computer Networks", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Database Management Systems", teacher: "T002", room: "R001", type: "theory" },
            { subject: "Computer Networks Lab", teacher: "T001", room: "R003", type: "lab" },
            { subject: "Operating Systems", teacher: "T003", room: "R004", type: "theory" },
            { subject: "Workshop", teacher: "T005", room: "WS001", type: "lab" },
            { subject: "Web Technologies Lab", teacher: "T002", room: "R003", type: "lab" },
            { subject: "Sports", teacher: "", room: "Ground", type: "other" }
        ],
        Wednesday: [
            { subject: "Database Management Systems", teacher: "T002", room: "R001", type: "theory" },
            { subject: "Computer Networks", teacher: "T001", room: "R002", type: "theory" },
            { subject: "OS Lab", teacher: "T003", room: "R003", type: "lab" },
            { subject: "Web Technologies", teacher: "T002", room: "R001", type: "theory" },
            { subject: "Soft Skills", teacher: "T004", room: "R005", type: "theory" },
            { subject: "Tutorial", teacher: "T001", room: "R001", type: "tutorial" },
            { subject: "Project Work", teacher: "T002", room: "R003", type: "lab" }
        ],
        Thursday: [
            { subject: "Computer Networks", teacher: "T001", room: "R001", type: "theory" },
            { subject: "DBMS Lab", teacher: "T002", room: "R003", type: "lab" },
            { subject: "Operating Systems", teacher: "T003", room: "R004", type: "theory" },
            { subject: "Web Technologies Lab", teacher: "T002", room: "R003", type: "lab" },
            { subject: "Soft Skills Lab", teacher: "T004", room: "R002", type: "lab" },
            { subject: "Computer Networks Lab", teacher: "T001", room: "R003", type: "lab" },
            { subject: "Club Activity", teacher: "", room: "Auditorium", type: "other" }
        ],
        Friday: [
            { subject: "Database Management Systems", teacher: "T002", room: "R001", type: "theory" },
            { subject: "Computer Networks", teacher: "T001", room: "R002", type: "theory" },
            { subject: "Operating Systems", teacher: "T003", room: "R004", type: "theory" },
            { subject: "Web Technologies", teacher: "T002", room: "R001", type: "theory" },
            { subject: "Tutorial", teacher: "T003", room: "R002", type: "tutorial" },
            { subject: "Project Work", teacher: "T001", room: "R003", type: "lab" },
            { subject: "Mentor Session", teacher: "", room: "R005", type: "other" }
        ],
        Saturday: [
            { subject: "DBMS Lab", teacher: "T002", room: "R003", type: "lab" },
            { subject: "OS Lab", teacher: "T003", room: "R003", type: "lab" },
            { subject: "Web Technologies Lab", teacher: "T002", room: "R003", type: "lab" },
            { subject: "Soft Skills", teacher: "T004", room: "R005", type: "theory" },
            { subject: "Tutorial", teacher: "T004", room: "R004", type: "tutorial" },
            { subject: "Project Work", teacher: "T002", room: "R003", type: "lab" },
            { subject: "Library", teacher: "", room: "LIB", type: "other" }
        ]
    }
},
"1-IT-B": {
    department: "IT",
    year: 1,
    division: "B",
    schedule: {
        Monday: [
            { subject: "Mathematics-I", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Physics", teacher: "T003", room: "R005", type: "lab" },
            { subject: "Programming Basics", teacher: "T002", room: "R003", type: "lab" },
            { subject: "English", teacher: "T004", room: "R002", type: "theory" },
            { subject: "Mathematics-I", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Engineering Drawing", teacher: "T005", room: "R004", type: "theory" },
            { subject: "Library", teacher: "", room: "LIB", type: "other" }
        ],
        Tuesday: [
            { subject: "Physics", teacher: "T003", room: "R002", type: "theory" },
            { subject: "Chemistry", teacher: "T006", room: "R006", type: "lab" },
            { subject: "Programming Basics", teacher: "T002", room: "R001", type: "theory" },
            { subject: "Mathematics-I", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Workshop", teacher: "T005", room: "WS001", type: "lab" },
            { subject: "Physics", teacher: "T003", room: "R005", type: "lab" },
            { subject: "Sports", teacher: "", room: "Ground", type: "other" }
        ],
        Wednesday: [
            { subject: "Chemistry", teacher: "T006", room: "R002", type: "theory" },
            { subject: "Mathematics-I", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Programming Basics Lab", teacher: "T002", room: "R003", type: "lab" },
            { subject: "Physics", teacher: "T003", room: "R002", type: "theory" },
            { subject: "English", teacher: "T004", room: "R005", type: "theory" },
            { subject: "Tutorial", teacher: "T001", room: "R001", type: "tutorial" },
            { subject: "Project Work", teacher: "T002", room: "R003", type: "lab" }
        ],
        Thursday: [
            { subject: "Mathematics-I", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Physics Lab", teacher: "T003", room: "R005", type: "lab" },
            { subject: "Programming Basics", teacher: "T002", room: "R001", type: "theory" },
            { subject: "Chemistry", teacher: "T006", room: "R004", type: "theory" },
            { subject: "English Lab", teacher: "T004", room: "R002", type: "lab" },
            { subject: "Chemistry Lab", teacher: "T006", room: "R006", type: "lab" },
            { subject: "Club Activity", teacher: "", room: "Auditorium", type: "other" }
        ],
        Friday: [
            { subject: "Physics", teacher: "T003", room: "R002", type: "theory" },
            { subject: "Chemistry", teacher: "T006", room: "R001", type: "theory" },
            { subject: "Mathematics-I", teacher: "T001", room: "R001", type: "theory" },
            { subject: "Programming Basics", teacher: "T002", room: "R001", type: "theory" },
            { subject: "Tutorial", teacher: "T003", room: "R002", type: "tutorial" },
            { subject: "Engineering Drawing Lab", teacher: "T005", room: "R004", type: "lab" },
            { subject: "Mentor Session", teacher: "", room: "R005", type: "other" }
        ],
        Saturday: [
            { subject: "Physics Lab", teacher: "T003", room: "R005", type: "lab" },
            { subject: "Chemistry Lab", teacher: "T006", room: "R006", type: "lab" },
            { subject: "Programming Basics Lab", teacher: "T002", room: "R003", type: "lab" },
            { subject: "English", teacher: "T004", room: "R002", type: "theory" },
            { subject: "Tutorial", teacher: "T006", room: "R004", type: "tutorial" },
            { subject: "Project Work", teacher: "T002", room: "R003", type: "lab" },
            { subject: "Library", teacher: "", room: "LIB", type: "other" }
        ]
    }
}
                    },
                    
                    // Room bookings
                    roomBookings: [
                        { id: "BK001", roomId: "R001", teacherId: "T001", date: "2023-10-15", period: 3, purpose: "Guest Lecture" },
                        { id: "BK002", roomId: "R003", teacherId: "T002", date: "2023-10-16", period: 5, purpose: "Project Work" }
                    ]
                },
                
                // Institute 2: Empty Institute
                INST002: {
                    name: "New Institute of Engineering",
                    password: "inst@456",
                    created: new Date().toISOString(),
                    hasSampleData: false,
                    
                    infrastructure: {
                        buildings: [],
                        rooms: []
                    },
                    
                    departments: [],
                    
                    teachers: [],
                    
                    users: {
                        admin: [
                            { username: "admin", password: "admin123", name: "Administrator", role: "admin" }
                        ],
                        teacher: [
                            { username: "teacher1", password: "teacher123", name: "New Teacher", role: "teacher" }
                        ],
                        student: [
                            { username: "student1", password: "student123", name: "New Student", role: "student" }
                        ]
                    },
                    
                    masterTimetable: {
                        years: [1, 2, 3, 4],
                        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        periods: [
                            { start: "09:00", end: "10:00" },
                            { start: "10:00", end: "11:00" },
                            { start: "11:00", end: "12:00" },
                            { start: "12:00", end: "13:00" },
                            { start: "14:00", end: "15:00" },
                            { start: "15:00", end: "16:00" },
                            { start: "16:00", end: "17:00" }
                        ]
                    },
                    
                    timetables: {},
                    roomBookings: []
                }
            };
            
            localStorage.setItem('institutes', JSON.stringify(sampleData));
        }
    },
    
    // Get institute by code
    getInstitute: function(code) {
        const institutes = JSON.parse(localStorage.getItem('institutes') || '{}');
        return institutes[code] || null;
    },
    
    // Authenticate institute
    authenticateInstitute: function(code, password) {
        const institute = this.getInstitute(code);
        if (!institute) return { success: false, message: "Institute not found" };
        
        if (institute.password !== password) {
            return { success: false, message: "Invalid password" };
        }
        
        return { 
            success: true, 
            institute: {
                code: code,
                name: institute.name,
                hasSampleData: institute.hasSampleData
            }
        };
    },
    
    // Authenticate user within institute
    authenticateUser: function(instituteCode, role, username, password) {
        const institute = this.getInstitute(instituteCode);
        if (!institute) return { success: false, message: "Institute not found" };
        
        const users = institute.users[role];
        if (!users) return { success: false, message: "Invalid role" };
        
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) return { success: false, message: "Invalid credentials" };
        
        return { 
            success: true, 
            user: {
                ...user,
                instituteCode: instituteCode,
                instituteName: institute.name
            }
        };
    },
    
    // Get user by role and username
    getUser: function(instituteCode, role, username) {
        const institute = this.getInstitute(instituteCode);
        if (!institute) return null;
        
        const users = institute.users[role];
        if (!users) return null;
        
        return users.find(u => u.username === username) || null;
    },
    
    // Update institute data
    updateInstitute: function(code, data) {
        const institutes = JSON.parse(localStorage.getItem('institutes') || '{}');
        if (!institutes[code]) return false;
        
        institutes[code] = { ...institutes[code], ...data };
        localStorage.setItem('institutes', JSON.stringify(institutes));
        return true;
    },
    
    // Get all infrastructure data
    getInfrastructure: function(instituteCode) {
        const institute = this.getInstitute(instituteCode);
        return institute ? institute.infrastructure : null;
    },
    
    // Update infrastructure
    updateInfrastructure: function(instituteCode, infrastructure) {
        return this.updateInstitute(instituteCode, { infrastructure });
    },
    
    // Get all departments
    getDepartments: function(instituteCode) {
        const institute = this.getInstitute(instituteCode);
        return institute ? institute.departments : [];
    },
    
    // Update departments
    updateDepartments: function(instituteCode, departments) {
        return this.updateInstitute(instituteCode, { departments });
    },
    
    // Get all teachers
    getTeachers: function(instituteCode) {
        const institute = this.getInstitute(instituteCode);
        return institute ? institute.teachers : [];
    },
    
    // Update teachers
    updateTeachers: function(instituteCode, teachers) {
        return this.updateInstitute(instituteCode, { teachers });
    },
    
    // Get master timetable structure
    getMasterTimetable: function(instituteCode) {
        const institute = this.getInstitute(instituteCode);
        return institute ? institute.masterTimetable : null;
    },
    
    // Get timetable for specific year, department, division
    getTimetable: function(instituteCode, year, department, division) {
        const institute = this.getInstitute(instituteCode);
        if (!institute) return null;
        
        const key = `${year}-${department}-${division}`;
        return institute.timetables[key] || null;
    },
    
    // Update timetable
    // Update timetable
updateTimetable: function(instituteCode, year, department, division, timetable) {
    const institutes = JSON.parse(localStorage.getItem('institutes') || '{}');
    if (!institutes[instituteCode]) return false;
    
    const key = `${year}-${department}-${division}`;
    institutes[instituteCode].timetables[key] = timetable;
    
    try {
        localStorage.setItem('institutes', JSON.stringify(institutes));
        return true;
    } catch (error) {
        console.error('Failed to save timetable:', error);
        return false;
    }
},
    
    // Get all timetables
    getAllTimetables: function(instituteCode) {
        const institute = this.getInstitute(instituteCode);
        return institute ? institute.timetables : {};
    },
    
    // Get room bookings
    getRoomBookings: function(instituteCode) {
        const institute = this.getInstitute(instituteCode);
        return institute ? institute.roomBookings : [];
    },
    
    // Add room booking
    addRoomBooking: function(instituteCode, booking) {
        const institutes = JSON.parse(localStorage.getItem('institutes') || '{}');
        if (!institutes[instituteCode]) return false;
        
        if (!institutes[instituteCode].roomBookings) {
            institutes[instituteCode].roomBookings = [];
        }
        
        booking.id = `BK${String(institutes[instituteCode].roomBookings.length + 1).padStart(3, '0')}`;
        institutes[instituteCode].roomBookings.push(booking);
        localStorage.setItem('institutes', JSON.stringify(institutes));
        return true;
    },
    
    // Cancel room booking
    cancelRoomBooking: function(instituteCode, bookingId) {
        const institutes = JSON.parse(localStorage.getItem('institutes') || '{}');
        if (!institutes[instituteCode]) return false;
        
        const index = institutes[instituteCode].roomBookings.findIndex(b => b.id === bookingId);
        if (index === -1) return false;
        
        institutes[instituteCode].roomBookings.splice(index, 1);
        localStorage.setItem('institutes', JSON.stringify(institutes));
        return true;
    },
    
    // Get available rooms for a specific time
    getAvailableRooms: function(instituteCode, date, period) {
        const institute = this.getInstitute(instituteCode);
        if (!institute) return [];
        
        const allRooms = institute.infrastructure.rooms || [];
        const bookings = institute.roomBookings || [];
        
        // Filter rooms that are not booked for the given date and period
        const bookedRoomIds = bookings
            .filter(b => b.date === date && b.period === period)
            .map(b => b.roomId);
        
        return allRooms.filter(room => !bookedRoomIds.includes(room.id));
    },
    
    // Get teacher workload
    getTeacherWorkload: function(instituteCode, teacherId) {
        const institute = this.getInstitute(instituteCode);
        if (!institute) return { weekly: 0, daily: {} };
        
        const timetables = institute.timetables || {};
        let weeklyCount = 0;
        const dailyCount = {
            Monday: 0, Tuesday: 0, Wednesday: 0, 
            Thursday: 0, Friday: 0, Saturday: 0
        };
        
        // Count teacher's classes across all timetables
        Object.values(timetables).forEach(timetable => {
            const schedule = timetable.schedule || {};
            Object.entries(schedule).forEach(([day, periods]) => {
                periods.forEach(period => {
                    if (period.teacher === teacherId) {
                        weeklyCount++;
                        dailyCount[day]++;
                    }
                });
            });
        });
        
        return { weekly: weeklyCount, daily: dailyCount };
    },
    
    // Check for timetable conflicts
    checkTimetableConflicts: function(instituteCode) {
        const institute = this.getInstitute(instituteCode);
        if (!institute) return [];
        
        const conflicts = [];
        const timetables = institute.timetables || {};
        const teacherSchedule = {};
        const roomSchedule = {};
        
        // Check for teacher and room conflicts
        Object.entries(timetables).forEach(([key, timetable]) => {
            const schedule = timetable.schedule || {};
            Object.entries(schedule).forEach(([day, periods]) => {
                periods.forEach((period, periodIndex) => {
                    if (period.teacher && period.room) {
                        // Check teacher conflict
                        const teacherKey = `${day}-${periodIndex}-${period.teacher}`;
                        if (teacherSchedule[teacherKey]) {
                            conflicts.push({
                                type: "teacher",
                                teacher: period.teacher,
                                day: day,
                                period: periodIndex + 1,
                                conflictWith: teacherSchedule[teacherKey]
                            });
                        } else {
                            teacherSchedule[teacherKey] = key;
                        }
                        
                        // Check room conflict
                        const roomKey = `${day}-${periodIndex}-${period.room}`;
                        if (roomSchedule[roomKey]) {
                            conflicts.push({
                                type: "room",
                                room: period.room,
                                day: day,
                                period: periodIndex + 1,
                                conflictWith: roomSchedule[roomKey]
                            });
                        } else {
                            roomSchedule[roomKey] = key;
                        }
                    }
                });
            });
        });
        
        return conflicts;
    },
    
    // Export timetable data
    exportTimetable: function(instituteCode, format = 'json') {
        const institute = this.getInstitute(instituteCode);
        if (!institute) return null;
        
        if (format === 'json') {
            return JSON.stringify(institute.timetables, null, 2);
        }
        
        // For CSV export (simplified)
        let csv = "Year,Department,Division,Day,Period,Subject,Teacher,Room\n";
        Object.entries(institute.timetables).forEach(([key, timetable]) => {
            const [year, department, division] = key.split('-');
            const schedule = timetable.schedule || {};
            
            Object.entries(schedule).forEach(([day, periods]) => {
               periods.forEach((period, index) => {
                    if (period.subject) {
                        csv += `${year},${department},${division},${day},${index + 1},${period.subject},${period.teacher},${period.room}\n`;
                    }
                });
            });
        });
        
        return csv;
    }
};

// Initialize sample data on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function() {
        DataManager.initSampleData();
    });
}
// Check if timetable exists for student1
const student1Timetable = DataManager.getTimetable('INST001', 2, 'CS', 'A');
console.log('Student 1 Timetable:', student1Timetable);

// Check if timetable exists for student2  
const student2Timetable = DataManager.getTimetable('INST001', 2, 'IT', 'B');
console.log('Student 2 Timetable:', student2Timetable);