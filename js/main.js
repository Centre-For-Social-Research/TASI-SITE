document.addEventListener('DOMContentLoaded', () => {
    class Particle {
        constructor() {
            this.pos = { x: 0, y: 0 };
            this.vel = { x: 0, y: 0 };
            this.acc = { x: 0, y: 0 };
            this.target = { x: 0, y: 0 };

            this.closeEnoughTarget = 100;
            this.maxSpeed = 1.0;
            this.maxForce = 0.1;
            this.particleSize = 10;
            this.isKilled = false;

            this.startColor = { r: 0, g: 0, b: 0 };
            this.targetColor = { r: 0, g: 0, b: 0 };
            this.colorWeight = 0;
            this.colorBlendRate = 0.01;
        }

        move() {
            let proximityMult = 1;
            const dx = this.pos.x - this.target.x;
            const dy = this.pos.y - this.target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.closeEnoughTarget) {
                proximityMult = distance / this.closeEnoughTarget;
            }

            const towardsTarget = {
                x: this.target.x - this.pos.x,
                y: this.target.y - this.pos.y
            };

            const magnitude = Math.sqrt(towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y);
            if (magnitude > 0) {
                towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult;
                towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult;
            }

            const steer = {
                x: towardsTarget.x - this.vel.x,
                y: towardsTarget.y - this.vel.y
            };

            const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
            if (steerMagnitude > 0) {
                steer.x = (steer.x / steerMagnitude) * this.maxForce;
                steer.y = (steer.y / steerMagnitude) * this.maxForce;
            }

            this.acc.x += steer.x;
            this.acc.y += steer.y;

            this.vel.x += this.acc.x;
            this.vel.y += this.acc.y;
            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;
            this.acc.x = 0;
            this.acc.y = 0;
        }

        draw(ctx, drawAsPoints) {
            if (this.colorWeight < 1.0) {
                this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
            }

            const currentColor = {
                r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
                g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
                b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight)
            };

            ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
            if (drawAsPoints) {
                ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
                return;
            }

            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        kill(width, height) {
            if (!this.isKilled) {
                const randomPos = generateRandomPos(width / 2, height / 2, (width + height) / 2);
                this.target.x = randomPos.x;
                this.target.y = randomPos.y;

                this.startColor = {
                    r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
                    g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
                    b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight
                };
                this.targetColor = { r: 0, g: 0, b: 0 };
                this.colorWeight = 0;
                this.isKilled = true;
            }
        }
    }

    const generateRandomPos = (x, y, mag) => {
        const randomX = Math.random() * 1000;
        const randomY = Math.random() * 500;

        const direction = {
            x: randomX - x,
            y: randomY - y
        };

        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (magnitude > 0) {
            direction.x = (direction.x / magnitude) * mag;
            direction.y = (direction.y / magnitude) * mag;
        }

        return {
            x: x + direction.x,
            y: y + direction.y
        };
    };

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
    const revealElements = document.querySelectorAll('.reveal-up');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
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
       Hero Particle Text
       ---------------------------------------------------- */
    const heroParticleCanvas = document.getElementById('heroParticleCanvas');

    if (heroParticleCanvas) {
        const words = ['TASI 2026', 'PEOPLE FIRST', 'SAFETY ALWAYS', 'NEW DELHI'];
        const pixelSteps = 6;
        const drawAsPoints = true;
        const particles = [];
        const mouse = { x: 0, y: 0, isPressed: false, isRightClick: false };
        let frameCount = 0;
        let wordIndex = 0;
        let animationFrameId = null;

        const resizeCanvas = () => {
            const maxWidth = Math.min(heroParticleCanvas.parentElement.clientWidth - 2, 900);
            const width = Math.max(300, Math.floor(maxWidth));
            const height = width < 480 ? 200 : 280;

            heroParticleCanvas.width = width;
            heroParticleCanvas.height = height;
        };

        const nextWord = (word) => {
            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = heroParticleCanvas.width;
            offscreenCanvas.height = heroParticleCanvas.height;
            const offscreenCtx = offscreenCanvas.getContext('2d');

            offscreenCtx.fillStyle = 'white';
            const fontSize = Math.max(44, Math.floor(heroParticleCanvas.width * 0.12));
            offscreenCtx.font = `bold ${fontSize}px Arial`;
            offscreenCtx.textAlign = 'center';
            offscreenCtx.textBaseline = 'middle';
            offscreenCtx.fillText(word, heroParticleCanvas.width / 2, heroParticleCanvas.height / 2);

            const imageData = offscreenCtx.getImageData(0, 0, heroParticleCanvas.width, heroParticleCanvas.height);
            const px = imageData.data;

            const newColor = {
                r: Math.random() * 255,
                g: Math.random() * 255,
                b: Math.random() * 255
            };

            let particleIndex = 0;
            const coordIndexes = [];

            for (let i = 0; i < px.length; i += pixelSteps * 4) {
                coordIndexes.push(i);
            }

            for (let i = coordIndexes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = coordIndexes[i];
                coordIndexes[i] = coordIndexes[j];
                coordIndexes[j] = temp;
            }

            for (const coordIndex of coordIndexes) {
                const alpha = px[coordIndex + 3];
                if (alpha <= 0) {
                    continue;
                }

                const x = (coordIndex / 4) % heroParticleCanvas.width;
                const y = Math.floor(coordIndex / 4 / heroParticleCanvas.width);

                let particle;

                if (particleIndex < particles.length) {
                    particle = particles[particleIndex];
                    particle.isKilled = false;
                    particleIndex++;
                } else {
                    particle = new Particle();
                    const randomPos = generateRandomPos(
                        heroParticleCanvas.width / 2,
                        heroParticleCanvas.height / 2,
                        (heroParticleCanvas.width + heroParticleCanvas.height) / 2
                    );
                    particle.pos.x = randomPos.x;
                    particle.pos.y = randomPos.y;
                    particle.maxSpeed = Math.random() * 6 + 4;
                    particle.maxForce = particle.maxSpeed * 0.05;
                    particle.particleSize = Math.random() * 6 + 6;
                    particle.colorBlendRate = Math.random() * 0.0275 + 0.0025;
                    particles.push(particle);
                }

                particle.startColor = {
                    r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
                    g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
                    b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight
                };
                particle.targetColor = newColor;
                particle.colorWeight = 0;
                particle.target.x = x;
                particle.target.y = y;
            }

            for (let i = particleIndex; i < particles.length; i++) {
                particles[i].kill(heroParticleCanvas.width, heroParticleCanvas.height);
            }
        };

        const animateParticles = () => {
            const ctx = heroParticleCanvas.getContext('2d');
            ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
            ctx.fillRect(0, 0, heroParticleCanvas.width, heroParticleCanvas.height);

            for (let i = particles.length - 1; i >= 0; i--) {
                const particle = particles[i];
                particle.move();
                particle.draw(ctx, drawAsPoints);

                if (particle.isKilled) {
                    if (
                        particle.pos.x < 0 ||
                        particle.pos.x > heroParticleCanvas.width ||
                        particle.pos.y < 0 ||
                        particle.pos.y > heroParticleCanvas.height
                    ) {
                        particles.splice(i, 1);
                    }
                }
            }

            if (mouse.isPressed && mouse.isRightClick) {
                particles.forEach((particle) => {
                    const distance = Math.sqrt(
                        Math.pow(particle.pos.x - mouse.x, 2) +
                        Math.pow(particle.pos.y - mouse.y, 2)
                    );

                    if (distance < 50) {
                        particle.kill(heroParticleCanvas.width, heroParticleCanvas.height);
                    }
                });
            }

            frameCount++;
            if (frameCount % 240 === 0) {
                wordIndex = (wordIndex + 1) % words.length;
                nextWord(words[wordIndex]);
            }

            animationFrameId = requestAnimationFrame(animateParticles);
        };

        const handleMouseDown = (e) => {
            mouse.isPressed = true;
            mouse.isRightClick = e.button === 2;
            const rect = heroParticleCanvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseUp = () => {
            mouse.isPressed = false;
            mouse.isRightClick = false;
        };

        const handleMouseMove = (e) => {
            const rect = heroParticleCanvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        resizeCanvas();
        nextWord(words[0]);
        animateParticles();

        heroParticleCanvas.addEventListener('mousedown', handleMouseDown);
        heroParticleCanvas.addEventListener('mouseup', handleMouseUp);
        heroParticleCanvas.addEventListener('mousemove', handleMouseMove);
        heroParticleCanvas.addEventListener('contextmenu', (e) => e.preventDefault());

        window.addEventListener('resize', () => {
            resizeCanvas();
            nextWord(words[wordIndex]);
        });

        window.addEventListener('beforeunload', () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        });
    }

    /* ----------------------------------------------------
       Team Rendering (About Page)
       ---------------------------------------------------- */
    const teamGrid = document.getElementById('teamGrid');
    // Ensure teamMembers is defined (from team_data.js)
    if (teamGrid && typeof teamMembers !== 'undefined') {
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
                            ${member.photo
                                ? `<img src="img/team/${member.photo}" alt="${member.name}"
                                       onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                                   <div class="speaker-initials" style="display:none">${initials(member.name)}</div>`
                                : `<div class="speaker-initials">${initials(member.name)}</div>`
                            }
                        </div>
                        <h3 class="speaker-name">${member.name}</h3>
                        <p class="speaker-role">${member.designation || ''}</p>
                        <span class="speaker-org" style="background:${col.bg}; color:${col.text};">Core Team</span>
                        <div class="card-hover-hint">
                            <i class="ph ph-arrow-clockwise"></i> Hover for bio
                        </div>
                    </div>
                    <!-- BACK -->
                    <div class="card-back">
                        <div class="back-name">${member.name}</div>
                        <div class="back-org">${member.designation || ''}</div>
                        <div class="back-bio">${member.bio}</div>
                    </div>
                </div>`;

            teamGrid.appendChild(card);
        });
    }
});
