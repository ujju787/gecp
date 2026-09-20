// Central API Client for GEC Palamu Frontend
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Token storage helpers
export const getAuthToken = () => localStorage.getItem('gecp_auth_token');
export const setAuthToken = (token) => localStorage.setItem('gecp_auth_token', token);
export const removeAuthToken = () => localStorage.removeItem('gecp_auth_token');

export const getStoredAuthUser = () => {
  try {
    const raw = localStorage.getItem('gecp_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredAuthUser = (user) => {
  localStorage.setItem('gecp_auth_user', JSON.stringify(user));
};

export const removeStoredAuthUser = () => {
  localStorage.removeItem('gecp_auth_user');
};

const getHeaders = (hasBody = true) => {
  const headers = {};
  if (hasBody) headers['Content-Type'] = 'application/json';
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  // 1. Auth & Approvals
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  register: async (formData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(false)
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  getPendingStudents: async () => {
    const res = await fetch(`${API_BASE}/admin/pending-students`, {
      headers: getHeaders(false)
    });
    return res.json();
  },

  approveStudent: async (studentId) => {
    const res = await fetch(`${API_BASE}/admin/approve-student/${studentId}`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  rejectStudent: async (studentId, reason) => {
    const res = await fetch(`${API_BASE}/admin/reject-student/${studentId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  getApprovedStudents: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const url = `${API_BASE}/students/approved${q ? `?${q}` : ''}`;
    const res = await fetch(url, { headers: getHeaders(false) });
    return res.json();
  },

  getAllStudents: async () => {
    const res = await fetch(`${API_BASE}/students/all`, { headers: getHeaders(false) });
    return res.json();
  },

  resetAllStudents: async () => {
    const res = await fetch(`${API_BASE}/admin/reset-students`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  promoteStudentSemester: async (studentIdOrRoll, payload) => {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentIdOrRoll)}/semester`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // 2. Smart QR Attendance (IIT / NIT Model)
  scanAttendanceQR: async (qrData, subjectCode, subjectName) => {
    const res = await fetch(`${API_BASE}/attendance/scan-qr`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ qrData, subjectCode, subjectName })
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getAttendanceLogs: async (params) => {
    let url = `${API_BASE}/attendance/logs`;
    if (typeof params === 'string') {
      url += `?subjectCode=${encodeURIComponent(params)}`;
    } else if (params && typeof params === 'object') {
      const q = new URLSearchParams();
      if (params.subjectCode) q.append('subjectCode', params.subjectCode);
      if (params.studentId) q.append('studentId', params.studentId);
      if (params.rollNo) q.append('rollNo', params.rollNo);
      if (params.date) q.append('date', params.date);
      const qs = q.toString();
      if (qs) url += `?${qs}`;
    }
    const res = await fetch(url, { headers: getHeaders(false) });
    return res.json();
  },

  markSessionAttendance: async (sessionData) => {
    const res = await fetch(`${API_BASE}/attendance/mark-session`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sessionData)
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getStudentAttendance: async (studentIdOrRoll) => {
    try {
      const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentIdOrRoll)}/attendance`, {
        headers: getHeaders(false)
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  resetAttendance: async () => {
    const res = await fetch(`${API_BASE}/attendance/reset`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  // 2.1. Fee Payment & Digital Challan Gateway
  processPayment: async (paymentData) => {
    const res = await fetch(`${API_BASE}/payment/process`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData)
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  verifyReceipt: async (receiptId) => {
    const res = await fetch(`${API_BASE}/payment/receipt/${encodeURIComponent(receiptId)}`, {
      headers: getHeaders(false)
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getStudentPaymentHistory: async (studentId) => {
    const res = await fetch(`${API_BASE}/payment/history/${encodeURIComponent(studentId)}`, {
      headers: getHeaders(false)
    });
    return res.json();
  },

  getStudentFeeDues: async (studentIdOrRoll) => {
    try {
      const res = await fetch(`${API_BASE}/payment/dues/${encodeURIComponent(studentIdOrRoll)}`, {
        headers: getHeaders(false)
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  getAllTransactions: async () => {
    const res = await fetch(`${API_BASE}/payment/all-transactions`, {
      headers: getHeaders(false)
    });
    return res.json();
  },

  generatePythonQR: async (data, options = {}) => {
    const res = await fetch(`${API_BASE}/qr/python`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ data, ...options })
    });
    const result = await res.json();
    if (!res.ok) throw result;
    if (result && result.qrBase64 && !result.qrBase64.startsWith('data:')) {
      result.qrBase64 = `data:image/png;base64,${result.qrBase64}`;
    }
    return result;
  },

  // 3. Digital Library
  getLibraryResources: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.branch && params.branch !== 'All') query.append('branch', params.branch);
    if (params.semester && params.semester !== 'All') query.append('semester', params.semester);
    if (params.category && params.category !== 'All Categories') query.append('category', params.category);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/library/resources?${query.toString()}`, {
      headers: getHeaders(false)
    });
    return res.json();
  },

  uploadLibraryResource: async (resourceData) => {
    const res = await fetch(`${API_BASE}/library/upload`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(resourceData)
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  downloadLibraryResource: async (id) => {
    const res = await fetch(`${API_BASE}/library/download/${id}`, {
      method: 'POST',
      headers: getHeaders(false)
    });
    return res.json();
  },

  deleteLibraryResource: async (id) => {
    const res = await fetch(`${API_BASE}/library/resources/${id}`, {
      method: 'DELETE',
      headers: getHeaders(false)
    });
    return res.json();
  },

  // 4. Live Streaming AI Chatbot (Like ChatGPT)
  streamChat: async (query, apiKey, onChunk, onDone, onError) => {
    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery: query, apiKey })
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); // keep partial

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              if (onDone) onDone();
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk && onChunk) {
                onChunk(parsed.chunk);
              }
            } catch (e) {
              // Ignore non-json lines
            }
          }
        }
      }

      if (onDone) onDone();
    } catch (err) {
      if (onError) onError(err);
    }
  },

  // 6. Teacher Broadcasts & Classroom Notices
  getBroadcasts: async () => {
    try {
      const res = await fetch(`${API_BASE}/broadcasts`, { headers: getHeaders(false) });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  postBroadcast: async (broadcastData) => {
    const res = await fetch(`${API_BASE}/broadcasts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(broadcastData)
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // 7. Dynamic Student Registry
  getApprovedStudents: async (branch, semester) => {
    try {
      const q = new URLSearchParams();
      if (branch) q.append('branch', branch);
      if (semester) q.append('semester', semester);
      const res = await fetch(`${API_BASE}/students/approved?${q.toString()}`, {
        headers: getHeaders(false)
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.students || []);
      return { success: true, count: list.length, students: list };
    } catch {
      return { success: false, count: 0, students: [] };
    }
  },

  getAllStudents: async () => {
    try {
      const res = await fetch(`${API_BASE}/students/all`, {
        headers: getHeaders(false)
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.students || []);
      return { success: true, count: list.length, students: list };
    } catch {
      return { success: false, count: 0, students: [] };
    }
  },

  resetAllStudents: async () => {
    const res = await fetch(`${API_BASE}/admin/reset-students`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  // 8. Profile Details & Internal Grades Management
  updateStudentProfile: async (profileData) => {
    const res = await fetch(`${API_BASE}/students/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  saveStudentGrades: async (grades) => {
    const res = await fetch(`${API_BASE}/students/grades`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ grades })
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getStudentGrades: async (studentIdOrRoll) => {
    try {
      const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentIdOrRoll)}/grades`, {
        headers: getHeaders(false)
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  getSubjectGrades: async (subjectCode) => {
    try {
      const res = await fetch(`${API_BASE}/grades/subject/${encodeURIComponent(subjectCode)}`, {
        headers: getHeaders(false)
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  getSubjectAttendance: async (subjectCode) => {
    try {
      const res = await fetch(`${API_BASE}/attendance/subject/${encodeURIComponent(subjectCode)}`, {
        headers: getHeaders(false)
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  // --- Events & Registrations ---
  getEvents: async () => {
    try {
      const res = await fetch(`${API_BASE}/events`, {
        headers: getHeaders(false)
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  createEvent: async (eventData) => {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(eventData)
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  deleteEvent: async (eventId) => {
    const res = await fetch(`${API_BASE}/events/${encodeURIComponent(eventId)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  registerForEvent: async (registrationData) => {
    const res = await fetch(`${API_BASE}/events/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(registrationData)
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getEventRegistrations: async (eventId) => {
    try {
      const url = eventId ? `${API_BASE}/events/${encodeURIComponent(eventId)}/registrations` : `${API_BASE}/events/registrations`;
      const res = await fetch(url, {
        headers: getHeaders(false)
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  getMyEventRegistrations: async (studentIdOrRoll) => {
    try {
      const res = await fetch(`${API_BASE}/events/my-registrations/${encodeURIComponent(studentIdOrRoll)}`, {
        headers: getHeaders(false)
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  // --- Faculty & Department Direct Database Sync ---
  getFaculty: async (params = {}) => {
    try {
      const q = new URLSearchParams(params).toString();
      const url = `${API_BASE}/faculty${q ? `?${q}` : ''}`;
      const res = await fetch(url, { headers: getHeaders(false) });
      if (!res.ok) return { success: false, faculty: [] };
      return res.json();
    } catch {
      return { success: false, faculty: [] };
    }
  },

  getHods: async () => {
    try {
      const res = await fetch(`${API_BASE}/faculty/hods`, { headers: getHeaders(false) });
      if (!res.ok) return { success: false, hods: [] };
      return res.json();
    } catch {
      return { success: false, hods: [] };
    }
  },

  getFacultyById: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/faculty/${encodeURIComponent(id)}`, { headers: getHeaders(false) });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  createFaculty: async (facultyData) => {
    const res = await fetch(`${API_BASE}/faculty`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(facultyData)
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  updateFaculty: async (id, facultyData) => {
    const res = await fetch(`${API_BASE}/faculty/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(facultyData)
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  deleteFaculty: async (id) => {
    const res = await fetch(`${API_BASE}/faculty/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getDepartmentsWithFaculty: async () => {
    try {
      const res = await fetch(`${API_BASE}/departments`, { headers: getHeaders(false) });
      if (!res.ok) return { success: false, departments: [] };
      return res.json();
    } catch {
      return { success: false, departments: [] };
    }
  }
};
