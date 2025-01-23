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
let questionIndex = 0;
let wrongAnswersCount = 0;

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
    questionsArray = await fetchQuestions(`./${category}_questions.json`);
  } catch (error) {
    alert("Failed to load questions. Please try again later.");
    return;
  }
  categoryEl.textContent = category.toUpperCase();
  questionsCountEl.textContent = questionsArray.length - questionIndex;
  displayQuestionsBullets();
  displayQuestion(questionsArray[questionIndex]);
  categoryForm.classList.add("hidden");
  quizContainer.classList.remove("hidden");
  setTimer();
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

function setTimer() {
  let remainingTime = 3;

  const timerInterval = setInterval(() => {
    remainingTime--;
    timerEl.textContent = remainingTime;

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      console.log("Time is up");
    }
  }, 1000);
}

function answerQuestion() {
  const isAnAnswerChecked = [...answersContainer.children].some((answer) =>
    answer.classList.contains("checked")
  );
  if (parseInt(questionsCountEl.textContent) > 1 && isAnAnswerChecked) {
    const usersAnswer = [...answersContainer.children].filter((answer) =>
      answer.classList.contains("checked")
    );
    wrongAnswersCount +=
      usersAnswer[0].dataset.answerOption ===
      questionsArray[questionIndex].true_answer
        ? 0
        : 1;
    reset();
    questionsBullets.children[questionIndex].classList.remove("active");
    questionsBullets.children[questionIndex].classList.add("done");
    questionIndex++;
    displayQuestion(questionsArray[questionIndex]);
    questionsCountEl.textContent = questionsArray.length - questionIndex;
    setTimer();
  } else if (!isAnAnswerChecked) {
    alert("Please select an answer!");
  } else if (parseInt(questionsCountEl.textContent) === 1) {
    showResults();
  }
}

function showResults() {
  quizContainer.classList.add("hidden");
  document.querySelector(".result-container").classList.remove("hidden");
  document.querySelector(".wrong-answers-count").textContent = wrongAnswersCount;
  document.querySelector(".total-questions-count").textContent = questionsArray.length;
  document.getElementById("try-again-button").onclick = () => window.location.reload();
}

function reset() {
  answersContainer.innerHTML = "";
}

selectCategoryButton.addEventListener("click", () => {
  setCategory();
});

categoryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    setCategory();
  }
});

submitAnswerButton.addEventListener("click", answerQuestion);

categoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
});
