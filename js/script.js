const API_URL = 'https://script.google.com/macros/s/AKfycbwaBZdPJZuhL9KelbPiNPs6S-3CLpiDs63YQesXWvdUU-qLRc4YxojxxTMBj3Yqc80B/exec';
const LINKS = {
  schedule: 'https://play.google.com/store/apps/details?id=com.ici.mysched',
  notion: 'https://app.notion.com/p/BSEE-1B-Lounge-124d2c5d826580c396b1e403ff4aa56b',
  facebook: 'https://www.facebook.com/profile.php?id=61592519789686'
};
const SCHEDULE_APP_PACKAGE = 'com.ici.mysched';
const SCHEDULE_ROOM_CODE = 'NFKN';
const scheduleDialog = document.getElementById('scheduleDialog');
const scheduleRoomCodeEl = document.getElementById('scheduleRoomCode');
const scheduleDownloadLink = document.getElementById('scheduleDownloadLink');
const accessGate = document.getElementById('accessGate');
const accessForm = document.getElementById('accessForm');
const accessStudentId = document.getElementById('accessStudentId');
const gateMessage = document.getElementById('gateMessage');
const profileName = document.getElementById('profileName');
const profileNameDetail = document.getElementById('profileNameDetail');
const profileStudentId = document.getElementById('profileStudentId');
const profileStudentNo = document.getElementById('profileStudentNo');

accessForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const studentId = accessStudentId.value.trim().toUpperCase();
  if (!/^TUPM-26-\d{4}$/.test(studentId)) {
    gateMessage.textContent = 'Enter a valid ID in the format TUPM-26-XXXX.';
    accessStudentId.focus();
    return;
  }
  const submitButton = accessForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  gateMessage.className = 'gate-message loading';
  gateMessage.textContent = 'Verifying your student access...';
  try {
    const response = await fetch(`${API_URL}?studentId=${encodeURIComponent(studentId)}`);
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    if (!data.success || !data.student) throw new Error('Student not found');
    profileName.textContent = `Welcome, ${data.student.name}`;
    profileNameDetail.textContent = data.student.name;
    profileStudentId.textContent = data.student.studentId;
    profileStudentNo.textContent = data.student.studentNo || data.student.studentNumber || data.student.no || data.student['No.'] || 'Not available';
    gateMessage.textContent = `Welcome, ${data.student.name}. Loading your portal...`;
    const welcome = document.createElement('div');
    welcome.className = 'welcome-strip';
    welcome.innerHTML = 'ACCESS GRANTED / <strong>Welcome, ' + data.student.name + '</strong><small> ' + data.student.studentId + '</small>';
    document.body.appendChild(welcome);
    document.querySelector('header').classList.add('portal-reveal');
    document.querySelector('main').classList.add('portal-reveal');
    document.querySelector('footer').classList.add('portal-reveal');
    document.body.classList.remove('gate-locked');
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    accessGate.classList.add('leaving');
    window.setTimeout(() => { accessGate.remove(); window.setTimeout(() => welcome.remove(), 4200); }, 800);
  } catch (error) {
    gateMessage.className = 'gate-message';
    gateMessage.textContent = error.message === 'Student not found' ? 'Student ID not found. Check your ID and try again.' : 'The student database could not be reached. Please try again.';
  } finally {
    submitButton.disabled = false;
  }
});

function openConfiguredLink(key, event) {
  event.preventDefault();
  if (key === 'schedule') {
    openScheduleDialog();
    return;
  }
  if (!LINKS[key] || LINKS[key].startsWith('YOUR_')) {
    window.alert(`The ${key} link has not been configured yet.`);
    return;
  }
  window.open(LINKS[key], '_blank', 'noopener,noreferrer');
}

function openScheduleDialog() {
  if (scheduleRoomCodeEl) {
    scheduleRoomCodeEl.textContent = SCHEDULE_ROOM_CODE;
  }
  if (scheduleDownloadLink) {
    scheduleDownloadLink.href = LINKS.schedule;
    scheduleDownloadLink.setAttribute('target', '_blank');
    scheduleDownloadLink.setAttribute('rel', 'noopener noreferrer');
  }
  scheduleDialog.classList.remove('hidden');
}

function closeScheduleDialog() {
  scheduleDialog.classList.add('hidden');
}

function launchScheduleApp() {
  const isAndroid = /Android/i.test(navigator.userAgent);
  if (!isAndroid) {
    window.open(LINKS.schedule, '_blank', 'noopener,noreferrer');
    return;
  }

  const appIntent = `intent://#Intent;package=${SCHEDULE_APP_PACKAGE};scheme=mysched;end`;
  window.location.assign(appIntent);
  closeScheduleDialog();
  window.setTimeout(() => {
    if (document.hasFocus()) {
      window.open(LINKS.schedule, '_blank', 'noopener,noreferrer');
    }
  }, 1200);
}

document.querySelectorAll('[data-link]').forEach((link) => link.addEventListener('click', (event) => openConfiguredLink(link.dataset.link, event)));
document.getElementById('closeScheduleDialog').addEventListener('click', closeScheduleDialog);
scheduleDialog.addEventListener('click', (event) => { if (event.target === scheduleDialog) closeScheduleDialog(); });
document.getElementById('openScheduleApp').addEventListener('click', launchScheduleApp);
document.getElementById('openScheduleWeb').addEventListener('click', () => {
  closeScheduleDialog();
  if (!LINKS.schedule || LINKS.schedule.startsWith('YOUR_')) {
    window.alert('The web schedule link has not been configured yet.');
    return;
  }
  window.open(LINKS.schedule, '_blank', 'noopener,noreferrer');
});
document.getElementById('menuToggle').addEventListener('click', () => {
  const nav = document.getElementById('navLinks');
  const isOpen = nav.classList.toggle('open');
  document.getElementById('menuToggle').setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('#navLinks a').forEach((link) => link.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open')));

