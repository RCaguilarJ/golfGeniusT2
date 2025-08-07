document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('leaderboard-list');
  const loader = document.getElementById('loader');
  const snackbar = document.getElementById('snackbar');

  function showLoader() {
    loader.style.display = 'block';
  }

  function hideLoader() {
    loader.style.display = 'none';
  }

  function formatHour(date) {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  function showSnackbar(message) {
    snackbar.textContent = message;
    snackbar.classList.add('show');
    setTimeout(() => {
      snackbar.classList.remove('show');
    }, 3000);
  }

  function renderLeaderboard() {
    const start = Date.now();
    showLoader();

    const apiUrl = `api/api_proxy.php`;

    const previousScores = {};
    document.querySelectorAll('.leaderboard-card').forEach(card => {
      const name = card.querySelector('.name')?.textContent?.trim();
      const score = card.querySelector('.score')?.textContent?.trim();
      if (name && score) previousScores[name] = score;
    });

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const results = data.results;
        const roster = data.roster;
        list.innerHTML = '';

        results.forEach(player => {
          const [lastName = '', firstName = ''] = player.name.split(', ');
          const displayName = `${firstName.charAt(0)}. ${lastName}`.toUpperCase();
          const cardId = player.member_card_id;

          const photoURL = roster[cardId] && roster[cardId].startsWith('http')
            ? roster[cardId]
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&rounded=true&size=56`;

          const lastRound = player.rounds[player.rounds.length - 1] || {};
          const thru = lastRound.thru || '-';

          let scoreClass = 'even';
          if (player.score.startsWith('-')) scoreClass = 'negative';
          else if (player.score.startsWith('+')) scoreClass = 'positive';

          const card = document.createElement('div');
          card.className = 'leaderboard-card';
          card.innerHTML = `
            <div class="card-content">
              <div class="position-box">${player.position}</div>
              <img src="${photoURL}" class="leaderboard-img" alt="Foto de ${displayName}">
              <div class="name">${displayName}</div>
              <span class="score ${scoreClass}">${player.score}</span>
              <span class="thru">Thru ${thru}</span>
            </div>
          `;

          list.appendChild(card);

          const oldScore = previousScores[displayName];
          if (oldScore && oldScore !== player.score) {
            const el = card.querySelector('.score');
            el.style.transform = 'scale(1.3)';
            setTimeout(() => { el.style.transform = 'scale(1)' }, 300);
          }
        });

        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 1000 - elapsed);
        setTimeout(() => {
          hideLoader();
          const now = new Date();
          showSnackbar(`Leaderboard actualizada - ${formatHour(now)}`);
        }, remaining);
      })
      .catch(error => {
        hideLoader();
        console.error('Error al cargar leaderboard:', error);
        showSnackbar('Error al actualizar leaderboard');
      });
  }

  renderLeaderboard();
  setInterval(renderLeaderboard, 300000); // 5 minutos
});
