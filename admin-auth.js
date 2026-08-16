document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (window.TourismAuth) window.TourismAuth.logout();
      window.location.href = 'login.html';
    });
  }

  // UI-only gate
  const loggedIn = window.TourismAuth && window.TourismAuth.isLoggedIn();
  if (!loggedIn) {
    window.location.href = 'login.html';
  }
});

