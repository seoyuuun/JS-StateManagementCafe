import { $ } from "./utils/dom.js";
import store from "./store/index.js";
import MenuApi from "./api/index.js";

function App() {
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    dessert: [],
  };

  this.currentCategory = "espresso";

  this.init = async () => {
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
    );
    render();
    initEventListeners();
  };

  const render = async () => {
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
    );
    const template = this.menu[this.currentCategory]
      .map((menuItem, index) => {
        return `
        <li data-menu-id="${
          menuItem.id
        }" class="menu-list-item d-flex items-center py-2">
        <span class="${
          menuItem.isSoldOut ? "sold-out" : ""
        }  w-100 pl-2 menu-name">${menuItem.name}</span>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
        >
          품절
        </button>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
        >
          수정
        </button>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
        >
          삭제
        </button>
      </li>`;
      })
      .join("");
    $("#menu-list").innerHTML = template;
    updateMenuCnt();
  };

  const addMenuName = async () => {
    if ($("#menu-name").value === "") {
      alert("값을 입력해주세요");
      return;
    }

    const duplicatedItem = this.menu[this.currentCategory].find(
      (menuItem) => menuItem.name === $("#menu-name").vaule
    );
    if (duplicatedItem) {
      alert("이미 등록된 메뉴입니다. 다른 메뉴를 입력해주세요");
      $("#menu-name").value = "";
      return;
    }

    const menuName = $("#menu-name").value;
    // this.menu[this.currentCategory].push({ name: menuName });
    await MenuApi.createMenu(this.currentCategory, menuName);
    render();
    $("#menu-name").value = "";
  };

  const updateMenuName = async (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    const $menuName = e.target.closest("li").querySelector(".menu-name");
    const editedMenuName = prompt(
      "수정할 메뉴명을 입력해주세요",
      $menuName.innerText
    );
    await MenuApi.updateMenu(this.currentCategory, editedMenuName, menuId);
    // this.menu[this.currentCategory][menuId].name = editedMenuName;
    // store.setLocalStorage(this.menu);
    render();
  };

  const displaySoldOut = async (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    await MenuApi.toggleSoldOuntMenu(this.currentCategory, menuId);
    // this.menu[this.currentCategory][menuId].soldOut =
    //   !this.menu[this.currentCategory][menuId].soldOut;
    // store.setLocalStorage(this.menu);
    render();
  };

  const deleteMenuName = async (e) => {
    if (confirm("정말 삭제하시겠습니다?")) {
      const menuId = e.target.closest("li").dataset.menuId;
      await MenuApi.deleteMenu(this.currentCategory, menuId);
      render();
    }
  };

  const updateMenuCnt = () => {
    const menuCnt = this.menu[this.currentCategory].length;
    $(".menu-count").innerText = `총 ${menuCnt}개`;
  };

  const changeCategory = (e) => {
    const isCategoryButton = e.target.classList.contains("cafe-category-name");
    if (isCategoryButton) {
      const categoryName = e.target.dataset.categoryName;
      this.currentCategory = categoryName;
      $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
      render();
    }
  };

  const initEventListeners = () => {
    $("#menu-form").addEventListener("submit", (e) => {
      e.preventDefault();
    });

    $("#menu-submit-button").addEventListener("click", addMenuName);

    // 메뉴 input 입력값을 받아온다.
    $("#menu-name").addEventListener("keypress", (e) => {
      if (e.key !== "Enter") {
        return;
      }
      addMenuName();
    });

    $("#menu-list").addEventListener("click", (e) => {
      if (e.target.classList.contains("menu-edit-button")) {
        updateMenuName(e);
        return;
      }
      if (e.target.classList.contains("menu-remove-button")) {
        deleteMenuName(e);
        return;
      }
      if (e.target.classList.contains("menu-sold-out-button")) {
        displaySoldOut(e);
        return;
      }
    });

    $("nav").addEventListener("click", changeCategory);
  };
}

// App();으로 실행하여 Typeerror 발생 -> new 키워드를 사용해서 실행하여 에러 해결
const app = new App();
app.init();
