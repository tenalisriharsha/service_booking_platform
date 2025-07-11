# Service Booking Platform

A full-stack, customizable appointment scheduling and service booking platform built with Django (Python) and React (JavaScript), enabling providers and clients to seamlessly manage bookings, availabilities, and communication.

## 🚀 Features

- **User Registration & Authentication** (Django REST, React)
- **Role-Based Access**: Client, User, and Custom Roles
- **Timezone-aware Scheduling**
- **Weekly Availability Management** for providers
- **Service Search & Filtering** (date, name, etc.)
- **Custom Client Role Field** (enter any description for client’s service)
- **Responsive UI** (React, CSS)
- **API-driven Backend** (Django REST Framework)
- **JWT/Token Authentication** for secure access
- **Profile, Dashboard & Listings** for users/clients
- **Modular, Extensible Codebase**
- **Admin Dashboard** (Django Admin)

## 🛠️ Tech Stack

- **Frontend:**  
  - React (Functional Components, Hooks)
  - CSS Modules / Custom CSS

- **Backend:**  
  - Django 5.x  
  - Django REST Framework  
  - Custom User Model (with extended fields)

- **Database:**  
  - SQLite (Dev) — Easily switchable to PostgreSQL/MySQL for production

- **Tools & Platform:**  
  - PyCharm (Backend)
  - VSCode/WebStorm (Frontend optional)
  - Git, GitHub (Version Control)
  - Postman (API Testing)
  - MacOS/Linux/Windows (Cross-platform dev)

## 📂 Project Structure
service_booking_platform/
│
├── accounts/                # User & Auth logic
│   ├── models.py            # CustomUser (with role, timezone, client_role)
│   ├── serializers.py
│   └── views.py
│
├── booking/                 # Booking logic, availability, slots
│   ├── models.py
│   ├── serializers.py
│   └── views.py
│
├── payments/                # (Optional) Payments integration
├── notifications/           # (Optional) Email/SMS logic
│
├── frontend/booking-ui/     # React app (see below)
│   ├── src/
│       └── userflow/
│           ├── ClientRegister.jsx
│           ├── ClientLogin.jsx
│           ├── ClientWeeklyAvailability.jsx
│           ├── SearchClients.jsx
│           └── … etc.
│
└── README.md                

## 🌐 How to Run Locally

### 1. **Backend (Django)**
```bash
# Setup virtualenv, activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # Create admin
python manage.py runserver

2. Frontend (React)
cd frontend/booking-ui
npm install
npm start
# App runs on http://localhost:3000

3. Environment Variables
	•	Configure Django settings.py for allowed hosts, database, email, etc.
	•	Add .env files for secrets (don’t commit to git!)

📸 Screenshots
<img width="1710" height="1107" alt="Screenshot 2025-07-10 at 8 05 23 PM" src="https://github.com/user-attachments/assets/277fecb9-2b63-40d0-89c4-7c2bc5cc71ba" />
<img width="1710" height="1107" alt="Screenshot 2025-07-10 at 8 05 39 PM" src="https://github.com/user-attachments/assets/8627d985-19f0-4fe5-a7f7-a69d0cda31d3" />
<img width="1710" height="1107" alt="Screenshot 2025-07-10 at 8 10 09 PM" src="https://github.com/user-attachments/assets/be16105d-3b10-4c25-9212-00e06150d3e5" />
<img width="1710" height="1107" alt="Screenshot 2025-07-10 at 8 10 32 PM" src="https://github.com/user-attachments/assets/990745e3-ec26-4fba-b1ff-9d216f212fbb" />
<img width="1710" height="1107" alt="Screenshot 2025-07-10 at 8 10 50 PM" src="https://github.com/user-attachments/assets/c5b1c8d9-4982-4c5a-9983-21a8f302d173" />
<img width="1710" height="1107" alt="Screenshot 2025-07-10 at 8 11 00 PM" src="https://github.com/user-attachments/assets/e11ded30-2260-4f65-aff2-5bf5f3c3153b" />
<img width="1710" height="1107" alt="Screenshot 2025-07-10 at 8 12 14 PM" src="https://github.com/user-attachments/assets/63d65453-02a5-4398-b2de-efc107282683" />
<img width="1710" height="1107" alt="Screenshot 2025-07-10 at 8 12 50 PM" src="https://github.com/user-attachments/assets/b12da000-8ab3-4458-8000-943f0bf16e51" />
<img width="1710" height="1107" alt="Screenshot 2025-07-10 at 8 13 00 PM" src="https://github.com/user-attachments/assets/9a6d66c3-0149-4da4-90c4-d3b56f419371" />
<img width="1710" height="1107" alt="Screenshot 2025-07-10 at 8 13 39 PM" src="https://github.com/user-attachments/assets/966bb21e-777b-4e21-a9d2-b1855da3aab2" />

🤖 API Overview
	•	/api/accounts/register/ — Register user/client
	•	/api/accounts/login/ — Login, get token
	•	/api/accounts/me/ — Get current user info (role, timezone, client_role)
	•	/api/booking/weekly-availability/ — Set or fetch availability
	•	/api/booking/clients-with-availability/ — List/search clients

⸻

📝 Customization
	•	Add more roles or permissions by editing CustomUser
	•	Extend booking model to include payments, reviews, etc.
	•	Easily connect with email, SMS, or 3rd-party integrations

⸻

👨‍💻 Contributors
	•	Sri Harsha Tenali (@tenalisriharsha)



