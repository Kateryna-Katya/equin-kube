window.addEventListener("load", () => {
    console.log("Equin-Kube: Window loaded. Starting...");

    // 1. Регистрация плагинов
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Запуск всех модулей
    initSmoothScroll();
    initHeader();
    initHero3D();
    initHeroText();
    initAnimations(); // <-- ИСПРАВЛЕННАЯ ФУНКЦИЯ
    initAccordion();
    initSlider();
    initContactForm();
    initCookiePopup();

    // Принудительное обновление триггеров
    ScrollTrigger.refresh();
});

/* =========================================
   1. Smooth Scroll
   ========================================= */
function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    window.lenisObj = lenis;
}

/* =========================================
   2. Header & Mobile Menu
   ========================================= */
function initHeader() {
    const header = document.querySelector('.header');
    const burger = document.querySelector('.header__burger');
    const nav = document.querySelector('.header__nav');
    const navLinks = document.querySelectorAll('.header__link');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > lastScroll && currentScroll > 50) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScroll = currentScroll;
    });

    if (burger && nav) {
        burger.addEventListener('click', () => {
            const isActive = burger.classList.toggle('is-active');
            nav.classList.toggle('is-active');
            if (isActive) {
                if (window.lenisObj) window.lenisObj.stop();
                document.body.style.overflow = 'hidden';
            } else {
                if (window.lenisObj) window.lenisObj.start();
                document.body.style.overflow = '';
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('is-active');
                nav.classList.remove('is-active');
                if (window.lenisObj) window.lenisObj.start();
                document.body.style.overflow = '';
            });
        });
    }
}

/* =========================================
   3. Hero 3D Scene
   ========================================= */
function initHero3D() {
    const container = document.getElementById('scene-container');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 });
    const cubesGroup = new THREE.Group();

    for (let i = 0; i < 15; i++) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2);
        cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        cube.scale.setScalar(Math.random() * 0.5 + 0.5);
        cubesGroup.add(cube);
    }
    scene.add(cubesGroup);

    const light1 = new THREE.PointLight(0x4F46E5, 2, 10);
    light1.position.set(-5, 2, 5);
    scene.add(light1);
    const light2 = new THREE.PointLight(0x0EA5E9, 2, 10);
    light2.position.set(5, -2, 5);
    scene.add(light2);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    function animate() {
        requestAnimationFrame(animate);
        cubesGroup.rotation.y += 0.005 + (mouseX * 0.05 - cubesGroup.rotation.y * 0.05);
        cubesGroup.rotation.x += 0.002 + (mouseY * 0.05 - cubesGroup.rotation.x * 0.05);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

/* =========================================
   4. Hero Text
   ========================================= */
function initHeroText() {
    if (typeof SplitType === 'undefined') return;
    const typeSplit = new SplitType('#hero-title', { types: 'lines', tagName: 'span' });
    const tl = gsap.timeline();

    if (typeSplit.lines.length > 0) {
        tl.from(typeSplit.lines, {
            y: '100%', opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.1, delay: 0.2
        });
    }
    tl.from('#hero-desc', { y: 20, opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.6')
      .from('#hero-actions', { y: 20, opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.6')
      .from('#hero-stats', { opacity: 0, duration: 1, ease: 'power2.out' }, '-=0.6')
      .from('.hero__visual', { scale: 0.8, opacity: 0, duration: 1.5, ease: 'elastic.out(1, 0.75)' }, '-=1.2');
}

/* =========================================
   5. Animations (Sections) - ИСПРАВЛЕНО
   ========================================= */
function initAnimations() {
    // --- ИСПРАВЛЕНИЕ: Используем ScrollTrigger.batch ---
    
    // 1. Карточки "О платформе" (About)
    // Сначала скрываем их через JS, чтобы избежать мигания
    gsap.set(".about__card", { y: 50, opacity: 0 });

    ScrollTrigger.batch(".about__card", {
        start: "top 90%", // Начинаем, когда элемент чуть показался
        onEnter: batch => gsap.to(batch, {
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            stagger: 0.2, 
            ease: "power2.out",
            overwrite: true 
        }),
        once: true // Анимировать только один раз при появлении
    });

    // 2. Список методики
    gsap.set(".methodology__list li", { x: -30, opacity: 0 });
    
    ScrollTrigger.batch(".methodology__list li", {
        start: "top 90%",
        onEnter: batch => gsap.to(batch, {
            opacity: 1, 
            x: 0, 
            duration: 0.6, 
            stagger: 0.15, 
            ease: "power2.out",
            overwrite: true
        }),
        once: true
    });

    // 3. Блок кода
    const codeBlock = document.querySelector('.code-block');
    if (codeBlock) {
        gsap.fromTo(codeBlock, 
            { scale: 0.8, opacity: 0, rotation: 10 },
            {
                scrollTrigger: { trigger: '.methodology', start: 'top 80%' },
                scale: 1, opacity: 1, rotation: 0, duration: 1, ease: 'back.out(1.7)'
            }
        );
    }
}

/* =========================================
   6. Accordion
   ========================================= */
function initAccordion() {
    const accordions = document.querySelectorAll('.accordion__item');
    accordions.forEach(el => {
        const header = el.querySelector('.accordion__header');
        header.addEventListener('click', () => {
            const content = el.querySelector('.accordion__content');
            el.classList.toggle('is-active');
            if (el.classList.contains('is-active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = null;
            }
        });
    });
}

/* =========================================
   7. Slider
   ========================================= */
function initSlider() {
    if (typeof Swiper === 'undefined') return;
    new Swiper('.reviews-slider', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        grabCursor: true,
        pagination: { el: '.swiper-pagination', clickable: true },
        breakpoints: {
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 30 }
        }
    });
}

/* =========================================
   8. Contact Form
   ========================================= */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const msgBox = document.getElementById('formMessage');
    const phoneInput = document.getElementById('phone');
    const captchaInput = document.getElementById('captcha');
    const captchaLabel = document.getElementById('captchaLabel');

    phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9+]/g, '');
    });

    const num1 = Math.floor(Math.random() * 5) + 1;
    const num2 = Math.floor(Math.random() * 5) + 1;
    captchaLabel.textContent = `Сколько будет ${num1} + ${num2}?`;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (parseInt(captchaInput.value) !== (num1 + num2)) {
            msgBox.textContent = "Ошибка: Неверный ответ.";
            msgBox.className = "form-message error";
            return;
        }
        const btn = form.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = "Отправка...";
        btn.disabled = true;
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            msgBox.textContent = "Заявка успешно отправлена!";
            msgBox.className = "form-message success";
            form.reset();
            captchaInput.value = '';
        }, 1500);
    });
}

/* =========================================
   9. Cookie Popup
   ========================================= */
function initCookiePopup() {
    const cookiePopup = document.getElementById('cookiePopup');
    const acceptBtn = document.getElementById('acceptCookie');
    if (!cookiePopup || !acceptBtn) return;
    if (!localStorage.getItem('cookieAccepted')) {
        setTimeout(() => {
            cookiePopup.style.display = 'block';
            setTimeout(() => cookiePopup.classList.add('is-visible'), 10);
        }, 2000);
    }
    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieAccepted', 'true');
        cookiePopup.classList.remove('is-visible');
        setTimeout(() => cookiePopup.style.display = 'none', 500);
    });
}