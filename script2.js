popupWhatsApp = () => {
  let btnClosePopup = document.querySelector('.closePopup');
  let btnOpenPopup = document.querySelector('.whatsapp-button');
  let popup = document.querySelector('.popup-whatsapp');
  let sendBtn = document.getElementById('send-btn');

  if (btnClosePopup && popup) {
    btnClosePopup.addEventListener("click", (e) => {
      e.preventDefault();
      popup.classList.toggle('is-active-whatsapp-popup');
    });
  }

  if (btnOpenPopup && popup) {
    btnOpenPopup.addEventListener("click", (e) => {
      e.preventDefault();
      popup.classList.toggle('is-active-whatsapp-popup');
      popup.style.animation = "fadeIn .6s 0.0s both";
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", (e) => {
      e.preventDefault();
      let inputEl = document.getElementById('whats-in');
      let msg = (inputEl && inputEl.value.trim()) ? inputEl.value.trim() : "Hola, necesito asesoría personalizada";
      let relmsg = encodeURIComponent(msg);

      window.open("https://api.whatsapp.com/send/?phone=51970423798&text=" + relmsg, "_blank", "noopener,noreferrer");
    });
  }
};

popupWhatsApp();