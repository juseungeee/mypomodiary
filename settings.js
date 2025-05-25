document.getElementById('go-to-main').addEventListener('click', () => {
    window.location.href = 'mainpage.html';
  });
  
  document.getElementById('save-button').addEventListener('click', () => {
    const selectedBackground = document.getElementById('background-select').value;
    const selectedColor = document.getElementById('color-select').value;
  
    localStorage.setItem('timerBackground', selectedBackground);
    localStorage.setItem('timerColor', selectedColor);
  
    alert('설정이 저장되었습니다');
  });

window.addEventListener('DOMContentLoaded', () => {
  const savedBackground = localStorage.getItem('timerBackground');
  const savedColor = localStorage.getItem('timerColor');
ㄴ
  if (savedBackground) {
    document.getElementById('background-select').value = savedBackground;
  }

  if (savedColor) {
    document.getElementById('color-select').value = savedColor;
  }
});

  