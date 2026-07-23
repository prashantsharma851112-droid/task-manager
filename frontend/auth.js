const API_URL = 'https://taskmanagerfr.netlify.app/auth.js';

// If already logged in, skip straight to the app
if (localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const subtabEmail = document.getElementById('subtab-email');
const subtabPhone = document.getElementById('subtab-phone');

const loginEmailForm = document.getElementById('login-email-form');
const loginPhoneForm = document.getElementById('login-phone-form');
const loginOtpForm = document.getElementById('login-otp-form');
const loginChangeNumber = document.getElementById('login-change-number');

const registerEmailForm = document.getElementById('register-email-form');
const registerPhoneForm = document.getElementById('register-phone-form');
const registerOtpForm = document.getElementById('register-otp-form');
const registerChangeNumber = document.getElementById('register-change-number');

const authError = document.getElementById('auth-error');
const authInfo = document.getElementById('auth-info');

const allForms = [loginEmailForm, loginPhoneForm, loginOtpForm, registerEmailForm, registerPhoneForm, registerOtpForm];

// mode: 'login' or 'register' ; method: 'email' or 'phone'
let currentMode = 'login';
let currentMethod = 'email';

function clearMessages() {
  authError.textContent = '';
  authInfo.textContent = '';
}

function render() {
  allForms.forEach(f => f.classList.add('hidden'));
  clearMessages();

  tabLogin.classList.toggle('active', currentMode === 'login');
  tabRegister.classList.toggle('active', currentMode === 'register');
  subtabEmail.classList.toggle('active', currentMethod === 'email');
  subtabPhone.classList.toggle('active', currentMethod === 'phone');

  if (currentMode === 'login' && currentMethod === 'email') loginEmailForm.classList.remove('hidden');
  if (currentMode === 'login' && currentMethod === 'phone') loginPhoneForm.classList.remove('hidden');
  if (currentMode === 'register' && currentMethod === 'email') registerEmailForm.classList.remove('hidden');
  if (currentMode === 'register' && currentMethod === 'phone') registerPhoneForm.classList.remove('hidden');
}

tabLogin.addEventListener('click', () => { currentMode = 'login'; render(); });
tabRegister.addEventListener('click', () => { currentMode = 'register'; render(); });
subtabEmail.addEventListener('click', () => { currentMethod = 'email'; render(); });
subtabPhone.addEventListener('click', () => { currentMethod = 'phone'; render(); });

loginChangeNumber.addEventListener('click', () => {
  loginOtpForm.classList.add('hidden');
  loginPhoneForm.classList.remove('hidden');
  clearMessages();
});
registerChangeNumber.addEventListener('click', () => {
  registerOtpForm.classList.add('hidden');
  registerPhoneForm.classList.remove('hidden');
  clearMessages();
});

function loginSuccess(data) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('userName', data.user.name);
  window.location.href = 'index.html';
}

// ---------- EMAIL LOGIN ----------
loginEmailForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      authError.textContent = data.error || 'Login failed';
      return;
    }
    loginSuccess(data);
  } catch (err) {
    authError.textContent = 'Could not reach the server. Is the backend running?';
  }
});

// ---------- EMAIL REGISTER ----------
registerEmailForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const name = document.getElementById('register-name-email').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      authError.textContent = data.error || 'Registration failed';
      return;
    }
    loginSuccess(data);
  } catch (err) {
    authError.textContent = 'Could not reach the server. Is the backend running?';
  }
});

// ---------- PHONE LOGIN ----------
let loginPhone = '';

loginPhoneForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const phone = document.getElementById('login-phone').value.trim();
  if (!/^[6-9]\d{9}$/.test(phone)) {
    authError.textContent = 'Enter a valid 10-digit mobile number';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, purpose: 'login' })
    });
    const data = await res.json();

    if (!res.ok) {
      authError.textContent = data.error || 'Could not send OTP';
      return;
    }

    loginPhone = phone;
    authInfo.textContent = `Demo mode: your OTP is ${data.demoOtp} (in production this would arrive by SMS)`;
    loginPhoneForm.classList.add('hidden');
    loginOtpForm.classList.remove('hidden');
  } catch (err) {
    authError.textContent = 'Could not reach the server. Is the backend running?';
  }
});

loginOtpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const otp = document.getElementById('login-otp-code').value.trim();

  try {
    const res = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: loginPhone, otp, purpose: 'login' })
    });
    const data = await res.json();

    if (!res.ok) {
      authError.textContent = data.error || 'OTP verification failed';
      return;
    }
    loginSuccess(data);
  } catch (err) {
    authError.textContent = 'Could not reach the server. Is the backend running?';
  }
});

// ---------- PHONE REGISTER ----------
let registerPhone = '';
let registerName = '';

registerPhoneForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const name = document.getElementById('register-name-phone').value.trim();
  const phone = document.getElementById('register-phone').value.trim();

  if (!/^[6-9]\d{9}$/.test(phone)) {
    authError.textContent = 'Enter a valid 10-digit mobile number';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, purpose: 'register' })
    });
    const data = await res.json();

    if (!res.ok) {
      authError.textContent = data.error || 'Could not send OTP';
      return;
    }

    registerPhone = phone;
    registerName = name;
    authInfo.textContent = `Demo mode: your OTP is ${data.demoOtp} (in production this would arrive by SMS)`;
    registerPhoneForm.classList.add('hidden');
    registerOtpForm.classList.remove('hidden');
  } catch (err) {
    authError.textContent = 'Could not reach the server. Is the backend running?';
  }
});

registerOtpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const otp = document.getElementById('register-otp-code').value.trim();

  try {
    const res = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: registerPhone, otp, purpose: 'register', name: registerName })
    });
    const data = await res.json();

    if (!res.ok) {
      authError.textContent = data.error || 'OTP verification failed';
      return;
    }
    loginSuccess(data);
  } catch (err) {
    authError.textContent = 'Could not reach the server. Is the backend running?';
  }
});

render();
