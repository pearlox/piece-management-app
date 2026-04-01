# 📊 Piece Management App

A simple and efficient web application to manage **piece entries, company-wise tracking, and reports** with Firebase backend support.

---

## 🚀 Features

### 🔐 Authentication

* Secure login using Firebase Authentication
* Session handling with auto-login/logout

### 📥 Entry Management

* Add **Credit / Debit entries**
* Track:

  * Date
  * Company
  * Ents
  * Gate Pass
  * Party
  * Pieces
  * Weight
* Edit and delete entries with confirmation modal

### 📊 Dashboard

* Company-wise summary cards
* Running balance per company & ents
* Paginated table view
* Quick filtering by company

### 📈 Reports

* Filter by:

  * Company
  * Ents
  * Date range
* Grouped report by **Ents**
* Running balance calculation
* Export report to Excel

### 📤 Export

* Excel export with:

  * Ents
  * Party
  * Date
  * Credit
  * Debit
  * Balance

---

## 🛠️ Tech Stack

* **Frontend:** HTML, CSS, JavaScript, Bootstrap
* **Backend:** Firebase Firestore
* **Authentication:** Firebase Auth
* **Excel Export:** SheetJS (XLSX)

---

## 📁 Project Structure

```
project/
│── index.html        # Main UI layout
│── style.css         # Styling
│── js/
│   ├── app.js        # Main logic
│   ├── ui.js         # UI rendering functions
│   ├── db.js         # Firestore operations
│   ├── firebase.js   # Firebase config
│   ├── auth.js       # Authentication logic
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/piece-management-app.git
cd piece-management-app
```

### 2️⃣ Configure Firebase

Update your Firebase config in:

```js
// firebase.js
const app = initializeApp({
  apiKey: "YOUR_API_KEY",
  projectId: "YOUR_PROJECT_ID",
});
```

### 3️⃣ Enable Firebase Services

* Firestore Database
* Authentication (Email/Password)

### 4️⃣ Run the App

Use Live Server (VS Code) or any static server:

```bash
# Example
npx serve
```

---

## 📌 Key Functionalities

### 🔄 Entry Flow

* Credit → Adds pieces
* Debit → Deducts pieces
* Balance auto-calculated

### 📊 Report Logic

* Data grouped by **Ents**
* Running balance per group
* Filters applied dynamically

---

## 🧠 Important Notes

* Each entry includes a unique `id` from Firestore 
* Firebase is initialized in `firebase.js` 
* UI rendering handled in `ui.js` (pagination, cards, tables) 
* Authentication logic handled in `auth.js` 
* Main app logic and report generation in `app.js` 

---

## 🎨 UI Highlights

* Responsive layout with Bootstrap
* Toast notifications
* Loader overlay
* Animated pagination
* Collapsible company cards
* Dark mode support (CSS ready) 

---

## 🔮 Future Enhancements

* 📅 Advanced date filters UI
* 📱 Mobile app version
* 📊 Charts & analytics dashboard
* 🔔 Notifications
* Multi-user role management

---

## 🤝 Contribution

Feel free to fork and improve the project. Pull requests are welcome!

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Author

Developed by **Kalai** 🚀

---
