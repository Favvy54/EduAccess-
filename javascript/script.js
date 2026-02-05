// const { AOS } = require("./aos");

document.addEventListener('DOMContentLoaded', () => {

  const counters = document.querySelectorAll('.counter');
  const duration = 2000;
  const frameRate = 16;
  const totalSteps = duration / frameRate;
  const suffix = '+';

  counters.forEach(counter => {
    const target = +counter.dataset.count;
    let count = 0;

    const increment = target / totalSteps; // Adjust the divisor to control speed
    const updateCount = () => {
      count += increment;


      if (count < target) {
        counter.innerText = Math.ceil(count);
        setTimeout(updateCount, frameRate); // Adjust the timeout to control speed
      } else {
        counter.innerText = target + suffix;
      }
    };

    updateCount();
  });

  // Wait for the DOM to fully load
  const filterButtons = document.querySelectorAll(".button-tabs button");
  const resources = document.querySelectorAll(".flashcard, .card");

  function filterResources(filterValue) {
    resources.forEach(item => {
      if (item.dataset.name) {
        
      }
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Remove 'active' class from all buttons
      filterButtons.forEach(btn => btn.classList.remove("active"));
      // Add 'active' to the clicked button
      button.classList.add("active");

      const filterValue = button.dataset.name;

      resources.forEach(item => {
        // const itemCategory = item.dataset.name;

        if (item.dataset.name === filterValue) {
          item.classList.remove("hide");
          item.setAttribute("data-aos", "fade-up");
        } else {
          item.classList.add("hide");
          item.removeAttribute("fade-up");
        }
      });
  
    });
  });

  // AOS.refresh();

  // Show syllabus by default on page load
  document.querySelector('button[data-name="syllabus"]').click();


  const buttons = document.querySelectorAll('.view-syllabus-btn');
  const modal = document.getElementById('syllabusModal');
  const modalTitle = document.getElementById('modalTitle');
  const iframe = document.getElementById('syllabusFrame');
  const downloadBtn = document.getElementById('downloadBtn');
  const closeBtn = document.getElementById('closeModal');

  const openModal = (subject, pdfUrl) => {
    modal.style.display = 'flex';
    modalTitle.textContent = subject + " " + ' Syllabus';
    iframe.src = pdfUrl;
    downloadBtn.href = pdfUrl;
    downloadBtn.download = subject + '-JAMB-Syllabus.pdf';
  };

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const subject = button.dataset.subject;
      const pdfUrl = button.dataset.pdf;
      openModal(subject, pdfUrl);
    });
  });

  // buttons.addEventListener('click', () => { 
  //   supabase.auth.getUser();
  //   if (!user) {
  //     localStorage.setItem('pendingAction', 'openModal');
  //     openSignupPrompt();
  //   }
  //   else {
  //     openModal();
  //   }
  // });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    iframe.src = "";
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.style.display = 'none';
      iframe.src = "";
    }
  });
});