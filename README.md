# EduPractic 🎓💼

**🚀 [Click here to view the live platform](https://edu-practic.vercel.app/)**

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logoColor=black)

**EduPractic** is a comprehensive, full-stack internship management platform designed to digitize and streamline the Vocational Education and Training (VET) sector. It bridges the gap between students, educational institutions, and companies by providing a centralized hub for applying, tracking, and evaluating practical learning experiences.

## 🎯 The Problem & Solution

Traditional internship management in the VET sector often relies on paper logbooks, manual attendance tracking, and disconnected communication. EduPractic solves this by offering a role-based, bilingual digital ecosystem where daily logs, location verifications, and progress archives are managed automatically.

## ✨ Core Features

- **Bilingual Architecture:** Integrated `i18n` engine supporting seamless, real-time UI switching between Macedonian (MK) and English (EN).
- **Role-Based Access Control (RBAC):** Custom-tailored portals with strict middleware protection for three distinct user types:

  <br>

  ### 🧑‍🎓 Student Portal (Mobile First)
  Browse open positions, apply, maintain daily task logbooks, and submit geolocation-verified attendance.

  | 📱 Registration & Role Selection | 📍 Submitting Daily Geolocation Log |
  | :---: | :---: |
  | <img width="200" alt="studentRegisterGif" src="https://github.com/user-attachments/assets/64d38d12-2d36-4447-8bf8-0d3e95a91728" /> | <img width="200" alt="studentLocationGif" src="https://github.com/user-attachments/assets/3b3e058a-cc5e-486e-930a-b90666fc27c4" /> |


  <br>

  ### 🏢 Company Portal
  Post structured internship listings, review candidate applications, and manage active interns.

  | 📋 Reviewing Student Applications | ✍️ Posting a New Internship |
  | :---: | :---: |
  | <img width="400" alt="companyReviewGif" src="https://github.com/user-attachments/assets/faeda203-f730-4f91-b1c7-df520aa11625" /> | <img width="400" alt="companyPostGif" src="https://github.com/user-attachments/assets/b867521b-d084-4858-b4ed-665aa666da6b" /> |



  <br>

  ### 👨‍🏫 Professor & Mentor Dashboard
  Monitor student quotas, review daily logs, manage excused absences, and generate bulk PDF archives for completed internships.

  | 📊 Monitoring Student Progress | 🗄️ 1-Click Bulk PDF Archiving |
  | :---: | :---: |
  | <img width="400" alt="professorMonitorGif" src="https://github.com/user-attachments/assets/45c7bc5c-185a-42cd-b4e3-51eb23ccb1b9" /> | <img width="400" alt="professorArchiveGif" src="https://github.com/user-attachments/assets/e0e0e839-b7f4-4b43-9559-865ad6ec0c5f" /> |


- **Responsive Hub Design:** Mobile-first, flex-grid layouts ensuring complex data tables and interactive dashboards scale perfectly on all devices.
- **Smart Notifications:** Real-time alert ping system for application status updates and urgent mentor feedback.

## 🛠️ Technical Architecture

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Frontend:** EJS (Embedded JavaScript), Vanilla JavaScript, Custom CSS, FontAwesome
- **Security & Auth:** JWT (JSON Web Tokens), bcryptjs
- **Localization:** i18n-node

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB database instance (Local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/ivansimonovikj/EduPractic.git](https://github.com/ivansimonovikj/EduPractic.git)
   cd EduPractic<img width="800" height="1733" alt="studentRegisterGif" src="https://github.com/user-attachments/assets/068dbbf1-de8f-4b3f-a6a4-3d6d56054b3b" />
