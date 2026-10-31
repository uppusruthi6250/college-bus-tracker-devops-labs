/**
 * Seed Data Script
 * Populates database with provided route data
 */

require('dotenv').config();
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, '..', 'database', 'bus_tracker.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);

console.log('🌱 Seeding database with Route data...');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Hash password for demo users
const hashedPassword = bcrypt.hashSync('password123', 10);

// Insert demo users
const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (username, password, role, full_name, email, phone)
    VALUES (?, ?, ?, ?, ?, ?)
`);

// Admin user
insertUser.run('admin', hashedPassword, 'admin', 'Admin User', 'admin@college.edu', '9876543210');

// Driver users
insertUser.run('driver1', hashedPassword, 'driver', 'Rajesh Kumar', 'rajesh@college.edu', '9876543211');
insertUser.run('driver2', hashedPassword, 'driver', 'Suresh Sharma', 'suresh@college.edu', '9876543212');
insertUser.run('driver3', hashedPassword, 'driver', 'Ramesh Gupta', 'ramesh@college.edu', '9876543213'); // Route 23K
insertUser.run('driver4', hashedPassword, 'driver', 'Mahesh Babu', 'mahesh@college.edu', '9876543214'); // Route 27P
insertUser.run('driver5', hashedPassword, 'driver', 'Naresh Reddy', 'naresh@college.edu', '9876543215'); // Route 7D
insertUser.run('driver6', hashedPassword, 'driver', 'Kiran Kumar', 'kiran@college.edu', '9876543216');
 // Route 7D

// Student users
insertUser.run('student1', hashedPassword, 'student', 'Amit Patel', 'amit@student.edu', '9876543216'); // Route 22K
insertUser.run('student2', hashedPassword, 'student', 'Priya Singh', 'priya@student.edu', '9876543217'); // Route 1D
insertUser.run('student3', hashedPassword, 'student', 'Rahul Verma', 'rahul@student.edu', '9876543218'); // Route 23K
insertUser.run('student4', hashedPassword, 'student', 'Sneha Reddy', 'sneha@student.edu', '9876543219'); // Route 27P
insertUser.run('student5', hashedPassword, 'student', 'Vikram Joshi', 'vikram@student.edu', '9876543220'); // Route 7D
insertUser.run('student6', hashedPassword, 'student', 'Ananya Sharma', 'ananya@student.edu', '9876543221'); // Route 30S
insertUser.run('student7', hashedPassword, 'student', 'Rohan Das', 'rohan@student.edu', '9876543222'); // Route 13E
insertUser.run('student8', hashedPassword, 'student', 'Kavita Devi', 'kavita@student.edu', '9876543223'); // Route 10E
insertUser.run('student9', hashedPassword, 'student', 'Sanjay Kumar', 'sanjay@student.edu', '9876543224'); // Route 5D
insertUser.run('student10', hashedPassword, 'student', 'Megha Rao', 'megha@student.edu', '9876543225'); // Route 16E
insertUser.run('student11', hashedPassword, 'student', 'Arjun Singh', 'arjun@student.edu', '9876543226'); // Route 20K
insertUser.run('student12', hashedPassword, 'student', 'Divya Patel', 'divya@student.edu', '9876543227'); // Route 14E
insertUser.run('student13', hashedPassword, 'student', 'Karthik N', 'karthik@student.edu', '9876543228'); // Route 15E
insertUser.run('student14', hashedPassword, 'student', 'Pooja Hegde', 'pooja@student.edu', '9876543229'); // Extra
insertUser.run('student15', hashedPassword, 'student', 'Manish Pandey', 'manish@student.edu', '9876543230'); // Extra

console.log('✅ Created demo users');

// Route Data
const routesData = [
    {
        "routeId": "22K",
        "name": "Suchitra to GNITS",
        "stops": [
            { "stopNo": 1, "name": "Suchitra", "lat": 17.4950, "lng": 78.4727 },
            { "stopNo": 2, "name": "Dairy Farm", "lat": 17.4815, "lng": 78.4740 },
            { "stopNo": 3, "name": "KPHB", "lat": 17.4837, "lng": 78.3915 },
            { "stopNo": 4, "name": "JNTU", "lat": 17.4933, "lng": 78.3914 },
            { "stopNo": 5, "name": "Nizampet", "lat": 17.4996, "lng": 78.3853 },
            { "stopNo": 6, "name": "Miyapur", "lat": 17.4968, "lng": 78.3484 },
            { "stopNo": 7, "name": "GNITS", "lat": 17.4124, "lng": 78.3970 }
        ]
    },
    {
        "routeId": "1D",
        "name": "Hayathnagar to GNITS",
        "stops": [
            { "stopNo": 1, "name": "Hayathnagar", "lat": 17.3237, "lng": 78.6041 },
            { "stopNo": 2, "name": "L.B. Nagar", "lat": 17.3457, "lng": 78.5522 },
            { "stopNo": 3, "name": "Chaitanyapuri", "lat": 17.3688, "lng": 78.5342 },
            { "stopNo": 4, "name": "Malakpet", "lat": 17.3719, "lng": 78.4972 },
            { "stopNo": 5, "name": "Koti", "lat": 17.3824, "lng": 78.4827 },
            { "stopNo": 6, "name": "Lakdikapool", "lat": 17.4020, "lng": 78.4653 },
            { "stopNo": 7, "name": "Mehdipatnam", "lat": 17.3916, "lng": 78.4402 },
            { "stopNo": 8, "name": "GNITS", "lat": 17.4124, "lng": 78.3970 }
        ]
    },
    {
        "routeId": "23K",
        "name": "Bachupally to GNITS",
        "stops": [
            { "stopNo": 1, "name": "Bachupally", "lat": 17.5358, "lng": 78.3615 },
            { "stopNo": 2, "name": "Coca Cola Company", "lat": 17.5029, "lng": 78.3491 },
            { "stopNo": 3, "name": "MyHome", "lat": 17.4930, "lng": 78.3470 },
            { "stopNo": 4, "name": "Lingampally", "lat": 17.4841, "lng": 78.3243 },
            { "stopNo": 5, "name": "HCU", "lat": 17.4580, "lng": 78.3370 },
            { "stopNo": 6, "name": "GNITS", "lat": 17.4124, "lng": 78.3970 }
        ]
    },
    {
        "routeId": "27P",
        "name": "Patancheru to GNITS",
        "stops": [
            { "stopNo": 1, "name": "Patancheru", "lat": 17.5255, "lng": 78.2678 },
            { "stopNo": 2, "name": "Bairamguda", "lat": 17.5350, "lng": 78.3050 },
            { "stopNo": 3, "name": "Ashok Nagar", "lat": 17.5011, "lng": 78.3187 },
            { "stopNo": 4, "name": "Miyapur", "lat": 17.4968, "lng": 78.3484 },
            { "stopNo": 5, "name": "JNTU", "lat": 17.4933, "lng": 78.3914 },
            { "stopNo": 6, "name": "Madhapur PS", "lat": 17.4475, "lng": 78.3912 },
            { "stopNo": 7, "name": "Mindspace", "lat": 17.4411, "lng": 78.3820 },
            { "stopNo": 8, "name": "Raidurga", "lat": 17.4262, "lng": 78.3780 },
            { "stopNo": 9, "name": "GNITS", "lat": 17.4124, "lng": 78.3970 }
        ]
    },
    {
        "routeId": "7D",
        "name": "Balapur to GNITS",
        "stops": [
            { "stopNo": 1, "name": "Balapur", "lat": 17.3060, "lng": 78.5135 },
            { "stopNo": 2, "name": "Karmanghat", "lat": 17.3392, "lng": 78.5317 },
            { "stopNo": 3, "name": "Champapet", "lat": 17.3458, "lng": 78.5186 },
            { "stopNo": 4, "name": "Midani", "lat": 17.3323, "lng": 78.4983 },
            { "stopNo": 5, "name": "Chandrayangutta", "lat": 17.3117, "lng": 78.4746 },
            { "stopNo": 6, "name": "Attapur", "lat": 17.3653, "lng": 78.4344 },
            { "stopNo": 7, "name": "GNITS", "lat": 17.4124, "lng": 78.3970 }
        ]
    },
    {
        "routeId": "30S",
        "name": "Are Maisamma Temple to GNITS",
        "stops": [
            { "stopNo": 1, "name": "Are Maisamma Temple", "lat": 17.4173, "lng": 78.3560 },
            { "stopNo": 2, "name": "Bandlaguda", "lat": 17.3813, "lng": 78.3920 },
            { "stopNo": 3, "name": "Vasavi College", "lat": 17.3816, "lng": 78.3238 },
            { "stopNo": 4, "name": "J.K Function Hall", "lat": 17.3960, "lng": 78.3600 },
            { "stopNo": 5, "name": "Narsingi Main Road", "lat": 17.3924, "lng": 78.3496 },
            { "stopNo": 6, "name": "O.U Colony X Roads", "lat": 17.4030, "lng": 78.3870 },
            { "stopNo": 7, "name": "GNITS", "lat": 17.4124, "lng": 78.3970 }
        ]
    },
    {
        "routeId": "13E",
        "name": "Nagaram to GNITS",
        "stops": [
            { "stopNo": 1, "name": "Nagaram", "lat": 17.4765, "lng": 78.5662 },
            { "stopNo": 2, "name": "ECIL", "lat": 17.4762, "lng": 78.5713 },
            { "stopNo": 3, "name": "Housing Board", "lat": 17.4585, "lng": 78.5570 },
            { "stopNo": 4, "name": "Mettuguda", "lat": 17.4353, "lng": 78.5085 },
            { "stopNo": 5, "name": "Kawadiguda", "lat": 17.4103, "lng": 78.4940 },
            { "stopNo": 6, "name": "Lower Tank Bund", "lat": 17.4094, "lng": 78.4747 },
            { "stopNo": 7, "name": "Tolichowki", "lat": 17.3993, "lng": 78.3996 },
            { "stopNo": 8, "name": "GNITS", "lat": 17.4124, "lng": 78.3970 }
        ]
    },
    {
        "routeId": "10E",
        "name": "Kushaiguda to GNITS",
        "stops": [
            { "stopNo": 1, "name": "Kushaiguda", "lat": 17.4810, "lng": 78.5755 },
            { "stopNo": 2, "name": "Bhavans College", "lat": 17.4489, "lng": 78.5040 },
            { "stopNo": 3, "name": "Malkajgiri", "lat": 17.4474, "lng": 78.5240 },
            { "stopNo": 4, "name": "Mettuguda", "lat": 17.4353, "lng": 78.5085 },
            { "stopNo": 5, "name": "Paradise", "lat": 17.4417, "lng": 78.4843 },
            { "stopNo": 6, "name": "Khairathabad", "lat": 17.4126, "lng": 78.4607 },
            { "stopNo": 7, "name": "Masab Tank", "lat": 17.4039, "lng": 78.4522 },
            { "stopNo": 8, "name": "Tolichowki", "lat": 17.3993, "lng": 78.3996 },
            { "stopNo": 9, "name": "GNITS", "lat": 17.4124, "lng": 78.3970 }
        ]
    },
    {
        "routeId": "5D",
        "name": "DRDL to GNITS",
        "stops": [
            { "stopNo": 1, "name": "DRDL", "lat": 17.3091, "lng": 78.4854 },
            { "stopNo": 2, "name": "Balapur X Roads", "lat": 17.3104, "lng": 78.4997 },
            { "stopNo": 3, "name": "NTR Nagar", "lat": 17.3290, "lng": 78.5005 },
            { "stopNo": 4, "name": "Musarambagh", "lat": 17.3790, "lng": 78.5095 },
            { "stopNo": 5, "name": "Kachiguda", "lat": 17.3912, "lng": 78.4952 },
            { "stopNo": 6, "name": "Narayanguda PS", "lat": 17.3992, "lng": 78.4880 },
            { "stopNo": 7, "name": "Mahaveer Hospital", "lat": 17.3998, "lng": 78.4675 },
            { "stopNo": 8, "name": "Tolichowki", "lat": 17.3993, "lng": 78.3996 },
            { "stopNo": 9, "name": "GNITS", "lat": 17.4124, "lng": 78.3970 }
        ]
    },
    {
        "routeId": "16E",
        "name": "Budha Nagar Road No 7 to GNITS",
        "stops": [
            { "stopNo": 1, "name": "Budha Nagar Road No 7", "lat": 17.4148, "lng": 78.5560 },
            { "stopNo": 2, "name": "Boduppal", "lat": 17.4135, "lng": 78.5783 },
            { "stopNo": 3, "name": "Uppal Depot", "lat": 17.4016, "lng": 78.5590 },
            { "stopNo": 4, "name": "Uppal Bus Stand", "lat": 17.4057, "lng": 78.5591 },
            { "stopNo": 5, "name": "Uppal Ring Road", "lat": 17.4030, "lng": 78.5615 },
            { "stopNo": 6, "name": "Survey of India", "lat": 17.3950, "lng": 78.5568 },
            { "stopNo": 7, "name": "Habsiguda", "lat": 17.4140, "lng": 78.5410 },
            { "stopNo": 8, "name": "Tarnaka", "lat": 17.4283, "lng": 78.5386 },
            { "stopNo": 9, "name": "Railway Degree College", "lat": 17.4305, "lng": 78.5332 },
            { "stopNo": 10, "name": "Mettuguda", "lat": 17.4353, "lng": 78.5085 },
            { "stopNo": 11, "name": "Allagadda Bavi", "lat": 17.4200, "lng": 78.5050 },
            { "stopNo": 12, "name": "Sitaphalmandi", "lat": 17.4300, "lng": 78.5000 },
            { "stopNo": 13, "name": "Chilkalguda", "lat": 17.4405, "lng": 78.4972 },
            { "stopNo": 14, "name": "Padmarao Nagar", "lat": 17.4304, "lng": 78.5061 },
            { "stopNo": 15, "name": "Musheerabad", "lat": 17.4143, "lng": 78.4980 },
            { "stopNo": 16, "name": "Gokonda X Roads", "lat": 17.4070, "lng": 78.4920 },
            { "stopNo": 17, "name": "RTC X Roads", "lat": 17.4040, "lng": 78.4890 },
            { "stopNo": 18, "name": "Ashok Nagar X Roads", "lat": 17.4010, "lng": 78.4850 },
            { "stopNo": 19, "name": "Telugu Talli Flyover", "lat": 17.3990, "lng": 78.4790 },
            { "stopNo": 20, "name": "Secretariat", "lat": 17.4035, "lng": 78.4706 },
            { "stopNo": 21, "name": "Lakdikapool", "lat": 17.4020, "lng": 78.4653 },
            { "stopNo": 22, "name": "NMDC", "lat": 17.3965, "lng": 78.4550 },
            { "stopNo": 23, "name": "Mehdipatnam", "lat": 17.3916, "lng": 78.4402 },
            { "stopNo": 24, "name": "Nanal Nagar", "lat": 17.3880, "lng": 78.4300 },
            { "stopNo": 25, "name": "Tolichowki", "lat": 17.3993, "lng": 78.3996 },
            { "stopNo": 26, "name": "GNITS", "lat": 17.4124, "lng": 78.3970 }
        ]
    },
    {
        "routeId": "20K",
        "name": "West Marredpally to GNITS",
        "stops": [
            { "stopNo": 1, "name": "West Marredpally", "lat": 17.4508, "lng": 78.4983 },
            { "stopNo": 2, "name": "Balkampet", "lat": 17.4485, "lng": 78.4502 },
            { "stopNo": 3, "name": "Balkampet Temple", "lat": 17.4475, "lng": 78.4495 },
            { "stopNo": 4, "name": "S.R Nagar PS", "lat": 17.4440, "lng": 78.4450 },
            { "stopNo": 5, "name": "S.R Nagar Community Hall", "lat": 17.4425, "lng": 78.4440 },
            { "stopNo": 6, "name": "S.R Nagar Statue", "lat": 17.4410, "lng": 78.4430 },
            { "stopNo": 7, "name": "Vengal Rao Nagar", "lat": 17.4402, "lng": 78.4380 },
            { "stopNo": 8, "name": "Rajiv Nagar", "lat": 17.4380, "lng": 78.4350 },
            { "stopNo": 9, "name": "Mid Land", "lat": 17.4365, "lng": 78.4320 },
            { "stopNo": 10, "name": "Mothi Nagar", "lat": 17.4335, "lng": 78.4280 },
            { "stopNo": 11, "name": "Mee Seva", "lat": 17.4300, "lng": 78.4250 },
            { "stopNo": 12, "name": "P.R.R Nagar", "lat": 17.4280, "lng": 78.4230 },
            { "stopNo": 13, "name": "Janapriya Apartments", "lat": 17.4250, "lng": 78.4200 },
            { "stopNo": 14, "name": "Erragadda", "lat": 17.4486, "lng": 78.4433 },
            { "stopNo": 15, "name": "Bharathi Nagar", "lat": 17.4455, "lng": 78.4400 },
            { "stopNo": 16, "name": "Moosapet", "lat": 17.4653, "lng": 78.4336 },
            { "stopNo": 17, "name": "Metro", "lat": 17.4675, "lng": 78.4345 },
            { "stopNo": 18, "name": "Kukatpally", "lat": 17.4948, "lng": 78.3996 },
            { "stopNo": 19, "name": "KPHB", "lat": 17.4837, "lng": 78.3915 },
            { "stopNo": 20, "name": "KPHB Road No 1", "lat": 17.4855, "lng": 78.3885 },
            { "stopNo": 21, "name": "Malasia Township", "lat": 17.4870, "lng": 78.3850 },
            { "stopNo": 22, "name": "KPHB V Phase", "lat": 17.4890, "lng": 78.3820 },
            { "stopNo": 23, "name": "Flyover", "lat": 17.4920, "lng": 78.3790 },
            { "stopNo": 24, "name": "Hi-Tech City Railway Station", "lat": 17.4495, "lng": 78.3781 },
            { "stopNo": 25, "name": "Hi-Tech City", "lat": 17.4435, "lng": 78.3772 },
            { "stopNo": 26, "name": "Darga", "lat": 17.4230, "lng": 78.3990 },
            { "stopNo": 27, "name": "GNITS", "lat": 17.4124, "lng": 78.3970 }
        ]
    },
    {
        "routeId": "14E",
        "name": "Diamond Point to GNITS",
        "stops": [
            { "stopNo": 1, "name": "Diamond Point", "lat": 17.4745, "lng": 78.5040 },
            { "stopNo": 2, "name": "Monda Market", "lat": 17.4392, "lng": 78.4983 },
            { "stopNo": 3, "name": "Pallavi School", "lat": 17.4380, "lng": 78.4900 },
            { "stopNo": 4, "name": "Bapuji Nagar", "lat": 17.4330, "lng": 78.4850 },
            { "stopNo": 5, "name": "Bowenpally PS", "lat": 17.4600, "lng": 78.4800 },
            { "stopNo": 6, "name": "Ferozguda", "lat": 17.4570, "lng": 78.4700 },
            { "stopNo": 7, "name": "B.B.R Hospital", "lat": 17.4520, "lng": 78.4705 },
            { "stopNo": 8, "name": "Shobhana Theatre", "lat": 17.4450, "lng": 78.4700 },
            { "stopNo": 9, "name": "Bala Nagar", "lat": 17.4510, "lng": 78.4490 },
            { "stopNo": 10, "name": "Fathe Nagar", "lat": 17.4580, "lng": 78.4380 },
            { "stopNo": 11, "name": "Sanath Nagar Flyover", "lat": 17.4555, "lng": 78.4440 },
            { "stopNo": 12, "name": "Erragadda", "lat": 17.4486, "lng": 78.4433 },
            { "stopNo": 13, "name": "Gokul Theatre", "lat": 17.4470, "lng": 78.4350 },
            { "stopNo": 14, "name": "ESI", "lat": 17.4430, "lng": 78.4320 },
            { "stopNo": 15, "name": "Vikas Puri", "lat": 17.4400, "lng": 78.4290 },
            { "stopNo": 16, "name": "J.J Hospital", "lat": 17.4370, "lng": 78.4250 },
            { "stopNo": 17, "name": "Kalyan Nagar", "lat": 17.4340, "lng": 78.4220 },
            { "stopNo": 18, "name": "Krishnakant Park", "lat": 17.4320, "lng": 78.4200 },
            { "stopNo": 19, "name": "Yusufguda Basthi", "lat": 17.4300, "lng": 78.4180 },
            { "stopNo": 20, "name": "Yellareddy Guda Check Post", "lat": 17.4280, "lng": 78.4150 },
            { "stopNo": 21, "name": "Sri Nagar Colony", "lat": 17.4260, "lng": 78.4120 },
            { "stopNo": 22, "name": "Satya Sai Nigam", "lat": 17.4240, "lng": 78.4100 },
            { "stopNo": 23, "name": "Kamala Nagar", "lat": 17.4220, "lng": 78.4080 },
            { "stopNo": 24, "name": "Krishna Nagar", "lat": 17.4200, "lng": 78.4060 },
            { "stopNo": 25, "name": "Venkatagiri", "lat": 17.4180, "lng": 78.4040 },
            { "stopNo": 26, "name": "Jubilee Hills Road No 10", "lat": 17.4160, "lng": 78.4020 },
            { "stopNo": 27, "name": "Gayathri Hills", "lat": 17.4140, "lng": 78.4000 },
            { "stopNo": 28, "name": "Peddamma Temple", "lat": 17.4215, "lng": 78.4070 },
            { "stopNo": 29, "name": "Madapur PS", "lat": 17.4484, "lng": 78.3915 },
            { "stopNo": 30, "name": "Hi Tech City", "lat": 17.4435, "lng": 78.3772 },
            { "stopNo": 31, "name": "Shilparamam", "lat": 17.4520, "lng": 78.3787 },
            { "stopNo": 32, "name": "Kothaguda", "lat": 17.4680, "lng": 78.3840 },
            { "stopNo": 33, "name": "Gachibowli", "lat": 17.4401, "lng": 78.3489 },
            { "stopNo": 34, "name": "Darga", "lat": 17.4230, "lng": 78.3990 },
            { "stopNo": 35, "name": "GNITS", "lat": 17.4124, "lng": 78.3970 }
        ]
    },
    {
        "routeId": "15E",
        "name": "Risala Bazar to GNITS",
        "stops": [
            { "stopNo": 1, "name": "Risala Bazar", "lat": 17.4830, "lng": 78.4990 },
            { "stopNo": 2, "name": "Bollaram", "lat": 17.5250, "lng": 78.5120 },
            { "stopNo": 3, "name": "Old Alwal", "lat": 17.5000, "lng": 78.5040 },
            { "stopNo": 4, "name": "Temple Alwal", "lat": 17.4920, "lng": 78.5020 },
            { "stopNo": 5, "name": "Alwal", "lat": 17.4940, "lng": 78.5050 },
            { "stopNo": 6, "name": "Lothukunta", "lat": 17.4860, "lng": 78.5120 },
            { "stopNo": 7, "name": "Lal Bazar", "lat": 17.4700, "lng": 78.5070 },
            { "stopNo": 8, "name": "Thirumalagiri", "lat": 17.4600, "lng": 78.4980 },
            { "stopNo": 9, "name": "Karkhana", "lat": 17.4550, "lng": 78.4985 },
            { "stopNo": 10, "name": "Secunderabad Club", "lat": 17.4400, "lng": 78.4930 },
            { "stopNo": 11, "name": "Mud Ford", "lat": 17.4370, "lng": 78.4870 },
            { "stopNo": 12, "name": "Sikh Village X Roads", "lat": 17.4350, "lng": 78.4850 },
            { "stopNo": 13, "name": "Paradise", "lat": 17.4417, "lng": 78.4843 },
            { "stopNo": 14, "name": "Shyamlal Building", "lat": 17.4330, "lng": 78.4800 },
            { "stopNo": 15, "name": "Begumpet", "lat": 17.4443, "lng": 78.4666 },
            { "stopNo": 16, "name": "Lifestyle", "lat": 17.4310, "lng": 78.4560 },
            { "stopNo": 17, "name": "Panjagutta", "lat": 17.4260, "lng": 78.4530 },
            { "stopNo": 18, "name": "Nagarjuna Circle", "lat": 17.4250, "lng": 78.4490 },
            { "stopNo": 19, "name": "TV9", "lat": 17.4220, "lng": 78.4450 },
            { "stopNo": 20, "name": "LV Prasad Eye Hospital", "lat": 17.4190, "lng": 78.4410 },
            { "stopNo": 21, "name": "Jubilee Check Post", "lat": 17.4257, "lng": 78.4107 },
            { "stopNo": 22, "name": "Peddamma Temple", "lat": 17.4215, "lng": 78.4070 },
            { "stopNo": 23, "name": "Hi Tech City", "lat": 17.4435, "lng": 78.3772 },
            { "stopNo": 24, "name": "Mindspace", "lat": 17.4411, "lng": 78.3820 },
            { "stopNo": 25, "name": "Raidurgam", "lat": 17.4262, "lng": 78.3780 },
            { "stopNo": 26, "name": "Darga", "lat": 17.4230, "lng": 78.3990 },
            { "stopNo": 27, "name": "GNITS", "lat": 17.4124, "lng": 78.3970 }
        ]
    }
];

// Insert routes
const insertRoute = db.prepare(`
    INSERT OR IGNORE INTO routes (id, name, description, is_active)
    VALUES (?, ?, ?, ?)
`);

// Insert stops
const insertStop = db.prepare(`
    INSERT OR IGNORE INTO stops (route_id, name, latitude, longitude, sequence_order, distance_from_previous)
    VALUES (?, ?, ?, ?, ?, ?)
`);

// Helper to calculate distance
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Insert routes and stops
routesData.forEach(route => {
    insertRoute.run(route.routeId, route.name, `${route.name} Route`, 1);

    let previousStop = null;
    route.stops.forEach((stop, index) => {
        let distance = 0;
        if (previousStop) {
            distance = haversineDistance(previousStop.lat, previousStop.lng, stop.lat, stop.lng);
        }

        insertStop.run(route.routeId, stop.name, stop.lat, stop.lng, stop.stopNo, distance);
        previousStop = stop;
    });
});

console.log('✅ Created routes and stops');

// Insert buses
const insertBus = db.prepare(`
    INSERT OR IGNORE INTO buses (bus_number, route_id, driver_id, status)
    VALUES (?, ?, ?, ?)
`);

// Assigning buses to routes
insertBus.run('BUS-22K', '22K', 2, 'idle');
insertBus.run('BUS-1D', '1D', 3, 'idle');
insertBus.run('BUS-23K', '23K', 4, 'idle');
insertBus.run('BUS-27P', '27P', 5, 'idle');
insertBus.run('BUS-7D', '7D', 6, 'idle');
insertBus.run('BUS-30S', '30S', 2, 'idle');
insertBus.run('BUS-13E', '13E', 3, 'idle');
insertBus.run('BUS-10E', '10E', 4, 'idle');
insertBus.run('BUS-5D', '5D', 5, 'idle');
insertBus.run('BUS-16E', '16E', 2, 'idle');
insertBus.run('BUS-20K', '20K', 3, 'idle');
insertBus.run('BUS-14E', '14E', 4, 'idle');
insertBus.run('BUS-15E', '15E', 5, 'idle');

console.log('✅ Created buses');


// Clear existing assignments to ensure clean state
db.prepare('DELETE FROM student_stops').run();

// Assign students to stops
const insertStudentStop = db.prepare(`
    INSERT OR IGNORE INTO student_stops (student_id, stop_id)
    VALUES (?, ?)
`);

// Fetch student/stop IDs for assignment
const getStudentId = db.prepare(`SELECT id FROM users WHERE username = ?`);
const getStopId = db.prepare(`SELECT id FROM stops WHERE route_id = ? AND sequence_order = ?`);

const assignStudentToStop = (username, routeId, sequenceOrder) => {
    const student = getStudentId.get(username);
    const stop = getStopId.get(routeId, sequenceOrder);
    if (student && stop) {
        insertStudentStop.run(student.id, stop.id);
        console.log(`📍 Assigned ${username} to ${routeId} (Stop ${sequenceOrder})`);
    } else {
        console.warn(`⚠️ Could not assign ${username} to ${routeId}: Student or Stop not found`);
    }
};

// Unique assignment: Each route gets one student
assignStudentToStop('student1', '22K', 3);
assignStudentToStop('student2', '1D', 4);
assignStudentToStop('student3', '23K', 4);
assignStudentToStop('student4', '27P', 5);
assignStudentToStop('student5', '7D', 4);
assignStudentToStop('student6', '30S', 3);
assignStudentToStop('student7', '13E', 4);
assignStudentToStop('student8', '10E', 5);
assignStudentToStop('student9', '5D', 4);
assignStudentToStop('student10', '16E', 5);
assignStudentToStop('student11', '20K', 8);
assignStudentToStop('student12', '14E', 12);
assignStudentToStop('student13', '15E', 10);

// Extra assignments
assignStudentToStop('student14', '22K', 2);
assignStudentToStop('student15', '1D', 2);
assignStudentToStop('student1', '20K', 15); // student1 on another route too
assignStudentToStop('student2', '14E', 5);  // student2 on another route too


console.log('✅ Assigned students to stops');

db.close();

console.log('🎉 Database seeding complete!');
