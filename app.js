document.addEventListener('DOMContentLoaded', async () => {
  let activeBusiness = 'sushin'; // 영업점 업무 카테고리 정의 (수신/여신 구분용)
  // --- 1. DOM Elements ---
  const statusClock = document.getElementById('status-clock');
  const liveTimestamp = document.getElementById('live-timestamp');
  const refreshTopBtn = document.getElementById('refresh-top-btn');
  const refreshBottomBtn2 = document.getElementById('refresh-bottom-btn-2');
  const refreshIcon = document.getElementById('refresh-icon');
  const refreshIcon2 = document.getElementById('refresh-icon-2');
  
  const waitingCountEl = document.getElementById('waiting-count');
  const waitingTimeEl = document.getElementById('waiting-time');
  
  const soundToggle = document.getElementById('sound-toggle');
  
  const accordionBtn = document.getElementById('pre-writing-accordion-btn');
  const formContainer = document.getElementById('pre-writing-form-container');
  const accordionArrow = document.getElementById('accordion-arrow');
  const preWritingForm = document.getElementById('pre-writing-form');
  const successMessage = document.getElementById('success-message');
  const displayName = document.getElementById('display-name');
  const displayJob = document.getElementById('display-job');
  const editFormBtn = document.getElementById('edit-form-btn');
  
  const radioButtons = document.querySelectorAll('input[name="transaction-type"]');
  const amountLabel = document.getElementById('amount-label');
  const amountInput = document.getElementById('transaction-amount');
  const quickAmountContainer = document.querySelector('.quick-amount-buttons');
  const accountField = document.getElementById('account-field');
  const quickBtns = document.querySelectorAll('.quick-btn');
  
  const kakaotalkBtn = document.getElementById('kakaotalk-btn');
  const kakaoModal = document.getElementById('kakao-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelModalBtn = document.getElementById('cancel-modal-btn');
  const confirmModalBtn = document.getElementById('confirm-modal-btn');
  const toast = document.getElementById('toast');

  // 순번 미루기 DOM 요소 및 상태 변수
  const delayQueueBtn = document.getElementById('delay-queue-btn');
  const delayStatusBadge = document.getElementById('delay-status-badge');
  let hasDelayed = false;

  // 신규 수정 요구사항 DOM 요소
  const smsAlertBtn = document.getElementById('sms-alert-btn');
  const smsModal = document.getElementById('sms-modal');
  const closeSmsModalBtn = document.getElementById('close-sms-modal-btn');
  const cancelSmsModalBtn = document.getElementById('cancel-sms-modal-btn');
  const confirmSmsModalBtn = document.getElementById('confirm-sms-modal-btn');

  const gameAccordionHeader = document.getElementById('game-accordion-header');
  const gameAccordionContent = document.getElementById('game-accordion-content');
  const gameAccordionSection = document.getElementById('game-accordion-section');

  const delayConfirmModal = document.getElementById('delay-confirm-modal');
  const closeDelayModalBtn = document.getElementById('close-delay-modal-btn');
  const cancelDelayModalBtn = document.getElementById('cancel-delay-modal-btn');
  const confirmDelayModalBtn = document.getElementById('confirm-delay-modal-btn');

  // --- Dynamic Products Loader and Fallbacks ---
  let allProducts = [];
  const fallbackProducts = [
    {
      "id": "im-i-card-fallback",
      "category": "카드",
      "name": "iM i 카드",
      "rate": "-",
      "benefit": "온라인 쇼핑, 배달앱, 커피, 편의점, 통신비 10% 집중 청구할인을 제공하는 디지털 실속형 카드",
      "icon": "fa-solid fa-credit-card",
      "image": "./im_i_card.png",
      "matchTypes": ["smart"],
      "lastUpdated": "2026-07-14 21:10"
    },
    {
      "id": "im-z-card-fallback",
      "category": "카드",
      "name": "iM Z 체크카드",
      "rate": "-",
      "benefit": "전월 실적 조건 없이 쓸 때마다 즉시 무제한 할인/적립을 제공하는 심플한 생활 체크카드",
      "icon": "fa-solid fa-credit-card",
      "image": "./im_one_card.png",
      "matchTypes": ["simple"],
      "lastUpdated": "2026-07-14 21:10"
    },
    {
      "id": "im-greit-card-fallback",
      "category": "카드",
      "name": "GREiT(그래잇)카드",
      "rate": "-",
      "benefit": "일상 생활 업종 전반 청구 할인과 쏠쏠한 금융 서비스를 함께 제공하는 대표 신용카드",
      "icon": "fa-solid fa-credit-card",
      "image": "./im_one_card.png",
      "matchTypes": ["simple"],
      "lastUpdated": "2026-07-14 21:10"
    },
    {
      "id": "im-yplus-card-fallback",
      "category": "카드",
      "name": "Master Y+ 체크카드",
      "rate": "-",
      "benefit": "해외 가맹점 및 직구 수수료 캐시백과 인천공항 라운지 무료 이용이 포함된 여행 글로벌 전용 체크카드",
      "icon": "fa-solid fa-credit-card",
      "image": "./im_travel_card.png",
      "matchTypes": ["travel"],
      "lastUpdated": "2026-07-14 21:10"
    },
    {
      "id": "im-seven-savings-fallback",
      "category": "적금",
      "name": "세븐적금",
      "rate": "최고 연 4.0%",
      "benefit": "7개월 만기 구성으로 매주 부담 없는 소액 자동이체를 통해 쉽고 유연하게 목표 목돈을 만드는 자유적금",
      "icon": "fa-solid fa-piggy-bank",
      "matchTypes": ["savings"],
      "lastUpdated": "2026-07-14 21:10"
    },
    {
      "id": "im-hotple-savings-fallback",
      "category": "적금",
      "name": "iM핫플적금",
      "rate": "최고 연 4.5%",
      "benefit": "대구·경북 주요 관광지 및 명소를 여행하며 앱 내 위치인증 미션 완수 시 풍성한 우대금리를 획득하는 참여형 적금",
      "icon": "fa-solid fa-route",
      "matchTypes": ["challenger"],
      "lastUpdated": "2026-07-14 21:10"
    },
    {
      "id": "im-main-deposit-fallback",
      "category": "예금",
      "name": "iM주거래우대예금",
      "rate": "최고 연 3.4%",
      "benefit": "기본 금리에 더해 주거래 조건(급여이체, 카드실적) 충족 시 우대 금리를 제공하는 거치식 정기예금",
      "icon": "fa-solid fa-vault",
      "matchTypes": ["deposit"],
      "lastUpdated": "2026-07-14 21:10"
    },
    {
      "id": "im-salary-bankbook-fallback",
      "category": "예금",
      "name": "직장인우대통장",
      "rate": "수수료 면제",
      "benefit": "급여 이체 우대실적 충족 시 인터넷 뱅킹 이체 및 DGB CD기 출금 수수료를 전면 면제하는 우대 금리 입출금통장",
      "icon": "fa-solid fa-wallet",
      "matchTypes": ["deposit"],
      "lastUpdated": "2026-07-14 21:10"
    }
  ];

  async function loadProducts() {
    try {
      const response = await fetch('./products.json');
      if (!response.ok) throw new Error('Failed to fetch products.json');
      allProducts = await response.json();
      console.log('Successfully loaded allProducts from products.json');
    } catch (e) {
      console.warn('Failed to load products.json, falling back to legacy products:', e.message);
      allProducts = fallbackProducts;
    }
  }

  // Load products initially
  await loadProducts();

  // --- 2. Initialize Virtual Clock & Initial Timestamp ---
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    
    // Format clock (HH:MM)
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    if (statusClock) {
      statusClock.textContent = `${formattedHours}:${formattedMinutes}`;
    }
  }
  
  function getKoreanTimestampString() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    
    // Convert 24h to 12h
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12

    // 헤더 1줄 압축 레이아웃 대응: 짧은 포맷 (예: 오후 3:07 기준)
    const paddedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${ampm} ${hours}:${paddedMinutes} 기준`;
  }
  
  updateClock();
  setInterval(updateClock, 60000); // Update clock every minute
  
  if (liveTimestamp) {
    liveTimestamp.textContent = getKoreanTimestampString();
  }

  // --- 3. Sound Notification Web Audio API ---
  let audioCtx = null;
  function playNotificationSound(type) {
    if (!soundToggle.checked) return;
    
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'double') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(660, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
      }
      
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (e) {
      console.warn('Web Audio API is not supported or blocked by user gesture.', e);
    }
  }
  
  soundToggle.addEventListener('change', () => {
    if (soundToggle.checked) {
      playNotificationSound('beep');
      showToast('알림 소리 및 진동이 설정되었습니다.');
    } else {
      showToast('알림이 무음으로 변경되었습니다.');
    }
  });

  // --- 4. Live Wait Refresh Simulation ---
  let isRefreshing = false;
  
  function triggerRefresh() {
    if (isRefreshing) return;
    isRefreshing = true;
    
    // Trigger CSS spin animations
    if (refreshIcon) refreshIcon.classList.add('spinning');
    if (refreshIcon2) refreshIcon2.classList.add('spinning');
    const safariRefreshIcon = document.getElementById('refresh-bottom-btn');
    if (safariRefreshIcon) safariRefreshIcon.classList.add('spinning');
    
    // Simulate API fetch delay
    setTimeout(() => {
      // 1. Update primary timestamps
      const newTimestamp = getKoreanTimestampString();
      if (liveTimestamp) liveTimestamp.textContent = newTimestamp;
      
      // 2. Randomize my queue numbers (If delayed, maintain a higher queue minimum)
      let randomWaitPeople = Math.floor(Math.random() * 5) + 3; // 3 to 7 people
      if (hasDelayed) {
        randomWaitPeople = Math.floor(Math.random() * 5) + 6; // 6 to 10 people
      }
      const randomWaitTime = Math.floor(randomWaitPeople * 3) + Math.floor(Math.random() * 3);
      
      waitingCountEl.textContent = `${randomWaitPeople}명`;
      waitingTimeEl.textContent = `약 ${randomWaitTime}분`;
      
      // Update delay badge dynamically
      updateDelayBadge();
      
      // Remove animations
      if (refreshIcon) refreshIcon.classList.remove('spinning');
      if (refreshIcon2) refreshIcon2.classList.remove('spinning');
      if (safariRefreshIcon) safariRefreshIcon.classList.remove('spinning');
      isRefreshing = false;
      
      // Chime and Toast
      playNotificationSound('beep');
      showToast('대기 정보가 성공적으로 갱신되었습니다.');
    }, 800);
  }
  
  if (refreshTopBtn) refreshTopBtn.addEventListener('click', triggerRefresh);
  if (refreshBottomBtn2) refreshBottomBtn2.addEventListener('click', triggerRefresh);
  const refreshSafariBtn = document.getElementById('refresh-bottom-btn');
  if (refreshSafariBtn) refreshSafariBtn.addEventListener('click', triggerRefresh);

  // --- 5. Toast Controller ---
  let toastTimeout = null;
  function showToast(message, isWarning = false) {
    toast.textContent = message;
    if (isWarning) {
      toast.classList.add('warning');
    } else {
      toast.classList.remove('warning');
    }
    toast.classList.remove('hidden');
    
    // Clear previous timeout if exists
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    
    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2000);
  }

  // --- 6. Pre-Writing Form Interaction (Accordion) ---
  if (accordionBtn) {
    accordionBtn.addEventListener('click', () => {
      formContainer.classList.toggle('collapsed');
      accordionArrow.classList.toggle('rotated');
    });
  }

  // Switch form requirements dynamically based on selected transaction
  radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const value = e.target.value;
      amountInput.value = ''; // Clear value when switching transaction types
      
      if (value === 'deposit') {
        amountLabel.textContent = '거래 금액 (원)';
        amountInput.placeholder = '금액을 입력해 주세요 (예: 50000)';
        amountInput.required = true;
        amountInput.style.display = 'block';
        amountLabel.style.display = 'block';
        quickAmountContainer.style.display = 'grid';
        accountField.style.display = 'flex';
      } else if (value === 'account') {
        amountLabel.textContent = '최초 개설 입금액 (원)';
        amountInput.placeholder = '개설 시 입금할 금액 (없을 시 0 입력)';
        amountInput.required = false;
        amountInput.style.display = 'block';
        amountLabel.style.display = 'block';
        quickAmountContainer.style.display = 'grid';
        accountField.style.display = 'none'; // No account yet
      } else if (value === 'card') {
        // Hide amount and account details for Card registration
        amountLabel.style.display = 'none';
        amountInput.style.display = 'none';
        amountInput.required = false;
        quickAmountContainer.style.display = 'none';
        accountField.style.display = 'flex';
        const accountLabel = accountField.querySelector('label');
        accountLabel.textContent = '결제 계좌번호 (iM Bank)';
      }
    });
  });

  // 천 단위 쉼표 포맷팅 함수 (안전성 보강)
  function formatNumberWithCommas(val) {
    if (!val) return '';
    const numOnly = val.toString().replace(/[^\d]/g, '');
    if (!numOnly) return '';
    return parseInt(numOnly, 10).toLocaleString();
  }

  // 직접 입력 시 실시간 쉼표 적용
  amountInput.addEventListener('input', (e) => {
    e.target.value = formatNumberWithCommas(e.target.value);
  });

  // Quick Amount Buttons click logic
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const valStr = btn.getAttribute('data-value');
      if (valStr) {
        amountInput.value = formatNumberWithCommas(valStr);
      }
    });
  });

  // Pre-writing Form Submission
  preWritingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate loading/saving animation
    const submitBtnText = preWritingForm.querySelector('.submit-form-btn span');
    const submitBtnIcon = preWritingForm.querySelector('.submit-form-btn i');
    const originalText = submitBtnText.textContent;
    
    submitBtnText.textContent = '서류 제출 중...';
    submitBtnIcon.className = 'fa-solid fa-spinner fa-spin';
    
    setTimeout(() => {
      // Gather inputs
      const nameVal = document.getElementById('user-name').value;
      const typeVal = document.querySelector('input[name="transaction-type"]:checked').value;
      let displayJobText = '입금/출금';
      if (typeVal === 'account') displayJobText = '통장 개설';
      if (typeVal === 'card') displayJobText = '카드 신청';
      
      // Update success message UI
      displayName.textContent = nameVal;
      displayJob.textContent = displayJobText;
      
      // Swapping states
      preWritingForm.classList.add('hidden');
      successMessage.classList.remove('hidden');
      
      // Restore submit button state
      submitBtnText.textContent = originalText;
      submitBtnIcon.className = 'fa-solid fa-arrow-right';
      
      playNotificationSound('double');
      showToast('서류 작성이 완료되었습니다.');
    }, 1000);
  });

  // Edit/Reset form button inside success layout
  editFormBtn.addEventListener('click', () => {
    successMessage.classList.add('hidden');
    preWritingForm.classList.remove('hidden');
  });

  // --- 7. KakaoTalk Modal Control ---
  kakaotalkBtn.addEventListener('click', () => {
    kakaoModal.classList.remove('hidden');
    playNotificationSound('beep');
  });

  function closeModal() {
    kakaoModal.classList.add('hidden');
  }

  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);
  
  // Close modal when clicking on the overlay backdrop
  kakaoModal.addEventListener('click', (e) => {
    if (e.target === kakaoModal) {
      closeModal();
    }
  });

  // Confirm Kakao alert
  confirmModalBtn.addEventListener('click', () => {
    const phoneNumber = document.getElementById('phone-number').value;
    if (!phoneNumber) {
      alert('휴대폰 번호를 입력해 주세요.');
      return;
    }
    
    // Close modal and show toast
    closeModal();
    playNotificationSound('double');
    showToast('카카오톡 대기 알림 신청이 완료되었습니다!');
  });

  // --- 8. 순번 미루기 기능 (1회 한정 - 커스텀 모달 연동) ---
  function updateDelayBadge() {
    if (!delayStatusBadge) return;
    
    // 버튼 위 코너 칩으로 표시되므로 짧은 문구 사용 (상세 안내는 ⓘ 모달 참고)
    if (hasDelayed) {
      delayStatusBadge.textContent = '사용완료';
      delayStatusBadge.className = 'delay-badge completed';
      delayQueueBtn && delayQueueBtn.setAttribute('title', '순번 미루기는 1회만 가능합니다.');
      return;
    }

    let currentWaitCount = parseInt(waitingCountEl.textContent, 10) || 0;
    if (currentWaitCount <= 3) {
      delayStatusBadge.textContent = '불가';
      delayStatusBadge.className = 'delay-badge warning';
      delayQueueBtn && delayQueueBtn.setAttribute('title', '대기 인원이 3명 이하일 때는 순번을 미룰 수 없습니다.');
    } else {
      delayStatusBadge.textContent = '1회 가능';
      delayStatusBadge.className = 'delay-badge';
      delayQueueBtn && delayQueueBtn.setAttribute('title', '순번을 3명 뒤로 미룹니다. (1회 한정)');
    }
  }

  // 초기 로드 시 뱃지 상태 업데이트
  updateDelayBadge();

  if (delayQueueBtn && delayConfirmModal) {
    delayQueueBtn.addEventListener('click', () => {
      // 1. 대기 인원 3명 이하 체크 (예외 처리)
      let currentWaitCount = parseInt(waitingCountEl.textContent, 10) || 0;
      if (currentWaitCount <= 3) {
        showToast("대기 인원이 3명 이하일 때는 순번을 미룰 수 없습니다.", true);
        playNotificationSound('beep');
        return;
      }

      // 2. 1회 사용 여부 체크
      if (hasDelayed) return;

      // 3. 정상 동작: 모달 띄우기
      delayConfirmModal.classList.remove('hidden');
      playNotificationSound('beep');
    });

    const closeDelayModal = () => {
      delayConfirmModal.classList.add('hidden');
    };

    if (closeDelayModalBtn) closeDelayModalBtn.addEventListener('click', closeDelayModal);
    if (cancelDelayModalBtn) cancelDelayModalBtn.addEventListener('click', closeDelayModal);
    
    delayConfirmModal.addEventListener('click', (e) => {
      if (e.target === delayConfirmModal) closeDelayModal();
    });

    if (confirmDelayModalBtn) {
      confirmDelayModalBtn.addEventListener('click', () => {
        closeDelayModal();

        let currentWaitCount = parseInt(waitingCountEl.textContent, 10) || 0;
        let currentWaitTime = parseInt(waitingTimeEl.textContent.replace(/[^0-9]/g, ''), 10) || 0;
        
        currentWaitCount += 3;
        currentWaitTime += 9;
        
        waitingCountEl.textContent = `${currentWaitCount}명`;
        waitingTimeEl.textContent = `약 ${currentWaitTime}분`;
        
        hasDelayed = true;
        delayQueueBtn.disabled = true;
        const delayBtnText = delayQueueBtn.querySelector('span:not(.delay-badge)');
        if (delayBtnText) delayBtnText.textContent = '미루기 완료';
        const delayBtnIcon = delayQueueBtn.querySelector('i');
        if (delayBtnIcon) delayBtnIcon.className = 'fa-solid fa-check';
        
        updateDelayBadge();
        
        playNotificationSound('double');
        showToast('대기 순번이 3명 뒤로 미뤄졌습니다.');
      });
    }
  }

  // ==========================================================================
  // --- 9. 신규 기능 아코디언 공통 제어 ---
  // ==========================================================================
  setupAccordion('checklist-accordion-btn', 'checklist-container', 'checklist-arrow');

  // ==========================================================================
  // --- 10. 업무별 필요 서류 체크리스트 제어 ---
  // ==========================================================================
  const checklistData = {
    card: [
      { text: "본인 실명 확인 증표 (신분증)", desc: "주민등록증, 운전면허증, 여권 등 (만 17세 이상)" },
      { text: "소득 증빙 서류 (한도 제한 해제 필요 시)", desc: "직장인의 경우 건강보험 자격득실확인서, 재직증명서 등" },
      { text: "대리인 신청 시 위임장", desc: "본인 인감도장 및 인감증명서 추가 위임 필요" }
    ],
    bankbook: [
      { text: "본인 실명 확인 증표 (신분증)", desc: "주민등록증, 운전면허증 등" },
      { text: "거래 인감 또는 본인 서명", desc: "통장에 등록할 거래 수단 준비" },
      { text: "금융거래 목적 증빙 서류", desc: "급여통장(재직증명서), 사업자통장(물품계약서) 등 목적 증빙 필수" }
    ],
    irp: [
      { text: "본인 신분증", desc: "실명 확인용 신분증 필수" },
      { text: "가입 자격 증빙 서류", desc: "재직증명서, 근로소득원천징수영수증 또는 사업자등록증명원 등" },
      { text: "타사 퇴직금 이전 시 이전 의뢰서", desc: "기존 가입한 퇴직금 계좌 보유 확인서 등 연계 서류" }
    ]
  };

  const checkedState = {
    card: [false, false, false],
    bankbook: [false, false, false],
    irp: [false, false, false]
  };

  let activeTab = 'card';
  const tabButtons = document.querySelectorAll('.tab-btn');
  const checklistItemsEl = document.getElementById('checklist-items');
  const progressBarEl = document.getElementById('checklist-progress-bar');
  const progressPctEl = document.getElementById('checklist-progress-pct');

  function updateChecklistProgress() {
    const total = checkedState[activeTab].length;
    const checkedCount = checkedState[activeTab].filter(Boolean).length;
    const percentage = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

    if (progressBarEl) progressBarEl.style.width = `${percentage}%`;
    if (progressPctEl) progressPctEl.textContent = `${percentage}%`;
  }

  // --- AI 일괄 서류 확인 시뮬레이션 상태 변수 ---
  let aiCurrentStep = 0;
  let aiTotalSteps = 0;
  let aiStepResults = []; // 단계별 임시 스캔 결과 누적

  // AI 모달 DOM 요소
  const aiScanModal = document.getElementById('ai-scan-modal');
  const closeAiModalBtn = document.getElementById('close-ai-modal-btn');
  const aiScanDocTargetName = document.getElementById('ai-scan-doc-target-name');
  const aiMockDocument = document.getElementById('ai-mock-document');
  const aiScanLaserLine = document.getElementById('ai-scan-laser-line');
  const aiStartScanBtn = document.getElementById('ai-start-scan-btn');
  const aiResultContainer = document.getElementById('ai-result-container');
  const aiScanStepCamera = document.getElementById('ai-scan-step-camera');
  
  const aiBatchStepText = document.getElementById('ai-batch-step-text');
  const aiBatchStepPercent = document.getElementById('ai-batch-step-percent');
  const aiBatchResultList = document.getElementById('ai-batch-result-list');
  const aiBatchSummaryText = document.getElementById('ai-batch-summary-text');
  const aiBatchSummaryPct = document.getElementById('ai-batch-summary-pct');
  const aiResultStatusTitle = document.getElementById('ai-result-status-title');

  const aiRetryScanBtn = document.getElementById('ai-retry-scan-btn');
  const aiConfirmBtn = document.getElementById('ai-confirm-btn');
  const aiBatchStartBtn = document.getElementById('ai-batch-start-btn');

  // AI 판별용 모의 서류 템플릿
  const aiMockDocTemplates = {
    card: [
      `<div class="mock-doc-header">
        <span class="mock-doc-title">주민등록증</span>
        <span class="mock-doc-watermark">사본</span>
      </div>
      <div class="mock-doc-body">
        <div class="mock-doc-row"><span class="mock-doc-label">성명</span><span class="mock-doc-value">홍길동</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">주민등록번호</span><span class="mock-doc-value">860101 - <span class="mock-doc-masked">*******</span></span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">발급일자</span><span class="mock-doc-value">2023.05.12</span></div>
      </div>
      <div class="mock-doc-footer"><span>대구광역시 북구청장</span><span>[적합 서류]</span></div>`,
      `<div class="mock-doc-header">
        <span class="mock-doc-title">건강보험자격득실확인서</span>
        <span class="mock-doc-watermark">제출용</span>
      </div>
      <div class="mock-doc-body">
        <div class="mock-doc-row"><span class="mock-doc-label">가입자 성명</span><span class="mock-doc-value">홍길동</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">주민등록번호</span><span class="mock-doc-value">860101 - <span class="mock-doc-unmasked-red">1234567</span></span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">발급일자</span><span class="mock-doc-value">2026.06.18</span></div>
      </div>
      <div class="mock-doc-footer"><span>국민건강보험공단</span><span>[마스킹 누락]</span></div>`,
      `<div class="mock-doc-header">
        <span class="mock-doc-title">위임장 (Power of Attorney)</span>
        <span class="mock-doc-watermark">원본</span>
      </div>
      <div class="mock-doc-body">
        <div class="mock-doc-row"><span class="mock-doc-label">위임인</span><span class="mock-doc-value">김철수</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">수임인</span><span class="mock-doc-value">홍길동</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">서명날인</span><span class="mock-doc-value">인감날인 완료</span></div>
      </div>
      <div class="mock-doc-footer"><span>인감증명서 첨부 확인</span><span>[적합 서류]</span></div>`
    ],
    bankbook: [
      `<div class="mock-doc-header">
        <span class="mock-doc-title">운전면허증</span>
        <span class="mock-doc-watermark">사본</span>
      </div>
      <div class="mock-doc-body">
        <div class="mock-doc-row"><span class="mock-doc-label">성명</span><span class="mock-doc-value">홍길동</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">면허번호</span><span class="mock-doc-value">12-34-567890-12</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">주민등록번호</span><span class="mock-doc-value">860101 - <span class="mock-doc-masked">*******</span></span></div>
      </div>
      <div class="mock-doc-footer"><span>경찰청장</span><span>[적합 서류]</span></div>`,
      `<div class="mock-doc-header">
        <span class="mock-doc-title">인감대장 및 서명 등록서</span>
        <span class="mock-doc-watermark">등록용</span>
      </div>
      <div class="mock-doc-body">
        <div class="mock-doc-row"><span class="mock-doc-label">등록인</span><span class="mock-doc-value">홍길동</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">인감인영</span><span class="mock-doc-value" style="color: var(--warning-red); font-weight: bold;">(인)</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">등록방식</span><span class="mock-doc-value">거래 도장 실물 대조</span></div>
      </div>
      <div class="mock-doc-footer"><span>iM Bank 대구본점</span><span>[적합 서류]</span></div>`,
      `<div class="mock-doc-header">
        <span class="mock-doc-title">재직증명서</span>
        <span class="mock-doc-watermark">제출용</span>
      </div>
      <div class="mock-doc-body">
        <div class="mock-doc-row"><span class="mock-doc-label">성명</span><span class="mock-doc-value">홍길동</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">회사명</span><span class="mock-doc-value">(주)아이엠테크</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">발급일자</span><span class="mock-doc-value" style="color: var(--warning-red); font-weight: bold;">2025.10.15</span></div>
      </div>
      <div class="mock-doc-footer"><span>(주)아이엠테크 대표이사</span><span>[기간 경과]</span></div>`
    ],
    irp: [
      `<div class="mock-doc-header">
        <span class="mock-doc-title">주민등록증</span>
        <span class="mock-doc-watermark">사본</span>
      </div>
      <div class="mock-doc-body">
        <div class="mock-doc-row"><span class="mock-doc-label">성명</span><span class="mock-doc-value">홍길동</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">주민등록번호</span><span class="mock-doc-value">860101 - <span class="mock-doc-masked">*******</span></span></div>
      </div>
      <div class="mock-doc-footer"><span>대구광역시 북구청장</span><span>[적합 서류]</span></div>`,
      `<div class="mock-doc-header">
        <span class="mock-doc-title">근로소득 원천징수영수증</span>
        <span class="mock-doc-watermark">제출용</span>
      </div>
      <div class="mock-doc-body">
        <div class="mock-doc-row"><span class="mock-doc-label">소득자</span><span class="mock-doc-value">홍길동</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">징수의무자</span><span class="mock-doc-value">(주)아이엠테크</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">귀속년도</span><span class="mock-doc-value">2025년</span></div>
      </div>
      <div class="mock-doc-footer"><span>세무서장 확인완료</span><span>[적합 서류]</span></div>`,
      `<div class="mock-doc-header">
        <span class="mock-doc-title">퇴직연금 계좌 이전 의뢰서</span>
        <span class="mock-doc-watermark">제출용</span>
      </div>
      <div class="mock-doc-body">
        <div class="mock-doc-row"><span class="mock-doc-label">신청인</span><span class="mock-doc-value">홍길동</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">이전대상기관</span><span class="mock-doc-value">A생명보험</span></div>
        <div class="mock-doc-row"><span class="mock-doc-label">이수기관</span><span class="mock-doc-value">iM Bank</span></div>
      </div>
      <div class="mock-doc-footer"><span>연금자산관리센터</span><span>[적합 서류]</span></div>`
    ]
  };

  // AI 판별 결과 시나리오 맵
  const aiVerifyScenarios = {
    card: [
      {
        readiness: '100%',
        suitability: '적합',
        guide: '본인 실명 확인 증표로 유효하며, 유효기간 및 주민등록번호 뒷자리 마스킹 처리가 올바르게 검증되었습니다. 즉시 사용이 가능합니다.',
        isSuccess: true
      },
      {
        readiness: '65%',
        suitability: '부적합',
        guide: '<b>[진단 의견] 주민등록번호 뒷자리 노출</b><br>금융거래 보호를 위해 주민등록번호 뒷자리(7자리)가 노출된 서류는 제출할 수 없습니다. 뒷자리를 가린 후 다시 준비해 주시기 바랍니다.',
        isSuccess: false
      },
      {
        readiness: '100%',
        suitability: '적합',
        guide: '본인 인감도장 날인 및 위임 의사가 규정에 맞춰 작성되었으며, 본인서명사실확인서 또는 인감증명서가 유효하게 첨부되었음을 확인하였습니다.',
        isSuccess: true
      }
    ],
    bankbook: [
      {
        readiness: '100%',
        suitability: '적합',
        guide: '본인 실명 확인 증표로 유효하며, 스캔 화질이 깨끗하고 주민등록번호 뒷자리가 정상적으로 마스킹되어 바로 확인 가능합니다.',
        isSuccess: true
      },
      {
        readiness: '100%',
        suitability: '적합',
        guide: '등록할 거래 인감 날인상태가 뚜렷하며 식별에 이상이 없습니다. 본인 서명 등록인 경우 대조 가능 상태입니다.',
        isSuccess: true
      },
      {
        readiness: '50%',
        suitability: '부적합',
        guide: '<b>[진단 의견] 발급일자 기준 초과 (3개월 경과)</b><br>제출하신 목적 증빙 서류의 발급일자가 3개월을 초과한 것으로 식별되었습니다. 최근 3개월 이내에 발급된 최신 증빙 서류로 다시 준비해 주시기 바랍니다.',
        isSuccess: false
      }
    ],
    irp: [
      {
        readiness: '100%',
        suitability: '적합',
        guide: '실명 증표 요건을 충족합니다. 뒷자리 마스킹 처리 상태가 양호합니다.',
        isSuccess: true
      },
      {
        readiness: '100%',
        suitability: '적합',
        guide: '가입 자격을 증명하는 소득 관련 증빙 서류의 내용이 세무서 등록 원본과 일치하며 정상 발급본임을 확인했습니다.',
        isSuccess: true
      },
      {
        readiness: '100%',
        suitability: '적합',
        guide: '타사 퇴직연금 이전 의뢰 정보가 양사 규정에 부합하게 올바른 내용으로 기재되어 검증되었습니다.',
        isSuccess: true
      }
    ]
  };

  function openAiBatchScanModal() {
    aiCurrentStep = 0;
    aiTotalSteps = checklistData[activeTab].length;
    aiStepResults = [];

    // 모달 초기 상태 리셋
    if (aiScanStepCamera) aiScanStepCamera.classList.remove('hidden');
    if (aiResultContainer) aiResultContainer.classList.add('hidden');
    
    loadScanStep();

    if (aiScanModal) {
      aiScanModal.classList.remove('hidden');
      playNotificationSound('beep');
    }
  }

  function loadScanStep() {
    const docName = checklistData[activeTab][aiCurrentStep].text;
    
    // 단계 인디케이터 업데이트
    if (aiBatchStepText) {
      aiBatchStepText.textContent = `단계: ${aiCurrentStep + 1} / ${aiTotalSteps}`;
    }
    if (aiBatchStepPercent) {
      const pct = Math.round(((aiCurrentStep + 1) / aiTotalSteps) * 100);
      aiBatchStepPercent.textContent = `${pct}%`;
    }
    if (aiScanDocTargetName) {
      aiScanDocTargetName.textContent = `[진단 서류] ${docName}`;
    }
    
    // 모의 서류 삽입
    if (aiMockDocument) {
      aiMockDocument.innerHTML = aiMockDocTemplates[activeTab][aiCurrentStep] || '<div>가상 서류 데이터 없음</div>';
      aiMockDocument.classList.remove('scanned');
    }
    
    if (aiScanLaserLine) aiScanLaserLine.classList.remove('animating');
    
    const startSpan = aiStartScanBtn.querySelector('span');
    const startIcon = aiStartScanBtn.querySelector('i');
    
    if (aiCurrentStep === aiTotalSteps - 1) {
      if (startSpan) startSpan.textContent = '스캔 및 종합 진단 시작';
      if (startIcon) startIcon.className = 'fa-solid fa-chart-line';
    } else {
      if (startSpan) startSpan.textContent = '스캔 후 다음 서류 촬영';
      if (startIcon) startIcon.className = 'fa-solid fa-camera';
    }
    
    if (aiStartScanBtn) aiStartScanBtn.disabled = false;
  }

  // 모달 닫기
  function closeAiScanModal() {
    if (aiScanModal) {
      aiScanModal.classList.add('hidden');
    }
  }

  if (closeAiModalBtn) {
    closeAiModalBtn.addEventListener('click', closeAiScanModal);
  }

  // AI 스캔 시작 시뮬레이션
  if (aiStartScanBtn) {
    aiStartScanBtn.addEventListener('click', () => {
      const startSpan = aiStartScanBtn.querySelector('span');
      const startIcon = aiStartScanBtn.querySelector('i');
      
      if (startSpan) startSpan.textContent = 'AI 분석 중...';
      if (startIcon) startIcon.className = 'fa-solid fa-spinner fa-spin';
      aiStartScanBtn.disabled = true;

      if (aiScanLaserLine) aiScanLaserLine.classList.add('animating');
      playNotificationSound('beep');

      setTimeout(() => {
        if (aiScanLaserLine) aiScanLaserLine.classList.remove('animating');
        if (aiMockDocument) aiMockDocument.classList.add('scanned');
        
        // 현재 단계의 결과 누적
        const scenario = aiVerifyScenarios[activeTab][aiCurrentStep];
        aiStepResults.push({
          index: aiCurrentStep,
          name: checklistData[activeTab][aiCurrentStep].text,
          ...scenario
        });

        playNotificationSound('beep');

        // 다음 단계 전환 또는 결과창 노출
        if (aiCurrentStep < aiTotalSteps - 1) {
          aiCurrentStep++;
          loadScanStep();
        } else {
          // 종합 분석 결과 표시
          showBatchResults();
        }
      }, 1000);
    });
  }

  function showBatchResults() {
    if (aiScanStepCamera) aiScanStepCamera.classList.add('hidden');
    if (aiResultContainer) aiResultContainer.classList.remove('hidden');

    if (aiBatchResultList) {
      aiBatchResultList.innerHTML = '';
      
      let fitCount = 0;
      
      aiStepResults.forEach(res => {
        const item = document.createElement('div');
        item.className = 'ai-report-item';
        
        const badgeClass = res.isSuccess ? 'badge-status-fit' : 'badge-status-unfit';
        const badgeText = res.isSuccess ? '적합' : '보완 필요';
        if (res.isSuccess) fitCount++;

        item.innerHTML = `
          <div class="ai-report-header">
            <span class="ai-report-title">${res.name}</span>
            <span class="${badgeClass}">${badgeText} (${res.readiness})</span>
          </div>
          <div class="ai-report-desc">${res.guide}</div>
        `;
        
        aiBatchResultList.appendChild(item);
      });

      // 종합 통계 텍스트 업데이트
      if (aiBatchSummaryText) {
        aiBatchSummaryText.textContent = `총 ${aiTotalSteps}개 중 ${fitCount}개 서류 준비 완료`;
      }
      if (aiBatchSummaryPct) {
        const totalPct = Math.round((fitCount / aiTotalSteps) * 100);
        aiBatchSummaryPct.textContent = `준비율 ${totalPct}%`;
      }
    }

    playNotificationSound('double');
    showToast('AI 서류 일괄 진단이 완료되었습니다.');
  }

  // 다시 스캔
  if (aiRetryScanBtn) {
    aiRetryScanBtn.addEventListener('click', () => {
      openAiBatchScanModal();
    });
  }

  // 일괄 결과 적용하기
  if (aiConfirmBtn) {
    aiConfirmBtn.addEventListener('click', () => {
      closeAiScanModal();
      
      let appliedCount = 0;
      aiStepResults.forEach(res => {
        if (res.isSuccess) {
          checkedState[activeTab][res.index] = true;
          appliedCount++;
        }
      });
      
      renderChecklist(); // 체크리스트 리로드
      showToast(`AI 진단 결과에 따라 서류 ${appliedCount}개가 준비 처리되었습니다.`);
      playNotificationSound('double');
    });
  }

  // 일괄 진단 시작 버튼 바인딩
  if (aiBatchStartBtn) {
    aiBatchStartBtn.addEventListener('click', () => {
      openAiBatchScanModal();
    });
  }

  function renderChecklist() {
    if (!checklistItemsEl) return;
    
    checklistItemsEl.innerHTML = '';
    const currentItems = checklistData[activeTab];
    const currentState = checkedState[activeTab];

    currentItems.forEach((item, index) => {
      const itemWrapper = document.createElement('label');
      itemWrapper.className = 'check-item-label';
      
      const isChecked = currentState[index];

      // 개별 AI 버튼은 완전히 제거
      itemWrapper.innerHTML = `
        <div class="check-item-left">
          <input type="checkbox" class="check-item-input" data-index="${index}" ${isChecked ? 'checked' : ''}>
          <div class="check-text-group">
            <span class="check-item-text">${item.text}</span>
            <span class="check-item-desc">${item.desc}</span>
          </div>
        </div>
      `;

      const checkbox = itemWrapper.querySelector('.check-item-input');
      checkbox.addEventListener('change', (e) => {
        checkedState[activeTab][index] = e.target.checked;
        updateChecklistProgress();
        if (e.target.checked) {
          playNotificationSound('beep');
        }
      });

      checklistItemsEl.appendChild(itemWrapper);
    });

    updateChecklistProgress();
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeTab = e.target.dataset.tab;
      renderChecklist();
      playNotificationSound('beep');
    });
  });

  renderChecklist();

  // ==========================================================================
  // --- 11. 송금 전표 스캔 시뮬레이션 제어 ---
  // ==========================================================================
  const startScanBtn = document.getElementById('start-scan-btn');
  const retryScanBtn = document.getElementById('retry-scan-btn');
  const submitOcrBtn = document.getElementById('submit-ocr-btn');
  const editScanBtn = document.getElementById('edit-scan-btn');
  
  const scanLaserLine = document.getElementById('scan-laser-line');
  const mockVoucher = document.getElementById('mock-voucher');
  
  const scanViewStep1 = document.getElementById('scan-view-step1');
  const ocrResultContainer = document.getElementById('ocr-result-container');
  const scanSuccessMessage = document.getElementById('scan-success-message');

  if (startScanBtn) {
    startScanBtn.addEventListener('click', () => {
      const btnSpan = startScanBtn.querySelector('span');
      const btnIcon = startScanBtn.querySelector('i');
      const originalText = btnSpan.textContent;
      
      btnSpan.textContent = activeBusiness === 'sushin' ? '전표 스캔 및 OCR 분석 중...' : '대출신청서 스캔 및 OCR 분석 중...';
      btnIcon.className = 'fa-solid fa-spinner fa-spin';
      
      if (scanLaserLine) scanLaserLine.classList.add('animating');
      playNotificationSound('beep');

      setTimeout(() => {
        if (scanLaserLine) scanLaserLine.classList.remove('animating');
        
        if (activeBusiness === 'sushin') {
          if (mockVoucher) mockVoucher.classList.add('scanned');
        }
        
        if (scanViewStep1) scanViewStep1.classList.add('hidden');
        if (ocrResultContainer) ocrResultContainer.classList.remove('hidden');
        
        btnSpan.textContent = originalText;
        btnIcon.className = 'fa-solid fa-camera';
        
        playNotificationSound('double');
        showToast(activeBusiness === 'sushin' ? '전표 스캔 및 정보 추출에 성공했습니다!' : '대출신청서 스캔 및 정보 추출에 성공했습니다!');
      }, 1500);
    });
  }

  if (retryScanBtn) {
    retryScanBtn.addEventListener('click', () => {
      if (mockVoucher) mockVoucher.classList.remove('scanned');
      if (ocrResultContainer) ocrResultContainer.classList.add('hidden');
      if (scanViewStep1) scanViewStep1.classList.remove('hidden');
      playNotificationSound('beep');
    });
  }

  if (submitOcrBtn) {
    submitOcrBtn.addEventListener('click', () => {
      if (ocrResultContainer) ocrResultContainer.classList.add('hidden');
      if (scanSuccessMessage) {
        const titleEl = scanSuccessMessage.querySelector('h3');
        const descEl = scanSuccessMessage.querySelector('p');
        
        if (activeBusiness === 'sushin') {
          if (titleEl) titleEl.textContent = '전표 전송 완료!';
          if (descEl) descEl.innerHTML = '송금 정보가 해당 창구로 정상 전송되었습니다.<br>차례가 되었을 때 직원에게 말씀해 주세요.';
        }
        
        scanSuccessMessage.classList.remove('hidden');
      }
      
      playNotificationSound('double');
      showToast(activeBusiness === 'sushin' ? '전표 정보가 창구로 전송되었습니다.' : '대출 신청 정보가 창구로 전송되었습니다.');
    });
  }

  if (editScanBtn) {
    editScanBtn.addEventListener('click', () => {
      if (mockVoucher) mockVoucher.classList.remove('scanned');
      if (scanSuccessMessage) scanSuccessMessage.classList.add('hidden');
      if (scanViewStep1) scanViewStep1.classList.remove('hidden');
      playNotificationSound('beep');
    });
  }

  // ==========================================================================
  // --- 12. 금융 상품 성향 테스트 제어 ---
  // ==========================================================================
  const restartQuizBtn = document.getElementById('restart-quiz-btn');
  const quizIntroBox = document.getElementById('quiz-intro-box');
  const quizCardBox = document.getElementById('quiz-card-box');
  const quizResultBox = document.getElementById('quiz-result-box');
  
  const quizStepIndicator = document.getElementById('quiz-step-indicator');
  const quizProgressPercent = document.getElementById('quiz-progress-percent');
  const quizQuestionText = document.getElementById('quiz-question-text');
  const quizOptionsBox = document.getElementById('quiz-options-box');
  
  const resultTypeName = document.getElementById('result-type-name');
  const resultTypeDesc = document.getElementById('result-type-desc');

  const financialQuizData = {
    card: {
      title: "카드 소비 성향 진단",
      icon: "fa-solid fa-credit-card",
      questions: [
        {
          q: "Q1. 평소 카드 결제를 많이 하는 주요 소비 카테고리는 어디인가요?",
          options: [
            { text: "쿠팡, 배달앱, 커피, 편의점 등 온라인 쇼핑 및 일상 생활 밀착 지출", score: { smart: 3, simple: 0, travel: 0 } },
            { text: "주유, 대형마트, 일반 요식업 등 전반적인 오프라인 고정 지출", score: { smart: 0, simple: 3, travel: 0 } },
            { text: "항공권 예약, 면세점 결제 혹은 해외 결제 및 해외 직구", score: { smart: 0, simple: 0, travel: 3 } }
          ]
        },
        {
          q: "Q2. 선호하는 할인 및 적립 혜택 스타일은 무엇인가요?",
          options: [
            { text: "내가 자주 가는 특정 업종(커피, 배달 등)에서 10% 이상 강력한 집중 할인", score: { smart: 3, simple: 0, travel: 0 } },
            { text: "업종 제한 없이 결제할 때마다 큼직하게 캐시백으로 직접 환급받기", score: { smart: 0, simple: 3, travel: 0 } },
            { text: "공항 라운지 무료 이용, 면세점 할인 등 여행과 글로벌 특화 혜택", score: { smart: 0, simple: 0, travel: 3 } }
          ]
        },
        {
          q: "Q3. 카드 전월 이용 실적(할인 조건)을 관리하는 당신의 태도는?",
          options: [
            { text: "혜택 극대화를 위해서라면 구간별 실적 한도를 꼼꼼히 설계하여 사용", score: { smart: 3, simple: 0, travel: 1 } },
            { text: "실적 조건이나 매월 할인 한도 제한 등을 챙기는 것이 번거롭고 싫음", score: { smart: 0, simple: 3, travel: 0 } },
            { text: "평소 고정 지출이 커 실적 조건은 자동 충족되므로 혜택 스케일에 집중", score: { smart: 0, simple: 0, travel: 3 } }
          ]
        },
        {
          q: "Q4. 카드 결제 한 건당 발생하는 평균 결제 금액대는 얼마인가요?",
          options: [
            { text: "커피숍, 편의점 등 1~2만 원 이하의 소액 결제가 자주 발생", score: { smart: 3, simple: 0, travel: 0 } },
            { text: "가맹점 무관 건당 3만 원 이상의 중간 금액대 결제가 자주 발생", score: { smart: 0, simple: 3, travel: 0 } },
            { text: "여행 예약, 명세서 납부 등 한 번에 10만 원 이상의 큰 지출이 중심", score: { smart: 0, simple: 0, travel: 3 } }
          ]
        },
        {
          q: "Q5. 카드를 새로 가입할 때 가장 매력적으로 느껴지는 부가 기능은?",
          options: [
            { text: "간편결제(삼성페이, 네이버페이 등) 등록 시 추가 할인 혜택", score: { smart: 3, simple: 0, travel: 0 } },
            { text: "매월 할인 한도에 걸릴 걱정 없는 통장 자동 현금 입금 캐시백", score: { smart: 0, simple: 3, travel: 0 } },
            { text: "해외 이용 수수료 면제 및 외화 머니 서비스 연동 혜택", score: { smart: 0, simple: 0, travel: 3 } }
          ]
        }
      ],
      results: {
        smart: {
          title: "디지털/배달/MZ 소비형",
          desc: "쿠팡, 배달의민족, 커피전문점, 편의점, 대중교통 및 이동통신요금 등 매일 소비하는 일상생활 대표 디지털 영역에서 10% 집중 할인을 통해 실속을 극대화하는 성향입니다."
        },
        simple: {
          title: "조건 없는 무제한 심플 할인형",
          desc: "카드 이용 실적 조건을 매월 챙기거나 할인 혜택 한도를 일일이 계산하는 머리아픈 과정 없이, 언제 어디서 긁어도 기본 1%에서 특별 1.5% 무제한 자동 청구 할인을 선호하는 성향입니다."
        },
        travel: {
          title: "✈️ 글로벌 / 해외여행 / 프리미엄 혜택 집중형",
          desc: "항공권 예약, 면세점 쇼핑, 해외 직구 및 여행 지출 비중이 높으며, 공항 라운지 이용과 해외 이용 수수료 면제 등 여행·글로벌 특화 혜택을 적극 활용하는 프리미엄 스케일의 성향입니다."
        }
      }
    },

    deposit: {
      title: "예적금 저축 성향 진단",
      icon: "fa-solid fa-piggy-bank",
      questions: [
        {
          q: "Q1. 현재 저축 및 목돈을 모으려는 가장 핵심적인 목적은 무엇인가요?",
          options: [
            { text: "이미 모아둔 종잣돈 목돈을 깨뜨리지 않고 안전하게 굴려서 이자 받기", score: { deposit: 3, savings: 0, challenger: 0 } },
            { text: "매달 급여의 일부를 떼어 강제로 묶어두고 목표 종잣돈 만들기", score: { deposit: 0, savings: 3, challenger: 1 } },
            { text: "게임하듯 다양한 금융 혜택 조건을 돌파하며 높은 고금리 혜택 수집", score: { deposit: 0, savings: 0, challenger: 3 } }
          ]
        },
        {
          q: "Q2. 평소 저축을 할 때 선호하는 자금 입금 방식 스타일은?",
          options: [
            { text: "만기까지 목돈 전체를 처음에 한꺼번에 넣어두고 신경 끄기", score: { deposit: 3, savings: 0, challenger: 0 } },
            { text: "급여일에 맞춰 고정액이 이체되도록 하되, 여유 있을 때 수시로 자유 납입", score: { deposit: 0, savings: 3, challenger: 1 } },
            { text: "일정한 금액을 지정일에 자동 이체하여 흐트러짐 없는 강제 저축 유지", score: { deposit: 0, savings: 0, challenger: 3 } }
          ]
        },
        {
          q: "Q3. 예적금 금리 비교 시 우대금리를 획득하기 위한 조건에 대한 태도는?",
          options: [
            { text: "복잡한 실적 달성 조건 없이 누구에게나 동일하게 정직한 고정금리 선호", score: { deposit: 3, savings: 1, challenger: 0 } },
            { text: "모바일 앱 로그인 등 스마트폰으로 쉽게 충족 가능한 가벼운 우대 혜택 선호", score: { deposit: 0, savings: 3, challenger: 0 } },
            { text: "급여, 자동이체, 주거래 실적 등 난이도 있는 미션을 다 깨더라도 최고 금리 쟁취", score: { deposit: 0, savings: 0, challenger: 3 } }
          ]
        },
        {
          q: "Q4. 본인이 설정하고자 하는 최적의 저축 및 예치 유지 기간은?",
          options: [
            { text: "1년 이상 목돈을 건드리지 않고 느긋하게 묶어두기", score: { deposit: 3, savings: 1, challenger: 0 } },
            { text: "6개월 이내 단기로 운용하여 필요한 일에 유연하게 대처할 비상금 만들기", score: { deposit: 0, savings: 3, challenger: 0 } },
            { text: "3년 이상의 성실한 중장기 레이스를 통해 집 계약금 등의 큰 목돈 종잣돈 마련", score: { deposit: 0, savings: 0, challenger: 3 } }
          ]
        },
        {
          q: "Q5. 평소 소비와 저축을 관리할 때의 금융 관리 습관은?",
          options: [
            { text: "비상금 통장, 예금 계좌 등 통장을 성격별로 쪼개서 엄격하게 관리", score: { deposit: 3, savings: 0, challenger: 0 } },
            { text: "지출 후에 남는 현금을 자유롭게 저축 통장이나 저금통 계좌로 이체", score: { deposit: 0, savings: 3, challenger: 0 } },
            { text: "급여 입금, 청약, 카드 대금 등 모든 금융 활동을 한 은행에 연결해 집중 우대", score: { deposit: 0, savings: 0, challenger: 3 } }
          ]
        }
      ],
      results: {
        deposit: {
          title: "안정형 정기예금 저축러",
          desc: "목돈을 안전하게 굴리는 거치식 예금을 선호하며, 급여 이체나 공과금 자동이체 등 일상적인 은행 거래 실적을 묶어 안정적으로 고금리 혜택을 챙기는 신중한 저축가입니다."
        },
        savings: {
          title: "자유로운 스마트 적립가",
          desc: "7개월이라는 비교적 짧은 만기와 매주 소액 자동이체(세븐 이체)를 설정해 게임을 하듯 가볍고 부담 없이 단기 비상금을 만드는 트렌디한 저축러입니다."
        },
        challenger: {
          title: "우대금리 달성 챌린저",
          desc: "대구·경북의 주요 명소를 찾아가 위치인증(GPS) 미션을 격파하는 액티브한 저축을 즐기며, 최고 연 1.50%p에 달하는 챌린저 우대금리를 쟁취해내는 미션 정복러입니다."
        }
      }
    }
  };

  let activeCategory = 'card';
  let currentQuestionIndex = 0;
  let userScores = {};

  // 나의 맞춤 금융 성향 테스트 아코디언 토글 제어 이벤트 리스너 바인딩
  if (gameAccordionHeader && gameAccordionContent && gameAccordionSection) {
    gameAccordionHeader.addEventListener('click', () => {
      gameAccordionContent.classList.toggle('hidden');
      const arrowIcon = gameAccordionHeader.querySelector('.game-section-toggle-icon i');
      if (arrowIcon) {
        arrowIcon.classList.toggle('fa-chevron-down');
        arrowIcon.classList.toggle('fa-chevron-up');
      }
      playNotificationSound('beep');
      
      if (!gameAccordionContent.classList.contains('hidden')) {
        setTimeout(() => {
          gameAccordionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        if (quizCardBox) quizCardBox.classList.add('hidden');
        if (quizIntroBox) quizIntroBox.classList.remove('hidden');
        if (quizResultBox) quizResultBox.classList.add('hidden');
        
        currentQuestionIndex = 0;
        userScores = {};
      }
    });
  }

  // 3대 카테고리 진입 카드 이벤트 바인딩
  const categoryCards = document.querySelectorAll('.category-card');
  if (categoryCards) {
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        activeCategory = card.getAttribute('data-category');
        if (quizIntroBox) quizIntroBox.classList.add('hidden');
        if (quizCardBox) quizCardBox.classList.remove('hidden');
        
        currentQuestionIndex = 0;
        userScores = {};
        renderQuestion();
        playNotificationSound('beep');
      });
    });
  }

  function renderQuestion() {
    const categoryData = financialQuizData[activeCategory];
    const questions = categoryData.questions;

    if (currentQuestionIndex >= questions.length) {
      showQuizResult();
      return;
    }

    const currentQ = questions[currentQuestionIndex];
    if (quizStepIndicator) quizStepIndicator.textContent = `질문 ${currentQuestionIndex + 1} of ${questions.length}`;
    
    const pct = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
    if (quizProgressPercent) quizProgressPercent.textContent = `${pct}%`;
    if (quizQuestionText) quizQuestionText.textContent = currentQ.q;
    
    if (quizOptionsBox) {
      quizOptionsBox.innerHTML = '';
      currentQ.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `<span>${option.text}</span>`;
        
        btn.addEventListener('click', () => {
          Object.keys(option.score).forEach(key => {
            userScores[key] = (userScores[key] || 0) + option.score[key];
          });
          
          currentQuestionIndex++;
          playNotificationSound('beep');
          
          if (quizCardBox) {
            quizCardBox.style.opacity = 0.5;
            setTimeout(() => {
              quizCardBox.style.opacity = 1;
              renderQuestion();
            }, 150);
          } else {
            renderQuestion();
          }
        });
        
        quizOptionsBox.appendChild(btn);
      });
    }
  }

  function showQuizResult() {
    if (quizCardBox) quizCardBox.classList.add('hidden');
    if (quizResultBox) quizResultBox.classList.remove('hidden');

    const categoryData = financialQuizData[activeCategory];
    const results = categoryData.results;

    let winner = Object.keys(results)[0];
    let maxScore = -1;
    
    Object.keys(results).forEach(key => {
      const scoreVal = userScores[key] || 0;
      if (scoreVal > maxScore) {
        maxScore = scoreVal;
        winner = key;
      }
    });

    const result = results[winner];

    if (resultTypeName) resultTypeName.textContent = result.title;
    if (resultTypeDesc) resultTypeDesc.textContent = result.desc;

    // 동적 상품 카드 생성 영역
    const container = document.getElementById('recommended-products-container');
    if (container) {
      container.innerHTML = '';
      
      // Filter products matching winner key
      const matchedProducts = allProducts.filter(p => p.matchTypes && p.matchTypes.includes(winner)).slice(0, 1);
      
      console.log(`[Quiz Result Debug] Winner: ${winner}, Matched Products Count: ${matchedProducts.length}`);

      matchedProducts.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // 클릭 시 상품몰 새 탭 이동
        card.addEventListener('click', () => {
          window.open('https://www.imbank.co.kr/com_ebz_fpm_main.act', '_blank');
        });

        // Left visual element
        let visualHtml = '';
        if (prod.category === '카드' && prod.image) {
          visualHtml = `<img src="${prod.image}" class="product-card-image" alt="${prod.name}">`;
        } else {
          visualHtml = `
            <div class="product-icon-box">
               <i class="${prod.icon || 'fa-solid fa-piggy-bank'}"></i>
            </div>`;
        }

        let rateHtml = '';
        if (prod.rate && prod.rate !== '-') {
          rateHtml = `<span style="font-size: 12px; color: var(--brand-mint-dark); font-weight: bold; margin-bottom: 2px;">${prod.rate}</span>`;
        }

        card.innerHTML = `
          ${visualHtml}
          <div class="product-info">
            <span class="product-tag">${prod.category} 추천</span>
            <span class="product-name">${prod.name}</span>
            ${rateHtml}
            <span class="product-benefit">${prod.benefit}</span>
          </div>
          <i class="fa-solid fa-chevron-right product-arrow"></i>
        `;
        
        container.appendChild(card);
      });
    }

    playNotificationSound('double');
    showToast(`${categoryData.title}이 완료되었습니다!`);
  }

  if (restartQuizBtn) {
    restartQuizBtn.addEventListener('click', () => {
      if (quizResultBox) quizResultBox.classList.add('hidden');
      if (quizIntroBox) quizIntroBox.classList.remove('hidden');
      playNotificationSound('beep');
    });
  }

  // --- 14. 문자(SMS) 대기 알림 신청 모달 제어 ---
  if (smsAlertBtn && smsModal) {
    smsAlertBtn.addEventListener('click', () => {
      smsModal.classList.remove('hidden');
      playNotificationSound('beep');
    });

    const closeSmsModal = () => {
      smsModal.classList.add('hidden');
    };

    if (closeSmsModalBtn) closeSmsModalBtn.addEventListener('click', closeSmsModal);
    if (cancelSmsModalBtn) cancelSmsModalBtn.addEventListener('click', closeSmsModal);
    
    smsModal.addEventListener('click', (e) => {
      if (e.target === smsModal) {
        closeSmsModal();
      }
    });

    if (confirmSmsModalBtn) {
      confirmSmsModalBtn.addEventListener('click', () => {
        const smsPhoneNumber = document.getElementById('sms-phone-number').value;
        if (!smsPhoneNumber) {
          alert('휴대폰 번호를 입력해 주세요.');
          return;
        }
        
        closeSmsModal();
        playNotificationSound('double');
        showToast('문자 대기 알림 신청이 완료되었습니다!');
      });
    }
  }



  // --- 14. 미리작성 서브 탭 제어 (서류 작성 vs 전표 스캔) ---
  const preTabBtns = document.querySelectorAll('.pre-tab-btn');
  const preTabContentForm = document.getElementById('pre-tab-content-form');
  const preTabContentScan = document.getElementById('pre-tab-content-scan');

  if (preTabBtns && preTabContentForm && preTabContentScan) {
    preTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-pre-tab');
        
        preTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (targetTab === 'form') {
          preTabContentForm.classList.remove('hidden');
          preTabContentScan.classList.add('hidden');
        } else {
          preTabContentForm.classList.add('hidden');
          preTabContentScan.classList.remove('hidden');
        }
        playNotificationSound('beep');
      });
    });
  }

  // --- 14-2. 이용 안내 및 유의사항 모달 제어 (헤더 ⓘ 버튼) ---
  const noticeInfoBtn = document.getElementById('notice-info-btn');
  const noticeModal = document.getElementById('notice-modal');
  const closeNoticeModalBtn = document.getElementById('close-notice-modal-btn');

  if (noticeInfoBtn && noticeModal) {
    noticeInfoBtn.addEventListener('click', () => {
      noticeModal.classList.remove('hidden');
      playNotificationSound('beep');
    });

    const closeNoticeModal = () => noticeModal.classList.add('hidden');

    if (closeNoticeModalBtn) closeNoticeModalBtn.addEventListener('click', closeNoticeModal);
    noticeModal.addEventListener('click', (e) => {
      if (e.target === noticeModal) closeNoticeModal();
    });
  }

  // --- 15. 스마트 앱 배너 닫기 제어 ---
  const closeAppBanner = document.getElementById('close-app-banner');
  const smartAppBanner = document.querySelector('.smart-app-banner');
  
  if (closeAppBanner && smartAppBanner) {
    closeAppBanner.addEventListener('click', (e) => {
      e.stopPropagation();
      smartAppBanner.remove();
      playNotificationSound('beep');
    });
  }

  // 아코디언 핸들러 헬퍼 함수
  function setupAccordion(btnId, containerId, arrowId) {
    const btn = document.getElementById(btnId);
    const container = document.getElementById(containerId);
    const arrow = document.getElementById(arrowId);
    
    if (btn && container && arrow) {
      btn.addEventListener('click', () => {
        container.classList.toggle('collapsed');
        arrow.classList.toggle('rotated');
      });
    }
  }

  // --- 16. 2x2 퀵 메뉴 그리드 클릭 이벤트 및 모달 팝업 바인딩 ---
  const quickPreWritingBtn = document.getElementById('btn-quick-pre-writing');
  const quickChecklistBtn = document.getElementById('btn-quick-checklist');
  const quickScanBtn = document.getElementById('btn-quick-scan');
  const quickFinancialTestBtn = document.getElementById('btn-quick-financial-test');

  const preWritingModal = document.getElementById('pre-writing-modal');
  const checklistModal = document.getElementById('checklist-modal');
  const financialTestModal = document.getElementById('financial-test-modal');

  const closePreWritingBtn = document.getElementById('close-pre-writing-modal-btn');
  const closeChecklistBtn = document.getElementById('close-checklist-modal-btn');
  const closeFinancialTestBtn = document.getElementById('close-financial-test-modal-btn');

  // 미리작성 모달 열기
  if (quickPreWritingBtn && preWritingModal) {
    quickPreWritingBtn.addEventListener('click', () => {
      preWritingModal.classList.remove('hidden');
      
      // 서류 직접 작성 탭 활성화
      const formTabBtn = document.querySelector('.pre-tab-btn[data-pre-tab="form"]');
      if (formTabBtn) {
        formTabBtn.click();
      }
      playNotificationSound('beep');
    });
  }

  // 송금전표 모달 열기
  if (quickScanBtn && preWritingModal) {
    quickScanBtn.addEventListener('click', () => {
      preWritingModal.classList.remove('hidden');
      
      // 송금전표 스캔 탭 활성화
      const scanTabBtn = document.querySelector('.pre-tab-btn[data-pre-tab="scan"]');
      if (scanTabBtn) {
        scanTabBtn.click();
      }
      playNotificationSound('beep');
    });
  }

  // 체크리스트 모달 열기
  if (quickChecklistBtn && checklistModal) {
    quickChecklistBtn.addEventListener('click', () => {
      checklistModal.classList.remove('hidden');
      renderChecklist(); // 진척도 및 체크리스트 강제 렌더링
      playNotificationSound('beep');
    });
  }

  // 금융성향 테스트 모달 열기
  if (quickFinancialTestBtn && financialTestModal) {
    quickFinancialTestBtn.addEventListener('click', () => {
      financialTestModal.classList.remove('hidden');
      playNotificationSound('beep');
    });
  }

  // 닫기 버튼 이벤트 바인딩
  const setupModalClose = (closeBtnEl, modalEl) => {
    if (closeBtnEl && modalEl) {
      closeBtnEl.addEventListener('click', () => {
        modalEl.classList.add('hidden');
        playNotificationSound('beep');
      });
      // 오버레이 배경 클릭 시 닫기
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
          modalEl.classList.add('hidden');
        }
      });
    }
  };

  setupModalClose(closePreWritingBtn, preWritingModal);
  setupModalClose(closeChecklistBtn, checklistModal);
  setupModalClose(closeFinancialTestBtn, financialTestModal);

});
