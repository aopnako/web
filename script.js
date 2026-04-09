const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

const readJSON = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// ===== Calendar =====
const calendarGrid = document.getElementById("calendarGrid");
const calendarTitle = document.getElementById("calendarTitle");
const monthArc = document.getElementById("monthArc");
const dayEditor = document.getElementById("dayEditor");
const entryForm = document.getElementById("entryForm");
const imageFileInput = document.getElementById("imageFileInput");
const imagePreview = document.getElementById("imagePreview");
const videoInput = document.getElementById("videoInput");
const editorDate = document.getElementById("editorDate");

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let activeDateKey = "";
let stagedImage = "";

function renderMonthArc() {
  if (!monthArc) return;

  monthArc.innerHTML = "";
  const panelHeight = Math.max(monthArc.clientHeight || 500, 360);
  const spacing = panelHeight / 13;

  MONTHS.forEach((label, index) => {
    const y = spacing * (index + 1);
    const curveOffset = Math.sin((index / 11) * Math.PI) * 130;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `month-arc-btn ${index === currentMonth ? "active" : ""}`;
    btn.textContent = label;
    btn.style.top = `${y}px`;
    btn.style.left = `${18 + curveOffset}px`;

    btn.addEventListener("mouseenter", () => {
      btn.classList.add("preview");
      renderCalendar(index);
    });

    btn.addEventListener("mouseleave", () => {
      btn.classList.remove("preview");
      renderCalendar(currentMonth);
    });

    btn.addEventListener("click", () => {
      currentMonth = index;
      renderMonthArc();
      renderCalendar(currentMonth);
    });

    monthArc.appendChild(btn);
  });
}

function renderCalendar(monthIndex = currentMonth) {
  if (!calendarGrid || !calendarTitle) return;

  calendarGrid.innerHTML = "";
  calendarTitle.textContent = `${currentYear} 年 ${monthIndex + 1} 月`;

  const firstDay = new Date(currentYear, monthIndex, 1).getDay();
  const totalDays = new Date(currentYear, monthIndex + 1, 0).getDate();
  const entries = readJSON("tea-calendar-entries", {});

  for (let i = 0; i < firstDay; i += 1) {
    const empty = document.createElement("div");
    empty.className = "day-cell";
    empty.style.visibility = "hidden";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const key = `${currentYear}-${monthIndex + 1}-${day}`;
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
  if (!dayEditor || !editorDate || !videoInput || !imagePreview) return;
  activeDateKey = key;
  stagedImage = data.image || "";
  editorDate.textContent = `编辑 ${key}`;
  videoInput.value = data.video || "";

  if (stagedImage) {
    imagePreview.hidden = false;
    imagePreview.src = stagedImage;
  } else {
    imagePreview.hidden = true;
    imagePreview.removeAttribute("src");
  }

  dayEditor.showModal();
}

if (imageFileInput) {
  imageFileInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      stagedImage = String(reader.result || "");
      imagePreview.hidden = false;
      imagePreview.src = stagedImage;
    };
    reader.readAsDataURL(file);
  });
}

if (entryForm) {
  entryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const entries = readJSON("tea-calendar-entries", {});
    entries[activeDateKey] = {
      image: stagedImage,
      video: videoInput.value.trim()
    };
    writeJSON("tea-calendar-entries", entries);
    dayEditor.close();
    renderCalendar(currentMonth);
  });
}

if (monthArc) {
  renderMonthArc();
  renderCalendar(currentMonth);
  window.addEventListener("resize", renderMonthArc);
}

// ===== Gallery by teapot periods =====
function initializePeriodGallery() {
  const periodNameInput = document.getElementById("periodNameInput");
  const addPeriodBtn = document.getElementById("addPeriodBtn");
  const periodList = document.getElementById("periodList");
  const periodDetail = document.getElementById("periodDetail");
  const activePeriodTitle = document.getElementById("activePeriodTitle");
  const renamePeriodBtn = document.getElementById("renamePeriodBtn");
  const deletePeriodBtn = document.getElementById("deletePeriodBtn");
  const periodImageInput = document.getElementById("periodImageInput");
  const waterStream = document.getElementById("waterStream");

  if (!periodList) return;

  let data = readJSON("tea-gallery-periods", []);
  let activeId = data[0]?.id || "";

  const save = () => writeJSON("tea-gallery-periods", data);

  const getActive = () => data.find((item) => item.id === activeId);

  const renderPeriods = () => {
    periodList.innerHTML = "";
    data.forEach((period) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `period-item ${period.id === activeId ? "active" : ""}`;
      btn.innerHTML = `<span class="tiny-pot"></span><span>${period.name}</span>`;
      btn.addEventListener("click", () => {
        activeId = period.id;
        renderPeriods();
        renderDetail();
      });
      periodList.appendChild(btn);
    });
  };

  const renderWaterStream = () => {
    if (!waterStream) return;
    const active = getActive();
    waterStream.innerHTML = "";
    if (!active || active.images.length === 0) {
      waterStream.innerHTML = '<p>还没有图片，上传第一张让茶壶流出回忆吧。</p>';
      return;
    }

    active.images.forEach((imgItem) => {
      const card = document.createElement("article");
      card.className = "stream-item";

      const img = document.createElement("img");
      img.src = imgItem.src;
      img.alt = imgItem.title || "回忆图片";
      card.appendChild(img);

      const footer = document.createElement("footer");
      const editBtn = document.createElement("button");
      editBtn.className = "ghost-btn";
      editBtn.textContent = "改名";
      editBtn.type = "button";
      editBtn.addEventListener("click", () => {
        const nextName = window.prompt("请输入新名字", imgItem.title || "");
        if (nextName === null) return;
        imgItem.title = nextName.trim();
        save();
        renderWaterStream();
      });

      const removeBtn = document.createElement("button");
      removeBtn.className = "ghost-btn danger";
      removeBtn.textContent = "删除";
      removeBtn.type = "button";
      removeBtn.addEventListener("click", () => {
        active.images = active.images.filter((target) => target.id !== imgItem.id);
        save();
        renderWaterStream();
      });

      footer.appendChild(editBtn);
      footer.appendChild(removeBtn);
      card.appendChild(footer);
      waterStream.appendChild(card);
    });
  };

  const renderDetail = () => {
    const active = getActive();
    if (!periodDetail || !activePeriodTitle) return;

    if (!active) {
      periodDetail.hidden = true;
      return;
    }

    periodDetail.hidden = false;
    activePeriodTitle.textContent = active.name;
    renderWaterStream();
  };

  addPeriodBtn?.addEventListener("click", () => {
    const name = periodNameInput?.value.trim();
    if (!name) return;
    const period = {
      id: crypto.randomUUID(),
      name,
      images: []
    };
    data.unshift(period);
    activeId = period.id;
    periodNameInput.value = "";
    save();
    renderPeriods();
    renderDetail();
  });

  renamePeriodBtn?.addEventListener("click", () => {
    const active = getActive();
    if (!active) return;
    const nextName = window.prompt("请输入新时期名字", active.name);
    if (!nextName) return;
    active.name = nextName.trim();
    save();
    renderPeriods();
    renderDetail();
  });

  deletePeriodBtn?.addEventListener("click", () => {
    if (!activeId) return;
    data = data.filter((period) => period.id !== activeId);
    activeId = data[0]?.id || "";
    save();
    renderPeriods();
    renderDetail();
  });

  periodImageInput?.addEventListener("change", (event) => {
    const active = getActive();
    const [file] = event.target.files;
    if (!active || !file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      active.images.unshift({
        id: crypto.randomUUID(),
        title: file.name,
        src: String(reader.result || "")
      });
      save();
      renderWaterStream();
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  });

  renderPeriods();
  renderDetail();
}

initializePeriodGallery();
