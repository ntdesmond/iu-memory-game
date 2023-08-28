/* Load card images */
const getCardUrl = (name) => `url('images/${name}.webp')`;

const cardFaceImages = [...Array(10).keys()].map((name) => ({
  name: name,
  url: getCardUrl(name),
}));

const cardFaces = [cardFaceImages, cardFaceImages].flat(); // Use each card twice
const cardBackUrl = getCardUrl("back");

cardFaces.sort(() => 0.5 - Math.random()); // Shuffle cards

/* Define required globals */
const gameGrid = document.querySelector("#cards-grid");
const scoreCounter = document.querySelector("#score");
let chosenIds = [];
let removedCardNames = [];

/* Game functions */
function createBoard() {
  for (let i = 0; i < cardFaces.length; i++) {
    // Fuck img elements, all my homies use background-image CSS property
    var card = document.createElement("div");
    card.classList.add("card");
    card.style.backgroundImage = cardBackUrl;
    card.setAttribute("data-id", i);
    card.addEventListener("click", flipCard);
    gameGrid.appendChild(card);
  }
}

function flipCard() {
  if (chosenIds.length === 2 || this.classList.contains("opened")) {
    return; // Bugfix 1 & 2: don't grab 3 cards or pick the same card twice
  }

  let id = this.getAttribute("data-id");
  this.classList.add("opened");
  this.style.backgroundImage = cardFaces[id].url;
  chosenIds.push(id);
  if (chosenIds.length === 2) {
    setTimeout(checkForMatch, 500);
  }
}

function checkForMatch() {
  const cardNames = chosenIds.map((id) => cardFaces[id].name);
  const cards = document.querySelectorAll(".card");

  if (cardNames[0] === cardNames[1]) {
    chosenIds.forEach((id) => {
      cards[id].style.backgroundImage = "unset";
      cards[id].removeEventListener("click", flipCard); // Bugfix 3: don't return removed cards into game
    });
    removedCardNames.push(cardNames[0]);
  } else {
    chosenIds.forEach((id) => {
      cards[id].style.backgroundImage = cardBackUrl;
      cards[id].classList.remove("opened");
    });
  }

  chosenIds = [];
  scoreCounter.textContent = removedCardNames.length;
  if (removedCardNames.length === cardFaces.length / 2) {
    endGame();
  }
}

function endGame() {
  bonusButton.disabled = true;
  alert("You won!");
}

createBoard();

/* Feature 1: start button */
const startButton = document.querySelector("#start");
const introScreen = document.querySelector("#intro");
startButton.addEventListener("click", startGame);

function startGame() {
  // Show the field
  gameGrid.classList.remove("disabled");
  startButton.style.display = "none";

  // Show the cards (field still is locked)
  document.querySelectorAll(`.card`).forEach((card) => {
    const id = card.getAttribute("data-id");
    card.style.backgroundImage = cardFaces[id].url;
  });

  setTimeout(() => {
    // Hide cards
    document.querySelectorAll(`.card`).forEach((card) => {
      card.style.backgroundImage = cardBackUrl;
    });

    // Enable bonus button and unlock the field
    bonusButton.disabled = false;
    introScreen.style.display = "none";
  }, 1000);
}

/* Feature 2: bonus that allows to see the move */
const bonusCounter = document.querySelector("#bonus-count");
const bonusButton = document.querySelector("#bonus-toggle");
let bonusCount = 0;

function initBonus(initialBonusCount) {
  bonusCount = initialBonusCount;
  bonusCounter.textContent = initialBonusCount;
  bonusButton.disabled = true;
  bonusButton.addEventListener("click", useBonus);
}

function useBonus() {
  this.disabled = true;

  // Find closed (unrevealed) cards
  let remainingCardNames = cardFaces
    .filter((card) => !removedCardNames.includes(card.name))
    .map((card) => card.name);

  // Take random card and highlight it and matching one
  const name =
    remainingCardNames[Math.floor(Math.random() * remainingCardNames.length)];
  [...cardFaces].forEach((card, index) => {
    if (card.name === name) {
      highlightCard(index);
    }
  });

  // Update counter
  bonusCount--;
  bonusCounter.textContent = bonusCount;
  if (bonusCount > 0) {
    setTimeout(() => (this.disabled = false), 1000);
  }
}

function highlightCard(index) {
  const card = document.querySelector(`.card[data-id="${index}"]`);
  card.classList.add("hint");
  setTimeout(() => card.classList.remove("hint"), 1000);
}

initBonus(3);
