/* script.js - TRP Electronics Single File for Shop + Cart + Projects Pages */
document.addEventListener("DOMContentLoaded", () => {
  
  /* ---------- 1. DARK MODE TOGGLE (SHARED) ---------- */
  const toggleBtn = document.getElementById("darkModeToggle");
  const body = document.body;
  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    if (toggleBtn) toggleBtn.textContent = "☀ Light Mode";
  } else {
    if (toggleBtn) toggleBtn.textContent = "🌙 Dark Mode";
  }
  toggleBtn?.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
    toggleBtn.textContent = body.classList.contains("dark-mode") ? "☀ Light Mode" : "🌙 Dark Mode";
  });

  /* ---------- 2. IMAGE LOAD EFFECT ---------- */
  document.querySelectorAll(".product-card img, .project-card img").forEach(img => {
    if (img.complete) img.classList.add("loaded");
    else img.addEventListener("load", () => img.classList.add("loaded"));
  });

  /* ---------- 3. LOGO HOVER EFFECTS ---------- */
  const logo = document.getElementById("logo");
  if (logo) {
    const text = logo.textContent.trim();
    logo.innerHTML = "";
    text.split("").forEach(ch => {
      const s = document.createElement("span");
      s.textContent = ch;
      s.style.display = "inline-block";
      s.style.transition = "transform .25s, text-shadow .25s, color .25s";
      logo.appendChild(s);
    });

    const pop = new Audio("Data Files/pop.mp3");
    logo.addEventListener("mouseenter", () => {
      pop.currentTime = 0;
      pop.play().catch(()=>{});
      logo.querySelectorAll("span").forEach((sp, i) => {
        setTimeout(() => {
          sp.classList.add("glow");
          setTimeout(() => sp.classList.remove("glow"), 350);
        }, i * 55);
      });
    });
  }

  /* ---------- 4. SHARED CART STORAGE GLOBAL LOGIC ---------- */
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const deliveryCharge = 89;
  const freeDeliveryLimit = 699;

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateHeaderCount();
  }

  function updateHeaderCount() {
    const el = document.getElementById("cart-count");
    if (!el) return;
    const qty = cart.reduce((s, i) => s + (i.qty || 0), 0);
    el.textContent = qty;
  }
  updateHeaderCount();

  /* ---------- 5. COMPONENTS.HTML: ADD TO CART BEHAVIOR ---------- */
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-cart")) {
      const btn = e.target;
      let name = btn.dataset.name;
      let price = parseFloat(btn.dataset.price);

      if (!name || isNaN(price)) {
        name = document.getElementById("modalTitle")?.textContent;
        const modalBtn = document.getElementById("modalAddCart");
        price = parseFloat(modalBtn?.dataset.price || "0");
      }

      if (!name || isNaN(price)) return;

      const found = cart.find(x => x.name === name);
      if (found) {
        found.qty++;
      } else {
        const productCard = btn.closest('.product-card');
        const imgUrl = productCard?.querySelector('img')?.src || document.getElementById("modalImg")?.src || 'images/all.png';
        cart.push({ name, price, qty: 1, image: imgUrl, img: imgUrl });
      }
      
      saveCart();
      showCartAlert(name);

      const modal = document.getElementById("product-modal");
      if (modal) modal.classList.remove("active");
    }
  });

  function showCartAlert(productName) {
    const alertBox = document.getElementById("cart-alert");
    if (alertBox) {
      alertBox.innerText = `✅ "${productName}" added to your cart`;
      alertBox.classList.add("show");
      setTimeout(() => {
        alertBox.classList.remove("show");
      }, 2500);
    } else {
      alert(`✅ "${productName}" added to your cart`);
    }
  }

  /* ---------- 6. EXPAND POPUP MODAL LOGIC ---------- */
  const modal = document.getElementById("product-modal");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalPrice = document.getElementById("modalPrice");
  const modalDesc = document.getElementById("modalDesc");
  const modalDatasheet = document.getElementById("modalDatasheet");
  const modalAddCart = document.getElementById("modalAddCart");
  const closeModal = document.getElementById("closeModal");

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("expand-btn")) {
      const card = e.target.closest(".product-card");
      if (!card) return;

      const title = card.querySelector("h3")?.textContent || "Component";
      const priceText = card.querySelector("p")?.textContent || "₹0";
      const imgSrc = card.querySelector("img")?.src || "images/all.png";
      const addCartBtn = card.querySelector(".add-cart");
      const priceVal = addCartBtn?.dataset.price || "0";

      const desc = card.dataset.desc || `High quality ${title} component for electronics DIY projects, circuit designing, and testing.`;
      const datasheet = card.dataset.datasheet || `datasheets/${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pdf`;

      if (modalImg) modalImg.src = imgSrc;
      if (modalTitle) modalTitle.textContent = title;
      if (modalPrice) modalPrice.textContent = priceText;
      if (modalDesc) modalDesc.innerHTML = `<strong>Description:</strong> ${desc}`;
      if (modalDatasheet) modalDatasheet.href = datasheet;
      if (modalAddCart) {
        modalAddCart.dataset.name = title;
        modalAddCart.dataset.price = priceVal;
      }

      if (modal) modal.classList.add("active");
    }
  });

  closeModal?.addEventListener("click", () => {
    modal?.classList.remove("active");
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  /* ---------- 7. COMPONENTS.HTML: SEARCH & EXPANDING INPUT HANDLER ---------- */
  const searchInput = document.getElementById("componentSearch");
  const searchClearBtn = document.getElementById("searchClearBtn");
  const productCards = Array.from(document.querySelectorAll(".product-card"));
  let activeCategory = "all";

  function applyFilters() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    
    if (searchInput) {
      if (q.length > 0) {
        searchInput.classList.add("has-text");
        if (searchClearBtn) searchClearBtn.style.display = "block";
      } else {
        if (document.activeElement !== searchInput) {
          searchInput.classList.remove("has-text");
        }
        if (searchClearBtn) searchClearBtn.style.display = "none";
      }
    }

    productCards.forEach(card => {
      const cat = (card.dataset.category || "").toLowerCase();
      const name = (card.querySelector("h3")?.textContent || "").toLowerCase();
      const keywords = (card.dataset.keywords || "").toLowerCase();
      const matchesCategory = (activeCategory === "all") || (cat === activeCategory.toLowerCase());
      const matchesSearch = !q || name.includes(q) || keywords.includes(q);
      card.style.display = (matchesCategory && matchesSearch) ? "" : "none";
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
    searchInput.addEventListener("focus", () => searchInput.classList.add("has-text"));
    searchInput.addEventListener("blur", () => {
      if (!searchInput.value.trim()) {
        searchInput.classList.remove("has-text");
      }
    });
  }

  searchClearBtn?.addEventListener("click", () => {
    if (searchInput) {
      searchInput.value = "";
      applyFilters();
      searchInput.focus();
    }
  });

  document.querySelectorAll(".category-menu-new .cat-item").forEach(li => {
    li.addEventListener("click", () => {
      document.querySelectorAll(".category-menu-new .cat-item").forEach(x => x.classList.remove("active"));
      li.classList.add("active");
      activeCategory = li.dataset.cat || "all";
      applyFilters();
    });
  });

  /* ---------- 8. CART.HTML: RENDER CART & RAZORPAY SYSTEM ---------- */
  if (document.body.classList.contains("cart-page")) {
    const itemsContainer = document.getElementById("cart-items-list");
    const summarySubtotal = document.getElementById("summary-subtotal");
    const summaryDelivery = document.getElementById("summary-delivery");
    const summaryTotal = document.getElementById("summary-total");
    const orderNow = document.getElementById("orderNow");

    function renderCart() {
      if (!itemsContainer) return;
      itemsContainer.innerHTML = "";
      let subtotal = 0;
      
      if (cart.length === 0) {
        itemsContainer.innerHTML = "<p>Your cart is empty. <a href='components.html'>Continue shopping</a></p>";
      } else {
        cart.forEach((it, idx) => {
          subtotal += it.price * it.qty;
          const row = document.createElement("div");
          row.className = "cart-row";
          row.innerHTML = `
          <img src="${it.image || it.img || ''}" alt="${it.name}" style="width:50px; height:50px; object-fit:contain; background:#fff; border-radius:6px; padding:2px;">
          <div class="info">
              <h4>${it.name}</h4>
              <p>₹${it.price} each</p>
            </div>
            <div class="controls">
              <input class="qty-input" data-i="${idx}" type="number" min="1" value="${it.qty}">
              <button class="remove-btn" data-i="${idx}">Remove</button>
            </div>
          `;
          itemsContainer.appendChild(row);
        });
      }

      const delivery = subtotal >= freeDeliveryLimit || subtotal === 0 ? 0 : deliveryCharge;
      if (summarySubtotal) summarySubtotal.textContent = `Subtotal: ₹${subtotal}`;
      if (summaryDelivery) summaryDelivery.textContent = `Delivery: ₹${delivery}`;
      if (summaryTotal) summaryTotal.textContent = `Total: ₹${subtotal + delivery}`;

      document.querySelectorAll(".qty-input").forEach(inp => {
        inp.onchange = (e) => {
          const i = parseInt(e.target.dataset.i, 10);
          const v = Math.max(1, parseInt(e.target.value, 10) || 1);
          cart[i].qty = v;
          saveCart();
          renderCart();
        };
      });

      document.querySelectorAll(".remove-btn").forEach(b => {
        b.onclick = (e) => {
          const i = parseInt(e.target.dataset.i, 10);
          cart.splice(i, 1);
          saveCart();
          renderCart();
        };
      });
    }

    renderCart();

    orderNow?.addEventListener("click", (e) => {
      e.preventDefault();

      if (cart.length === 0) return alert("❌ Add products first.");
      
      const name = document.getElementById("name")?.value.trim();
      const address = document.getElementById("address")?.value.trim();
      const pincode = document.getElementById("pincode")?.value.trim();
      const phone = document.getElementById("phone")?.value.trim();

      if (!name || !address || !pincode || !phone) {
        return alert("❌ Please fill all delivery details.");
      }

      if (phone.length !== 10 || !/^[6-9][0-9]{9}$/.test(phone)) {
        alert("❌ Enter a valid 10-digit Indian mobile number.");
        document.getElementById("phone")?.focus();
        return;
      }

      const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const delivery = subtotal >= freeDeliveryLimit ? 0 : deliveryCharge;
      const totalAmount = subtotal + delivery;
      const amountInPaise = totalAmount * 100;

      var options = {
        "key": "rzp_live_T9fdcBxIRGP1MY",
        "amount": amountInPaise,
        "currency": "INR",
        "name": "TRP Electronics",
        "description": "Components Purchase",
        "image": "images/logo.png",
        "handler": function (response) {
          alert(`🎉 Payment Successful! Payment ID: ${response.razorpay_payment_id}`);

          const orderText = cart.map(i => `• ${i.name} - ₹${i.price} x ${i.qty}`).join("\n");
          const msg = `🧾 *New Verified Order*\n*Payment ID:* ${response.razorpay_payment_id}\n--------------------\n${orderText}\n--------------------\n*Delivery:* ₹${delivery}\n*Total Paid:* ₹${totalAmount}\n\n👤 *Name:* ${name}\n🏠 *Address:* ${address}\n📮 *Pincode:* ${pincode}\n📞 *Phone:* ${phone}`;
          
          cart = [];
          saveCart();
          renderCart();

          window.location.href = `https://api.whatsapp.com/send?phone=919115603213&text=${encodeURIComponent(msg)}`;
        },
        "prefill": {
          "name": name,
          "contact": phone
        },
        "theme": {
          "color": "#0052FF"
        }
      };

      try {
        var rzp1 = new Razorpay(options);
        rzp1.open();
      } catch (err) {
        alert("❌ Razorpay Open Error: " + err.message + "\nCheck Key ID configuration.");
      }
    });
  }

  /* ---------- 9. MOBILE NAV TOGGLE & ABOUT ACCORDION FIXED ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  menuToggle?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("show");
  });

  const aboutHeader = document.querySelector(".about-toggle-header") || document.getElementById("aboutToggle");
  const aboutContent = document.getElementById("aboutContent");
  const aboutArrow = document.querySelector(".about-arrow") || document.getElementById("aboutArrow");

  aboutHeader?.addEventListener("click", () => {
    aboutHeader.classList.toggle("active");
    if (aboutContent) {
      aboutContent.classList.toggle("show");
    }
    if (aboutArrow) {
      aboutArrow.style.transform = aboutHeader.classList.contains("active") ? "rotate(90deg)" : "rotate(0deg)";
    }
  });

  const phoneInput = document.getElementById("phone");
  phoneInput?.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/[^0-9]/g, "");
    if (phoneInput.value.length > 10) {
      phoneInput.value = phoneInput.value.slice(0, 10);
    }
  });

 /* ---------- 10. PROJECTS PAGE SEARCH & CATEGORY FILTER ---------- */
  const projectSearchInput = document.getElementById("projectSearch");
  const projectSearchClearBtn = document.getElementById("projectSearchClearBtn");
  const projectCards = Array.from(document.querySelectorAll(".project-card"));
  let activeProjectCat = "all";

  function applyProjectFilters() {
    const q = (projectSearchInput?.value || "").toLowerCase().trim();

    if (projectSearchInput) {
      if (q.length > 0) {
        projectSearchInput.classList.add("has-text");
        if (projectSearchClearBtn) projectSearchClearBtn.style.display = "block";
      } else {
        if (document.activeElement !== projectSearchInput) {
          projectSearchInput.classList.remove("has-text");
        }
        if (projectSearchClearBtn) projectSearchClearBtn.style.display = "none";
      }
    }

    projectCards.forEach(card => {
      const cardCategory = (card.getAttribute("data-category") || "").toLowerCase().trim();
      const selectedCategory = activeProjectCat.toLowerCase().trim();

      const title = (card.querySelector("h3")?.textContent || "").toLowerCase();
      const desc = (card.querySelector("p")?.textContent || "").toLowerCase();
      const keywords = (card.getAttribute("data-keywords") || "").toLowerCase();

      const matchesCategory = (selectedCategory === "all" || selectedCategory === "" || cardCategory === selectedCategory);
      const matchesSearch = !q || title.includes(q) || desc.includes(q) || keywords.includes(q);

      // setProperty se Mobile aur Desktop dono par 100% force hide/show hoga
      if (matchesCategory && matchesSearch) {
        card.style.removeProperty("display");
      } else {
        card.style.setProperty("display", "none", "important");
      }
    });
  }

  if (projectSearchInput) {
    projectSearchInput.addEventListener("input", applyProjectFilters);
    projectSearchInput.addEventListener("focus", () => projectSearchInput.classList.add("has-text"));
    projectSearchInput.addEventListener("blur", () => {
      if (!projectSearchInput.value.trim()) {
        projectSearchInput.classList.remove("has-text");
      }
    });
  }

  projectSearchClearBtn?.addEventListener("click", () => {
    if (projectSearchInput) {
      projectSearchInput.value = "";
      applyProjectFilters();
      projectSearchInput.focus();
    }
  });

  // Second Nav Category Filter Click / Touch Listener (Works on Mobile + PC)
  document.querySelectorAll(".second-center .cat-item").forEach(li => {
    li.addEventListener("click", function(e) {
      e.preventDefault();
      document.querySelectorAll(".second-center .cat-item").forEach(x => x.classList.remove("active"));
      this.classList.add("active");
      activeProjectCat = this.getAttribute("data-cat") || this.textContent.trim();
      applyProjectFilters();
    });
  });

  });


lottie.loadAnimation({
  container: document.getElementById('lottie-container'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'images/loading.json' //
});

// Desktop category horizontal scroll with mouse wheel
const catCenter = document.querySelector('.second-center');
if (catCenter) {
  catCenter.addEventListener('wheel', (e) => {
    if (window.innerWidth > 768) {
      if (e.deltaY !== 0) {
        e.preventDefault();
        catCenter.scrollLeft += e.deltaY;
      }
    }
  }, { passive: false });
}
