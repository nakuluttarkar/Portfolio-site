// ================================
// Main JavaScript for Portfolio
// Handles: Navigation, Theme Toggle, Scroll Effects, Contact Form
// ================================

document.addEventListener('DOMContentLoaded', function () {

    // ================================
    // Theme Toggle
    // ================================

    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    const html = document.documentElement;

    // Check for saved theme preference or default to 'dark'
    const currentTheme = localStorage.getItem('theme') || 'dark';

    // Set initial theme
    if (currentTheme === 'light') {
        html.classList.add('light');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }

    // Theme toggle click handler
    themeToggle.addEventListener('click', function () {
        html.classList.toggle('light');

        if (html.classList.contains('light')) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
            localStorage.setItem('theme', 'light');
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
            localStorage.setItem('theme', 'dark');
        }
    });


    // ================================
    // Mobile Navigation
    // ================================

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    mobileMenuBtn.addEventListener('click', function () {
        navLinks.classList.toggle('open');
    });

    // Close mobile menu when clicking a link
    const navLinkItems = navLinks.querySelectorAll('a');
    navLinkItems.forEach(link => {
        link.addEventListener('click', function () {
            navLinks.classList.remove('open');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (event) {
        const isClickInsideNav = navLinks.contains(event.target);
        const isClickOnButton = mobileMenuBtn.contains(event.target);

        if (!isClickInsideNav && !isClickOnButton && navLinks.classList.contains('open')) {
            navLinks.classList.remove('open');
        }
    });


    // ================================
    // Smooth Scroll for Navigation Links
    // ================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    // ================================
    // Header Scroll Effect
    // ================================

    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        // Add shadow when scrolled
        if (currentScroll > 50) {
            header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });


    // ================================
    // Active Navigation Link Highlighting
    // ================================

    const sections = document.querySelectorAll('section[id]');

    function highlightNavigation() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                if (navLink) {
                    document.querySelectorAll('.nav-links a').forEach(link => {
                        link.style.color = '';
                    });
                    navLink.style.color = 'var(--primary)';
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);


    // ================================
    // Intersection Observer for Animations
    // ================================

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.project-card, .timeline-item, .skill-category, .cert-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });


    // ================================
    // Contact Form Submission
    // ================================

    window.submitContactForm = async function () {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        const formStatus = document.getElementById('formStatus');

        // Clear previous status
        formStatus.className = 'form-status';
        formStatus.textContent = '';

        // Validation
        if (!name) {
            showFormStatus('error', 'Please enter your name.');
            return;
        }

        if (!email || !isValidEmail(email)) {
            showFormStatus('error', 'Please enter a valid email address.');
            return;
        }

        if (!message) {
            showFormStatus('error', 'Please enter a message.');
            return;
        }

        // Show loading state
        const submitButton = document.querySelector('#contactForm .btn-primary');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        try {
            // Send to Formspree
            const response = await fetch('https://formspree.io/f/xovlrdwa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message
                })
            });

            if (response.ok) {
                showFormStatus('success', '✅ Thank you! Your message has been sent successfully.');

                // Clear form
                document.getElementById('name').value = '';
                document.getElementById('email').value = '';
                document.getElementById('message').value = '';
            } else {
                showFormStatus('error', '❌ Oops! Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormStatus('error', '⚠️ Network error. Please check your connection and try again.');
        } finally {
            // Reset button
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    };

    function showFormStatus(type, message) {
        const formStatus = document.getElementById('formStatus');
        formStatus.className = `form-status ${type}`;
        formStatus.textContent = message;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


    // ================================
    // Current Year in Footer
    // ================================

    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }


    // ================================
    // Typing Effect for Hero (Optional Enhancement)
    // ================================

    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }

        type();
    }

    // Uncomment to enable typing effect
    // const heroSubtitle = document.querySelector('.hero-subtitle');
    // if (heroSubtitle) {
    //   const originalText = heroSubtitle.textContent;
    //   typeWriter(heroSubtitle, originalText, 80);
    // }


    // ================================
    // Scroll to Top Button (Optional)
    // ================================

    const scrollToTopButton = document.createElement('button');
    scrollToTopButton.innerHTML = '↑';
    scrollToTopButton.className = 'scroll-to-top';
    scrollToTopButton.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 2rem;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 999;
    box-shadow: var(--shadow-sm);
  `;

    document.body.appendChild(scrollToTopButton);

    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 500) {
            scrollToTopButton.style.opacity = '1';
            scrollToTopButton.style.visibility = 'visible';
        } else {
            scrollToTopButton.style.opacity = '0';
            scrollToTopButton.style.visibility = 'hidden';
        }
    });

    scrollToTopButton.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });


    // ================================
    // Performance: Lazy Load Images (if you add images later)
    // ================================

    const lazyImages = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));


    // ================================
    // Console Easter Egg
    // ================================

    console.log('%c👋 Hi there!', 'font-size: 24px; color: #06b6d4; font-weight: bold;');
    console.log('%cLooking for something? Check out the source code on GitHub!', 'font-size: 14px; color: #9ca3af;');
    console.log('%cBuilt with ❤️ by Nakul Uttarkar', 'font-size: 12px; color: #6b7280;');

});

// ================================
// Keyboard Navigation Accessibility
// ================================

document.addEventListener('keydown', function (e) {
    // Press 'Escape' to close mobile menu
    if (e.key === 'Escape') {
        const navLinks = document.getElementById('navLinks');
        if (navLinks && navLinks.classList.contains('open')) {
            navLinks.classList.remove('open');
        }

        // Close chatbot if open
        const chatbotWindow = document.getElementById('chatbotWindow');
        if (chatbotWindow && chatbotWindow.classList.contains('open')) {
            chatbotWindow.classList.remove('open');
            document.getElementById('chatbotToggle').style.display = 'flex';
        }
    }
});