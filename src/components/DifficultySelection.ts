import { startGame, resumeGame, loadGame } from "../logic/GameLogic";
import { fetchCategories } from "../logic/Api";

let isRendered = false;

export function renderDifficultySelection(container: HTMLElement) {
  if (isRendered) {
    console.log("renderDifficultySelection already rendered, skipping");
    return;
  }
  isRendered = true;

  console.log("renderDifficultySelection called with container:", container);

  container.innerHTML = `
    <div id="difficulty-selection" class="text-center">
      <h1 class="text-3xl md:text-5xl font-bold mb-6 text-yellow-400">Who Wants to Be a Millionaire</h1>
      <p class="text-lg md:text-2xl mb-4">Select Category and Difficulty:</p>
      <div class="flex flex-col items-center space-y-3 mb-4">
        <select id="category-select" class="text-black">
          <option value="">Any Category</option>
        </select>
      </div>
      <div class="flex flex-col md:flex-row justify-center space-y-3 md:space-y-0 md:space-x-4">
        <button id="easy-btn" class="px-4 py-2 bg-green-600 rounded-full hover:bg-green-700 transition-colors text-base md:text-lg">Easy</button>
        <button id="medium-btn" class="px-4 py-2 bg-yellow-600 rounded-full hover:bg-yellow-700 transition-colors text-base md:text-lg">Medium</button>
        <button id="hard-btn" class="px-4 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors text-base md:text-lg">Hard</button>
      </div>
      <button id="resume-btn" class="mt-4 px-4 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors text-base md:text-lg hidden">Resume Game</button>
    </div>
  `;

  const categorySelect = document.getElementById(
    "category-select"
  ) as HTMLSelectElement;
  const easyBtn = document.getElementById("easy-btn") as HTMLButtonElement;
  const mediumBtn = document.getElementById("medium-btn") as HTMLButtonElement;
  const hardBtn = document.getElementById("hard-btn") as HTMLButtonElement;
  const resumeBtn = document.getElementById("resume-btn") as HTMLButtonElement;

  console.log("Initial DOM elements:", {
    categorySelect,
    easyBtn,
    mediumBtn,
    hardBtn,
    resumeBtn,
  });

  if (!categorySelect || !easyBtn || !mediumBtn || !hardBtn || !resumeBtn) {
    console.error("One or more elements not found in DOM");
    return;
  }

  fetchCategories()
    .then((categories) => {
      console.log("Categories fetched:", categories);
      categorySelect.innerHTML = '<option value="">Any Category</option>';
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id.toString();
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
      console.log(
        "Category select updated with options:",
        categorySelect.options.length
      );
      console.log("Category select HTML:", categorySelect.outerHTML);
    })
    .catch((error) => console.error("Failed to fetch categories:", error));

  if (loadGame()) {
    console.log("Saved game found, showing resume button");
    resumeBtn.classList.remove("hidden");
  }

  const getCategory = () =>
    categorySelect.value ? Number(categorySelect.value) : undefined;

  easyBtn.onclick = () => {
    console.log("Easy button clicked (onclick), category:", getCategory());
    startGame("easy", getCategory());
  };
  mediumBtn.onclick = () => {
    console.log("Medium button clicked (onclick), category:", getCategory());
    startGame("medium", getCategory());
  };
  hardBtn.onclick = () => {
    console.log("Hard button clicked (onclick), category:", getCategory());
    startGame("hard", getCategory());
  };
  resumeBtn.onclick = () => {
    console.log("Resume button clicked (onclick)");
    if (resumeGame()) {
      resumeBtn.classList.add("hidden");
    }
  };

  console.log("Event listeners attached (using onclick)");
}
