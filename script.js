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


    // ── 5. EMAIL & SMS INQUIRY SUBMISSION (mailto: & sms: integration) ──
    const inquiryForm = document.getElementById('inquiry-form');
    const btnEmail = document.getElementById('btn-submit-email');
    const btnSms = document.getElementById('btn-submit-sms');

    if (inquiryForm && btnEmail && btnSms) {
        // Prevent default form submit on Enter key press
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
        });

        const handleSubmission = (type) => {
            const nameVal = document.getElementById('inquiry-name').value.trim();
            const phoneVal = document.getElementById('inquiry-phone').value.trim();
            const emailVal = document.getElementById('inquiry-email').value.trim();
            const typeVal = document.getElementById('inquiry-type').value;
            const messageVal = document.getElementById('inquiry-message').value.trim();
            
            // Validate required fields
            if (!nameVal || !phoneVal || !typeVal || !messageVal) {
                showToast("필수 항목을 모두 입력해 주세요.");
                
                // Focus empty fields
                if (!nameVal) document.getElementById('inquiry-name').focus();
                else if (!phoneVal) document.getElementById('inquiry-phone').focus();
                else if (!typeVal) document.getElementById('inquiry-type').focus();
                else if (!messageVal) document.getElementById('inquiry-message').focus();
                return;
            }

            const clientInfo = `[간편 상담 신청 정보]\n` +
                               `- 신청인/회사명: ${nameVal}\n` +
                               `- 연락처: ${phoneVal}\n` +
                               `- 이메일: ${emailVal || '미입력'}\n` +
                               `- 상담 분야: ${typeVal}\n\n` +
                               `[문의 내용]\n` +
                               `${messageVal}`;
            
            const encodedBody = encodeURIComponent(clientInfo);

            if (type === 'email') {
                const recipient = 'tag0909@naver.com';
                const subject = encodeURIComponent(`[혜성경영기술원 모바일명함] ${nameVal}님의 상담 신청`);
                const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${encodedBody}`;
                
                try {
                    window.location.href = mailtoUrl;
                    showToast("메일 전송 창이 실행되었습니다.");
                } catch (err) {
                    console.error("Mailto error:", err);
                    showToast("메일 앱 연동에 실패했습니다.");
                }
            } else if (type === 'sms') {
                const recipient = '010-2685-5790';
                // Detect iOS for SMS separator compatibility
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
                const separator = isIOS ? '&' : '?';
                const smsUrl = `sms:${recipient}${separator}body=${encodedBody}`;
                
                try {
                    window.location.href = smsUrl;
                    showToast("문자 메시지 창이 실행되었습니다.");
                } catch (err) {
                    console.error("SMS error:", err);
                    showToast("문자 앱 연동에 실패했습니다.");
                }
            }

            // Close modal and reset form
            const inquiryModal = document.getElementById('modal-inquiry');
            if (inquiryModal) {
                closeModal(inquiryModal);
            }
            inquiryForm.reset();
        };

        btnEmail.addEventListener('click', () => handleSubmission('email'));
        btnSms.addEventListener('click', () => handleSubmission('sms'));
    }
});
