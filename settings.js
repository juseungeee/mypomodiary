// 메인페이지로 이동
document.getElementById('go-to-main').addEventListener('click', () => {
    window.location.href = 'mainpage.html';
  });
  

  // 저장 버튼 누르면 localStorage에 저장
  document.getElementById('save-button').addEventListener('click', () => {
    const selectedBackground = document.getElementById('background-select').value;
    const selectedColor = document.getElementById('color-select').value;
  
    localStorage.setItem('timerBackground', selectedBackground);
    localStorage.setItem('timerColor', selectedColor);
  
    alert('설정이 저장되었습니다');
  });

// 저장된 값이 있다면 초기값으로 설정
window.addEventListener('DOMContentLoaded', () => {
  const savedBackground = localStorage.getItem('timerBackground');
  const savedColor = localStorage.getItem('timerColor');

  if (savedBackground) {
    document.getElementById('background-select').value = savedBackground;
  }

  if (savedColor) {
    document.getElementById('color-select').value = savedColor;
  }
});

  