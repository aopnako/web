const MONTHS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月"
];

const calendarGrid = document.getElementById("calendarGrid");
const calendarTitle = document.getElementById("calendarTitle");
const monthRing = document.getElementById("monthRing");
const dayEditor = document.getElementById("dayEditor");
const entryForm = document.getElementById("entryForm");
const imageInput = document.getElementById("imageInput");
const videoInput = document.getElementById("videoInput");
const editorDate = document.getElementById("editorDate");

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let activeDateKey = "";

const readData = (key) => JSON.parse(localStorage.getItem(key) || "{}");
const writeData = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function renderMonthRing() {
  if (!monthRing) return;

  monthRing.innerHTML = "";
  const radius = 95;
  const center = 110;

  MONTHS.forEach((label, index) => {
    const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `month-btn ${index === currentMonth ? "active" : ""}`;
    btn.textContent = label;
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    btn.addEventListener("click", () => {
      currentMonth = index;
      renderCalendar();
      renderMonthRing();
    });

    monthRing.appendChild(btn);
  });
}

function renderCalendar() {
  if (!calendarGrid || !calendarTitle) return;

  calendarGrid.innerHTML = "";
  calendarTitle.textContent = `${currentYear} 年 ${currentMonth + 1} 月`;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const entries = readData("tea-calendar-entries");

  for (let i = 0; i < firstDay; i += 1) {
    const empty = document.createElement("div");
    empty.className = "day-cell";
    empty.style.visibility = "hidden";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const key = `${currentYear}-${currentMonth + 1}-${day}`;
    const cell = document.createElement("button");
    cell.className = "day-cell";
    cell.type = "button";

    const number = document.createElement("strong");
    number.textContent = `${day}`;
    cell.appendChild(number);

    if (entries[key]?.image) {
      const img = document.createElement("img");
      img.src = entries[key].image;
      img.alt = `${key} 图片`;
      cell.appendChild(img);
    }

    if (entries[key]?.video) {
      const link = document.createElement("a");
      link.href = entries[key].video;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "查看视频";
      cell.appendChild(link);
    }

    cell.addEventListener("click", () => openEditor(key, entries[key]));
    calendarGrid.appendChild(cell);
  }
}

function openEditor(key, data = {}) {
  if (!dayEditor || !editorDate || !imageInput || !videoInput) return;
  activeDateKey = key;
  editorDate.textContent = `编辑 ${key}`;
  imageInput.value = data.image || "";
  videoInput.value = data.video || "";
  dayEditor.showModal();
}

if (entryForm) {
  entryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const entries = readData("tea-calendar-entries");
    entries[activeDateKey] = {
      image: imageInput.value.trim(),
      video: videoInput.value.trim()
    };
    writeData("tea-calendar-entries", entries);
    dayEditor.close();
    renderCalendar();
  });
}

function initializeGallery() {
  const photoInput = document.getElementById("photoInput");
  const videoInputField = document.getElementById("galleryVideoInput");
  const addVideoBtn = document.getElementById("addVideoBtn");
  const galleryGrid = document.getElementById("galleryGrid");
  if (!galleryGrid) return;

  const renderGallery = () => {
    const items = JSON.parse(localStorage.getItem("tea-gallery-items") || "[]");
    galleryGrid.innerHTML = "";

    items.forEach((item) => {
      const wrap = document.createElement("article");
      wrap.className = "gallery-item";
      if (item.type === "image") {
        const img = document.createElement("img");
        img.src = item.src;
        img.alt = "我的照片";
        wrap.appendChild(img);
      } else {
        const iframe = document.createElement("iframe");
        iframe.src = item.src;
        iframe.loading = "lazy";
        iframe.height = "180";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        wrap.appendChild(iframe);
      }
      galleryGrid.appendChild(wrap);
    });
  };

  const addItem = (item) => {
    const items = JSON.parse(localStorage.getItem("tea-gallery-items") || "[]");
    items.unshift(item);
    localStorage.setItem("tea-gallery-items", JSON.stringify(items));
    renderGallery();
  };

  photoInput?.addEventListener("change", (e) => {
    const [file] = e.target.files;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => addItem({ type: "image", src: reader.result });
    reader.readAsDataURL(file);
    e.target.value = "";
  });

  addVideoBtn?.addEventListener("click", () => {
    const url = videoInputField?.value.trim();
    if (!url) return;
    addItem({ type: "video", src: url });
    videoInputField.value = "";
  });

  renderGallery();
}

renderMonthRing();
renderCalendar();
initializeGallery();
