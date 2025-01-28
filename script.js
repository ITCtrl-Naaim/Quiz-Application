const categoryForm = document.querySelector(".category-form");
const categoryInput = document.getElementById("categories-choice");
const selectCategoryButton = document.getElementById("select-category-button");
const categoriesArray = Array.from(
  document.getElementById("categories").children
);
const categoryEl = document.querySelector(".category");
const quizContainer = document.querySelector(".quiz-container");
const questionsCountEl = document.querySelector(".questions-count");
const questionEl = document.querySelector(".question");
const answersContainer = document.querySelector(".answers-container");
const submitAnswerButton = document.getElementById("submit-answer-button");
const questionsBullets = document.querySelector(".questions-bullets");
const timerEl = document.querySelector(".timer");
let questionsArray = [];
let questionsLeft;
let questionIndex = 0;
let wrongAnswersCount = 0;
let timerInterval;
let timesUp = false;

window.onload = () => {
  categoryInput.focus();
};

async function fetchQuestions(link) {
  try {
    const data = await (await fetch(link)).json();
    return data;
  } catch (error) {
    throw new Error(error);
  }
}

async function setCategory() {
  const category = categoryInput.value.trim().toLowerCase();
  const doesCategoryExist = categoriesArray.some(
    (option) => option.value === category
  );
  if (!category) {
    alert("Please select or enter a category!");
    return;
  } else if (!doesCategoryExist) {
    alert("Your entered category does not exist!");
    return;
  }
  try {
    questionsArray = await fetchQuestions(`./json_files/${category}_questions.json`);
  } catch (error) {
    alert("Failed to load questions. Please try again later.");
    return;
  }
  categoryEl.textContent = category.toUpperCase();
  questionsLeft = questionsArray.length - questionIndex;
  questionsCountEl.textContent = questionsLeft;
  displayQuestionsBullets();
  displayQuestion(questionsArray[questionIndex]);
  categoryForm.classList.add("hidden");
  quizContainer.classList.remove("hidden");
  setTimer(30);
}

function displayQuestion({ question, answers }) {
  questionEl.textContent = question;
  Object.values(answers).forEach((answer) => {
    const li = document.createElement("li");
    const label = document.createElement("label");
    const input = document.createElement("input");
    li.dataset.answerOption = answer;
    input.type = "radio";
    input.name = "answer";
    label.append(input);
    label.append(answer);
    li.append(label);
    answersContainer.append(li);
    li.addEventListener("click", (e) => {
      [...answersContainer.children].forEach((li) => {
        li.classList.remove("checked");
      });
      e.currentTarget.classList.add("checked");
    });
  });
  questionsBullets.children[questionIndex].classList.add("active");
}

function displayQuestionsBullets() {
  questionsArray.forEach(() => {
    const li = document.createElement("li");
    questionsBullets.append(li);
  });
}

function setTimer(duration) {
  if (questionIndex < questionsArray.length) {
    let minutes, seconds;
    timerInterval = setInterval(() => {
      minutes = parseInt(duration / 60);
      seconds = parseInt(duration % 60);
      timerEl.textContent = `${minutes < 10 ? "0" + minutes : minutes}:${
        seconds < 10 ? "0" + seconds : seconds
      }`;
      if (--duration < 0) {
        clearInterval(timerInterval);
        timesUp = true;
        submitAnswerButton.click();
      }
    }, 1000);
  }
}

function answerQuestion() {
  const isAnAnswerChecked = [...answersContainer.children].some((answer) =>
    answer.classList.contains("checked")
  );
  if (questionsLeft > 1 && isAnAnswerChecked) {
    const usersAnswer = [...answersContainer.children].filter((answer) =>
      answer.classList.contains("checked")
    );
    wrongAnswersCount +=
      usersAnswer[0].dataset.answerOption ===
      questionsArray[questionIndex].true_answer
        ? 0
        : 1;
    nextQuestion();
  } else if (!isAnAnswerChecked && !timesUp) {
    alert("Please select an answer!");
  } else if (!isAnAnswerChecked && timesUp && questionsLeft > 0) {
    wrongAnswersCount += 1;
    nextQuestion();
  } else if (questionsLeft === 1) {
    showResults();
  }
}

function nextQuestion() {
  if (questionsLeft > 1) {
    answersContainer.innerHTML = "";
    clearInterval(timerInterval);
    questionsBullets.children[questionIndex].classList.remove("active");
    questionsBullets.children[questionIndex].classList.add("done");
    questionIndex++;
    displayQuestion(questionsArray[questionIndex]);
    questionsLeft = questionsArray.length - questionIndex;
    questionsCountEl.textContent = questionsLeft;
    setTimer(30);
  } else {
    showResults();
  }
}

function showResults() {
  quizContainer.classList.add("hidden");
  document.querySelector(".result-container").classList.remove("hidden");
  document.querySelector(".wrong-answers-count").textContent =
    wrongAnswersCount;
  document.querySelector(".total-questions-count").textContent =
    questionsArray.length;
  document.getElementById("try-again-button").onclick = () =>
    window.location.reload();
}

selectCategoryButton.addEventListener("click", () => {
  setCategory();
});

categoryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    setCategory();
  }
});

submitAnswerButton.addEventListener("click", () => {
  answerQuestion();
});

categoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
});
