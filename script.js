document.addEventListener('DOMContentLoaded', () => {
    // ── 1. 3D CARD FLIP MECHANISM (Controlled ONLY by explicit trigger) ──
    const businessCard = document.getElementById('business-card');
    const flipTrigger = document.getElementById('flip-trigger');
    const flipText = document.getElementById('flip-text');
    const flipIcon = flipTrigger ? flipTrigger.querySelector('i') : null;

    function toggleFlip() {
        if (!businessCard) return;
        const isFlipped = businessCard.classList.toggle('flipped');
        
        if (flipText) {
            flipText.textContent = isFlipped ? '앞면 보기' : '뒷면 보기';
        }
        
        if (flipIcon && window.lucide) {
            if (isFlipped) {
                flipIcon.setAttribute('data-lucide', 'undo-2');
            } else {
                flipIcon.setAttribute('data-lucide', 'rotate-3d');
            }
            window.lucide.createIcons();
        }
    }
    
    if (flipTrigger) {
        flipTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFlip();
        });
    }


    // ── 2. MODAL OVERLAY SYSTEM (Inputs & Click Lock via Event Delegation) ──
    const modalOverlays = document.querySelectorAll('.modal-overlay');

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.classList.add('modal-open'); // Safe scroll lock
            
            // Auto focus on the first input if it's the inquiry modal
            if (modalId === 'modal-inquiry') {
                const nameInput = document.getElementById('inquiry-name');
                if (nameInput) setTimeout(() => nameInput.focus(), 300);
            }
        }
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('show');
        
        // Check if any other modal is still active
        const anyOpen = Array.from(modalOverlays).some(m => m.classList.contains('show'));
        const qrOpen = document.getElementById('qr-overlay')?.classList.contains('show');
        if (!anyOpen && !qrOpen) {
            document.body.classList.remove('modal-open');
        }
    }

    // Global Event Delegation for opening modals
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-modal]');
        if (trigger) {
            e.preventDefault();
            e.stopPropagation(); // Stop propagation to prevent card flips
            const modalId = trigger.getAttribute('data-modal');
            openModal(modalId);
        }
    });

    // Global Event Delegation for closing modals
    document.addEventListener('click', (e) => {
        // Handle Close button click
        const closeBtn = e.target.closest('.modal-close');
        if (closeBtn) {
            e.preventDefault();
            e.stopPropagation();
            const modal = closeBtn.closest('.modal-overlay');
            if (modal) closeModal(modal);
        }

        // Handle Background Overlay click
        const overlay = e.target.closest('.modal-overlay');
        if (overlay && e.target === overlay) {
            e.preventDefault();
            e.stopPropagation();
            closeModal(overlay);
        }
    });


    // ── 3. QR CODE SHARING MODAL ──
    const shareBtn = document.getElementById('share-btn');
    const qrOverlay = document.getElementById('qr-overlay');
    const qrClose = document.getElementById('qr-close');
    const qrcodeContainer = document.getElementById('qrcode');
    const cardUrl = 'https://tag04120115.github.io/';
    let qrInitialized = false;

    function openQrShare() {
        if (qrOverlay) {
            qrOverlay.classList.add('show');
            document.body.classList.add('modal-open');

            if (!qrInitialized && qrcodeContainer) {
                try {
                    new QRCode(qrcodeContainer, {
                        text: cardUrl,
                        width: 150,
                        height: 150,
                        colorDark : "#1a3a5c", 
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.H
                    });
                    qrInitialized = true;
                } catch (err) {
                    console.error("QR creation error:", err);
                }
            }
        }
    }

    function closeQrShare() {
        if (qrOverlay) {
            qrOverlay.classList.remove('show');
            const anyOpen = Array.from(modalOverlays).some(m => m.classList.contains('show'));
            if (!anyOpen) {
                document.body.classList.remove('modal-open');
            }
        }
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const shareData = {
                title: '혜성경영기술원 김영탁 | 모바일 명함',
                text: '경진단부터 AI 디지털 전환까지, 성장 파트너 김영탁 경영지도사입니다.',
                url: cardUrl
            };

            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                navigator.share(shareData)
                    .catch((err) => {
                        if (err.name !== 'AbortError') {
                            openQrShare(); 
                        }
                    });
            } else {
                openQrShare(); 
            }
        });
    }

    if (qrClose) {
        qrClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeQrShare();
        });
    }

    if (qrOverlay) {
        qrOverlay.addEventListener('click', (e) => {
            if (e.target === qrOverlay) {
                e.preventDefault();
                e.stopPropagation();
                closeQrShare();
            }
        });
    }


    // ── 4. TOAST NOTIFICATION ──
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


    // ── 5. SUPABASE DB INQUIRY SUBMISSION ──
    const SUPABASE_URL = 'https://lpxowhmcbeaszaiehxdv.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxweG93aG1jYmVhc3phaWVoeGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTQ0OTMsImV4cCI6MjA5ODEzMDQ5M30.HF-fzoX_Doh7vg6jhjMr2y0PTJBMvkK3xbo4jXPf2mw';
    
    let supabase = null;
    const isSupabaseConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
    
    if (isSupabaseConfigured && window.supabase) {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (e) {
            console.error("Supabase client failed initialization:", e);
        }
    }

    const inquiryForm = document.getElementById('inquiry-form');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
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
                showToast("DB 설정이 완성되지 않았습니다.");
                return;
            }

            const submitBtn = inquiryForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            
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

                const inquiryModal = document.getElementById('modal-inquiry');
                if (inquiryModal) {
                    closeModal(inquiryModal);
                }

                showToast("문의가 성공적으로 전송되었습니다.");
                inquiryForm.reset();
            } catch (err) {
                console.error("Supabase submission error:", err);
                showToast("전송에 실패했습니다. 대표 번호로 연락 부탁드립니다.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }
        });
    }
});
