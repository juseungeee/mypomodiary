// 타이머 속도 조절값 (1000 = 1초마다 1초 경과 / 1 = 테스트용 빠른 모드)
const SPEED = 1;

let elapsedSeconds = 0; // 현재 경과된 시간
const totalSeconds = 60 * 60;  // 60분 = 3600초
let timer = null; // setInterval ID 저장용

let pomoCount = 0; // Today 뽀모 수
let todayDateKey = new Date().toISOString().slice(0, 10); // 오늘 날짜 (yyyy-mm-dd)

// 타이머 박스 요소 가져오기
const $box = document.getElementById('box');


// 시계 테두리에 1분 단위로 분침 그리기
const appendMinuteHand = (minute) => {
  const $minuteHand = document.createElement('div');
  $box.appendChild($minuteHand);
  $minuteHand.classList.add('minuteHand');
  $minuteHand.style.transform = `rotateZ(${minute * 6}deg)`; // 6도씩 회전
  $minuteHand.classList.add(minute % 5 ? 'thin' : 'thick'); // 5분마다 두껍게
};
[...Array(30).keys()].forEach((minute) => appendMinuteHand(minute));

// 5분 단위로 분침 숫자 테두리에 표시
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

// 가운데 원을 추가해서 분침 중심 가림
const $circleForHide = document.createElement('div');
$circleForHide.id = 'circleForHide';
$box.appendChild($circleForHide);

// 현재 경과된 시간 텍스트로 표시 (MM:SS)
function updateTimerDisplay() {
  let minutes = Math.floor(elapsedSeconds / 60);
  let seconds = elapsedSeconds % 60;
  document.getElementById("timer-text").innerText =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// 타이머 시작
function startTimer() {
  if (timer !== null) return; // 이미 실행 중이면 중복 실행 방지

  timer = setInterval(() => {
    elapsedSeconds++; // 1초 증가
    updateTimerDisplay(); // 화면 숫자 표시 갱신
    updateFillingCircle(); // 원 채우기 갱신

    if (elapsedSeconds >= totalSeconds) {
        // 시간이 다 되면 타이머 멈춤
      clearInterval(timer);
      timer = null;

      splash(); // 이미지 변경 (토마토->토마토터짐)

      pomoCount++; // Today 뽀모 수 1 증가
      updatePomoCount(); // 화면 반영

      elapsedSeconds = totalSeconds;
      updateTimerDisplay();
      
      alarmSound.play(); // 알림음 재생

      setTimeout(() => { 
        alert("뽀모 완료! 🍅"); // 완료 알림 
        }, 100)
    }
  }, SPEED);
}

// 토마토 -> 토마토터짐 이미지 변경
function splash() {
    tomatoImage.classList.remove('tomato');
    tomatoImage.classList.add('splash');
    tomatoImage.src = "images/splash.png";
  }

// 원 채워지는 그래픽 요소 가져오기
const $fillingCircle = document.getElementById('filling-circle');
// 사운드 및 이미지 요소 가져오기
const alarmSound = document.getElementById('alarm-sound');
const tomatoImage = document.getElementById('tomato-image');

// 타이머 진행에 따라 원 채우기
function updateFillingCircle() {
  const percentage = (elapsedSeconds / totalSeconds) * 360;
  $fillingCircle.style.background = `conic-gradient(#ffa5a5 ${percentage}deg, transparent 0deg)`;
}

// 타이머 리셋
function resetTimer() {
  clearInterval(timer);
  timer = null;
  elapsedSeconds = 0;
  updateTimerDisplay();
  updateFillingCircle();

  // 토마토 이미지 복구
  tomatoImage.src = "images/tomato.png";
  tomatoImage.classList.remove('splash');
  tomatoImage.classList.add('tomato');
}

// Today 뽀모 수 화면에 표시
function updatePomoCount() {
    document.getElementById('today-pomo-count').innerText = `Today: ${pomoCount} pomo`;
  }

// 오늘 날짜 화면에 표시 (yyyy년 mm월 dd일 요일)
function updateTodayDate() {
    const today = new Date();
  
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 0부터 시작이라 +1
    const date = today.getDate();
    
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const day = dayNames[today.getDay()]; // 0: 일요일, 1: 월요일, ...
  
    const formattedDate = `${year}년 ${month}월 ${date}일 ${day}`;
    document.getElementById('today-date').innerText = formattedDate;
  }

// 자정이 되면 뽀모 수와 날짜 리셋
  function checkMidnightReset() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
  
    if (hours === 0 && minutes === 0) {
      // 자정이 되었으면
      pomoCount = 0; // Today 뽀모 수 0으로 리셋
      todayDateKey = now.toISOString().slice(0, 10);
      updateTodayDate();
      updatePomoCount();
    }
  }
  
  // 1분마다 자정 체크
setInterval(checkMidnightReset, 60000);

// 달력 그리기
function generateCalendar() {
  const $calendar = document.getElementById('calendar');
  $calendar.innerHTML = ''; // 초기화

  const today = new Date();
  const year = today.getFullYear(); // 연도 추출 
  const month = today.getMonth(); // 월 추출

  // 이번 달 1일이 무슨 요일인지 확인인
  const firstDay = new Date(year, month, 1).getDay();
  // 이번 달의 마지막 날짜 구하기기
  const lastDate = new Date(year, month + 1, 0).getDate(); 

  const totalCells = 42; // 7일 * 6주 => 총 42칸
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  // 요일을 달력 위에 추가
  dayNames.forEach(day => {
    const $dayHeader = document.createElement('div');
    $dayHeader.classList.add('day-header');
    $dayHeader.innerText = day;
    $calendar.appendChild($dayHeader);
  });
  // 날짜 셀 42개를 순회하면서 달력 칸을 하나씩 채움
  for (let i = 0; i < totalCells; i++) {
    const $dateCell = document.createElement('div');
    $dateCell.classList.add('date-cell');

    const dateNum = i - firstDay + 1; // 실제 날짜 계산
    // 유효한 날짜만 표시
    if (dateNum > 0 && dateNum <= lastDate) {
      $dateCell.innerText = dateNum;
      // 오늘 날짜 강조 표시
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

// 시작/리셋/설정 버튼 이벤트 연결
document.getElementById("start-button").addEventListener("click", startTimer);
document.getElementById("reset-button").addEventListener("click", resetTimer);
document.getElementById('go-to-settings').addEventListener('click', () => {
  window.location.href = 'settings.html';
});

// 페이지 첫 로딩 시 초기화
updateTimerDisplay();
updateTodayDate()
updatePomoCount();
generateCalendar();

