document.addEventListener('DOMContentLoaded', () => {
    /* ----------------------------------------------------
       Sticky Navigation
       ---------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* ----------------------------------------------------
       Mobile Menu Toggle
       ---------------------------------------------------- */
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    /* ----------------------------------------------------
       Site Theme Toggle
       ---------------------------------------------------- */
    const root = document.documentElement;
    const storedTheme = localStorage.getItem('tasi-theme');
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    const applyTheme = (theme, persist = true) => {
        root.setAttribute('data-theme', theme);

        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            const isLight = theme === 'light';
            toggle.classList.toggle('is-light', isLight);
            toggle.setAttribute('aria-pressed', isLight ? 'false' : 'true');
            toggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
        }

        if (persist) {
            localStorage.setItem('tasi-theme', theme);
        }
    };

    const injectThemeToggle = () => {
        if (!navLinks || document.getElementById('themeToggle')) {
            return;
        }

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.id = 'themeToggle';
        toggle.className = 'theme-toggle';
        toggle.innerHTML = `
            <i class="ph ph-sun theme-sun" aria-hidden="true"></i>
            <span class="theme-toggle-thumb" aria-hidden="true"></span>
            <i class="ph ph-moon theme-moon" aria-hidden="true"></i>
        `;

        toggle.addEventListener('click', () => {
            const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme);
        });

        navLinks.appendChild(toggle);
        applyTheme(root.getAttribute('data-theme') || 'dark', false);
    };

    applyTheme(storedTheme || preferredTheme, false);
    injectThemeToggle();

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('ph-list');
                icon.classList.add('ph-x');
            } else {
                icon.classList.remove('ph-x');
                icon.classList.add('ph-list');
            }
        });
    }

    /* ----------------------------------------------------
       Scroll Reveal Animations
       ---------------------------------------------------- */
    const revealElements = document.querySelectorAll('.reveal-up, .reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('reveal')) {
                    entry.target.classList.add('visible');
                }
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    /* ----------------------------------------------------
       Countdown Timer (Target: October 1, 2026)
       ---------------------------------------------------- */
    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMinutes = document.getElementById('cd-minutes');
    const cdSeconds = document.getElementById('cd-seconds');

    if (cdDays) {
        // Set Target Date to October 1, 2026
        const targetDate = new Date('October 1, 2026 09:00:00').getTime();

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                cdDays.innerText = "00";
                cdHours.innerText = "00";
                cdMinutes.innerText = "00";
                cdSeconds.innerText = "00";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            cdDays.innerText = days.toString().padStart(2, '0');
            cdHours.innerText = hours.toString().padStart(2, '0');
            cdMinutes.innerText = minutes.toString().padStart(2, '0');
            cdSeconds.innerText = seconds.toString().padStart(2, '0');
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    /* ----------------------------------------------------
       Hero Network Canvas
       ---------------------------------------------------- */
    const networkCanvas = document.getElementById('networkCanvas');

    if (networkCanvas) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobileViewport = window.matchMedia('(max-width: 767px)').matches;

        if (!prefersReducedMotion && !isMobileViewport) {
            const ctx = networkCanvas.getContext('2d');

            if (ctx) {
                const CFG = {
                    nodeCount: 46,
                    connectionDist: 130,
                    connectionOpacity: 0.14,
                    lineWidth: 0.75,
                    mouseRadius: 150,
                    mouseForce: 0.038,
                    maxSpeed: 1.45,
                    baseSpeed: 0.4,
                    pulseSpeed: 0.015,
                    colors: ['#d4572a', '#5c7a3e', '#c8992a', '#b84a22', '#4a6230', '#d46a3e'],
                    sizes: [2.1, 2.6, 3.0, 3.5, 2.4]
                };

                let nodes = [];
                let mouseX = -9999;
                let mouseY = -9999;
                let rafId = null;
                let lastTime = 0;
                let frameCount = 0;
                let slowFrames = 0;
                const rgbCache = {};

                const resizeCanvas = () => {
                    const dpr = Math.min(window.devicePixelRatio || 1, 2);
                    const rect = networkCanvas.getBoundingClientRect();
                    const width = Math.max(1, Math.floor(rect.width));
                    const height = Math.max(1, Math.floor(rect.height));

                    networkCanvas.width = width * dpr;
                    networkCanvas.height = height * dpr;
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    networkCanvas._w = width;
                    networkCanvas._h = height;
                };

                const createNodes = () => {
                    const width = networkCanvas._w;
                    const height = networkCanvas._h;
                    nodes = Array.from({ length: CFG.nodeCount }, () => {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = CFG.baseSpeed * (0.5 + Math.random() * 0.8);

                        return {
                            x: Math.random() * width,
                            y: Math.random() * height,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            radius: CFG.sizes[Math.floor(Math.random() * CFG.sizes.length)],
                            color: CFG.colors[Math.floor(Math.random() * CFG.colors.length)],
                            opacity: 0.35 + Math.random() * 0.55,
                            phase: Math.random() * Math.PI * 2
                        };
                    });
                };

                const hexToRgb = (hex) => {
                    if (rgbCache[hex]) {
                        return rgbCache[hex];
                    }

                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    const rgb = `${r},${g},${b}`;
                    rgbCache[hex] = rgb;
                    return rgb;
                };

                const drawNetwork = () => {
                    const width = networkCanvas._w;
                    const height = networkCanvas._h;
                    ctx.clearRect(0, 0, width, height);

                    for (let i = 0; i < nodes.length; i++) {
                        for (let j = i + 1; j < nodes.length; j++) {
                            const ni = nodes[i];
                            const nj = nodes[j];
                            const dx = ni.x - nj.x;
                            const dy = ni.y - nj.y;
                            const d2 = dx * dx + dy * dy;
                            const maxDist = CFG.connectionDist;

                            if (d2 < maxDist * maxDist) {
                                const dist = Math.sqrt(d2);
                                const alpha = (1 - dist / maxDist) * CFG.connectionOpacity;

                                ctx.beginPath();
                                ctx.moveTo(ni.x, ni.y);
                                ctx.lineTo(nj.x, nj.y);
                                ctx.strokeStyle = `rgba(${hexToRgb(ni.color)},${alpha.toFixed(3)})`;
                                ctx.lineWidth = CFG.lineWidth;
                                ctx.stroke();
                            }
                        }
                    }

                    nodes.forEach((node) => {
                        const pulse = 1 + Math.sin(node.phase) * 0.18;
                        const radius = node.radius * pulse;
                        const rgb = hexToRgb(node.color);

                        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 3.5);
                        gradient.addColorStop(0, `rgba(${rgb},${(node.opacity * 0.22).toFixed(3)})`);
                        gradient.addColorStop(1, `rgba(${rgb},0)`);

                        ctx.beginPath();
                        ctx.arc(node.x, node.y, radius * 3.5, 0, Math.PI * 2);
                        ctx.fillStyle = gradient;
                        ctx.fill();

                        ctx.beginPath();
                        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${rgb},${node.opacity.toFixed(3)})`;
                        ctx.fill();
                    });
                };

                const updateNodes = () => {
                    const width = networkCanvas._w;
                    const height = networkCanvas._h;

                    nodes.forEach((node) => {
                        node.phase += CFG.pulseSpeed;

                        const mdx = mouseX - node.x;
                        const mdy = mouseY - node.y;
                        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

                        if (mdist < CFG.mouseRadius && mdist > 1) {
                            const force = (1 - mdist / CFG.mouseRadius) * CFG.mouseForce;
                            node.vx += (mdx / mdist) * force;
                            node.vy += (mdy / mdist) * force;
                        }

                        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
                        if (speed > CFG.maxSpeed) {
                            node.vx = (node.vx / speed) * CFG.maxSpeed;
                            node.vy = (node.vy / speed) * CFG.maxSpeed;
                        }

                        node.x += node.vx;
                        node.y += node.vy;

                        const pad = 30;
                        if (node.x < pad) { node.x = pad; node.vx = Math.abs(node.vx); }
                        if (node.x > width - pad) { node.x = width - pad; node.vx = -Math.abs(node.vx); }
                        if (node.y < pad) { node.y = pad; node.vy = Math.abs(node.vy); }
                        if (node.y > height - pad) { node.y = height - pad; node.vy = -Math.abs(node.vy); }
                    });
                };

                const animationLoop = (timestamp) => {
                    const delta = timestamp - lastTime;
                    lastTime = timestamp;
                    frameCount++;

                    if (frameCount % 60 === 0 && delta > 33) {
                        slowFrames++;
                        if (slowFrames >= 3 && nodes.length > 20) {
                            nodes.splice(0, Math.floor(nodes.length * 0.25));
                            slowFrames = 0;
                        }
                    } else if (delta <= 20) {
                        slowFrames = 0;
                    }

                    updateNodes();
                    drawNetwork();
                    rafId = window.requestAnimationFrame(animationLoop);
                };

                const handleMouseMove = (event) => {
                    const rect = networkCanvas.getBoundingClientRect();
                    mouseX = event.clientX - rect.left;
                    mouseY = event.clientY - rect.top;
                };

                const handleTouchMove = (event) => {
                    if (!event.touches.length) {
                        return;
                    }
                    const rect = networkCanvas.getBoundingClientRect();
                    mouseX = event.touches[0].clientX - rect.left;
                    mouseY = event.touches[0].clientY - rect.top;
                };

                const handleMouseLeave = () => {
                    mouseX = -9999;
                    mouseY = -9999;
                };

                const heroElement = networkCanvas.closest('.hero') || networkCanvas.parentElement;
                heroElement.addEventListener('mousemove', handleMouseMove);
                heroElement.addEventListener('mouseleave', handleMouseLeave);
                heroElement.addEventListener('touchmove', handleTouchMove, { passive: true });

                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        window.cancelAnimationFrame(rafId);
                        rafId = null;
                    } else if (!rafId) {
                        lastTime = performance.now();
                        rafId = window.requestAnimationFrame(animationLoop);
                    }
                });

                let networkResizeTimer;
                window.addEventListener('resize', () => {
                    window.clearTimeout(networkResizeTimer);
                    networkResizeTimer = window.setTimeout(() => {
                        resizeCanvas();
                        createNodes();
                    }, 150);
                });

                resizeCanvas();
                createNodes();
                lastTime = performance.now();
                rafId = window.requestAnimationFrame(animationLoop);
            }
        }
    }

    /* ----------------------------------------------------
       Masonry Gallery (GSAP)
       ---------------------------------------------------- */
    const masonryGallery = document.getElementById('masonryGallery');
    const galleryRefreshBtn = document.getElementById('galleryRefreshBtn');

    if (masonryGallery) {
        const INITIAL_ITEMS = [
            { id: '1', img: 'img/Gallery/7T7A0181.webp', title: 'Registration & Delegate Passes', height: 400 },
            { id: '2', img: 'img/Gallery/7T7A0215.webp', title: 'Networking & Connections', height: 260 },
            { id: '3', img: 'img/Gallery/7T7A0259.webp', title: 'Outdoor Receptions', height: 520 },
            { id: '4', img: 'img/Gallery/7T7A0527.webp', title: 'High-Level Panel Discussions', height: 360 },
            { id: '5', img: 'img/Gallery/7T7A0573.webp', title: 'Inaugural Lamp Lighting', height: 500 },
            { id: '6', img: 'img/Gallery/7T7A0646.webp', title: 'Ministerial Keynote Address', height: 320 },
            { id: '7', img: 'img/Gallery/7T7A1512.webp', title: 'Interactive Policy Rounds', height: 450 },
            { id: '8', img: 'img/Gallery/7T7A2715.webp', title: 'Plenary Sessions', height: 300 },
            { id: '9', img: 'img/Gallery/7T7A2996.webp', title: 'Expert Insights', height: 540 },
            { id: '10', img: 'img/Gallery/7T7A3314 (1).webp', title: 'Cross-Border Cooperation Panel', height: 340 },
            { id: '11', img: 'img/Gallery/7T7A3544.webp', title: 'Safety by Design', height: 380 },
            { id: '12', img: 'img/Gallery/7T7A3637.webp', title: 'Industry Partners & Exhibitors', height: 460 },
            { id: '13', img: 'img/Gallery/7T7A4136.webp', title: 'Civil Society Perspectives', height: 310 },
            { id: '14', img: 'img/Gallery/7T7A4166.webp', title: 'Fireside Chats', height: 420 },
            { id: '15', img: 'img/Gallery/7T7A4504.webp', title: 'Regulatory Frameworks', height: 360 }
        ];

        const options = {
            ease: 'power3.out',
            duration: 0.6,
            stagger: 0.08,
            animateFrom: 'bottom',
            scaleOnHover: true,
            hoverScale: 0.96,
            blurToFocus: true,
            colorShiftOnHover: true
        };

        let items = [...INITIAL_ITEMS];
        let grid = [];
        let hasMounted = false;

        const getColumns = () => {
            const viewport = window.innerWidth;
            if (viewport >= 1500) return 5;
            if (viewport >= 1000) return 4;
            if (viewport >= 600) return 3;
            if (viewport >= 400) return 2;
            return 1;
        };

        const preloadImages = async (urls) => {
            await Promise.all(urls.map((src) => new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = img.onerror = resolve;
            })));
        };

        const getInitialPosition = (item) => {
            const rect = masonryGallery.getBoundingClientRect();
            let direction = options.animateFrom;

            if (direction === 'random') {
                const dirs = ['top', 'bottom', 'left', 'right'];
                direction = dirs[Math.floor(Math.random() * dirs.length)];
            }

            if (direction === 'top') return { x: item.x, y: -220 };
            if (direction === 'bottom') return { x: item.x, y: window.innerHeight + 220 };
            if (direction === 'left') return { x: -220, y: item.y };
            if (direction === 'right') return { x: window.innerWidth + 220, y: item.y };
            if (direction === 'center') {
                return {
                    x: rect.width / 2 - item.w / 2,
                    y: rect.height / 2 - item.h / 2
                };
            }
            return { x: item.x, y: item.y + 100 };
        };

        const calculateGrid = () => {
            const columns = getColumns();
            const containerWidth = masonryGallery.clientWidth;
            const gap = 24;
            const totalGaps = (columns - 1) * gap;
            const columnWidth = (containerWidth - totalGaps) / columns;
            const columnHeights = new Array(columns).fill(0);

            const mapped = items.map((entry) => {
                const nextColumn = columnHeights.indexOf(Math.min(...columnHeights));
                const x = nextColumn * (columnWidth + gap);
                const h = (entry.height / 400) * columnWidth;
                const y = columnHeights[nextColumn];
                columnHeights[nextColumn] += h + gap;

                return {
                    ...entry,
                    x,
                    y,
                    w: columnWidth,
                    h
                };
            });

            grid = mapped;
            masonryGallery.style.height = `${Math.max(...columnHeights, 420)}px`;
        };

        const buildCard = (item) => {
            const card = document.createElement(item.url ? 'a' : 'div');
            card.className = 'masonry-item';
            card.dataset.key = item.id;
            card.setAttribute('aria-label', item.title || 'Gallery image');

            if (item.url) {
                card.href = item.url;
                card.target = '_blank';
                card.rel = 'noopener';
            }

            const image = document.createElement('img');
            image.className = 'masonry-image';
            image.src = item.img;
            image.alt = item.title || 'Gallery highlight';
            image.loading = 'lazy';

            const overlay = document.createElement('div');
            overlay.className = 'masonry-color-overlay';

            const caption = document.createElement('div');
            caption.className = 'masonry-caption';
            caption.textContent = item.title || '';

            card.appendChild(image);
            if (options.colorShiftOnHover) {
                card.appendChild(overlay);
            }
            card.appendChild(caption);

            if (options.scaleOnHover) {
                card.addEventListener('mouseenter', () => {
                    if (window.gsap) {
                        window.gsap.to(card, {
                            scale: options.hoverScale,
                            duration: 0.4,
                            ease: 'power2.out'
                        });
                    }
                });

                card.addEventListener('mouseleave', () => {
                    if (window.gsap) {
                        window.gsap.to(card, {
                            scale: 1,
                            duration: 0.4,
                            ease: 'power2.out'
                        });
                    }
                });
            }

            if (options.colorShiftOnHover) {
                card.addEventListener('mouseenter', () => {
                    if (window.gsap) {
                        window.gsap.to(overlay, { opacity: 0.32, duration: 0.4 });
                    }
                });

                card.addEventListener('mouseleave', () => {
                    if (window.gsap) {
                        window.gsap.to(overlay, { opacity: 0, duration: 0.4 });
                    }
                });
            }

            return card;
        };

        const ensureCards = () => {
            grid.forEach((item) => {
                if (masonryGallery.querySelector(`[data-key="${item.id}"]`)) {
                    return;
                }
                masonryGallery.appendChild(buildCard(item));
            });
        };

        const animateGrid = () => {
            grid.forEach((item, index) => {
                const element = masonryGallery.querySelector(`[data-key="${item.id}"]`);
                if (!element) return;

                const toProps = {
                    x: item.x,
                    y: item.y,
                    width: item.w,
                    height: item.h
                };

                if (!window.gsap) {
                    element.style.transform = `translate(${item.x}px, ${item.y}px)`;
                    element.style.width = `${item.w}px`;
                    element.style.height = `${item.h}px`;
                    element.style.opacity = '1';
                    return;
                }

                if (!hasMounted) {
                    const start = getInitialPosition(item);
                    window.gsap.fromTo(
                        element,
                        {
                            opacity: 0,
                            x: start.x,
                            y: start.y,
                            width: item.w,
                            height: item.h,
                            ...(options.blurToFocus ? { filter: 'blur(20px)' } : {})
                        },
                        {
                            opacity: 1,
                            ...toProps,
                            ...(options.blurToFocus ? { filter: 'blur(0px)' } : {}),
                            duration: 1.2,
                            ease: options.ease,
                            delay: index * options.stagger,
                            overwrite: 'auto'
                        }
                    );
                } else {
                    window.gsap.to(element, {
                        ...toProps,
                        duration: options.duration,
                        ease: options.ease,
                        overwrite: 'auto'
                    });
                }
            });

            hasMounted = true;
        };

        const renderGallery = () => {
            calculateGrid();
            ensureCards();
            animateGrid();
        };

        const shuffleItems = () => {
            const shuffled = [...INITIAL_ITEMS].sort(() => Math.random() - 0.5);
            items = shuffled;

            const nodes = Array.from(masonryGallery.children);
            nodes.sort((a, b) => {
                const ai = items.findIndex((entry) => entry.id === a.dataset.key);
                const bi = items.findIndex((entry) => entry.id === b.dataset.key);
                return ai - bi;
            }).forEach((node) => masonryGallery.appendChild(node));

            hasMounted = false;
            renderGallery();
        };

        const initGallery = async () => {
            await preloadImages(items.map((entry) => entry.img));
            renderGallery();
        };

        let resizeTimer;
        window.addEventListener('resize', () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => {
                renderGallery();
            }, 120);
        });

        if (galleryRefreshBtn) {
            galleryRefreshBtn.addEventListener('click', () => {
                shuffleItems();
                const icon = galleryRefreshBtn.querySelector('i');
                if (icon && window.gsap) {
                    window.gsap.fromTo(icon, { rotate: 0 }, { rotate: 180, duration: 0.45, ease: 'power2.out' });
                }
            });
        }

        initGallery();
    }

    /* ----------------------------------------------------
       Team Rendering (About Page)
       ---------------------------------------------------- */
    const teamGrid = document.getElementById('teamGrid');
    // Ensure teamMembers is defined (from team_data.js)
    if (teamGrid && typeof teamMembers !== 'undefined') {
        const escHtml = value => String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        const safePhotoName = value => /^[A-Za-z0-9._-]+$/.test(String(value || '')) ? value : '';

        const initials = name => {
            const parts = name.replace(/^(Dr\.|Mr\.|Ms\.)\s*/i, '').trim().split(' ');
            if (parts.length === 1) return parts[0][0].toUpperCase();
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        };

        const catColors = {
            "Core Team": { bg: "rgba(236,72,153,0.1)",  text: "#EC4899" } // using Civil Society colors for CSR
        };

        teamMembers.forEach((member, i) => {
            const col = catColors["Core Team"];
            const safeName = escHtml(member.name);
            const safeDesignation = escHtml(member.designation || '');
            const safeBio = escHtml(member.bio || '');
            const safeInitials = escHtml(initials(member.name || ''));
            const photo = safePhotoName(member.photo);
            const card = document.createElement('div');
            card.className = 'speaker-card';
            card.style.animation = 'fadeIn 0.5s ease forwards';
            card.style.animationDelay = `${i * 0.1}s`;
            card.style.opacity = '0'; // Starts invisible, animated to 1

            card.innerHTML = `
                <div class="card-inner">
                    <!-- FRONT -->
                    <div class="card-front">
                        <div class="speaker-photo-wrap">
                            ${photo
                                ? `<img src="img/team/${photo}" alt="${safeName}"
                                       onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                                   <div class="speaker-initials" style="display:none">${safeInitials}</div>`
                                : `<div class="speaker-initials">${safeInitials}</div>`
                            }
                        </div>
                        <h3 class="speaker-name">${safeName}</h3>
                        <p class="speaker-role">${safeDesignation}</p>
                        <span class="speaker-org" style="background:${col.bg}; color:${col.text};">Core Team</span>
                        <div class="card-hover-hint">
                            <i class="ph ph-arrow-clockwise"></i> Hover for bio
                        </div>
                    </div>
                    <!-- BACK -->
                    <div class="card-back">
                        <div class="back-name">${safeName}</div>
                        <div class="back-org">${safeDesignation}</div>
                        <div class="back-bio">${safeBio}</div>
                    </div>
                </div>`;

            teamGrid.appendChild(card);
        });
    }
});
