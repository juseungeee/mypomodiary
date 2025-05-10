const SPEED = 1;

let pomoRecord = {};
let pomoCount = Number(localStorage.getItem('pomoCount')) || 0;

let elapsedSeconds = 0; 
const totalSeconds = 60 * 60;
let timer = null;

function getTodayDateKeyKST() {
  const now = new Date();
  now.setHours(now.getHours() + 9);
  return now.toISOString().slice(0, 10);
}
let todayDateKey = getTodayDateKeyKST();

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
const minuteFiveInterval = [...Array(12)].map((_, index) => index * 5);
minuteFiveInterval.forEach((minute) => appendMinuteText(minute));

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
  $fillingCircle.style.background = `conic-gradient(#ffa5a5 ${percentage}deg, transparent 0deg)`;
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
      elapsedSeconds = totalSeconds;
      updateTimerDisplay();
      alarmSound.play();

      setTimeout(() => {
        alert("뽀모 완료! 🍅");
      }, 100);

      todayDateKey = getTodayDateKeyKST();
      if (!pomoRecord[todayDateKey]) {
        pomoRecord[todayDateKey] = 0;
      }
      pomoRecord[todayDateKey]++;
      db.collection('pomoRecords').doc(todayDateKey).set({
        count: pomoRecord[todayDateKey]
      }).then(() => {
        console.log('Firestore 저장 성공');
      }).catch((error) => {
        console.error('Firestore 저장 실패', error);
      });

      generateCalendar();
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
  document.getElementById('today-pomo-count').innerText = `Today: ${pomoCount} pomo`;
}

function updateTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const day = dayNames[today.getDay()];
  const formattedDate = `${year}년 ${month}월 ${date}일 ${day}`;
  document.getElementById('today-date').innerText = formattedDate;
}

function checkMidnightReset() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  if (hours === 0 && minutes === 0) {
    pomoCount = 0;
    todayDateKey = getTodayDateKeyKST();
    updateTodayDate();
    updatePomoCount();
    localStorage.setItem('pomoCount', 0);
  }
}
setInterval(checkMidnightReset, 60000);

function generateCalendar() {
  const $calendar = document.getElementById('calendar');
  $calendar.innerHTML = '';
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
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

async function loadPomoRecord() {
  try {
    const snapshot = await db.collection('pomoRecords').get();
    snapshot.forEach((doc) => {
      pomoRecord[doc.id] = doc.data().count;
    });
    console.log('pomoRecord 불러오기 성공', pomoRecord);
  } catch (error) {
    console.error('pomoRecord 불러오기 실패', error);
  }
}

function updateCalendarTitle() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  document.getElementById('calendar-title').innerText = `${year}년 ${month}월`;
}

document.getElementById("start-button").addEventListener("click", startTimer);
document.getElementById("reset-button").addEventListener("click", resetTimer);
document.getElementById('go-to-settings').addEventListener('click', () => {
  window.location.href = 'jsettings.html';
});

updateTimerDisplay();
updateTodayDate();
updatePomoCount();
loadPomoRecord().then(() => {
  generateCalendar();
  updateCalendarTitle();
});
