let students = JSON.parse(localStorage.getItem('students')) || [];
let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
let fees = JSON.parse(localStorage.getItem('fees')) || [];
let attendance = JSON.parse(localStorage.getItem('attendance')) || [];
let results = JSON.parse(localStorage.getItem('results')) || [];

// LOGIN / LOGOUT
function login(){
  if(document.getElementById('username').value==='admin' && document.getElementById('password').value==='1234'){
    document.getElementById('loginPage').style.display='none';
    document.getElementById('app').style.display='block';
    init();
  } else {
    document.getElementById('loginError').innerText='Invalid Credentials';
  }
}
function logout(){
  document.getElementById('loginPage').style.display='flex';
  document.getElementById('app').style.display='none';
}

// INIT
function init(){
  document.getElementById('attendanceDate').valueAsDate = new Date();
  updateDashboard(); renderStudents(); renderTeachers(); renderFees(); renderAttendance(); renderResults();
}

// TABS
function showTab(id){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.sidebar li').forEach(li=>li.classList.remove('active'));
  event.target.classList.add('active');
}

// DASHBOARD
function updateDashboard(){
  document.getElementById('totalStudents').innerText = students.length;
  document.getElementById('totalTeachers').innerText = teachers.length;
  document.getElementById('feesDue').innerText = fees.filter(f=>f.due>0).length;
  const today = document.getElementById('attendanceDate').value;
  const att = attendance.find(a=>a.date===today);
  document.getElementById('presentToday').innerText = att? att.data.filter(d=>d.status==='Present').length : 0;
}

// STUDENTS CRUD
function openStudentModal(id=null){
  document.getElementById('studentModal').style.display='flex';
  if(id){
    const s = students.find(x=>x.id===id);
    document.getElementById('studentModalTitle').innerText='Edit Student';
    ['studentId','studentName','studentClass','studentPhone','studentAddress'].forEach(k=>document.getElementById(k).value=s[k.replace('student','').toLowerCase()]||'');
  } else {
    document.getElementById('studentModalTitle').innerText='Add Student';
    ['studentId','studentName','studentClass','studentPhone','studentAddress'].forEach(k=>document.getElementById(k).value='');
  }
}
function closeStudentModal(){document.getElementById('studentModal').style.display='none';}
function saveStudent(){
  const s = {
    id: document.getElementById('studentId').value? parseInt(document.getElementById('studentId').value):Date.now(),
    name:studentName.value, class:studentClass.value, phone:studentPhone.value, address:studentAddress.value
  };
  students = students.some(x=>x.id===s.id)? students.map(x=>x.id===s.id?s:x):[...students,s];
  localStorage.setItem('students',JSON.stringify(students)); closeStudentModal(); init();
}
function deleteStudent(id){ if(confirm('Delete?')){students=students.filter(s=>s.id!==id); localStorage.setItem('students',JSON.stringify(students)); init();}}
function renderStudents(){
  studentTable.innerHTML = students.map(s=>`
  <tr><td>${s.id}</td><td>${s.name}</td><td>${s.class}</td><td>${s.phone}</td><td>${s.address}</td>
  <td><button class="btn-edit" onclick="openStudentModal(${s.id})">Edit</button><button class="btn-delete" onclick="deleteStudent(${s.id})">Delete</button></td></tr>`).join('');
}
function searchStudent(){
  const val = searchStudent.value.toLowerCase();
  studentTable.innerHTML = students.filter(s=>s.name.toLowerCase().includes(val)).map(s=>`
  <tr><td>${s.id}</td><td>${s.name}</td><td>${s.class}</td><td>${s.phone}</td><td>${s.address}</td>
  <td><button class="btn-edit" onclick="openStudentModal(${s.id})">Edit</button><button class="btn-delete" onclick="deleteStudent(${s.id})">Delete</button></td></tr>`).join('');
}

// TEACHERS CRUD
function openTeacherModal(id=null){
  teacherModal.style.display='flex';
  if(id){
    const t = teachers.find(x=>x.id===id);
    teacherModalTitle.innerText='Edit Teacher';
    teacherId.value=t.id; teacherName.value=t.name; teacherSubject.value=t.subject; teacherPhone.value=t.phone; teacherExp.value=t.exp;
  } else {
    teacherModalTitle.innerText='Add Teacher';
    ['teacherId','teacherName','teacherSubject','teacherPhone','teacherExp'].forEach(k=>document.getElementById(k).value='');
  }
}
function closeTeacherModal(){teacherModal.style.display='none';}
function saveTeacher(){
  const t={id:teacherId.value?parseInt(teacherId.value):Date.now(), name:teacherName.value, subject:teacherSubject.value, phone:teacherPhone.value, exp:teacherExp.value};
  teachers = teachers.some(x=>x.id===t.id)? teachers.map(x=>x.id===t.id?t:x):[...teachers,t];
  localStorage.setItem('teachers',JSON.stringify(teachers)); closeTeacherModal(); init();
}
function deleteTeacher(id){ if(confirm('Delete?')){teachers=teachers.filter(t=>t.id!==id); localStorage.setItem('teachers',JSON.stringify(teachers)); init();}}
function renderTeachers(){
  teacherTable.innerHTML = teachers.map(t=>`
  <tr><td>${t.id}</td><td>${t.name}</td><td>${t.subject}</td><td>${t.phone}</td><td>${t.exp}</td>
  <td><button class="btn-edit" onclick="openTeacherModal(${t.id})">Edit</button><button class="btn-delete" onclick="deleteTeacher(${t.id})">Delete</button></td></tr>`).join('');
}

// FEES
function renderFees(){
  feesTable.innerHTML = students.map(s=>{
    let f = fees.find(x=>x.studentId===s.id) || {total:50000, paid:0, due:50000};
    return `<tr><td>${s.name}</td><td>${s.class}</td>
    <td><input type="number" value="${f.total}" onchange="updFee(${s.id},'total',this.value)"></td>
    <td><input type="number" value="${f.paid}" onchange="updFee(${s.id},'paid',this.value)"></td>
    <td>${f.due}</td><td class="${f.due>0?'status-due':'status-paid'}">${f.due>0?'Due':'Paid'}</td>
    <td><button class="btn-primary" onclick="saveFee(${s.id})">Save</button></td></tr>`
  }).join('');
}
function updFee(id,field,val){let f=fees.find(x=>x.studentId===id)||{studentId:id,total:50000,paid:0,due:50000}; f[field]=+val; f.due=f.total-f.paid; if(!fees.find(x=>x.studentId===id))fees.push(f);}
function saveFee(id){localStorage.setItem('fees',JSON.stringify(fees)); alert('Saved'); updateDashboard();}

// ATTENDANCE
function renderAttendance(){
  const date=attendanceDate.value;
  attendanceTable.innerHTML = students.map(s=>{
    const att=attendance.find(a=>a.date===date);
    const status=att? (att.data.find(d=>d.studentId===s.id)?.status||'Present'):'Present';
    return `<tr><td>${s.name}</td><td>${s.class}</td>
    <td><select id="att_${s.id}"><option ${status==='Present'?'selected':''}>Present</option><option ${status==='Absent'?'selected':''}>Absent</option></select></td></tr>`
  }).join('');
}
function saveAttendance(){
  const date=attendanceDate.value; const data=students.map(s=>({studentId:s.id,status:document.getElementById(`att_${s.id}`).value}));
  attendance=attendance.filter(a=>a.date!==date); attendance.push({date,data});
  localStorage.setItem('attendance',JSON.stringify(attendance)); alert('Attendance Saved'); updateDashboard();
}

// RESULTS
function renderResults(){
  resultTable.innerHTML = students.map(s=>{
    let r=results.find(x=>x.studentId===s.id)||{tamil:0,english:0,maths:0,science:0};
    let total=r.tamil+r.english+r.maths+r.science;
    let grade=total>=320?'A+':total>=280?'A':total>=240?'B':total>=200?'C':'F';
    return `<tr><td>${s.name}</td><td>${s.class}</td>
    <td><input type="number" value="${r.tamil}" onchange="updRes(${s.id},'tamil',this.value)"></td>
    <td><input type="number" value="${r.english}" onchange="updRes(${s.id},'english',this.value)"></td>
    <td><input type="number" value="${r.maths}" onchange="updRes(${s.id},'maths',this.value)"></td>
    <td><input type="number" value="${r.science}" onchange="updRes(${s.id},'science',this.value)"></td>
    <td>${total}</td><td>${grade}</td><td><button class="btn-primary" onclick="saveRes(${s.id})">Save</button></td></tr>`
  }).join('');
}
function updRes(id,sub,val){let r=results.find(x=>x.studentId===id)||{studentId:id,tamil:0,english:0,maths:0,science:0}; r[sub]=+val; if(!results.find(x=>x.studentId===id))results.push(r);}
function saveRes(id){localStorage.setItem('results',JSON.stringify(results)); alert('Result Saved'); renderResults();}