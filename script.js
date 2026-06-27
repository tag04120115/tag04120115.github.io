document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Hamburger Menu Toggle
    const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('open');
            // Change hamburger icon/aria state if needed
            const icon = menuBtn.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('open')) {
                    icon.setAttribute('data-lucide', 'x');
                } else {
                    icon.setAttribute('data-lucide', 'menu');
                }
                if (window.lucide) window.lucide.createIcons();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && e.target !== menuBtn) {
                navLinks.classList.remove('open');
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    if (window.lucide) window.lucide.createIcons();
                }
            }
        });

        // Close menu when clicking link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    if (window.lucide) window.lucide.createIcons();
                }
            });
        });
    }

    // 2. Active Section Highlighting on Nav links
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // triggers when section occupies center of viewport
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navItems.forEach(item => {
                    if (item.getAttribute('href') === `#${id}`) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // 3. Smooth Dynamic Height Accordion
    function initAccordion() {
        const tabs = document.querySelectorAll('.domain-tab');
        
        tabs.forEach((tab) => {
            const header = tab.querySelector('.tab-header');
            const body = tab.querySelector('.tab-body');
            
            if (!header || !body) return;

            header.addEventListener('click', () => {
                const isOpen = tab.classList.contains('open');
                
                // Close all tabs
                tabs.forEach((t) => {
                    t.classList.remove('open');
                    const b = t.querySelector('.tab-body');
                    if (b) b.style.maxHeight = null;
                });
                
                // If the clicked tab wasn't open, open it
                if (!isOpen) {
                    tab.classList.add('open');
                    // Set max-height to scrollHeight to animate smoothly
                    body.style.maxHeight = body.scrollHeight + 'px';
                }
            });

            // If it is the default overview tab, open it on load
            if (tab.classList.contains('tab-overview')) {
                tab.classList.add('open');
                // Allow browser a tiny paint window to calculate scrollHeight
                setTimeout(() => {
                    body.style.maxHeight = body.scrollHeight + 'px';
                }, 100);
            }
        });

        // Re-calculate heights on window resize
        window.addEventListener('resize', () => {
            tabs.forEach(tab => {
                if (tab.classList.contains('open')) {
                    const body = tab.querySelector('.tab-body');
                    if (body) body.style.maxHeight = body.scrollHeight + 'px';
                }
            });
        });
    }

    initAccordion();

    // 4. QR Code Modal Logic
    const qrBtn = document.getElementById('qr-btn');
    const qrOverlay = document.getElementById('qr-overlay');
    const qrClose = document.getElementById('qr-close');
    const qrcodeContainer = document.getElementById('qrcode');
    let qrInitialized = false;

    if (qrBtn && qrOverlay && qrClose && qrcodeContainer) {
        qrBtn.addEventListener('click', () => {
            qrOverlay.classList.add('show');
            document.body.style.overflow = 'hidden'; // prevent scroll

            if (!qrInitialized) {
                // Initialize QRCode.js
                // Target URL is the current site deployment address
                const targetUrl = 'https://tag04120115.github.io/';
                try {
                    new QRCode(qrcodeContainer, {
                        text: targetUrl,
                        width: 160,
                        height: 160,
                        colorDark : "#1a3a5c",
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.H
                    });
                    qrInitialized = true;
                } catch (e) {
                    console.error("QR Code initialization failed:", e);
                }
            }
        });

        const closeQR = () => {
            qrOverlay.classList.remove('show');
            document.body.style.overflow = ''; // restore scroll
        };

        qrClose.addEventListener('click', closeQR);
        
        // Close modal on background click
        qrOverlay.addEventListener('click', (e) => {
            if (e.target === qrOverlay) {
                closeQR();
            }
        });
    }

    // 5. Native Sharing & Clipboard Copy Trigger
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const shareData = {
                title: '김영탁 · 디지털 프로필 명함',
                text: '소상공인의 경영개선을 돕는 경영지도사 김영탁 파트너의 모바일 명함입니다.',
                url: 'https://tag04120115.github.io/'
            };

            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                navigator.share(shareData)
                    .catch((e) => {
                        if (e.name !== 'AbortError') {
                            fallbackCopyUrl();
                        }
                    });
            } else {
                fallbackCopyUrl();
            }
        });
    }

    function fallbackCopyUrl() {
        navigator.clipboard.writeText('https://tag04120115.github.io/')
            .then(() => showToast("명함 주소가 복사되었습니다."))
            .catch(() => showToast("주소 복사에 실패했습니다."));
    }

    // 6. Toast Notification Banner
    const toastBanner = document.getElementById('toast-banner');
    const toastMessage = document.getElementById('toast-message');

    function showToast(message) {
        if (!toastBanner || !toastMessage) return;
        toastMessage.textContent = message;
        toastBanner.classList.add('show');
        setTimeout(() => {
            toastBanner.classList.remove('show');
        }, 2800);
    }

    // 7. Supabase Database Connection & Inquiry Submission
    // [설정 방법] Supabase 대시보드 프로젝트 설정 -> API에서 URL과 anon public key를 복사하여 아래에 채워주세요.
    const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL'; 
    const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
    
    let supabase = null;
    
    // Check if configuration is set
    const isSupabaseConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
    
    if (isSupabaseConfigured && window.supabase) {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (e) {
            console.error("Supabase client creation failed:", e);
        }
    }

    const inquiryForm = document.getElementById('inquiry-form');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nameVal = document.getElementById('inquiry-name').value.trim();
            const phoneVal = document.getElementById('inquiry-phone').value.trim();
            const emailVal = document.getElementById('inquiry-email').value.trim();
            const typeVal = document.getElementById('inquiry-type').value;
            const messageVal = document.getElementById('inquiry-message').value.trim();
            
            if (!nameVal || !phoneVal || !typeVal || !messageVal) {
                showToast("필수 항목을 모두 입력해 주세요.");
                return;
            }

            if (!isSupabaseConfigured || !supabase) {
                showToast("DB 설정이 필요합니다. (script.js 파일 수정 필요)");
                console.warn("Supabase is not configured yet. Set SUPABASE_URL and SUPABASE_ANON_KEY in script.js.");
                return;
            }

            const submitBtn = inquiryForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            
            // Set loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>전송 중...</span>';

            try {
                const { error } = await supabase
                    .from('consulting_inquiries')
                    .insert([
                        { 
                            name: nameVal, 
                            phone: phoneVal, 
                            email: emailVal || null, 
                            inquiry_type: typeVal, 
                            message: messageVal 
                        }
                    ]);

                if (error) throw error;

                showToast("상담 신청이 성공적으로 전달되었습니다.");
                inquiryForm.reset();
            } catch (err) {
                console.error("Supabase insert error:", err);
                showToast("전송에 실패했습니다: " + (err.message || "네트워크 오류"));
            } finally {
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    }
});
