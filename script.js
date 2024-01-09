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
    modal: {
      visible: false,
      title: '',
      message: '',
    },
    colors: [
      '#C1A469', // natural
      '#222222', // black
      '#881814', // red
      '#126A51', // green
      '#1F3A93', // blue
      '#FFFFFF', // white
    ],
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
    openModal(title, message) {
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
      this.openModal('Game Settings', '');
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
    }
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
          if(this.players[i].score >= this.score.max) {
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
    // this.openSettingsModal();
  }
});


document.addEventListener('visibilitychange', function() {
  // app.loadData();
});


['focus', 'blur', 'visibilitychange'].forEach(function(e) {
  window.addEventListener(e, function() {
    // app.loadData();
  });
});