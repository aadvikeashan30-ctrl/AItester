// ===== GymPro - Gym Management Software =====
// Data Storage using LocalStorage

// ===== DATA LAYER =====
class DataStore {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('gym_members')) {
            localStorage.setItem('gym_members', JSON.stringify([]));
        }
        if (!localStorage.getItem('gym_plans')) {
            localStorage.setItem('gym_plans', JSON.stringify(this.getDefaultPlans()));
        }
        if (!localStorage.getItem('gym_payments')) {
            localStorage.setItem('gym_payments', JSON.stringify([]));
        }
        if (!localStorage.getItem('gym_attendance')) {
            localStorage.setItem('gym_attendance', JSON.stringify([]));
        }
        if (!localStorage.getItem('gym_trainers')) {
            localStorage.setItem('gym_trainers', JSON.stringify([]));
        }
    }

    getDefaultPlans() {
        return [
            { id: '1', name: 'Basic Monthly', duration: 30, price: 29.99, features: ['Gym floor access', 'Locker room', 'Free WiFi'] },
            { id: '2', name: 'Premium Monthly', duration: 30, price: 49.99, features: ['All Basic features', 'Group classes', 'Sauna access', 'Towel service'] },
            { id: '3', name: 'Annual Basic', duration: 365, price: 299.99, features: ['Gym floor access', 'Locker room', 'Free WiFi', '2 months free'] },
            { id: '4', name: 'Annual Premium', duration: 365, price: 499.99, features: ['All Premium features', 'Personal trainer (2 sessions)', 'Nutrition plan', '2 months free'] }
        ];
    }


    get(key) {
        return JSON.parse(localStorage.getItem(`gym_${key}`)) || [];
    }

    set(key, data) {
        localStorage.setItem(`gym_${key}`, JSON.stringify(data));
    }

    add(key, item) {
        const data = this.get(key);
        item.id = Date.now().toString();
        data.push(item);
        this.set(key, data);
        return item;
    }

    update(key, id, updates) {
        const data = this.get(key);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            this.set(key, data);
            return data[index];
        }
        return null;
    }

    delete(key, id) {
        const data = this.get(key);
        const filtered = data.filter(item => item.id !== id);
        this.set(key, filtered);
    }

    find(key, id) {
        const data = this.get(key);
        return data.find(item => item.id === id);
    }
}

const store = new DataStore();


// ===== NAVIGATION =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    setupNavigation();
    updateDashboard();
    setTodayDate();
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const page = item.dataset.page;
            showPage(page);
        });
    });
}

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageName}`).classList.add('active');

    switch(pageName) {
        case 'dashboard': updateDashboard(); break;
        case 'members': renderMembers(); break;
        case 'subscriptions': renderPlans(); break;
        case 'payments': renderPayments(); break;
        case 'attendance': renderAttendance(); break;
        case 'trainers': renderTrainers(); break;
        case 'reports': generateReports(); break;
    }
}

function setTodayDate() {
    const today = new Date();
    document.getElementById('todayDate').textContent = today.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}


// ===== DASHBOARD =====
function updateDashboard() {
    const members = store.get('members');
    const payments = store.get('payments');
    const attendance = store.get('attendance');
    const trainers = store.get('trainers');

    const today = new Date().toISOString().split('T')[0];
    const activeMembers = members.filter(m => getMemberStatus(m) === 'active');
    const todayCheckins = attendance.filter(a => a.date === today);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthPayments = payments.filter(p => p.date >= monthStart && p.status === 'paid');
    const monthRevenue = monthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const overduePayments = payments.filter(p => p.status === 'overdue').length;

    document.getElementById('totalMembers').textContent = members.length;
    document.getElementById('activeMembers').textContent = activeMembers.length;
    document.getElementById('monthRevenue').textContent = `$${monthRevenue.toFixed(2)}`;
    document.getElementById('overduePayments').textContent = overduePayments;
    document.getElementById('todayCheckins').textContent = todayCheckins.length;
    document.getElementById('totalTrainers').textContent = trainers.length;

    // Recent members
    const recent = [...members].sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate)).slice(0, 5);
    document.getElementById('recentMembers').innerHTML = recent.length ? recent.map(m =>
        `<div class="list-item"><span>${m.name}</span><span class="badge badge-${getMemberStatus(m)}">${getMemberStatus(m)}</span></div>`
    ).join('') : '<div class="empty-state"><p>No members yet</p></div>';

    // Expiring soon
    const expiring = members.filter(m => {
        const exp = getExpiryDate(m);
        const diff = (new Date(exp) - now) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 7;
    }).slice(0, 5);
    document.getElementById('expiringSoon').innerHTML = expiring.length ? expiring.map(m =>
        `<div class="list-item"><span>${m.name}</span><span style="color:var(--danger);font-size:0.8rem">${getExpiryDate(m)}</span></div>`
    ).join('') : '<div class="empty-state"><p>No expiring memberships</p></div>';

    // Today's attendance
    document.getElementById('todayAttendance').innerHTML = todayCheckins.length ? todayCheckins.map(a => {
        const member = store.find('members', a.memberId);
        return `<div class="list-item"><span>${member ? member.name : 'Unknown'}</span><span style="font-size:0.8rem">${a.checkIn}</span></div>`;
    }).join('') : '<div class="empty-state"><p>No check-ins today</p></div>';
}

function getMemberStatus(member) {
    const expiry = getExpiryDate(member);
    if (!expiry) return 'pending';
    return new Date(expiry) >= new Date() ? 'active' : 'expired';
}

function getExpiryDate(member) {
    if (!member.joinDate || !member.planId) return null;
    const plan = store.find('plans', member.planId);
    if (!plan) return null;
    const join = new Date(member.joinDate);
    join.setDate(join.getDate() + plan.duration);
    return join.toISOString().split('T')[0];
}


// ===== MEMBERS MODULE =====
function renderMembers() {
    const members = store.get('members');
    populateMemberDropdowns();
    renderMembersTable(members);
}

function renderMembersTable(members) {
    const tbody = document.getElementById('membersTableBody');
    if (members.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No members found. Click "+ Add Member" to get started.</td></tr>';
        return;
    }
    tbody.innerHTML = members.map(m => {
        const status = getMemberStatus(m);
        const plan = store.find('plans', m.planId);
        return `<tr>
            <td><strong>${m.name}</strong></td>
            <td>${m.email}</td>
            <td>${m.phone}</td>
            <td>${plan ? plan.name : 'N/A'}</td>
            <td><span class="badge badge-${status}">${status}</span></td>
            <td>${m.joinDate || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editMember('${m.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteMember('${m.id}')">Delete</button>
            </td>
        </tr>`;
    }).join('');
}

function filterMembers() {
    const search = document.getElementById('memberSearch').value.toLowerCase();
    const filter = document.getElementById('memberFilter').value;
    let members = store.get('members');

    if (search) {
        members = members.filter(m =>
            m.name.toLowerCase().includes(search) ||
            m.email.toLowerCase().includes(search) ||
            m.phone.includes(search)
        );
    }
    if (filter !== 'all') {
        members = members.filter(m => getMemberStatus(m) === filter);
    }
    renderMembersTable(members);
}

function openMemberModal(id = null) {
    document.getElementById('memberModalTitle').textContent = id ? 'Edit Member' : 'Add Member';
    document.getElementById('memberForm').reset();
    document.getElementById('memberId').value = '';

    // Populate plan dropdown
    const plans = store.get('plans');
    document.getElementById('memberPlan').innerHTML = plans.map(p =>
        `<option value="${p.id}">${p.name} - $${p.price}</option>`
    ).join('');

    // Populate trainer dropdown
    const trainers = store.get('trainers');
    document.getElementById('memberTrainer').innerHTML = '<option value="">No Trainer</option>' +
        trainers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

    if (id) {
        const member = store.find('members', id);
        if (member) {
            document.getElementById('memberId').value = member.id;
            document.getElementById('memberName').value = member.name;
            document.getElementById('memberEmail').value = member.email;
            document.getElementById('memberPhone').value = member.phone;
            document.getElementById('memberDob').value = member.dob || '';
            document.getElementById('memberGender').value = member.gender || 'male';
            document.getElementById('memberPlan').value = member.planId || '';
            document.getElementById('memberTrainer').value = member.trainerId || '';
            document.getElementById('memberEmergency').value = member.emergency || '';
            document.getElementById('memberNotes').value = member.notes || '';
        }
    }

    openModal('memberModal');
}

function editMember(id) { openMemberModal(id); }

function saveMember(e) {
    e.preventDefault();
    const id = document.getElementById('memberId').value;
    const memberData = {
        name: document.getElementById('memberName').value,
        email: document.getElementById('memberEmail').value,
        phone: document.getElementById('memberPhone').value,
        dob: document.getElementById('memberDob').value,
        gender: document.getElementById('memberGender').value,
        planId: document.getElementById('memberPlan').value,
        trainerId: document.getElementById('memberTrainer').value,
        emergency: document.getElementById('memberEmergency').value,
        notes: document.getElementById('memberNotes').value
    };

    if (id) {
        store.update('members', id, memberData);
    } else {
        memberData.joinDate = new Date().toISOString().split('T')[0];
        store.add('members', memberData);
    }

    closeModal('memberModal');
    renderMembers();
    updateDashboard();
}

function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        store.delete('members', id);
        renderMembers();
        updateDashboard();
    }
}


// ===== SUBSCRIPTIONS MODULE =====
function renderPlans() {
    const plans = store.get('plans');
    const grid = document.getElementById('plansGrid');
    if (plans.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No plans created yet.</p></div>';
        return;
    }
    grid.innerHTML = plans.map(p => `
        <div class="plan-card">
            <h3>${p.name}</h3>
            <div class="plan-price">$${p.price}</div>
            <div class="plan-duration">${p.duration} days</div>
            <ul class="plan-features">
                ${(p.features || []).map(f => `<li>${f}</li>`).join('')}
            </ul>
            <div class="plan-actions">
                <button class="btn btn-sm btn-primary" onclick="editPlan('${p.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deletePlan('${p.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function openPlanModal(id = null) {
    document.getElementById('planModalTitle').textContent = id ? 'Edit Plan' : 'Add Plan';
    document.getElementById('planForm').reset();
    document.getElementById('planId').value = '';

    if (id) {
        const plan = store.find('plans', id);
        if (plan) {
            document.getElementById('planId').value = plan.id;
            document.getElementById('planName').value = plan.name;
            document.getElementById('planDuration').value = plan.duration;
            document.getElementById('planPrice').value = plan.price;
            document.getElementById('planFeatures').value = (plan.features || []).join('\n');
        }
    }
    openModal('planModal');
}

function editPlan(id) { openPlanModal(id); }

function savePlan(e) {
    e.preventDefault();
    const id = document.getElementById('planId').value;
    const planData = {
        name: document.getElementById('planName').value,
        duration: parseInt(document.getElementById('planDuration').value),
        price: parseFloat(document.getElementById('planPrice').value),
        features: document.getElementById('planFeatures').value.split('\n').filter(f => f.trim())
    };

    if (id) {
        store.update('plans', id, planData);
    } else {
        store.add('plans', planData);
    }

    closeModal('planModal');
    renderPlans();
}

function deletePlan(id) {
    if (confirm('Are you sure you want to delete this plan?')) {
        store.delete('plans', id);
        renderPlans();
    }
}


// ===== PAYMENTS MODULE =====
function renderPayments() {
    const payments = store.get('payments');
    populateMemberDropdowns();
    renderPaymentsTable(payments);
}

function renderPaymentsTable(payments) {
    const tbody = document.getElementById('paymentsTableBody');
    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No payments recorded yet.</td></tr>';
        return;
    }
    tbody.innerHTML = payments.map(p => {
        const member = store.find('members', p.memberId);
        return `<tr>
            <td>${member ? member.name : 'Unknown'}</td>
            <td><strong>$${parseFloat(p.amount).toFixed(2)}</strong></td>
            <td>${p.planName || 'N/A'}</td>
            <td>${p.date}</td>
            <td>${p.dueDate || 'N/A'}</td>
            <td><span class="badge badge-${p.status}">${p.status}</span></td>
            <td>
                ${p.status !== 'paid' ? `<button class="btn btn-sm btn-success" onclick="markPaid('${p.id}')">Mark Paid</button>` : ''}
                <button class="btn btn-sm btn-danger" onclick="deletePayment('${p.id}')">Delete</button>
            </td>
        </tr>`;
    }).join('');
}

function filterPayments() {
    const search = document.getElementById('paymentSearch').value.toLowerCase();
    const filter = document.getElementById('paymentFilter').value;
    let payments = store.get('payments');

    if (search) {
        payments = payments.filter(p => {
            const member = store.find('members', p.memberId);
            return (member && member.name.toLowerCase().includes(search));
        });
    }
    if (filter !== 'all') {
        payments = payments.filter(p => p.status === filter);
    }
    renderPaymentsTable(payments);
}

function openPaymentModal() {
    document.getElementById('paymentForm').reset();
    populateMemberDropdowns();
    document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
    openModal('paymentModal');
}

function savePayment(e) {
    e.preventDefault();
    const memberId = document.getElementById('paymentMember').value;
    const member = store.find('members', memberId);
    const plan = member ? store.find('plans', member.planId) : null;

    const paymentData = {
        memberId: memberId,
        amount: document.getElementById('paymentAmount').value,
        date: document.getElementById('paymentDate').value,
        method: document.getElementById('paymentMethod').value,
        notes: document.getElementById('paymentNotes').value,
        planName: plan ? plan.name : 'N/A',
        dueDate: plan ? calculateDueDate(document.getElementById('paymentDate').value, plan.duration) : '',
        status: 'paid'
    };

    store.add('payments', paymentData);
    closeModal('paymentModal');
    renderPayments();
    updateDashboard();
}

function markPaid(id) {
    store.update('payments', id, { status: 'paid' });
    renderPayments();
    updateDashboard();
}

function deletePayment(id) {
    if (confirm('Delete this payment record?')) {
        store.delete('payments', id);
        renderPayments();
        updateDashboard();
    }
}

function calculateDueDate(startDate, days) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}


// ===== ATTENDANCE MODULE =====
function renderAttendance() {
    const attendance = store.get('attendance');
    populateMemberDropdowns();
    document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];
    renderAttendanceTable(attendance);
}

function renderAttendanceTable(records) {
    const tbody = document.getElementById('attendanceTableBody');
    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No attendance records.</td></tr>';
        return;
    }
    const sorted = [...records].sort((a, b) => new Date(b.date + ' ' + b.checkIn) - new Date(a.date + ' ' + a.checkIn));
    tbody.innerHTML = sorted.map(a => {
        const member = store.find('members', a.memberId);
        const duration = a.checkOut ? calculateDuration(a.checkIn, a.checkOut) : 'In progress';
        return `<tr>
            <td>${member ? member.name : 'Unknown'}</td>
            <td>${a.date} ${a.checkIn}</td>
            <td>${a.checkOut ? `${a.date} ${a.checkOut}` : '-'}</td>
            <td>${duration}</td>
            <td>
                ${!a.checkOut ? `<button class="btn btn-sm btn-success" onclick="checkOut('${a.id}')">Check Out</button>` : ''}
            </td>
        </tr>`;
    }).join('');
}

function filterAttendance() {
    const date = document.getElementById('attendanceDate').value;
    const search = document.getElementById('attendanceSearch').value.toLowerCase();
    let records = store.get('attendance');

    if (date) {
        records = records.filter(a => a.date === date);
    }
    if (search) {
        records = records.filter(a => {
            const member = store.find('members', a.memberId);
            return member && member.name.toLowerCase().includes(search);
        });
    }
    renderAttendanceTable(records);
}

function openCheckinModal() {
    document.getElementById('checkinForm').reset();
    populateMemberDropdowns();

    const now = new Date();
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('checkinTime').value = localISO;

    openModal('checkinModal');
}

function saveCheckin(e) {
    e.preventDefault();
    const memberId = document.getElementById('checkinMember').value;
    const datetime = document.getElementById('checkinTime').value;
    const dt = new Date(datetime);

    const record = {
        memberId: memberId,
        date: dt.toISOString().split('T')[0],
        checkIn: dt.toTimeString().slice(0, 5),
        checkOut: null
    };

    store.add('attendance', record);
    closeModal('checkinModal');
    renderAttendance();
    updateDashboard();
}

function checkOut(id) {
    const now = new Date();
    store.update('attendance', id, { checkOut: now.toTimeString().slice(0, 5) });
    renderAttendance();
}

function calculateDuration(checkIn, checkOut) {
    const [h1, m1] = checkIn.split(':').map(Number);
    const [h2, m2] = checkOut.split(':').map(Number);
    const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (mins < 0) return 'N/A';
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
}


// ===== TRAINERS MODULE =====
function renderTrainers() {
    const trainers = store.get('trainers');
    const grid = document.getElementById('trainersGrid');
    if (trainers.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No trainers added yet. Click "+ Add Trainer" to get started.</p></div>';
        return;
    }
    grid.innerHTML = trainers.map(t => {
        const initials = t.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const members = store.get('members').filter(m => m.trainerId === t.id);
        return `
        <div class="trainer-card">
            <div class="trainer-avatar">${initials}</div>
            <h3>${t.name}</h3>
            <div class="trainer-specialization">${t.specialization || 'General Fitness'}</div>
            <div class="trainer-info">Email: ${t.email}</div>
            <div class="trainer-info">Phone: ${t.phone}</div>
            <div class="trainer-info">Experience: ${t.experience || 0} years</div>
            <div class="trainer-info">Rate: $${t.rate || 0}/hr</div>
            <div class="trainer-info">Members: ${members.length}</div>
            <div class="trainer-actions">
                <button class="btn btn-sm btn-primary" onclick="editTrainer('${t.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteTrainer('${t.id}')">Delete</button>
            </div>
        </div>`;
    }).join('');
}

function openTrainerModal(id = null) {
    document.getElementById('trainerModalTitle').textContent = id ? 'Edit Trainer' : 'Add Trainer';
    document.getElementById('trainerForm').reset();
    document.getElementById('trainerId').value = '';

    if (id) {
        const trainer = store.find('trainers', id);
        if (trainer) {
            document.getElementById('trainerId').value = trainer.id;
            document.getElementById('trainerName').value = trainer.name;
            document.getElementById('trainerEmail').value = trainer.email;
            document.getElementById('trainerPhone').value = trainer.phone;
            document.getElementById('trainerSpecialization').value = trainer.specialization || 'general';
            document.getElementById('trainerExperience').value = trainer.experience || '';
            document.getElementById('trainerRate').value = trainer.rate || '';
        }
    }
    openModal('trainerModal');
}

function editTrainer(id) { openTrainerModal(id); }

function saveTrainer(e) {
    e.preventDefault();
    const id = document.getElementById('trainerId').value;
    const trainerData = {
        name: document.getElementById('trainerName').value,
        email: document.getElementById('trainerEmail').value,
        phone: document.getElementById('trainerPhone').value,
        specialization: document.getElementById('trainerSpecialization').value,
        experience: document.getElementById('trainerExperience').value,
        rate: document.getElementById('trainerRate').value
    };

    if (id) {
        store.update('trainers', id, trainerData);
    } else {
        store.add('trainers', trainerData);
    }

    closeModal('trainerModal');
    renderTrainers();
    updateDashboard();
}

function deleteTrainer(id) {
    if (confirm('Are you sure you want to delete this trainer?')) {
        store.delete('trainers', id);
        renderTrainers();
        updateDashboard();
    }
}


// ===== REPORTS MODULE =====
function generateReports() {
    const period = document.getElementById('reportPeriod').value;
    const now = new Date();
    let startDate;

    switch(period) {
        case 'week':
            startDate = new Date(now); startDate.setDate(now.getDate() - 7); break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
        case 'quarter':
            startDate = new Date(now); startDate.setMonth(now.getMonth() - 3); break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1); break;
    }

    const startStr = startDate.toISOString().split('T')[0];
    const members = store.get('members');
    const payments = store.get('payments');
    const attendance = store.get('attendance');
    const trainers = store.get('trainers');

    // Revenue Report
    const periodPayments = payments.filter(p => p.date >= startStr && p.status === 'paid');
    const totalRevenue = periodPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const avgPayment = periodPayments.length ? totalRevenue / periodPayments.length : 0;

    document.getElementById('revenueReport').innerHTML = `
        <div class="report-stat"><span class="label">Total Revenue</span><span class="value">$${totalRevenue.toFixed(2)}</span></div>
        <div class="report-stat"><span class="label">Transactions</span><span class="value">${periodPayments.length}</span></div>
        <div class="report-stat"><span class="label">Avg Payment</span><span class="value">$${avgPayment.toFixed(2)}</span></div>
        <div class="report-stat"><span class="label">Overdue</span><span class="value" style="color:var(--danger)">${payments.filter(p => p.status === 'overdue').length}</span></div>
        <div class="report-stat"><span class="label">Cash</span><span class="value">${periodPayments.filter(p => p.method === 'cash').length}</span></div>
        <div class="report-stat"><span class="label">Card</span><span class="value">${periodPayments.filter(p => p.method === 'card').length}</span></div>
    `;

    // Membership Report
    const active = members.filter(m => getMemberStatus(m) === 'active').length;
    const expired = members.filter(m => getMemberStatus(m) === 'expired').length;
    const pending = members.filter(m => getMemberStatus(m) === 'pending').length;
    const activePercent = members.length ? (active / members.length * 100) : 0;

    document.getElementById('membershipReport').innerHTML = `
        <div class="report-stat"><span class="label">Total Members</span><span class="value">${members.length}</span></div>
        <div class="report-stat"><span class="label">Active</span><span class="value" style="color:var(--success)">${active}</span></div>
        <div class="report-stat"><span class="label">Expired</span><span class="value" style="color:var(--danger)">${expired}</span></div>
        <div class="report-stat"><span class="label">Pending</span><span class="value" style="color:var(--warning)">${pending}</span></div>
        <div class="report-bar">
            <div class="report-bar-label"><span>Active Rate</span><span>${activePercent.toFixed(1)}%</span></div>
            <div class="report-bar-track"><div class="report-bar-fill" style="width:${activePercent}%"></div></div>
        </div>
        <div class="report-stat"><span class="label">New This Period</span><span class="value">${members.filter(m => m.joinDate >= startStr).length}</span></div>
    `;

    // Attendance Report
    const periodAttendance = attendance.filter(a => a.date >= startStr);
    const uniqueMembers = new Set(periodAttendance.map(a => a.memberId)).size;
    const avgDaily = periodAttendance.length ? (periodAttendance.length / getDaysDiff(startDate, now)).toFixed(1) : 0;

    document.getElementById('attendanceReport').innerHTML = `
        <div class="report-stat"><span class="label">Total Check-ins</span><span class="value">${periodAttendance.length}</span></div>
        <div class="report-stat"><span class="label">Unique Members</span><span class="value">${uniqueMembers}</span></div>
        <div class="report-stat"><span class="label">Avg Daily</span><span class="value">${avgDaily}</span></div>
        <div class="report-stat"><span class="label">Attendance Rate</span><span class="value">${members.length ? ((uniqueMembers / members.length) * 100).toFixed(1) : 0}%</span></div>
    `;

    // Trainer Report
    const trainerStats = trainers.map(t => {
        const memberCount = members.filter(m => m.trainerId === t.id).length;
        return { name: t.name, members: memberCount };
    }).sort((a, b) => b.members - a.members);

    document.getElementById('trainerReport').innerHTML = trainerStats.length ? trainerStats.map(t => `
        <div class="report-stat"><span class="label">${t.name}</span><span class="value">${t.members} members</span></div>
    `).join('') : '<div class="empty-state"><p>No trainers to report on</p></div>';
}

function getDaysDiff(start, end) {
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}


// ===== UTILITY FUNCTIONS =====
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function populateMemberDropdowns() {
    const members = store.get('members');
    const options = members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');

    const paymentMember = document.getElementById('paymentMember');
    if (paymentMember) paymentMember.innerHTML = '<option value="">Select Member</option>' + options;

    const checkinMember = document.getElementById('checkinMember');
    if (checkinMember) checkinMember.innerHTML = '<option value="">Select Member</option>' + options;
}

// ===== GLOBAL SEARCH =====
document.getElementById('globalSearch').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    if (!query) return;

    const members = store.get('members').filter(m =>
        m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query)
    );

    if (members.length > 0) {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelector('[data-page="members"]').classList.add('active');
        showPage('members');
        renderMembersTable(members);
    }
});
