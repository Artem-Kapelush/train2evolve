document.addEventListener("DOMContentLoaded", function () {
    burgerMenu();
    initModals();
    slider();
    initPriceRangeSlider();
    initSorting();
    initPagination(items);
    filterElement(true);
    restoreFilters();
    initCart();
    initLoginForm();
});

document.addEventListener('DOMContentLoaded', initCart);

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".filter__container").addEventListener("submit", function(e) {
        e.preventDefault();
        filterElement(true);
    });

    document.querySelector(".filter__button-reset").addEventListener("click", function() {
        localStorage.removeItem("filter");
        document.querySelector(".filter__container").reset();
        document.querySelectorAll(".platform-options input[type='checkbox']").forEach(cb => cb.checked = false);
        document.querySelectorAll(".price-input")[0].value = 0;
        document.querySelectorAll(".price-input")[1].value = 900;

        document.querySelectorAll(".catalog__item").forEach(item => {
            item.style.opacity = "1";
            item.style.backgroundColor = "white";
        });

        if (typeof updateHandlePositions === "function") {
            updateHandlePositions();
        }
    });
});

function burgerMenu() {
    let header = document.querySelector('.header');
    let navToggle = document.querySelector('.header__toggle');
    let menuBlock = document.querySelector('.menu__list-block');

    navToggle.addEventListener('click', function () {
        // Перемикання класів header
        header.classList.toggle('header--opened');
        header.classList.toggle('header--closed');

        // Перемикання класу відображення меню
        if (menuBlock.classList.contains('menu__list-block--open')) {
            menuBlock.classList.remove('menu__list-block--open');
        } else {
            menuBlock.classList.add('menu__list-block--open');
        }
    });
};
  
function initModals() {
    const loginButton = document.querySelector('.user__list-item:first-child .user__list-link');
    const cartButton = document.querySelector('.user__list-item:nth-child(2) .user__list-link');
    const loginModal = document.getElementById('loginModal');
    const cartModal = document.getElementById('cartModal');
    const closeButtons = document.querySelectorAll('.modal__close');
    const body = document.body;
  
    loginButton?.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(loginModal);
    });
  
    cartButton?.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(cartModal);
    });
  
    closeButtons.forEach(button => {
        button.addEventListener('click', function () {
            closeModal(this.closest('.modal'));
        });
    });
  
    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
  
    function openModal(modal) {
        modal.style.display = 'flex';
        body.classList.add('modal__open');
    };
  
    function closeModal(modal) {
        modal.style.display = 'none';
        body.classList.remove('modal__open');
    };
};

function slider() {
    const slider = document.querySelector(".slider__list");
    const slides = document.querySelectorAll(".slider__item");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");
    const dots = document.querySelectorAll(".slider__dot");
    
    let currentSlide = 0;
    const slideCount = slides.length;

    // Initialize slider
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === index);
        });
        
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === index);
        });
    }

    // Next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideCount;
        showSlide(currentSlide);
    }

    // Previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        showSlide(currentSlide);
    }

    // Event listeners
    nextBtn.addEventListener("click", nextSlide);
    prevBtn.addEventListener("click", prevSlide);

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
};

function initPriceRangeSlider() {
    const priceSlider = document.querySelector(".price-slider");
    const handles = priceSlider.querySelectorAll(".handle");
    const bar = priceSlider.querySelector(".bar");
    const inputs = document.querySelectorAll(".price-inputs input");

    let isDragging = false;
    let activeHandle = null;
    const maxValue = 1000;
    const paddingPercent = 1.5;

    let sliderWidth;
    let sidePadding;
    let usableWidth;

    const defaultMin = 0;
    const defaultMax = 900;

    inputs[0].value = defaultMin;
    inputs[1].value = defaultMax;

    recalculateSliderDimensions();
    updateHandlePositions();

    function recalculateSliderDimensions() {
        sliderWidth = priceSlider.offsetWidth;

        // Адаптивне значення paddingPercent
        const screenWidth = window.innerWidth;
        const paddingPercent = screenWidth <= 767 ? 1.5 : 3.5;

        sidePadding = (paddingPercent / 100) * sliderWidth;
        usableWidth = sliderWidth - 2 * sidePadding;
    }


    function updatePriceInputs() {
        const leftPosition = parseFloat(handles[0].style.left) || 0;
        const rightPosition = parseFloat(handles[1].style.left) || usableWidth;

        const minPrice = Math.round((leftPosition / usableWidth) * maxValue);
        const maxPrice = Math.round((rightPosition / usableWidth) * maxValue);

        inputs[0].value = minPrice;
        inputs[1].value = maxPrice;

        bar.style.left = `${leftPosition + sidePadding}px`;
        bar.style.width = `${Math.max(0, rightPosition - leftPosition)}px`;
    }

    function updateHandlePositions() {
        let minPrice = parseInt(inputs[0].value) || 0;
        let maxPrice = parseInt(inputs[1].value) || maxValue;

        minPrice = Math.max(0, Math.min(maxValue, minPrice));
        maxPrice = Math.max(0, Math.min(maxValue, maxPrice));

        if (minPrice > maxPrice) minPrice = maxPrice;
        if (maxPrice < minPrice) maxPrice = minPrice;

        const leftPosition = (minPrice / maxValue) * usableWidth;
        const rightPosition = (maxPrice / maxValue) * usableWidth;

        handles[0].style.left = `${leftPosition}px`;
        handles[1].style.left = `${rightPosition}px`;

        bar.style.left = `${leftPosition + sidePadding}px`;
        bar.style.width = `${Math.max(0, rightPosition - leftPosition)}px`;
    }

    handles.forEach((handle, index) => {
        handle.addEventListener("mousedown", function (e) {
            isDragging = true;
            activeHandle = index;
            document.addEventListener("mousemove", handleDrag);
            document.addEventListener("mouseup", stopDrag);
            e.preventDefault();
        });
    });

    function handleDrag(e) {
        if (!isDragging) return;

        const sliderRect = priceSlider.getBoundingClientRect();
        let newPosition = e.clientX - sliderRect.left - sidePadding;

        newPosition = Math.max(0, Math.min(usableWidth, newPosition));

        if (activeHandle === 0) {
            const rightHandlePosition = parseFloat(handles[1].style.left) || usableWidth;
            newPosition = Math.min(newPosition, rightHandlePosition);
        } else {
            const leftHandlePosition = parseFloat(handles[0].style.left) || 0;
            newPosition = Math.max(newPosition, leftHandlePosition);
        }

        handles[activeHandle].style.left = `${newPosition}px`;
        updatePriceInputs();
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener("mousemove", handleDrag);
        document.removeEventListener("mouseup", stopDrag);
    }

    window.addEventListener("resize", function () {
        recalculateSliderDimensions();
        updateHandlePositions();
    });

    inputs.forEach((input, index) => {
        input.addEventListener("change", function () {
            let min = parseInt(inputs[0].value) || 0;
            let max = parseInt(inputs[1].value) || 0;

            min = Math.max(0, Math.min(maxValue, min));
            max = Math.max(0, Math.min(maxValue, max));

            if (min > max) {
                if (index === 0) min = max;
                else max = min;
            }

            inputs[0].value = min;
            inputs[1].value = max;

            updateHandlePositions();
        });

        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                this.dispatchEvent(new Event("change"));
            }
        });

        window.updateHandlePositions = updateHandlePositions;
    });
};

// Функція сортування
function initSorting() {
    const sortSelect = document.querySelector("#sorting");
    const catalogList = document.querySelector(".catalog__list");
  
    let allItems = Array.from(catalogList.children); // Повний список елементів
    const initialItems = [...allItems]; // Копія для "за замовчуванням"
  
    const savedSorting = localStorage.getItem("sorting");
    if (savedSorting) {
        sortSelect.value = savedSorting;
        applySorting(savedSorting);
    }
  
    sortSelect.addEventListener("change", function () {
        const selectedValue = this.value;
        localStorage.setItem("sorting", selectedValue);
        applySorting(selectedValue);
    });
  
    function applySorting(sortType) {
        allItems.sort((a, b) => {
            const aPrice = getPrice(a);
            const bPrice = getPrice(b);
            const aFee = getFee(a);
            const bFee = getFee(b);
            const aAge = getAge(a);
            const bAge = getAge(b);
    
            switch (sortType) {
            case 'price-asc': return aPrice - bPrice;
            case 'price-desc': return bPrice - aPrice;
            case 'fee-asc': return aFee - bFee;
            case 'fee-desc': return bFee - aFee;
            case 'age-asc': return aAge - bAge;
            case 'age-desc': return bAge - aAge;
            default: return initialItems.indexOf(a) - initialItems.indexOf(b);
        }
      });
  
      catalogList.innerHTML = '';
      allItems.forEach(item => {
            item.style.display = 'none'; // початково ховаємо
            catalogList.appendChild(item);
      });
  
        initPagination(allItems); // якщо є пагінація
    }
  
    function getPrice(item) {
        const text = item.querySelector(".catalog__meta-price")?.textContent || "0";
        return parseInt(text.replace(/[^0-9]/g, ''), 10);
    }
  
    function getFee(item) {
        const text = item.querySelector(".catalog__meta-commission")?.textContent || "0%";
        return parseInt(text.replace(/[^0-9]/g, ''), 10); // 20% → 20
    }
  
    function getAge(item) {
        const text = item.querySelector(".catalog__meta-age")?.textContent || "0+";
        return parseInt(text.replace(/[^0-9]/g, ''), 10); // 18+ → 18
    }
}

function initPagination(items) {
    const itemsPerPage = 6;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const paginationList = document.querySelector('.pagination__list');
    const backBtn = document.querySelector('.pagination__button-back');
    const nextBtn = document.querySelector('.pagination__button-next');

    let currentPage = 1;

    function showPage(page) {
        currentPage = page;

        items.forEach((item, index) => {
            item.style.display = (index >= (page - 1) * itemsPerPage && index < page * itemsPerPage) ? 'flex' : 'none';
        });

        updatePaginationUI();
    }

    function updatePaginationUI() {
        paginationList.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.classList.add('pagination__item');
            if (i === currentPage) li.classList.add('pagination__item-activ');

            const a = document.createElement('a');
            a.href = '#';
            a.textContent = i;
            a.classList.add('padination__link');
            if (i === currentPage) a.classList.add('padination__link-active');

            a.addEventListener('click', (e) => {
                e.preventDefault();
                showPage(i);
            });

            li.appendChild(a);
            paginationList.appendChild(li);
        }

        backBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    }

    backBtn.onclick = () => {
        if (currentPage > 1) showPage(currentPage - 1);
    };

    nextBtn.onclick = () => {
        if (currentPage < totalPages) showPage(currentPage + 1);
    };

    showPage(1);
}

// --- Функція фільтрації ---
function filterElement(saveToStorage = true) {
    const catalogItems = document.querySelectorAll(".catalog__item");
    const priceInputs = document.querySelectorAll(".price-input");
    const minPrice = parseInt(priceInputs[0].value) || 0;
    const maxPrice = parseInt(priceInputs[1].value) || 1000;

    const selectedPlatformTypes = Array.from(document.querySelectorAll(".platform-options input[type='checkbox']:checked"))
        .map(cb => cb.nextElementSibling.nextElementSibling.textContent.trim().toLowerCase());

    const selectedCommission = document.querySelector(".filter__commission input[type='radio']:checked")?.id;
    const selectedAge = document.querySelector(".filter__age input[type='radio']:checked")?.id;

    if (saveToStorage) {
        localStorage.setItem("filter", JSON.stringify({
            minPrice,
            maxPrice,
            selectedPlatformTypes,
            selectedCommission,
            selectedAge
        }));
    }

    catalogItems.forEach(item => {
        const desc = item.querySelector(".catalog__item-desc").textContent.toLowerCase();
        const price = parseInt(item.querySelector(".catalog__meta-price").textContent.replace(/[^\d]/g, "")) || 0;
        const commission = parseInt(item.querySelector(".catalog__meta-commission").textContent.replace(/[^\d]/g, "")) || 0;
        const ageText = item.querySelector(".catalog__meta-age").textContent;
        const age = ageText.includes("16") ? 16 : ageText.includes("18") ? 18 : ageText.includes("21") ? 21 : 0;

        let show = true;

        // Фільтр за ціною
        if (price < minPrice || price > maxPrice) {
            show = false;
        }

        // Фільтр за типом платформи
        const platformKeywords = {
            "для новачків": [
                "новачк", "початк", "прості завдан", "гіг", "портфоліо", "перших клієнтів", "старт", "невеликі замовлення"
            ],
            "для досвідчених фахівців": [
                "досвідчен", "рейтинг", "конкуренц", "тривалість", "різного рівня", "універсальн", "серйозні контракти", "фахівц",
                "складності", "рівнів спеціалістів"
            ],
            "преміум рівень": [
                "преміум", "топов", "елітн", "відбір", "високі ставки", "перевірен", "якісне портфоліо", "жорсткий відбір"
            ]
        };

        if (selectedPlatformTypes.length > 0) {
            const matchesPlatform = selectedPlatformTypes.some(typeLabel => {
                const keywords = platformKeywords[typeLabel];
                return keywords && keywords.some(keyword => desc.includes(keyword));
            });
            if (!matchesPlatform) show = false;
        }

        // Фільтр за комісією
        if (selectedCommission) {
            if (selectedCommission === "commission-low" && commission > 10) {
                show = false;
            } else if (selectedCommission === "commission-medium" && (commission <= 10 || commission >= 20)) {
                show = false;
            } else if (selectedCommission === "commission-high" && commission < 20) {
                show = false; // Виправлено: враховує 20% також
            }
        }

        // Фільтр за віком
        if (selectedAge) {
            if (selectedAge === "age-16" && age !== 16) {
                show = false; // Виправлено: лише 16
            } else if (selectedAge === "age-18" && age < 18) {
                show = false; // Виправлено: 18 і вище
            } else if (selectedAge === "age-21" && age < 21) {
                show = false;
            }
        }

        item.style.opacity = show ? "1" : "0.4";
        item.style.backgroundColor = show ? "white" : "#eee";
    });
}


// --- Відновлення стану фільтра при завантаженні сторінки ---
function restoreFilters() {
    const savedFilter = JSON.parse(localStorage.getItem("filter"));
    if (!savedFilter) return;

    document.querySelectorAll(".price-input")[0].value = savedFilter.minPrice;
    document.querySelectorAll(".price-input")[1].value = savedFilter.maxPrice;

    // Відновлення чекбоксів платформ
    const platformCheckboxes = document.querySelectorAll(".platform-options input[type='checkbox']");
    platformCheckboxes.forEach(cb => {
        const label = cb.nextElementSibling.nextElementSibling.textContent.trim().toLowerCase();
        cb.checked = savedFilter.selectedPlatformTypes.includes(label);
    });

    // Відновлення комісії
    if (savedFilter.selectedCommission) {
        const radio = document.getElementById(savedFilter.selectedCommission);
        if (radio) radio.checked = true;
    }

    // Відновлення віку
    if (savedFilter.selectedAge) {
        const radio = document.getElementById(savedFilter.selectedAge);
        if (radio) radio.checked = true;
    }

    filterElement(false);
};
  
function initCart() {
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    };

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <span class="notification-text">${message}</span>
            <span class="notification-close">&times;</span>
        `;
        notificationContainer.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 1500);
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        });
    };

    function attachQuantityHandlers() {
        const allItems = document.querySelectorAll('.cart__item');
        allItems.forEach(item => {
            const decreaseBtn = item.querySelector('.quantity__button-decrease');
            const increaseBtn = item.querySelector('.quantity__button-increase');
            const quantityEl = item.querySelector('.quantity__value');
            const removeBtn = item.querySelector('.remove__button');

            decreaseBtn.onclick = () => {
                let qty = parseInt(quantityEl.textContent);
                if (qty > 1) {
                    quantityEl.textContent = qty - 1;
                } else {
                    item.remove();
                    if (document.querySelectorAll('.cart__item').length === 0) {
                        document.querySelector('.cart__items').innerHTML = '<div class="cart__empty">Ваш кошик порожній</div>';
                    }
                }
                updateCartCount();
                updateCartTotal();
            };

            increaseBtn.onclick = () => {
                quantityEl.textContent = parseInt(quantityEl.textContent) + 1;
                updateCartCount();
                updateCartTotal();
            };

            removeBtn.onclick = () => {
                item.remove();
                if (document.querySelectorAll('.cart__item').length === 0) {
                    document.querySelector('.cart__items').innerHTML = '<div class="cart__empty">Ваш кошик порожній</div>';
                }
                updateCartCount();
                updateCartTotal();
            };
        });
    };

    function updateCartCount() {
        const cartCountElement = document.getElementById('basket-count');
        let totalCount = 0;
        document.querySelectorAll('.quantity__value').forEach(span => {
            totalCount += parseInt(span.textContent);
        });

        if (cartCountElement) {
            if (totalCount > 0) {
                cartCountElement.textContent = totalCount;
                cartCountElement.style.display = 'flex';
            } else {
                cartCountElement.style.display = 'none';
            }
        }
    };

    function updateCartTotal() {
        const cartItems = document.querySelectorAll('.cart__item');
        let total = 0;
        cartItems.forEach(item => {
            const priceText = item.querySelector('.cart__item-price').textContent;
            const quantity = parseInt(item.querySelector('.quantity__value').textContent);
            const price = parseInt(priceText.replace(/\D/g, ''));
            total += price * quantity;
        });
        document.querySelector('.total__amount').textContent = `${total} $`;
    };

    function addToCart(name, price, image) {
        const cartItems = document.querySelector('.cart__items');
        const existingItem = Array.from(cartItems.querySelectorAll('.cart__item')).find(item =>
            item.querySelector('.cart__item-name')?.textContent === name
        );

        if (existingItem) {
            const quantityEl = existingItem.querySelector('.quantity__value');
            quantityEl.textContent = parseInt(quantityEl.textContent) + 1;
        } else {
            const cartEmpty = document.querySelector('.cart__empty');
            if (cartEmpty) cartEmpty.remove();
            const cartItemHTML = `
            <div class="cart__item">
                <img src="${image}" alt="${name}" class="cart__item-image">
                <div class="cart__item-details">
                    <div class="cart__item-name">${name}</div>
                    <div class="cart__item-price">Середня ціна ${price}</div>
                </div>
                <div class="cart__item-quantity">
                    <button class="quantity__button quantity__button-decrease">&minus;</button>
                    <span class="quantity__value">1</span>
                    <button class="quantity__button quantity__button-increase">&plus;</button>
                </div>
                <button class="remove__button">&times;</button>
            </div>
            `;
            cartItems.insertAdjacentHTML('beforeend', cartItemHTML);
        }

        updateCartCount();
        updateCartTotal();
        attachQuantityHandlers();
    };

    const addButtons = document.querySelectorAll('.catalog__cart-button'); // Змінено на один слеш

    addButtons.forEach(button => {
        const originalHTML = button.innerHTML;
        const originalBg = button.style.backgroundColor;
        const originalColor = button.style.color;
        let isAnimating = false;

        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (isAnimating) return;
            isAnimating = true;

            let product = {};

            const item = button.closest('.catalog__item');
            const imageEl = item.querySelector('.catalog__img');
            product = {
                name: item.querySelector('.catalog__item-title')?.textContent || 'Товар',
                price: item.querySelector('.catalog__meta-price')?.textContent.split(':')[1]?.trim() || '0$',
                image: imageEl?.getAttribute('src') || ''
            };

            showNotification(`Додано до кошика: ${product.name}`);
            addToCart(product.name, product.price, product.image);

            button.innerHTML = 'Додано';
            button.style.backgroundColor = '#4CAF50';
            button.style.color = 'white';

            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.backgroundColor = originalBg;
                button.style.color = originalColor;
                isAnimating = false;
            }, 1500);
        });
    });
};

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
  
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');
  
    emailInput.addEventListener('input', function () {
        validateEmail(this);
    });
  
    emailInput.addEventListener('blur', function () {
        validateEmail(this);
    });
  
    loginForm.addEventListener('submit', function (e) {
        if (!validateEmail(emailInput)) {
            e.preventDefault();
        }
    });
  
    function validateEmail(input) {
        const emailRegex = /[a-zA-Z0-9._%+-]+@gmail\.com$/;
        const isValid = emailRegex.test(input.value);
        if (isValid) {
            emailError.style.display = 'none';
            input.classList.remove('invalid');
            input.classList.add('valid');
            return true;
        } else {
            emailError.style.display = 'block';
            input.classList.remove('valid');
            input.classList.add('invalid');
            return false;
        }
    };
};