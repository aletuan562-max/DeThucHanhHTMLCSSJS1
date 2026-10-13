"use strict";
// Dữ liệu khởi tạo. Được phép chỉnh sửa hoặc thêm thuộc tính nếu cần.
const items = [
  {
    "id": 1,
    "title": "Viết báo cáo HTML",
    "dueDate": "2026-10-20",
    "priority": "Cao",
    "status": "pending"
  },
  {
    "id": 2,
    "title": "Ôn Flexbox",
    "dueDate": "2026-10-23",
    "priority": "Trung bình",
    "status": "pending"
  },
  {
    "id": 3,
    "title": "Làm bài DOM",
    "dueDate": "2026-10-19",
    "priority": "Cao",
    "status": "done"
  },
  {
    "id": 4,
    "title": "Đọc tài liệu CSS",
    "dueDate": "2026-10-25",
    "priority": "Thấp",
    "status": "pending"
  },
  {
    "id": 5,
    "title": "Thiết kế trang cá nhân",
    "dueDate": "2026-10-21",
    "priority": "Trung bình",
    "status": "done"
  }
];

// Tham chiếu tới các phần tử trên trang
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const dueInput = document.querySelector("#task-due");
const priorityInput = document.querySelector("#task-priority");
const errorBox = document.querySelector("#form-error");
const searchInput = document.querySelector("#search-input");
const statusFilter = document.querySelector("#status-filter");
const listEl = document.querySelector("#task-list");
const emptyEl = document.querySelector("#empty-message");
const countEl = document.querySelector("#result-count");

// Id tiếp theo: lớn hơn id lớn nhất hiện có (không bị trùng sau khi xóa)
let nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

// Chuyển "Trung bình" -> "trung-binh" để dùng làm tên class CSS
function priorityClass(priority) {
  return priority
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "-");
}

// "2026-10-20" -> "20/10/2026"
function formatDate(value) {
  if (!value) return "Không có hạn";
  const [y, m, d] = value.split("-");
  return d + "/" + m + "/" + y;
}

// Tạo phần tử với class và nội dung chữ (dùng textContent để tránh chèn HTML)
function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

// C3: Lấy danh sách sau khi áp dụng tìm kiếm + lọc trạng thái
function getVisibleItems() {
  const keyword = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  return items.filter((item) => {
    const matchName = item.title.toLowerCase().includes(keyword);
    const matchStatus = status === "all" || item.status === status;
    return matchName && matchStatus;
  });
}

// C1: Hiển thị dữ liệu từ mảng lên DOM
function render() {
  const visible = getVisibleItems();
  listEl.innerHTML = "";

  visible.forEach((item) => {
    const isDone = item.status === "done";
    const li = createEl("li", "task-item priority-" + priorityClass(item.priority) + (isDone ? " done" : ""));
    li.dataset.id = item.id;

    const info = createEl("div", "task-info");
    info.appendChild(createEl("p", "task-title", item.title));
    const meta = createEl("div", "task-meta");
    meta.appendChild(createEl("span", "", "Hạn: " + formatDate(item.dueDate)));
    meta.appendChild(createEl("span", "prio", "Ưu tiên " + item.priority.toLowerCase()));
    meta.appendChild(createEl("span", "chip" + (isDone ? " chip-done" : ""), isDone ? "Đã hoàn thành" : "Chưa hoàn thành"));
    info.appendChild(meta);

    const actions = createEl("div", "task-actions");
    const toggleBtn = createEl("button", "btn btn-small", isDone ? "Bỏ hoàn thành" : "Hoàn thành");
    toggleBtn.type = "button";
    toggleBtn.dataset.action = "toggle";
    const deleteBtn = createEl("button", "btn btn-small btn-danger", "Xóa");
    deleteBtn.type = "button";
    deleteBtn.dataset.action = "delete";
    actions.append(toggleBtn, deleteBtn);

    li.append(info, actions);
    listEl.appendChild(li);
  });

  emptyEl.hidden = visible.length > 0;
  countEl.textContent = "Hiển thị " + visible.length + "/" + items.length + " công việc";
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
  titleInput.classList.add("invalid");
  titleInput.focus();
}

function clearError() {
  errorBox.textContent = "";
  errorBox.hidden = true;
  titleInput.classList.remove("invalid");
}

// C2: Đọc form, kiểm tra dữ liệu và thêm bản ghi
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (title === "") {
    showError("Vui lòng nhập tên công việc.");
    return;
  }

  clearError();
  items.push({
    id: nextId++,
    title: title,
    dueDate: dueInput.value,
    priority: priorityInput.value,
    status: "pending"
  });

  form.reset(); // xóa nội dung form (ưu tiên trở về "Trung bình")
  render();
});

titleInput.addEventListener("input", clearError);

// C3: Tìm kiếm và lọc cập nhật ngay khi người dùng thao tác
searchInput.addEventListener("input", render);
statusFilter.addEventListener("change", render);

// C4: Đánh dấu hoàn thành / xóa theo ID (event delegation trên danh sách)
listEl.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.closest(".task-item").dataset.id);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return;

  if (button.dataset.action === "toggle") {
    items[index].status = items[index].status === "done" ? "pending" : "done";
  } else if (button.dataset.action === "delete") {
    items.splice(index, 1);
  }
  render();
});

render();