document.addEventListener('DOMContentLoaded', () => {
    // ── 1. 3D CARD FLIP MECHANISM ──
    const businessCard = document.getElementById('business-card');
    const flipTrigger = document.getElementById('flip-trigger');
    const flipText = document.getElementById('flip-text');
    const flipIcon = flipTrigger ? flipTrigger.querySelector('i') : null;

    function toggleFlip(e) {
        // Prevent flipping if user clicked on an interactive link or button inside the card
        if (e && (e.target.closest('a') || e.target.closest('button'))) {
            return;
        }
        
        const isFlipped = businessCard.classList.toggle('flipped');
        
        if (flipText) {
            flipText.textContent = isFlipped ? '앞면 보기' : '뒷면 보기';
        }
        
        // Update Lucide icon dynamically if needed
        if (flipIcon && window.lucide) {
            if (isFlipped) {
                flipIcon.setAttribute('data-lucide', 'undo-2');
            } else {
                flipIcon.setAttribute('data-lucide', 'rotate-3d');
            }
            window.lucide.createIcons();
        }
    }

    if (businessCard) {
        businessCard.addEventListener('click', toggleFlip);
    }
    
    if (flipTrigger) {
        flipTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFlip();
        });
    }


    // ── 2. MODAL OVERLAY TRIGGERS ──
    const modalButtons = document.querySelectorAll('[data-modal]');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    const modalCloses = document.querySelectorAll('.modal-close');

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Lock back scroll
        }
    }

    function closeModal(modal) {
        modal.classList.remove('show');
        // Check if any other modal is still open before unlocking scroll
        const anyOpen = Array.from(modalOverlays).some(m => m.classList.contains('show'));
        const qrOpen = document.getElementById('qr-overlay')?.classList.contains('show');
        if (!anyOpen && !qrOpen) {
            document.body.style.overflow = '';
        }
    }

    // Attach open triggers to buttons
    modalButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const modalId = btn.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    // Attach close triggers
    modalCloses.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const modal = btn.closest('.modal-overlay');
            if (modal) closeModal(modal);
        });
    });

    // Close modal on background clicks
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay);
            }
        });
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
            document.body.style.overflow = 'hidden';

            if (!qrInitialized && qrcodeContainer) {
                try {
                    new QRCode(qrcodeContainer, {
                        text: cardUrl,
                        width: 150,
                        height: 150,
                        colorDark : "#1a3a5c", // corporate navy
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
                document.body.style.overflow = '';
            }
        }
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Try Native Share API first
            const shareData = {
                title: '혜성경영기술원 김영탁 | 모바일 명함',
                text: '경진단부터 AI 디지털 전환까지, 성장 파트너 김영탁 경영지도사입니다.',
                url: cardUrl
            };

            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                navigator.share(shareData)
                    .catch((err) => {
                        if (err.name !== 'AbortError') {
                            openQrShare(); // Fallback to QR modal if Native share fails
                        }
                    });
            } else {
                openQrShare(); // Fallback to QR modal if Native share is unavailable
            }
        });
    }

    if (qrClose) {
        qrClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeQrShare();
        });
    }

    if (qrOverlay) {
        qrOverlay.addEventListener('click', (e) => {
            if (e.target === qrOverlay) {
                closeQrShare();
            }
        });
    }


    // ── 4. TOAST NOTIFICATION BANNER ──
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

                // Close the modal overlay after success
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
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }
        });
    }
});
