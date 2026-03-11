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
