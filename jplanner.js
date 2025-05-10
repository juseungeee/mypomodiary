const selectedDate = localStorage.getItem('selectedDate');
const dateTitle = document.getElementById('date-title');

if (selectedDate) {
    const dateObj = new Date(selectedDate);

    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1; 
    const date = dateObj.getDate();
    
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const day = dayNames[dateObj.getDay()];
    
    dateTitle.innerText = `${year}년 ${month}월 ${date}일 ${day}`;
  } else {
    dateTitle.innerText = "날짜가 선택되지 않았습니다.";
  }

  document.getElementById('go-to-main').addEventListener('click', () => {
    window.location.href = 'jmainpage.html'; 
  });