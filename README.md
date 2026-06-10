# EduPractic 🎓💼

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

  - 🧑‍🎓 **Students:** Browse open positions, apply, maintain daily task logbooks, and submit geolocation-verified attendance.
    <br>
  <img width="200" height="400" alt="studentRegisterGif" src="https://github.com/user-attachments/assets/dd97f5d7-0b13-485f-a941-b56c76f89aed" />
  - 🏢 **Companies:** Post structured internship listings, review candidate applications, and manage active interns.
  - 👨‍🏫 **Mentors/Professors:** Monitor student quotas, review daily logs, manage excused absences, and generate bulk PDF archives for completed internships.
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

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/ivansimonovikj/EduPractic.git](https://github.com/ivansimonovikj/EduPractic.git)
   cd EduPractic
   ```
