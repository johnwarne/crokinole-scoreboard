// Create a new Vue instance
const app = new Vue({
  el: '#app',
  data: {
    players: [],
    timeout: null,
    score: {
      min: 0,
      max: 100,
      increment: 5,
    },
    standard_score: {
      min: 0,
      max: 100,
      increment: 5,
    },
    tournament_score: {
      min: 0,
      max: 4,
      increment: 1,
    },
    modal: {
      visible: false,
      title: 'Settings',
      message: '',
      show_header: true,
      show_reset: true,
      show_settings: true,
    },
    colors: [
      '#C1A469', // natural
      '#222222', // black
      '#881814', // red
      '#126A51', // green
      '#1F3A93', // blue
      '#FFFFFF', // white
    ],
    wakeLock: null,
  },
  methods: {
    loadData() {
      if (typeof(Storage) !== 'undefined' && localStorage.getItem('players') !== null) {
        this.players = JSON.parse(localStorage.getItem('players'));
        this.score = JSON.parse(localStorage.getItem('score'));
      } else if(this.players.length < 2) {
        this.addPlayer();
        if(this.players.length < 2) {
          this.addPlayer();
        }
      }
    },
    saveData() {
      localStorage.setItem('players', JSON.stringify(this.players));
      localStorage.setItem('score', JSON.stringify(this.score));
    },
    resetData() {
      localStorage.removeItem('players');
      localStorage.removeItem('score');
      this.players = [];
      this.score.min = 0;
      this.score.max = 100;
      this.score.increment = 5;
      this.loadData();
    },
    incrementScore(player, event) {
      if(this.timeout) return;
      if(!event.target.classList.contains('disabled')) {
        if(player.score < this.score.max) player.score = parseInt(player.score) + this.score.increment;
      }
    },
    decrementScore(player, event) {
      if(!event.target.classList.contains('disabled')) {
        if(player.score > this.score.min) player.score = parseInt(player.score) - this.score.increment;
      }
    },
    resetScore() {
      for (let i = 0; i < this.players.length; i++) {
        this.players[i].score = this.score.min;
      }
    },
    addPlayer() {
      if(this.players.length < 4) {
        this.players.push({
          name: 'Player ' + (this.players.length + 1),
          score: this.score.min,
          color: this.colors[this.players.length],
        });
      }
    },
    removePlayer(index) {
      this.players.splice(index, 1);
    },
    randomHexColor() {
      // make sure it's dark enough
      let color = '#';
      let letters = '0123456789ABCDEF';
      do {
        color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
      } while(this.isLight(color));
      return color;
    },
    isLight(color) {
      // https://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black
      let r = parseInt(color.substr(1,2),16);
      let g = parseInt(color.substr(3,2),16);
      let b = parseInt(color.substr(5,2),16);
      let yiq = ((r*299)+(g*587)+(b*114))/1000;
      return (yiq >= 128);
      // return (yiq >= 170); // prefer white text on light colors
    },
    convertCssColorToHex(color) {
      // https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes
      let a = document.createElement('div');
      a.style.color = color;
      let colors = window.getComputedStyle(document.body.appendChild(a)).color.match(/\d+/g).map(function(a){ return parseInt(a,10); });
      document.body.removeChild(a);
      return '#' + colors.map(function(a){ return ('0' + a.toString(16)).slice(-2); }).join('');
    },
    setPlayerTextColor(player) {
      if(this.isLight(player.color)) {
        return '#222222';
      }
      return '#FFFFFF';
    },
    removePlayer(index) {
      this.players.splice(index, 1);
    },
    changeColor(player) {
      // use native color picker
      let color = prompt('Enter a hex color code', player.color);
      if(color !== null) {
        player.color = color;
      }
    },
    sortPlayers() {
      this.players.sort(function(a, b) {
        return b.score - a.score;
      });
    },
    selectAll(event) {
      // when input is selected, select all text
      event.target.select();
    },
    nameCheck() {
      if(this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(() => {
        this.timeout = null;
      }, 200);
      // Each player name in the players object must not be blank and must be unique
      let names = [];
      for (let i = 0; i < this.players.length; i++) {
        if(this.players[i].name === '' || names.includes(this.players[i].name)) {
          this.players[i].name = 'Player ' + (i + 1);
        }
        names.push(this.players[i].name);
      }
    },
    scoreCheck() {
      if(this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(() => {
        this.timeout = null;
      }, 200);
      // Each player score in the players object must be an integer between 0 and 100 divisible by 5
      for (let i = 0; i < this.players.length; i++) {
        if(this.players[i].score < this.score.min || this.players[i].score > this.score.max) {
          this.players[i].score = this.score.min;
        }
        if(isNaN(this.players[i].score)) {
          this.players[i].score = this.score.min;
        }
        if(this.players[i].score === '') {
          this.players[i].score = this.score.min;
        }
        this.players[i].score = Math.round(this.players[i].score / this.score.increment) * this.score.increment;
      }
    },
    scoreMaxCheck() {
      if(this.score.max <= this.score.min + this.score.increment * 2) {
        this.score.max = this.score.min + this.score.increment * 2;
      }
      if(isNaN(this.score.max)) {
        this.score.max = this.standard_score.max;
      }
      if(this.score.max === '') {
        this.score.max = this.standard_score.max;
      }
      // If it's not divisible by the increment, round it up
      this.score.max = Math.ceil(this.score.max / this.score.increment) * this.score.increment;
      // If any player's score is at or above the new max, set it to one increment below the new max
      for (let i = 0; i < this.players.length; i++) {
        if(this.players[i].score >= this.score.max) {
          this.players[i].score = this.score.max - this.score.increment;
        }
      }
    },
    openModal(show_header = true, show_settings = true, show_reset = true, title = 'Settings', message = '') {
      this.modal.show_header = show_header;
      this.modal.show_reset = show_reset;
      this.modal.show_settings = show_settings;
      this.modal.title = title;
      this.modal.message = message;
      this.modal.visible = true;
    },
    closeModal(event) {
      if(event.target.classList.contains('close') || event.target.classList.contains('overlay')) {
        this.modal.visible = false;
      }
    },
    openSettingsModal() {
      this.openModal(show_header = true, show_settings = true, show_reset = true, title = 'Game Settings', message = '');
    },
    numberOfCharacters(val) {
      return val.length || 1;
    },
    launchConfetti() {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    },
    isIOS() {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test( userAgent );
    },
    isInStandaloneMode() {
      return ('standalone' in window.navigator) && (window.navigator.standalone);
    },
    keepScreenAwake() {
      if(this.wakeLock !== null) return;
      if ('wakeLock' in navigator) {
        let wakeLock = null;
        const wakeLockEnable = async () => {
          try {
            wakeLock = await navigator.wakeLock.request('screen');
            this.wakeLock = wakeLock;
            wakeLock.addEventListener('release', () => {});
          } catch (err) {
            console.error(`${err.name}, ${err.message}`);
          }
        }
        wakeLockEnable();
      }
    },
  },
  watch: {
    players: {
      handler: function (val, oldVal) {
        this.saveData();
        for (let i = 0; i < this.players.length; i++) {
          this.players[i].color = this.convertCssColorToHex(this.players[i].color);
          this.setPlayerTextColor(this.players[i]);
        }
      },
      deep: true,
    },
    score: {
      handler: function (val, oldVal) {
        this.saveData();
      },
      deep: true,
    },
  },
  computed: {
    bg_color: {
      get() {
        if (this.players.length === 0) {
          return '#222222';
        }
        return this.players[this.players.length - 1].color;
      },
    },
    game_is_underway: {
      get() {
        for (let i = 0; i < this.players.length; i++) {
          if(this.players[i].score > this.score.min) {
            return true;
          }
        }
        return false;
      },
    },
    game_is_over: {
      get() {
        for (let i = 0; i < this.players.length; i++) {
          if(this.players[i].score >= this.score.max) {
            return true;
          }
        }
        return false;
      },
    },
    winner: {
      get() {
        for (let i = 0; i < this.players.length; i++) {
          if(this.players[i].score >= this.score.max && document.activeElement.id !== 'score-max') {
            console.log(this.players[i].name + ' wins!');
            this.launchConfetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
            return this.players[i];
          }
        }
        return null;
      },
    },
  },
  mounted() {
    this.loadData();
    // Add to home screen notification on iOS
    if (this.isIOS() && !this.isInStandaloneMode() && localStorage.getItem('ios_pwa_notification_shown') === null) {
      this.openModal(show_header = true, show_settings = false, show_reset = false, title = 'Install', message = '<p>To install this web app on your home screen:</p><ol><li>Tap the <span @click="addToHomeScreen">share button <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M18 8h-2c-.55 0-1 .45-1 1s.45 1 1 1h2v11H6V10h2c.55 0 1-.45 1-1s-.45-1-1-1H6c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2"/><path fill="currentColor" d="M12 16c.55 0 1-.45 1-1V5h1.79c.45 0 .67-.54.35-.85l-2.79-2.79c-.2-.2-.51-.2-.71 0L8.85 4.15a.5.5 0 0 0 .36.85H11v10c0 .55.45 1 1 1"/></svg></span></li><li>Tap <strong>Add to Home Screen</strong> <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H5V5h14zm-8-2h2v-4h4v-2h-4V7h-2v4H7v2h4z"/></svg></li></ol>');
      localStorage.setItem('ios_pwa_notification_shown', 'true');
    }
  }
});
