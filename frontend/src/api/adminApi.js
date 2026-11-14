// src/api/adminApi.js
import {
  MOCK_ADMIN_USERS,
  MOCK_ADMIN_STATS,
  MOCK_EXAMS,
} from './mockData';
import { useAuthStore } from '../store/authStore';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const USERS_KEY = 'examiq_admin_users';

function delay(ms = 600) {
  return new Promise((r) => setTimeout(r, ms));
}

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      return headers;
    }
    const raw = localStorage.getItem('examiq-auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      const storageToken = parsed?.state?.accessToken;
      if (storageToken) {
        headers['Authorization'] = `Bearer ${storageToken}`;
      }
    }
  } catch (_) {}
  return headers;
}

function loadUsers() {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_ADMIN_USERS));
  return [...MOCK_ADMIN_USERS];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function getUsers({ search = '', role = '', status = '', page = 1, pageSize = 10 } = {}) {
  if (USE_MOCK) {
    await delay();
    let users = loadUsers();
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (role) users = users.filter((u) => u.role === role);
    if (status) users = users.filter((u) => u.status === status);

    const total = users.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const data = users.slice((page - 1) * pageSize, page * pageSize);
    return { data, total, totalPages };
  }
  const params = new URLSearchParams({ search, role, status, page, pageSize });
  const res = await fetch(`${BASE_URL}/api/admin/users?${params}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    let msg = 'Failed to fetch users';
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  const json = await res.json();
  const rawList = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : (json.data?.content || []));
  let filtered = [...rawList];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (u) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    );
  }
  if (role) filtered = filtered.filter((u) => u.role === role);
  if (status) {
    filtered = filtered.filter((u) => {
      const userStatus = u.status || (u.active ? 'ACTIVE' : 'INACTIVE');
      return userStatus === status;
    });
  }
  const total = json.total ?? filtered.length;
  const totalPages = json.totalPages ?? Math.max(1, Math.ceil(total / pageSize));
  const data = json.total != null ? rawList : filtered.slice((page - 1) * pageSize, page * pageSize);
  return { data, total, totalPages };
}

export async function createUser({ name, email, role }) {
  if (USE_MOCK) {
    await delay();
    const users = loadUsers();
    if (users.find((u) => u.email === email)) throw new Error('Email already exists');
    const id = `usr_${Date.now()}`;
    const user = {
      id,
      name,
      email,
      role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };
    users.push(user);
    saveUsers(users);
    return user;
  }
  const res = await fetch(`${BASE_URL}/api/admin/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, email, role }),
  });
  if (!res.ok) {
    let msg = 'Failed to create user';
    try {
      const err = await res.json();
      if (err.fieldErrors && err.fieldErrors.length > 0) {
        msg = err.fieldErrors.map((f) => f.message).join(', ');
      } else {
        msg = err.message || err.error || msg;
      }
    } catch (_) {}
    throw new Error(msg);
  }
  const data = await res.json();
  return data.data || data;
}

export async function updateUserRole(userId, role) {
  if (USE_MOCK) {
    await delay();
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    users[idx] = { ...users[idx], role };
    saveUsers(users);
    return users[idx];
  }
  const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    let msg = 'Failed to update role';
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  const data = await res.json();
  return data.data || data;
}

export async function setUserStatus(userId, status) {
  if (USE_MOCK) {
    await delay();
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    users[idx] = { ...users[idx], status };
    saveUsers(users);
    return users[idx];
  }
  const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    let msg = 'Failed to update status';
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  const data = await res.json();
  return data.data || data;
}

export async function deleteUser(userId) {
  if (USE_MOCK) {
    await delay();
    const users = loadUsers().filter((u) => u.id !== userId);
    saveUsers(users);
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    let msg = 'Failed to delete user';
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

// ── Exams ────────────────────────────────────────────────────────────────────

export async function getAdminExams({ search = '', status = '', page = 1, pageSize = 10 } = {}) {
  if (USE_MOCK) {
    await delay();
    let exams = [...MOCK_EXAMS];
    if (search) {
      const q = search.toLowerCase();
      exams = exams.filter(
        (e) => e.title.toLowerCase().includes(q) || (e.teacherName || '').toLowerCase().includes(q)
      );
    }
    // compute status
    const now = new Date();
    exams = exams.map((e) => {
      const start = new Date(e.startTime);
      const end = new Date(e.endTime);
      let computedStatus = 'UPCOMING';
      if (now >= start && now <= end) computedStatus = 'LIVE';
      else if (now > end) computedStatus = 'COMPLETED';
      return { ...e, computedStatus };
    });
    if (status) exams = exams.filter((e) => e.computedStatus === status);
    const total = exams.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return { data: exams.slice((page - 1) * pageSize, page * pageSize), total, totalPages };
  }
  const params = new URLSearchParams({ search, status, page, pageSize });
  const res = await fetch(`${BASE_URL}/api/admin/exams?${params}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    let msg = 'Failed to fetch exams';
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  const json = await res.json();
  const rawList = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
  const total = json.total ?? rawList.length;
  const totalPages = json.totalPages ?? Math.max(1, Math.ceil(total / pageSize));
  return { data: rawList, total, totalPages };
}

export async function deleteAdminExam(examId) {
  if (USE_MOCK) {
    await delay();
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/api/admin/exams/${examId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    let msg = 'Failed to delete exam';
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

// ── Stats ────────────────────────────────────────────────────────────────────

export async function getAdminStats() {
  if (USE_MOCK) {
    await delay();
    return MOCK_ADMIN_STATS;
  }
  const res = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    let msg = 'Failed to fetch admin stats';
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  const data = await res.json();
  return data.data || data;
}
