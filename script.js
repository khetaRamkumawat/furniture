
// EmailJS Config
const EMAILJS_PUBLIC_KEY = "QGTD16YNQCEIPJn5j";
const EMAILJS_SERVICE_ID = "service_dr5n82o";
const EMAILJS_TEMPLATE_ID = "template_f89d1nm";
const EMAILJS_CONTACT_TEMPLATE = "template_contact";

document.addEventListener("DOMContentLoaded", () => {
  emailjs.init(EMAILJS_PUBLIC_KEY);
});


// Cart State
let cart = [];
const cartCountEl = document.getElementById("cartCount");
const cartTableBody = document.getElementById("cartTableBody");
const grandTotalEl = document.getElementById("grandTotal");
const orderForm = document.getElementById("orderForm");
const orderJsonEl = document.getElementById("order_json");
const orderTotalEl = document.getElementById("order_total");


// Product Cards
const allProductCards = Array.from(document.querySelectorAll(".product-card"));
let filteredProducts = [...allProductCards]; // initially all
let currentPage = 1;
const productsPerPage = 6;

const productsWrapper = document.querySelector("#Products .row.g-4");

// Pagination UI container
const paginationContainer = document.createElement("div");
paginationContainer.className = "d-flex justify-content-center mt-4";
paginationContainer.id = "pagination";
productsWrapper.after(paginationContainer);

// Render Products with Pagination
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // hide all
  allProductCards.forEach((p) => p.parentElement.classList.add("d-none"));

  // show current page
  let start = (currentPage - 1) * productsPerPage;
  let end = start + productsPerPage;
  filteredProducts.slice(start, end).forEach((p) =>
    p.parentElement.classList.remove("d-none")
  );

  // pagination buttons
  paginationContainer.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    let btn = document.createElement("button");
    btn.className = `btn btn-sm mx-1 ${
      i === currentPage ? "btn-primary" : "btn-outline-primary"
    }`;
    btn.innerText = i;
    btn.addEventListener("click", () => {
      currentPage = i;
      renderPagination();
    });
    paginationContainer.appendChild(btn);
  }

  // if no result
  if (filteredProducts.length === 0) {
    productsWrapper.innerHTML =
      '<p class="text-center text-muted">No products found!</p>';
    paginationContainer.innerHTML = "";
  }
}
renderPagination();

// Search + Filter
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");

function filterProducts() {
  let searchText = searchInput.value.toLowerCase();
  let filterValue = filterSelect ? filterSelect.value : "all";

  filteredProducts = allProductCards.filter((card) => {
    let title = card.querySelector(".card-title").innerText.toLowerCase();
    let matchSearch = title.includes(searchText);
    let matchFilter =
      filterValue === "all" || title.includes(filterValue.toLowerCase());
    return matchSearch && matchFilter;
  });

  currentPage = 1;
  renderPagination();
}

// Search form submit  scroll to Products
document
  .getElementById("searchForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    if (searchInput.value.trim() !== "") {
      document
        .getElementById("Products")
        .scrollIntoView({ behavior: "smooth" });
      filterProducts();
    }
  });

if (searchInput) searchInput.addEventListener("input", filterProducts);
if (filterSelect) filterSelect.addEventListener("change", filterProducts);


// Category Buttons
const categoryButtons = document.querySelectorAll(".category-btn");
if (categoryButtons) {
  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      categoryButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      let selectedCategory = this.dataset.category.toLowerCase();

      filteredProducts = allProductCards.filter((card) => {
        let title = card.querySelector(".card-title").innerText.toLowerCase();
        return (
          selectedCategory === "all" || title.includes(selectedCategory)
        );
      });

      currentPage = 1;
      renderPagination();
    });
  });
}

// Add to Cart
document.querySelectorAll(".add-to-cart").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price, 10);
    const existing = cart.find((i) => i.name === name);
    if (existing) existing.qty += 1;
    else cart.push({ name, price, qty: 1 });

    renderCart();
    Swal.fire({
      toast: true,
      position: "top-end",
      timer: 1400,
      showConfirmButton: false,
      icon: "success",
      title: "Added to cart",
    });
  });
});

// Render Cart
function renderCart() {
  cartTableBody.innerHTML = "";
  let total = 0;

  cart.forEach((item, idx) => {
    const subtotal = item.price * item.qty;
    total += subtotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${item.name}</td>
      <td class="text-end">₹${item.price.toLocaleString("en-IN")}</td>
      <td>
        <div class="input-group input-group-sm">
          <button class="btn btn-outline-secondary qty-minus" data-idx="${idx}" type="button">-</button>
          <input type="number" min="1" class="form-control text-center qty-input" data-idx="${idx}" value="${item.qty}">
          <button class="btn btn-outline-secondary qty-plus" data-idx="${idx}" type="button">+</button>
        </div>
      </td>
      <td class="text-end">₹${subtotal.toLocaleString("en-IN")}</td>
      <td><button class="btn btn-sm btn-danger remove-item" data-idx="${idx}">Remove</button></td>
    `;
    cartTableBody.appendChild(tr);
  });

  grandTotalEl.textContent = "₹" + total.toLocaleString("en-IN");
  cartCountEl.textContent = cart.reduce((a, c) => a + c.qty, 0);

  // qty update
  cartTableBody.querySelectorAll(".qty-minus").forEach((b) => {
    b.onclick = () => {
      const i = +b.dataset.idx;
      cart[i].qty = Math.max(1, cart[i].qty - 1);
      renderCart();
    };
  });
  cartTableBody.querySelectorAll(".qty-plus").forEach((b) => {
    b.onclick = () => {
      const i = +b.dataset.idx;
      cart[i].qty += 1;
      renderCart();
    };
  });
  cartTableBody.querySelectorAll(".qty-input").forEach((inp) => {
    inp.onchange = () => {
      const i = +inp.dataset.idx;
      cart[i].qty = Math.max(1, parseInt(inp.value || "1", 10));
      renderCart();
    };
  });
  cartTableBody.querySelectorAll(".remove-item").forEach((b) => {
    b.onclick = () => {
      const i = +b.dataset.idx;
      cart.splice(i, 1);
      renderCart();
    };
  });
}

// View Cart
const cartModal = new bootstrap.Modal(document.getElementById("cartModal"));
document.getElementById("viewCartBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    Swal.fire({ icon: "info", title: "Your cart is empty" });
    return;
  }
  cartModal.show();
  renderCart();
});

// Checkout → EmailJS
document.getElementById("checkoutBtn").addEventListener("click", async () => {
  if (cart.length === 0) {
    Swal.fire({ icon: "info", title: "Add some items first" });
    return;
  }
  if (!orderForm.reportValidity()) return;

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  orderJsonEl.value = JSON.stringify(cart, null, 2);
  orderTotalEl.value = total;

  const btn = document.getElementById("checkoutBtn");
  btn.disabled = true;
  btn.textContent = "Processing...";

  try {
    await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, orderForm);
    orderForm.reset();
    cartModal.hide();
    setTimeout(() => {
      cart = [];
      renderCart();
    }, 300);
    Swal.fire({
      icon: "success",
      title: "Order Confirmed!",
      text: "Your order has been placed. Confirmation email sent.",
    });
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to send email. Check your keys.",
    });
  } finally {
    btn.disabled = false;
    btn.textContent = "Place Order";
  }
});

// Contact Form → EmailJS
const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        let name = document.getElementById("name").value.trim();
        let email = document.getElementById("email").value.trim();
        let message = document.getElementById("message").value.trim();
        let phone = document.getElementById("phone").value.trim();
        let subject = document.getElementById("subject").value.trim();

        // Validation
        if (name === "" || email === "" || message === "") {
            Swal.fire("Error", "All fields are required!", "error");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            Swal.fire("Error", "Please enter a valid email!", "error");
            return;
        }

        // 🔹 First mail
        emailjs.send("service_dr5n82o", "template_f89d1nm", {
            from_name: name,
            from_email: email,
            message: message,
            phone: phone,
            subject: subject
        }, "QGTD16YNQCEIPJn5j").then(
            function () {
                Swal.fire("Success", "Message send successfully!", "success");
                contactForm.reset();
            },
            function (error) {
                Swal.fire("Error", "Failed to send message to Email", "error");
            }
        );

        // 🔹 Second mail
        emailjs.send("service_8k2fj3r", "template_iqrooni", {
            from_name: name,
            from_email: email,
            message: message,
            phone: phone,
            subject: subject
        }, "x3iRyxeN9gYtv3rhQ").then(
            function () {
                console.log("Message also sent to Email-2 successfully!");
            },
            function (error) {
                console.log("Error sending to Email-2", error);
            }
        );
    });
}

// =====================
// Cursor-follow Zoom + Modal Preview
// =====================
document.querySelectorAll('.zoom-wrap').forEach(function (wrap) {
  const img = wrap.querySelector('.zoom-img');

  function setOrigin(e) {
    const rect = wrap.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;  // 0–100%
    const y = ((e.clientY - rect.top)  / rect.height) * 100; // 0–100%
    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = 'scale(1.3)';
  }

  wrap.addEventListener('mousemove', setOrigin);

  wrap.addEventListener('mouseenter', function(e){
    setOrigin(e);
  });

  wrap.addEventListener('mouseleave', function(){
    img.style.transformOrigin = 'center center';
    img.style.transform = 'scale(1)';
  });
});

// =====================
// Image Modal
// =====================
document.querySelectorAll('.image-wrapper').forEach(wrapper => {
  const img = wrapper.querySelector('.zoom-img');

  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`; // zoom ko cursor ke hisaab se shift karo
  });

  wrapper.addEventListener('mouseleave', () => {
    img.style.transformOrigin = 'center center';
  });
});
document.querySelectorAll('.image-wrapper').forEach(wrapper => {
  const img = wrapper.querySelector('.zoom-img');
  let zoomed = false;

  // ✅ Desktop zoom effect (cursor follow)
  wrapper.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 768) return; // Disable for mobile
    const rect = wrapper.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    img.style.transform = "scale(2)";
    img.style.transformOrigin = `${x}% ${y}%`;
  });

  wrapper.addEventListener('mouseleave', () => {
    if (window.innerWidth <= 768) return;
    img.style.transform = "scale(1)";
    img.style.transformOrigin = "center center";
  });

  // ✅ Mobile (tap to zoom)
  wrapper.addEventListener('click', () => {
    if (window.innerWidth > 768) return; // Disable for desktop
    if (!zoomed) {
      img.style.transform = "scale(2)";
      img.style.transformOrigin = "center center";
      zoomed = true;
      wrapper.style.cursor = "zoom-out";
    } else {
      img.style.transform = "scale(1)";
      zoomed = false;
      wrapper.style.cursor = "zoom-in";
    }
  });
});
document.querySelectorAll('.image-wrapper').forEach(wrapper => {
  const img = wrapper.querySelector('.zoom-img');
  const magnifier = wrapper.querySelector('.magnifier');
  let zoomed = false;

  // Desktop magnifier
  wrapper.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 768) return;
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    magnifier.style.display = "block";
    magnifier.style.left = `${x - 60}px`; // center magnifier
    magnifier.style.top = `${y - 60}px`;

    magnifier.style.backgroundImage = `url(${img.src})`;
    magnifier.style.backgroundPosition = `${-(x*2 - 60)}px ${-(y*2 - 60)}px`;
  });

  wrapper.addEventListener('mouseleave', () => {
    if (window.innerWidth <= 768) return;
    magnifier.style.display = "none";
  });

  // Mobile tap zoom
  wrapper.addEventListener('click', () => {
    if (window.innerWidth > 768) return;
    if (!zoomed) {
      img.style.transform = "scale(2)";
      img.style.transformOrigin = "center center";
      zoomed = true;
    } else {
      img.style.transform = "scale(1)";
      zoomed = false;
    }
  });
});
