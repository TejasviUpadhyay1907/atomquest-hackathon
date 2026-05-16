# ⚡ QUICK TEST - 2 MINUTES TO WORKING APP!

## 🚀 DO THIS NOW:

### **Step 1: Restart Everything (1 minute)**

**Terminal 1 - Backend:**
```bash
cd C:\Users\tejas\OneDrive\Desktop\ATOMQUEST\goal-tracking-portal\backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd C:\Users\tejas\OneDrive\Desktop\ATOMQUEST\goal-tracking-portal\frontend  
npm run dev
```

---

### **Step 2: Clear Browser & Test (1 minute)**

1. **Open:** http://localhost:3000
2. **Press:** `Ctrl+Shift+Delete`
3. **Clear:** "Cookies" and "Cached images"
4. **Click:** "Clear data"
5. **Refresh:** F5

---

### **Step 3: Login**

**Use these credentials:**
- Email: `emp1@demo.com`
- Password: `password123`

**Click "Sign In"**

---

## ✅ IT SHOULD WORK NOW!

**What I fixed:**
1. ✅ Token is now set in axios headers immediately after login
2. ✅ Added initialization check to prevent race conditions
3. ✅ Added small delay before navigation
4. ✅ Improved error handling
5. ✅ Fixed logout to clear axios headers

---

## 🎯 IF IT WORKS:

**You'll see:**
- ✅ "Welcome back, Alice Engineer!" message
- ✅ Dashboard with sidebar
- ✅ "My Goals" page
- ✅ No immediate logout!

---

## 🔧 IF STILL NOT WORKING:

**Use the console method:**

1. Open http://localhost:3000
2. Press F12
3. Paste this:

```javascript
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'emp1@demo.com', password: 'password123' })
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  window.location.href = '/employee/goals';
});
```

4. Press Enter
5. You'll be logged in!

---

## 🎉 NEXT STEPS:

Once logged in:
1. ✅ Test creating goals
2. ✅ Test AI suggestions
3. ✅ Test all features
4. ✅ Record video demo
5. ✅ Deploy and WIN! 🏆

---

**TRY IT NOW!** 🚀

