// Fetch every page: /attendance/me defaults to just ten daily records.
export async function loadPunchHistory(client) {
  const records = [];
  for (let page = 1; ; page += 1) {
    const response = await client.get(`/attendance/me?page=${page}&limit=100`);
    if (!response || response.success === false) {
      throw new Error(response?.message || 'Unable to load punch records');
    }
    const payload = response.data?.data ? response.data : response;
    const rows = payload.data;
    if (!Array.isArray(rows)) throw new Error('Invalid punch history response');
    records.push(...rows);
    if (!payload.meta || records.length >= payload.meta.total) return records;
    if (rows.length === 0) throw new Error('Incomplete punch history response');
  }
}

const attendanceDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
};

export function filterPunchHistory(records, period, now = new Date()) {
  const today = attendanceDate(now);
  return records.filter(record => {
    if (period === 'all') return true;
    const date = attendanceDate(record.attendanceDate || record.punchInAt || record.date || record.timestamp);
    if (!date) return false;
    if (period === 'monthly') return date.slice(0, 7) === today.slice(0, 7);
    if (period === 'yearly') return date.slice(0, 4) === today.slice(0, 4);
    return date === today;
  });
}

export function countPunches(records) {
  const punchIns = records.filter(record => record.punchInAt).length;
  const punchOuts = records.filter(record => record.punchOutAt).length;
  return { total: punchIns + punchOuts, punchIns, punchOuts };
}
