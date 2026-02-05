 let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {

  generateCalendar();
  document.getElementById('prevMonth').addEventListener('click', previousMonth);
  document.getElementById('nextMonth').addEventListener('click', nextMonth);

  function generateCalendar() {
    const calendarBody = document.getElementById('calendarBody');

    const monthYear = document.getElementById('monthYear');
    const monthNames = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`


    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let calendarDays = "";
    let day = 1;

    for (let i = 0; i < 6; i++) {

      let week = '<tr>';
      
      for (let j = 0; j < 7; j++) {
        
        if (i === 0 && j < firstDay) {
          week +='<td class="empty"></td>'
        } else if (day > daysInMonth) {
          week +='<td class="empty"></td>'
          break;
        }

        else {
          week += `<td> ${day}</td>`;
          day++;
        }
        
      }
      week += '</tr>'
      calendarDays += week;

      if(day > daysInMonth) break
    }

    calendarBody.innerHTML = calendarDays;
  }
  function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar();
  }

  function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++
    }
    generateCalendar();
    
  }
});