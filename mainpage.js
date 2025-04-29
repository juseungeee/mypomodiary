// 타이머 속도 조절값 (1000 = 1초마다 1초 경과 / 1 = 테스트용 빠른 모드)
const SPEED = 1;

let elapsedSeconds = 0; // 현재 경과된 시간
const totalSeconds = 60 * 60;  // 60분 = 3600초
let timer = null;

// 타이머 박스 요소 가져오기
const $box = document.getElementById('box');

// 시계 테두리에 1분 단위로 분침 그리기
const appendMinuteHand = (minute) => {
  const $minuteHand = document.createElement('div');
  $box.appendChild($minuteHand);
  $minuteHand.classList.add('minuteHand');
  $minuteHand.style.transform = `rotateZ(${minute * 6}deg)`;
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

// 현재 경과된 시간 텍스트로 표시
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
    elapsedSeconds++;
    updateTimerDisplay();
    updateFillingCircle();

    if (elapsedSeconds >= totalSeconds) {
        // 시간이 다 되면 타이머 멈춤
      clearInterval(timer);
      timer = null;

      splash();

      elapsedSeconds = totalSeconds;
      updateTimerDisplay();
      
      alarmSound.play();

      setTimeout(() => { 
        alert("뽀모 완료! 🍅"); // 완료 알림 
        }, 100)
    }
  }, SPEED);
}

function splash() {
    tomatoImage.classList.remove('tomato');
    tomatoImage.classList.add('splash');
    tomatoImage.src = "images/splash.png";
  }


// 원 채워지는 그래픽 요소 가져오기
const $fillingCircle = document.getElementById('filling-circle');
const alarmSound = document.getElementById('alarm-sound');
const tomatoImage = document.getElementById('tomato-image');

// 타이머 원 채우기
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

  tomatoImage.src = "images/tomato.png";
  tomatoImage.classList.remove('splash');
  tomatoImage.classList.add('tomato');
}

// 시작/리셋 버튼 이벤트 연결
document.getElementById("start-button").addEventListener("click", startTimer);
document.getElementById("reset-button").addEventListener("click", resetTimer);

// 페이지 처음 열었을 때 표시
updateTimerDisplay();


