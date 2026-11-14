// src/api/certificateApi.js
import {
  MOCK_CERTIFICATES,
  MOCK_INVALID_CERT_IDS,
} from './mockData';
import { useAuthStore } from '../store/authStore';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const STORAGE_KEY = 'examiq_certificates';

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

function loadCerts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CERTIFICATES));
  return [...MOCK_CERTIFICATES];
}

function saveCerts(certs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
}

export async function getMyCertificates(userId) {
  if (USE_MOCK) {
    await delay();
    return loadCerts().filter((c) => c.studentId === userId);
  }
  const res = await fetch(`${BASE_URL}/api/certificates?studentId=${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch certificates');
  const json = await res.json();
  const list = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
  return list;
}

export async function getCertificate(certId) {
  if (USE_MOCK) {
    await delay();
    return loadCerts().find((c) => c.id === certId) || null;
  }
  const res = await fetch(`${BASE_URL}/api/certificates/${certId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data || json;
}

export async function verifyCertificate(certId) {
  if (USE_MOCK) {
    await delay();
    if (MOCK_INVALID_CERT_IDS.includes(certId)) return null;
    return loadCerts().find((c) => c.id === certId) || null;
  }
  const res = await fetch(`${BASE_URL}/api/certificates/verify/${certId}`);
  if (!res.ok) return null;
  const json = await res.json();
  if (json && json.success && json.data) {
    return json.data;
  }
  if (json && json.studentName) {
    return json;
  }
  return null;
}

export async function generateCertificate({
  studentId,
  studentName,
  examId,
  examTitle,
  subject,
  score,
  totalMarks,
  percentage,
  grade,
  attemptId,
}) {
  if (USE_MOCK) {
    await delay();
    const existing = loadCerts().find((c) => c.attemptId === attemptId);
    if (existing) return existing;
    const id = `EXQ-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const cert = {
      id,
      studentId,
      studentName,
      examId,
      examTitle,
      subject: subject || 'General',
      score,
      totalMarks,
      percentage,
      grade: grade || (percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : 'B'),
      attemptId,
      issuedAt: new Date().toISOString(),
      isValid: true,
    };
    const certs = loadCerts();
    certs.push(cert);
    saveCerts(certs);
    return cert;
  }
  const res = await fetch(`${BASE_URL}/api/certificates`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ studentId, studentName, examId, examTitle, subject, score, totalMarks, percentage, grade, attemptId }),
  });
  if (!res.ok) throw new Error('Failed to generate certificate');
  const json = await res.json();
  return json.data || json;
}
