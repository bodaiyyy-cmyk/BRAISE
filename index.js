// ========================================
// BRAISE RESTAURANT - MAIN JAVASCRIPT
// ========================================

document.addEventListener("DOMContentLoaded", () => {

  // ========================================
  // 1. ELEMENTS
  // ========================================

  const menuCards = document.querySelectorAll(".dish-card");
  const addToCartButtons = document.querySelectorAll(".add-to-cart");

  const cartOverlay = document.getElementById("cartOverlay");
  const cartDrawer = document.getElementById("cartDrawer");
  const closeCartBtn = document.getElementById("closeCart");

  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotalElement = document.getElementById("cartTotal");

  const cartButtons = document.querySelectorAll(
    ".cart-btn, [data-cart-open], #mobileCartBtn"
  );

  const menuTabs = document.querySelectorAll(".menu-tabs .tab");

  const backToTop = document.getElementById("backToTop");

  const reservationForm = document.getElementById("reservationForm");


  // ========================================
  // 2. CART DATA
  // ========================================

  let cart = JSON.parse(localStorage.getItem("braiseCart")) || [];


  // ========================================
  // 3. SAVE CART
  // ========================================

  function saveCart() {
    localStorage.setItem("braiseCart", JSON.stringify(cart));
  }


  // ========================================
  // 4. OPEN CART
  // ========================================

  function openCart() {
    if (!cartOverlay || !cartDrawer) return;

    cartOverlay.classList.add("active");
    cartDrawer.classList.add("active");

    document.body.classList.add("cart-open");

    renderCart();
  }


  // ========================================
  // 5. CLOSE CART
  // ========================================

  function closeCart() {
    if (!cartOverlay || !cartDrawer) return;

    cartOverlay.classList.remove("active");
    cartDrawer.classList.remove("active");

    document.body.classList.remove("cart-open");
  }


  // ========================================
  // 6. CART BUTTONS
  // ========================================

  cartButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      openCart();
    });
  });


  // Close button
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", closeCart);
  }


  // Click outside cart
  if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCart);
  }


  // Prevent drawer itself from closing
  if (cartDrawer) {
    cartDrawer.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }


  // ========================================
  // 7. ADD TO CART
  // ========================================

  addToCartButtons.forEach((button) => {

    button.addEventListener("click", () => {

      const name = button.dataset.name;
      const price = Number(button.dataset.price);

      if (!name || isNaN(price)) return;

      const existingItem = cart.find(
        (item) => item.name === name
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          name: name,
          price: price,
          quantity: 1
        });
      }

      saveCart();
      renderCart();
      updateCartCount();

      // Open cart after adding
      openCart();

    });

  });


  // ========================================
  // 8. RENDER CART
  // ========================================

  function renderCart() {

    if (!cartItemsContainer) return;

    if (cart.length === 0) {

      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <p>السلة فارغة</p>
          <span>أضف بعض الأطباق اللذيذة أولاً</span>
        </div>
      `;

      updateCartTotal();
      updateCartCount();

      return;
    }


    cartItemsContainer.innerHTML = cart.map((item, index) => {

      const itemTotal = item.price * item.quantity;

      return `
        <div class="cart-item">

          <div class="cart-item__info">

            <h4>${item.name}</h4>

            <span class="cart-item__price">
              ${item.price} ج.م
            </span>

          </div>


          <div class="cart-item__controls">

            <button 
              class="decrease"
              data-index="${index}"
              aria-label="تقليل الكمية"
            >
              −
            </button>

            <span class="cart-item__quantity">
              ${item.quantity}
            </span>

            <button 
              class="increase"
              data-index="${index}"
              aria-label="زيادة الكمية"
            >
              +
            </button>

          </div>


          <div class="cart-item__total">
            ${itemTotal} ج.م
          </div>


          <button 
            class="cart-item__remove remove"
            data-index="${index}"
            aria-label="حذف المنتج"
          >
            🗑
          </button>

        </div>
      `;

    }).join("");


    // Increase quantity
    cartItemsContainer
      .querySelectorAll(".increase")
      .forEach((button) => {

        button.addEventListener("click", () => {

          const index = Number(button.dataset.index);

          cart[index].quantity += 1;

          saveCart();
          renderCart();
          updateCartCount();

        });

      });


    // Decrease quantity
    cartItemsContainer
      .querySelectorAll(".decrease")
      .forEach((button) => {

        button.addEventListener("click", () => {

          const index = Number(button.dataset.index);

          if (cart[index].quantity > 1) {

            cart[index].quantity -= 1;

          } else {

            cart.splice(index, 1);

          }

          saveCart();
          renderCart();
          updateCartCount();

        });

      });


    // Remove item
    cartItemsContainer
      .querySelectorAll(".remove")
      .forEach((button) => {

        button.addEventListener("click", () => {

          const index = Number(button.dataset.index);

          cart.splice(index, 1);

          saveCart();
          renderCart();
          updateCartCount();

        });

      });


    updateCartTotal();

  }


  // ========================================
  // 9. CART TOTAL
  // ========================================

  function updateCartTotal() {

    if (!cartTotalElement) return;

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    cartTotalElement.textContent = `${total} ج.م`;

  }


  // ========================================
  // 10. CART COUNT
  // ========================================

  function updateCartCount() {

    const count = cart.reduce(
      (total, item) => total + item.quantity,
      0
    );


    const counters = document.querySelectorAll(
      ".cart-count, #cartCount, #mobileCartCount"
    );


    counters.forEach((counter) => {

      counter.textContent = count;

      if (count > 0) {
        counter.classList.add("has-items");
      } else {
        counter.classList.remove("has-items");
      }

    });

  }


  // ========================================
// COMPLETE ORDER
// ========================================

const goToCheckout = document.getElementById("goToCheckout");

if (goToCheckout) {
  goToCheckout.addEventListener("click", (e) => {
    e.preventDefault();

    // لو السلة فاضية
    if (cart.length === 0) {
      alert("السلة فاضية 🍽️");
      return;
    }

    // تأكيد الطلب
    alert("تم الطلب بنجاح ✅");

    // تفريغ السلة
    cart = [];

    saveCart();
    renderCart();
    updateCartCount();

    // قفل السلة
    closeCart();
  });
}


  // ========================================
  // 11. MENU CATEGORY FILTER
  // ========================================

  if (menuTabs.length > 0 && menuCards.length > 0) {

    menuTabs.forEach((tab) => {

      tab.addEventListener("click", () => {

        // Remove active from all tabs
        menuTabs.forEach((item) => {
          item.classList.remove("active");
        });

        // Add active to clicked tab
        tab.classList.add("active");


        const category = tab.dataset.category;


        menuCards.forEach((card) => {

          const cardCategory = card.dataset.category;


          if (
            category === "all" ||
            cardCategory === category
          ) {

            card.style.display = "";

            // Small animation
            requestAnimationFrame(() => {
              card.classList.add("in-view");
            });

          } else {

            card.style.display = "none";

          }

        });

      });

    });

  }


  // ========================================
  // 12. SCROLL ANIMATIONS
  // ========================================

  const animatedElements = document.querySelectorAll(
    "[data-animate]"
  );


  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add("in-view");

            observerInstance.unobserve(entry.target);

          }

        });

      },
      {
        threshold: 0.15
      }
    );


    animatedElements.forEach((element) => {
      observer.observe(element);
    });

  } else {

    animatedElements.forEach((element) => {
      element.classList.add("in-view");
    });

  }


  // ========================================
  // 13. BACK TO TOP BUTTON
  // ========================================

  function handleBackToTop() {

    if (!backToTop) return;

    if (window.scrollY > 500) {

      backToTop.classList.add("show");

    } else {

      backToTop.classList.remove("show");

    }

  }


  window.addEventListener(
    "scroll",
    handleBackToTop,
    { passive: true }
  );


  if (backToTop) {

    backToTop.addEventListener("click", () => {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    });

  }


  // ========================================
  // 14. NAVBAR ACTIVE LINK
  // ========================================

  const sections = document.querySelectorAll(
    "section[id]"
  );

  const navLinks = document.querySelectorAll(
    'a[href^="#"]'
  );


  function updateActiveNav() {

    let currentSection = "";


    sections.forEach((section) => {

      const sectionTop =
        section.offsetTop - 180;

      const sectionHeight =
        section.offsetHeight;


      if (
        window.scrollY >= sectionTop &&
        window.scrollY < sectionTop + sectionHeight
      ) {

        currentSection = section.id;

      }

    });


    navLinks.forEach((link) => {

      const href = link.getAttribute("href");

      link.classList.remove("active");

      if (href === `#${currentSection}`) {
        link.classList.add("active");
      }

    });

  }


  window.addEventListener(
    "scroll",
    updateActiveNav,
    { passive: true }
  );


  updateActiveNav();


  // ========================================
  // 15. MOBILE MENU / NAVIGATION
  // ========================================

  const mobileNavLinks = document.querySelectorAll(
    ".mobile-nav a"
  );


  mobileNavLinks.forEach((link) => {

    link.addEventListener("click", () => {

      mobileNavLinks.forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");

    });

  });


  // ========================================
  // 16. RESERVATION FORM
  // ========================================

  if (reservationForm) {

    reservationForm.addEventListener(
      "submit",
      (e) => {

        e.preventDefault();


        const name =
          document.getElementById("name")?.value.trim();

        const phone =
          document.getElementById("phone")?.value.trim();

        const guests =
          document.getElementById("guests")?.value;

        const date =
          document.getElementById("date")?.value;

        const time =
          document.getElementById("time")?.value;

        const message =
          document.getElementById("message")?.value.trim();


        if (
          !name ||
          !phone ||
          !guests ||
          !date ||
          !time
        ) {

          alert("من فضلك املأ جميع البيانات المطلوبة.");

          return;

        }


        // ========================================
        // IMPORTANT:
        // Replace this with the real WhatsApp number
        // Example: 201012345678
        // ========================================

        const restaurantNumber =
          "201XXXXXXXXX";


        const whatsappMessage = `
مرحباً Braise 👋

أريد حجز طاولة:

👤 الاسم: ${name}

📱 رقم الهاتف: ${phone}

👥 عدد الأشخاص: ${guests}

📅 التاريخ: ${date}

⏰ الوقت: ${time}

📝 طلبات خاصة:
${message || "لا يوجد"}
        `.trim();


        const whatsappURL =
          `https://wa.me/${restaurantNumber}?text=${encodeURIComponent(
            whatsappMessage
          )}`;


        window.open(
          whatsappURL,
          "_blank"
        );

      }
    );

  }


  // ========================================
  // 17. CLOSE CART WITH ESC
  // ========================================

  document.addEventListener(
    "keydown",
    (e) => {

      if (e.key === "Escape") {
        closeCart();
      }

    }
  );


  // ========================================
  // 18. INITIALIZE
  // ========================================

  renderCart();
  updateCartCount();
  handleBackToTop();


});