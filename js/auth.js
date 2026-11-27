/* Alvacea — demo autentikasi (client-side)
   Catatan: ini demo statis. Akun disimpan di file ini, bukan di server. */

(function () {
  'use strict';

  var KEY = 'alvacea.auth';

  var ACCOUNTS = [
    { username: 'charlene', password: 'tawas2026', name: 'Charlene' }
  ];

  function readSession() {
    try {
      var raw = localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || typeof data.username !== 'string') return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  function writeSession(data, remember) {
    var target = remember ? localStorage : sessionStorage;
    var other = remember ? sessionStorage : localStorage;
    try {
      other.removeItem(KEY);
      target.setItem(KEY, JSON.stringify(data));
    } catch (err) { /* storage penuh atau diblokir */ }
  }

  function clearSession() {
    try {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(KEY);
    } catch (err) { /* noop */ }
  }

  var auth = {
    user: readSession(),

    isLoggedIn: function () { return !!auth.user; },

    login: function (username, password, remember) {
      var u = String(username || '').trim().toLowerCase();
      var p = String(password || '');
      var found = null;

      for (var i = 0; i < ACCOUNTS.length; i++) {
        if (ACCOUNTS[i].username === u && ACCOUNTS[i].password === p) {
          found = ACCOUNTS[i];
          break;
        }
      }

      if (!found) return false;

      auth.user = { username: found.username, name: found.name, ts: Date.now() };
      writeSession(auth.user, remember !== false);
      return true;
    },

    logout: function () {
      clearSession();
      auth.user = null;
      renderHeader();
    }
  };

  function initial(name) {
    var c = String(name || '?').trim().charAt(0);
    return (c || '?').toUpperCase();
  }

  /* ---- header: tombol masuk / chip akun ---- */

  function renderHeader() {
    var slots = document.querySelectorAll('[data-auth-slot]');
    if (!slots.length) return;

    Array.prototype.forEach.call(slots, function (slot) {
      slot.textContent = '';

      if (auth.user) {
        var chip = document.createElement('a');
        chip.className = 'auth-chip';
        chip.href = 'login.html';
        chip.title = 'Akun ' + auth.user.name;
        chip.setAttribute('aria-label', 'Akun ' + auth.user.name);

        var av = document.createElement('span');
        av.className = 'auth-avatar';
        av.textContent = initial(auth.user.name);

        var nm = document.createElement('span');
        nm.className = 'auth-chip-name';
        nm.textContent = auth.user.name;

        chip.appendChild(av);
        chip.appendChild(nm);

        var out = document.createElement('button');
        out.type = 'button';
        out.className = 'auth-out';
        out.textContent = 'Keluar';
        out.addEventListener('click', function () { auth.logout(); });

        slot.appendChild(chip);
        slot.appendChild(out);
      } else {
        var link = document.createElement('a');
        link.className = 'auth-entry';
        link.href = 'login.html';
        link.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
          '<circle cx="12" cy="8.5" r="3.6" stroke="currentColor" stroke-width="1.7"/>' +
          '<path d="M4.8 20c.9-3.7 3.7-5.6 7.2-5.6s6.3 1.9 7.2 5.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
          '</svg><span>Masuk</span>';
        slot.appendChild(link);
      }
    });
  }

  /* ---- halaman login ---- */

  function initLoginPage() {
    var form = document.getElementById('loginForm');
    if (!form) return;

    var userInput = document.getElementById('username');
    var passInput = document.getElementById('password');
    var remember = document.getElementById('remember');
    var error = document.getElementById('loginError');
    var note = document.getElementById('loginNote');
    var toggle = document.getElementById('pwToggle');
    var fill = document.getElementById('demoFill');
    var done = document.getElementById('authDone');
    var doneName = document.getElementById('doneName');
    var doneLogout = document.getElementById('doneLogout');
    var panel = document.getElementById('authFormPanel');

    function hideMessages() {
      if (error) error.hidden = true;
      if (note) note.hidden = true;
    }

    function showError(msg) {
      hideMessages();
      if (!error) return;
      error.textContent = msg;
      error.hidden = false;
    }

    function showNote(msg) {
      hideMessages();
      if (!note) return;
      note.textContent = msg;
      note.hidden = false;
    }

    function showLoggedIn() {
      if (!done || !panel) return;
      panel.hidden = true;
      done.hidden = false;
      if (doneName) doneName.textContent = auth.user ? auth.user.name : '';
      var doneAvatar = document.getElementById('doneAvatar');
      if (doneAvatar && auth.user) doneAvatar.textContent = initial(auth.user.name);
    }

    if (auth.user) showLoggedIn();

    if (toggle && passInput) {
      toggle.addEventListener('click', function () {
        var isPw = passInput.type === 'password';
        passInput.type = isPw ? 'text' : 'password';
        toggle.textContent = isPw ? 'Sembunyi' : 'Lihat';
        toggle.setAttribute('aria-label', isPw ? 'Sembunyikan password' : 'Tampilkan password');
        passInput.focus();
      });
    }

    if (fill && userInput && passInput) {
      fill.addEventListener('click', function () {
        userInput.value = ACCOUNTS[0].username;
        passInput.value = ACCOUNTS[0].password;
        hideMessages();
        passInput.focus();
      });
    }

    var forgot = document.getElementById('forgotLink');
    if (forgot) {
      forgot.addEventListener('click', function (e) {
        e.preventDefault();
        showNote('Demo statis: fitur reset password belum aktif. Gunakan akun demo di bawah untuk masuk.');
      });
    }

    var register = document.getElementById('registerLink');
    if (register) {
      register.addEventListener('click', function (e) {
        e.preventDefault();
        showNote('Demo statis: pendaftaran belum aktif. Pakai akun demo di bawah, ya.');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideMessages();

      var u = userInput ? userInput.value.trim() : '';
      var p = passInput ? passInput.value : '';

      if (!u || !p) {
        showError('Username dan password wajib diisi.');
        return;
      }

      if (!auth.login(u, p, remember ? remember.checked : true)) {
        showError('Username atau password salah. Coba akun demo di bawah.');
        if (passInput) { passInput.value = ''; passInput.focus(); }
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Masuk…';
      }

      var next = new URLSearchParams(window.location.search).get('next');
      var target = next && /^[\w.-]+\.html$/.test(next) ? next : 'index.html';
      window.location.href = target;
    });

    if (doneLogout) {
      doneLogout.addEventListener('click', function () {
        auth.logout();
        if (panel) panel.hidden = false;
        if (done) done.hidden = true;
        hideMessages();
        if (userInput) userInput.focus();
      });
    }
  }

  renderHeader();
  initLoginPage();

  window.AlvaceaAuth = auth;
})();
