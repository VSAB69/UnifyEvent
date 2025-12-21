

# 📚 **College Event Management System — Full-Stack Application**

A complete event management platform built for colleges, featuring:

* 🎟 **Event browsing & registration**
* 🛒 **Cart system with constraints, slots & participant handling**
* 🧾 **Checkout & booking generation**
* 🎫 **Ticket view + upcoming ticket download system**
* 🛠 **Admin dashboard for event management** (slots, organisers, constraints, attendance)
* 🔐 **JWT cookie authentication**
* 💳 **Payment integration-ready architecture**

---

# ⚙️ **Tech Stack**

### **Frontend**

* React.js (Vite or CRA)
* Tailwind + Material UI
* Axios
* Framer Motion

### **Backend**

* Django 5
* Django REST Framework
* SimpleJWT (cookie-based)
* Django Filters
* Pillow
* Razorpay (optional for real payments)

---

# 📁 **Project Structure**

```
project-root/
│
├── backend/
│   ├── project/            # Django main project
│   ├── base/               # Auth + core models
│   ├── app/                # Events, booking, cart logic
│   ├── media/              # Uploaded files
│   ├── requirements.txt
│   └── manage.py
│
└── frontend/
    └── src/                # React application
```

---

# 🛠 **Backend Setup (Django)**

### **1️⃣ Navigate to the backend folder**

```sh
cd backend
```

---

### **2️⃣ Create a virtual environment**

```
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

---

### **3️⃣ Install backend dependencies**

```
pip install -r requirements.txt
```

---

### **4️⃣ Apply migrations**

```
python manage.py migrate
```

---

### **5️⃣ Create a superuser**

```
python manage.py createsuperuser
```

---

### **6️⃣ Run the development server**

```
python manage.py runserver
```

The backend now runs at:

👉 [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

# 🔧 **Environment Variables**

Create a `.env` file inside **backend/project/**:

```
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

(Optional if not integrating payments yet — defaults exist in settings.)

---

# 🎨 **Frontend Setup (React)**

### **1️⃣ Navigate to the frontend folder**

```
cd frontend
```

---

### **2️⃣ Install dependencies**

```
npm install
```

---

### **3️⃣ Run the frontend**

```
npm start
```

The frontend now runs at:

👉 [http://localhost:3000/](http://localhost:3000/)

---

# 🔐 **Authentication (Cookie-based JWT)**

Your backend uses:

* Access token stored in `access_token` HttpOnly cookie
* Refresh token stored in `refresh_token` cookie
* Requests automatically authenticate via cookies
* Axios instance must have:

```js
withCredentials: true
```

No need to manually attach JWT tokens!

---

# 🗄 **API Endpoints Overview**

### **Events**

```
GET    /events/browse/
GET    /events/{id}/
```

### **Cart**

```
GET    /cart/
POST   /cartitems/
PATCH  /cartitems/{id}/
DELETE /cartitems/{id}/
```

### **Bookings**

```
POST   /bookings/place/
GET    /bookings/
GET    /booked-events/{id}/
```

### **Parent Events / Slots / Details / Constraints**

```
GET    /parent-events/
GET    /event-slots/?event_id={id}
POST   /constraints/
...
```

---

# 👨‍💼 **Admin Features**

Admins can manage:

✔ Events
✔ Slots
✔ Participation constraints
✔ Event details
✔ Organisers
✔ Attendance scanning
✔ Booked events dashboard

Through the React admin panel.

---

# 🔄 **Developer Workflow**

### **Backend**

```
# Make changes
python manage.py makemigrations
python manage.py migrate
```

### **Frontend**

```
npm run dev
```

### **Linting / Formatting (optional)**

```
npm run lint
```




# 🧾 **Future Features (Optional Upgrades)**

* Real Razorpay payment flow
* PDF Ticket download
* QR-based check-in system
* Event analytics dashboard
* Referral system

---

# 🎉 **All Set!**

Your full-stack event management system is ready to run locally.


