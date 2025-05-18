// 속도 조절용 (1000 = 정상, 1 = 테스트용 빠른 모드)
const SPEED = 1000;

let currentYear = Number(localStorage.getItem('calendarYear')) || new Date().getFullYear();
let currentMonth = Number(localStorage.getItem('calendarMonth')) || new Date().getMonth();

let pomoRecord = {};
let completedRecord = {};

let elapsedSeconds = 0;
const totalSeconds = 60 * 60;
let timer = null;

function getTodayDateKeyKST() {
  const now = new Date();
  now.setHours(now.getHours() + 9);
  return now.toISOString().slice(0, 10);
}

let todayDateKey = getTodayDateKeyKST();
checkInitialDateReset();

const bgImageMap = {
  tomato: 'bg-tomato.png',
  pudding: 'bg-pudding.png',
  clover: 'bg-clover.png',
  cloud: 'bg-cloud.png'
};

let customFillingColor = '#FF7F7F';

const $box = document.getElementById('box');

const appendMinuteHand = (minute) => {
  const $minuteHand = document.createElement('div');
  $box.appendChild($minuteHand);
  $minuteHand.classList.add('minuteHand');
  $minuteHand.style.transform = `rotateZ(${minute * 6}deg)`;
  $minuteHand.classList.add(minute % 5 ? 'thin' : 'thick');
};
[...Array(30).keys()].forEach((minute) => appendMinuteHand(minute));

const appendMinuteText = (minute, radius = 130) => {
  const angle = (minute - 15) * 6;
  const radian = (angle / 180) * Math.PI;
  const X = radius * Math.cos(radian);
  const Y = radius * Math.sin(radian);
  const $minuteText = document.createElement('p');
  $minuteText.classList.add('minuteText');
  $minuteText.textContent = minute;
  $minuteText.style.left = '50%';
  $minuteText.style.top = '50%';
  $minuteText.style.transform = `translate(-50%, -50%) translate(${X}px, ${Y}px)`;
  $box.appendChild($minuteText);
};
[...Array(12)].map((_, i) => i * 5).forEach((minute) => appendMinuteText(minute));

const $circleForHide = document.createElement('div');
$circleForHide.id = 'circleForHide';
$box.appendChild($circleForHide);

function updateTimerDisplay() {
  let minutes = Math.floor(elapsedSeconds / 60);
  let seconds = elapsedSeconds % 60;
  document.getElementById("timer-text").innerText =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateFillingCircle() {
  const percentage = (elapsedSeconds / totalSeconds) * 360;
  $fillingCircle.style.background = `conic-gradient(${customFillingColor} ${percentage}deg, transparent 0deg)`;
}

function applyCustomStyle() {
  const selectedBgKey = localStorage.getItem('timerBackground') || 'tomato';
  const selectedColor = localStorage.getItem('timerColor') || '#FF7F7F';
  const bgFilename = bgImageMap[selectedBgKey];
  if (bgFilename) {
    $box.style.backgroundImage = `url(images/${bgFilename})`;
    $box.style.backgroundSize = 'cover';
    $box.style.backgroundPosition = 'center';
  }
  customFillingColor = selectedColor;
}

function startTimer() {
  if (timer !== null) return;
  timer = setInterval(() => {
    elapsedSeconds++;
    updateTimerDisplay();
    updateFillingCircle();
    if (elapsedSeconds >= totalSeconds) {
      clearInterval(timer);
      timer = null;
      splash();
      pomoCount++;
      updatePomoCount();
      localStorage.setItem('pomoCount', pomoCount);
      localStorage.setItem('pomoDate', todayDateKey);
      elapsedSeconds = totalSeconds;
      updateTimerDisplay();
      alarmSound.play();
      setTimeout(() => {
        alert("토마토 수확 완료! 🍅");
        resetTimer();
      }, 100);
      todayDateKey = getTodayDateKeyKST();
      if (!pomoRecord[todayDateKey]) pomoRecord[todayDateKey] = 0;
      pomoRecord[todayDateKey]++;
      db.collection('pomoRecords').doc(todayDateKey).set({ count: pomoRecord[todayDateKey] });
      generateCalendar(currentYear, currentMonth);
    }
  }, SPEED);
}

function splash() {
  tomatoImage.classList.remove('tomato');
  tomatoImage.classList.add('splash');
  tomatoImage.src = "images/splash.png";
}

const alarmSound = document.getElementById('alarm-sound');
const $fillingCircle = document.getElementById('filling-circle');
const tomatoImage = document.getElementById('tomato-image');

function resetTimer() {
  clearInterval(timer);
  timer = null;
  elapsedSeconds = 0;
  updateTimerDisplay();
  updateFillingCircle();
  tomatoImage.src = "images/tomato.png";
  tomatoImage.classList.remove('splash');
  tomatoImage.classList.add('tomato');
}

function updatePomoCount() {
  document.getElementById('today-pomo-count').innerText = `오늘의 토마토 수확 : ${pomoCount}개`;
}

function updateTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const day = dayNames[today.getDay()];
  document.getElementById('today-date').innerText = `${year}년 ${month}월 ${date}일 ${day}`;
}

function checkMidnightReset() {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    pomoCount = 0;
    todayDateKey = getTodayDateKeyKST();
    updateTodayDate();
    updatePomoCount();
    localStorage.setItem('pomoCount', 0);
  }
}
setInterval(checkMidnightReset, 60000);

function checkInitialDateReset() {
  const storedDateKey = localStorage.getItem('pomoDate');
  const nowDateKey = getTodayDateKeyKST();

  if (storedDateKey !== nowDateKey) {
    pomoCount = 0;
    todayDateKey = nowDateKey;
    localStorage.setItem('pomoCount', 0);
    localStorage.setItem('pomoDate', todayDateKey);
  } else {
    todayDateKey = storedDateKey;
    pomoCount = Number(localStorage.getItem('pomoCount')) || 0;
  }
}

function generateCalendar(year, month) {
  const $calendar = document.getElementById('calendar');
  $calendar.innerHTML = '';
  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const totalCells = 42;
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  dayNames.forEach(day => {
    const $dayHeader = document.createElement('div');
    $dayHeader.classList.add('day-header');
    $dayHeader.innerText = day;
    $calendar.appendChild($dayHeader);
  });
  for (let i = 0; i < totalCells; i++) {
    const $dateCell = document.createElement('div');
    $dateCell.classList.add('date-cell');
    const dateNum = i - firstDay + 1;
    if (dateNum > 0 && dateNum <= lastDate) {
      const $dateNumber = document.createElement('div');
      $dateNumber.innerText = dateNum;
      $dateCell.appendChild($dateNumber);
      const thisDate = new Date(year, month, dateNum);
      thisDate.setHours(thisDate.getHours() + 9);
      const thisDateKey = thisDate.toISOString().slice(0, 10);
      const pomoForThisDate = pomoRecord[thisDateKey] || 0;
      const $pomoCount = document.createElement('div');
      $pomoCount.style.fontSize = '12px';
      $pomoCount.style.marginTop = '3px';
      $pomoCount.innerText = `${pomoForThisDate}뽀모`;
      $dateCell.appendChild($pomoCount);
      if (completedRecord[thisDateKey]) {
        const tomatoStamp = document.createElement('img');
        tomatoStamp.src = 'images/tomato.png';
        tomatoStamp.alt = '토마토 도장';
        tomatoStamp.style.width = '20px';
        tomatoStamp.style.marginTop = '5px';
        $dateCell.appendChild(tomatoStamp);
      }
      $dateCell.addEventListener('click', () => {
        const clickedDate = new Date(year, month, dateNum);
        clickedDate.setHours(clickedDate.getHours() + 9);
        const clickedDateKey = clickedDate.toISOString().slice(0, 10);
        localStorage.setItem('selectedDate', clickedDateKey);
        window.location.href = 'planner.html';
      });
      if (
        dateNum === today.getDate() &&
        year === today.getFullYear() &&
        month === today.getMonth()
      ) {
        $dateCell.classList.add('today');
      }
    }
    $calendar.appendChild($dateCell);
  }
}

function updateCalendarTitle(year, month) {
  document.getElementById('calendar-title').innerText = `${year}년 ${month + 1}월`;
}

async function loadPomoRecord() {
  try {
    const snapshot = await db.collection('pomoRecords').get();
    snapshot.forEach((doc) => {
      pomoRecord[doc.id] = doc.data().count;
    });
  } catch (error) {
    console.error('pomoRecord 불러오기 실패', error);
  }
}

async function loadCompletedRecord() {
  try {
    const snapshot = await db.collection('completedRecords').get();
    snapshot.forEach((doc) => {
      completedRecord[doc.id] = doc.data().completed;
    });
  } catch (error) {
    console.error('completedRecord 불러오기 실패', error);
  }
}

document.getElementById('prev-month').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  localStorage.setItem('calendarYear', currentYear);
  localStorage.setItem('calendarMonth', currentMonth);
  generateCalendar(currentYear, currentMonth);
  updateCalendarTitle(currentYear, currentMonth);
});

document.getElementById('next-month').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  localStorage.setItem('calendarYear', currentYear);
  localStorage.setItem('calendarMonth', currentMonth);
  generateCalendar(currentYear, currentMonth);
  updateCalendarTitle(currentYear, currentMonth);
});

document.getElementById("start-button").addEventListener("click", startTimer);
document.getElementById("reset-button").addEventListener("click", resetTimer);
document.getElementById('go-to-settings').addEventListener('click', () => {
  window.location.href = 'settings.html';
});

applyCustomStyle();
updateTimerDisplay();
updateTodayDate();
updatePomoCount();
loadPomoRecord();
loadCompletedRecord().then(() => {
  generateCalendar(currentYear, currentMonth);
  updateCalendarTitle(currentYear, currentMonth);
});
