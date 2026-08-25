document.addEventListener('DOMContentLoaded', async () => {
  let activeBusiness = 'sushin'; // 영업점 업무 카테고리 정의 (수신/여신 구분용)

  // --- 모달 팝업 오픈 상태 감시 및 body 스크롤 차단(no-scroll) 자동 연동 ---
  const modalElements = document.querySelectorAll('.modal-overlay, .modal, [id$="-modal"]');
  const syncScrollLock = () => {
    let anyModalVisible = false;
    modalElements.forEach(modal => {
      if (modal && !modal.classList.contains('hidden') && getComputedStyle(modal).display !== 'none') {
        anyModalVisible = true;
      }
    });
    if (anyModalVisible) {
      document.body.classList.add('no-scroll');
      document.documentElement.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
    }
  };

  const modalObserver = new MutationObserver(syncScrollLock);
  modalElements.forEach(modal => {
    modalObserver.observe(modal, { attributes: true, attributeFilter: ['class', 'style'] });
  });

  // 최초 동기화
  syncScrollLock();

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
    },
    {
      "id": "im-safe-fund-fallback",
      "category": "펀드",
      "name": "iM 단기국공채 증권투자신탁",
      "rate": "채권형 안정추구",
      "benefit": "정부 및 공공기관이 발행한 국공채 위주로 투자하여 원금 손실 가능성을 철저히 방지하고 시중금리 플러스 알파의 안정적 수익을 지향하는 펀드",
      "icon": "fa-solid fa-shield-halved",
      "matchTypes": ["safe"],
      "lastUpdated": "2026-07-14 21:10"
    },
    {
      "id": "im-aggressive-fund-fallback",
      "category": "펀드",
      "name": "iM 글로벌 AI 테크 주식형 펀드",
      "rate": "주식형 고위험고수익",
      "benefit": "글로벌 AI 혁신 기술 대형주(엔비디아, 마이크로소프트 등)에 집중 투자하여 초과 수익률을 노리는 액티브 주식형 펀드",
      "icon": "fa-solid fa-fire-flame-curved",
      "matchTypes": ["aggressive"],
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
    if (soundToggle && !soundToggle.checked) return;
    
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
  
  if (soundToggle) {
    soundToggle.addEventListener('change', () => {
      if (soundToggle.checked) {
        playNotificationSound('beep');
        showToast('알림 소리 및 진동이 설정되었습니다.');
      } else {
        showToast('알림이 무음으로 변경되었습니다.');
      }
    });
  }

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

  // --- 6. Pre-Writing Form Interaction ---
  const preWorkTypeRadios = document.querySelectorAll('input[name="pre-work-type"]');
  const reportFieldsGroup = document.getElementById('report-fields-group');
  const cifFieldsGroup = document.getElementById('cif-fields-group');
  
  const reportTargetSelect = document.getElementById('report-target');
  const reportDetailGroups = document.querySelectorAll('.report-detail-group');
  
  const reportUserName = document.getElementById('report-user-name');
  const reportUserPhone = document.getElementById('report-user-phone');

  // 대분류 선택에 따른 토글
  const dynamicReportFields = document.getElementById('dynamic-report-fields');

  // 대분류 및 세부항목 선택에 따른 동적 필수 정보 입력란 렌더링 함수
  function updateDynamicReportFields() {
    if (!dynamicReportFields) return;
    
    // 현재 어떤 업무 카드가 선택되었는지 확인
    const selectedWorkRadio = document.querySelector('input[name="pre-work-type"]:checked');
    const selectedWorkType = selectedWorkRadio ? selectedWorkRadio.value : 'cif';
    
    // 선택된 소분류 칩의 라디오 값 가져오기
    const checkedDetailRadio = document.querySelector(`input[name="detail-${selectedWorkType}-val"]:checked`);
    const detailVal = checkedDetailRadio ? checkedDetailRadio.value : '';
    
    let html = '';
    
    if (selectedWorkType === 'cif') {
      // 1. 신규 신청
      if (detailVal === '예/적금 신규') {
        html = `
          <div class="form-group">
            <label class="form-label">가입 상품 구분</label>
            <select class="form-input" id="cif-dep-type">
              <option value="정기예금">정기예금</option>
              <option value="정기적금">정기적금</option>
              <option value="자유적금">자유적금</option>
              <option value="주택청약종합저축">주택청약종합저축</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">가입 기간 (개월)</label>
            <select class="form-input" id="cif-dep-period">
              <option value="12개월">12개월</option>
              <option value="24개월">24개월</option>
              <option value="36개월">36개월</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">가입 금액 (원)</label>
            <input type="text" class="form-input" id="cif-dep-amount" placeholder="예: 1,000,000" required>
          </div>
          <div class="form-group">
            <label class="form-label">만기시 처리 방식</label>
            <select class="form-input" id="cif-dep-expiry-type">
              <option value="만기 자동해지 후 지정계좌 입금">만기 자동해지 후 지정계좌 입금</option>
              <option value="만기 자동재예치 (원금+이자)">만기 자동재예치 (원금+이자)</option>
              <option value="만기 직접 해지">만기 직접 해지</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">출금 계좌번호 (연동용)</label>
            <input type="text" inputmode="numeric" class="form-input" id="cif-dep-withdraw-acc" placeholder="연결할 계좌번호 입력 (- 제외)" required>
          </div>
        `;
      } else if (detailVal === '체크/신용카드 신규') {
        html = `
          <div class="form-group">
            <label class="form-label">희망 카드 유형</label>
            <div class="form-radio-group" style="grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 8px;">
              <label class="radio-card" style="padding: 0;">
                <input type="radio" name="cif-card-class" value="체크카드" checked>
                <span class="radio-content" style="padding: 8px 4px; font-size: 11px; text-align: center;">체크카드</span>
              </label>
              <label class="radio-card" style="padding: 0;">
                <input type="radio" name="cif-card-class" value="신용카드">
                <span class="radio-content" style="padding: 8px 4px; font-size: 11px; text-align: center;">신용카드</span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">희망 카드 명칭</label>
            <select class="form-input" id="cif-card-name">
              <option value="iM원 카드">iM원 카드 (기본 쇼핑/생활 혜택)</option>
              <option value="iM트래블 카드">iM트래블 카드 (해외 결제/환전 수수료 면제)</option>
              <option value="iM아이 카드">iM아이 카드 (교육/문화 할인 혜택)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">결제 계좌번호</label>
            <input type="text" inputmode="numeric" class="form-input" id="cif-card-pay-acc" placeholder="카드 대금 결제 계좌번호 입력" required>
          </div>
          <div class="form-group">
            <label class="form-label">명세서 수령 방법</label>
            <select class="form-input" id="cif-card-statement-type">
              <option value="모바일 알림 (앱 PUSH)">모바일 알림 (앱 PUSH)</option>
              <option value="이메일 고지">이메일 고지</option>
              <option value="종이 우편물 고지">종이 우편물 고지</option>
            </select>
          </div>
        `;
      } else if (detailVal === '전자금융 신규') {
        html = `
          <div class="form-group">
            <label class="form-label">희망 로그인 ID 설정</label>
            <input type="text" class="form-input" id="cif-ebank-id" placeholder="희망 아이디 입력 (6~12자)" required>
          </div>
          <div class="form-group">
            <label class="form-label">1일 이체 한도 설정</label>
            <select class="form-input" id="cif-ebank-day-limit">
              <option value="1,000만원">1,000만원</option>
              <option value="5,000만원">5,000만원</option>
              <option value="1억원">1억원</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">1회 이체 한도 설정</label>
            <select class="form-input" id="cif-ebank-once-limit">
              <option value="1,000만원">1,000만원</option>
              <option value="5,000만원">5,000만원</option>
            </select>
          </div>
          <div class="form-group checkbox-group" style="margin-bottom: 12px;">
            <label class="checkbox-container">
              <input type="checkbox" id="cif-ebank-push-agree" checked>
              <span class="checkmark"></span>
              <span class="checkbox-label" style="font-size: 11.5px;">스마트폰 입출금 push 실시간 무료 알림 서비스 신청</span>
            </label>
          </div>
        `;
      }
    } else if (selectedWorkType === 'report') {
      // 2. 제신고 & 변경
      if (detailVal === '고객정보 변경') {
        html = `
          <div class="form-group">
            <label class="form-label">변경할 자택 주소</label>
            <input type="text" class="form-input" id="report-new-address" placeholder="새로운 도로명 주소를 입력해 주세요" required>
          </div>
          <div class="form-group">
            <label class="form-label">변경할 이메일 주소</label>
            <input type="email" class="form-input" id="report-new-email" placeholder="새로운 이메일 입력" required>
          </div>
          <div class="form-group">
            <label class="form-label">우편물 수령처 변경</label>
            <select class="form-input" id="report-new-mail-deliver">
              <option value="자택">자택으로 변경</option>
              <option value="직장">직장으로 변경</option>
              <option value="모바일/이메일 대체 수령">모바일 / 이메일 대체 수령 신청</option>
            </select>
          </div>
        `;
      } else if (detailVal === '카드 재발급') {
        html = `
          <div class="form-group">
            <label class="form-label">재발급 사유</label>
            <select class="form-input" id="report-card-reissue-reason">
              <option value="분실/도난">분실 / 도난</option>
              <option value="훼손">훼손 (마그네틱/칩 인식 오류)</option>
              <option value="유효기간 만료">유효기간 만료 임박</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">재발급 카드 수령지</label>
            <div class="form-radio-group" style="grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 8px;">
              <label class="radio-card" style="padding: 0;">
                <input type="radio" name="report-card-delivery" value="자택" checked>
                <span class="radio-content" style="padding: 8px 4px; font-size: 11px; text-align: center;">자택 배송</span>
              </label>
              <label class="radio-card" style="padding: 0;">
                <input type="radio" name="report-card-delivery" value="직장">
                <span class="radio-content" style="padding: 8px 4px; font-size: 11px; text-align: center;">직장 배송</span>
              </label>
              <label class="radio-card" style="padding: 0;">
                <input type="radio" name="report-card-delivery" value="영업점">
                <span class="radio-content" style="padding: 8px 4px; font-size: 11px; text-align: center;">영업점 수령</span>
              </label>
            </div>
          </div>
          <div class="form-group" id="card-delivery-address-group">
            <label class="form-label">배송지 주소</label>
            <input type="text" class="form-input" id="report-card-delivery-address" placeholder="주소를 정확히 입력해 주세요" required>
          </div>
        `;
      } else if (detailVal === '결제계좌/결제일 변경') {
        html = `
          <div class="form-group">
            <label class="form-label">대상 카드사 구분</label>
            <select class="form-input" id="report-card-provider">
              <option value="iM카드(자체)">iM카드 (자체)</option>
              <option value="BC카드">BC카드</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">희망 결제일 변경</label>
            <select class="form-input" id="report-card-payday">
              <option value="매월 13일 (추천)">매월 13일 (전월 1일~말일 결제대상 기간 일치)</option>
              <option value="매월 1일">매월 1일</option>
              <option value="매월 5일">매월 5일</option>
              <option value="매월 25일">매월 25일</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">변경할 카드 대금 결제 계좌번호</label>
            <input type="text" inputmode="numeric" class="form-input" id="report-card-new-account" placeholder="새로운 대금 결제 계좌번호 입력" required>
          </div>
        `;
      }
    } else if (selectedWorkType === 'autodebit') {
      // 3. 자동이체 등록
      if (detailVal === '계좌간 자동이체 신청') {
        html = `
          <div class="form-group">
            <label class="form-label">출금 계좌번호</label>
            <input type="text" inputmode="numeric" class="form-input" id="autodebit-withdraw-acc" placeholder="출금할 내 계좌번호 입력" required>
          </div>
          <div class="form-group">
            <label class="form-label">입금 은행명</label>
            <input type="text" class="form-input" id="autodebit-deposit-bank" placeholder="예: iM뱅크, 신한은행 등" required>
          </div>
          <div class="form-group">
            <label class="form-label">입금 계좌번호</label>
            <input type="text" inputmode="numeric" class="form-input" id="autodebit-deposit-acc" placeholder="상대방 입금 계좌번호 입력" required>
          </div>
          <div class="form-group">
            <label class="form-label">매월 이체 희망 금액 (원)</label>
            <input type="text" class="form-input" id="autodebit-amount" placeholder="예: 300,000" required>
          </div>
          <div class="form-group">
            <label class="form-label">매월 이체 희망일</label>
            <select class="form-input" id="autodebit-day">
              <option value="매월 5일">매월 5일</option>
              <option value="매월 10일">매월 10일</option>
              <option value="매월 25일">매월 25일</option>
            </select>
          </div>
        `;
      } else if (detailVal === '공과금 자동이체 신청') {
        html = `
          <div class="form-group">
            <label class="form-label">출금 계좌번호</label>
            <input type="text" inputmode="numeric" class="form-input" id="autodebit-bill-withdraw-acc" placeholder="출금할 내 계좌번호 입력" required>
          </div>
          <div class="form-group">
            <label class="form-label">공과금 구분</label>
            <select class="form-input" id="autodebit-bill-type">
              <option value="아파트 관리비">아파트 관리비</option>
              <option value="도시가스 요금">도시가스 요금</option>
              <option value="한전 전기요금">한전 전기요금</option>
              <option value="국민연금 납부">국민연금 납부</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">납부자 번호 (지로/고객번호)</label>
            <input type="text" class="form-input" id="autodebit-bill-customer-num" placeholder="지로 고지서의 고객번호 9~12자리 입력" required>
          </div>
        `;
      }
    } else if (selectedWorkType === 'doc') {
      // 4. 기초 서류 작성
      if (detailVal === '고객확인제도(CDD/EDD)') {
        html = `
          <div class="form-group">
            <label class="form-label">금융 거래 목적</label>
            <select class="form-input" id="doc-cdd-purpose">
              <option value="급여 및 생활비">급여 및 생활비</option>
              <option value="저축 및 투자">저축 및 투자</option>
              <option value="사업 자금 거래">사업 자금 거래</option>
              <option value="대출 원리금 상환">대출 원리금 상환</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">자금 원천 구분</label>
            <select class="form-input" id="doc-cdd-source">
              <option value="근로소득 (급여)">근로소득 (급여)</option>
              <option value="사업소득">사업소득</option>
              <option value="부동산 임대소득/양도">부동산 임대소득 / 양도</option>
              <option value="상속 / 증여 / 차입">상속 / 증여 / 차입</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">본인이 이 계좌의 실제 소유자입니까?</label>
            <div class="form-radio-group" style="grid-template-columns: repeat(2, 1fr); gap: 6px;">
              <label class="radio-card" style="padding: 0;">
                <input type="radio" name="doc-cdd-realowner" value="예 (실제 소유자)" checked>
                <span class="radio-content" style="padding: 8px 4px; font-size: 11.5px; text-align: center;">예 (실제 소유자)</span>
              </label>
              <label class="radio-card" style="padding: 0;">
                <input type="radio" name="doc-cdd-realowner" value="아니오 (타인 대리)">
                <span class="radio-content" style="padding: 8px 4px; font-size: 11.5px; text-align: center;">아니오 (대리 발급 등)</span>
              </label>
            </div>
          </div>
        `;
      } else if (detailVal === 'FATCA 거주지 확인') {
        html = `
          <div class="form-group">
            <label class="form-label">본인은 미국 시민권자 또는 미국 거주자입니까?</label>
            <div class="form-radio-group" style="grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 8px;">
              <label class="radio-card" style="padding: 0;">
                <input type="radio" name="doc-fatca-us-check" value="아니오" checked>
                <span class="radio-content" style="padding: 8px 4px; font-size: 11px; text-align: center;">아니오 (해당 없음)</span>
              </label>
              <label class="radio-card" style="padding: 0;">
                <input type="radio" name="doc-fatca-us-check" value="예">
                <span class="radio-content" style="padding: 8px 4px; font-size: 11px; text-align: center;">예 (미국 납세자)</span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">국적 및 납세 국가</label>
            <input type="text" class="form-input" id="doc-fatca-nationality" value="대한민국" required>
          </div>
          <div class="form-group checkbox-group" style="margin-bottom: 12px;">
            <label class="checkbox-container">
              <input type="checkbox" id="doc-fatca-cert-agree" checked>
              <span class="checkmark"></span>
              <span class="checkbox-label" style="font-size: 11.5px;">해외금융계좌신고(FATCA) 거주지 본인 확인 확약에 동의합니다.</span>
            </label>
          </div>
        `;
      }
    } else if (selectedWorkType === 'security') {
      // 5. 창구 보안 업무 (사전 작성 불가 비대상 경고창 노출)
      html = `
        <div class="info-alert-box" style="background-color: #FFF2F4; border: 1px solid #FFCCD3; border-radius: 8px; padding: 12px; font-size: 12.0px; color: #D0021B; line-height: 1.6; margin-bottom: 8px; box-sizing: border-box; text-align: left;">
          <h4 style="margin: 0 0 6px 0; font-weight: 700; font-size: 12.5px;"><i class="fa-solid fa-triangle-exclamation"></i> 사전 작성 및 전송 제한 안내</h4>
          계좌 비밀번호 변경, 비밀번호 재설정/오입력 해제, 그리고 OTP/보안카드 실물 재발급 업무는 <strong>웹 보안 및 금융 사고 예방 규정</strong>에 의거하여 모바일 사전 입력이 제한됩니다.<br><br>
          해당 업무는 번호표 호출 시 영업점 창구의 <strong>보안 핀패드(Pinpad) 직접 입력</strong> 및 <strong>실물 신분증 대조 확인</strong>이 필수적이므로 행원 앞에서 직접 안전하게 처리해 주시기 바랍니다.
        </div>
      `;
    }
    
    dynamicReportFields.innerHTML = html;
    
    // 추가 서식 내 인터랙션 보정: 카드 재발급 우편/영업점 수령에 따른 주소창 가시성 연동
    const addressGroup = document.getElementById('card-delivery-address-group');
    const deliveryRadios = document.querySelectorAll('input[name="report-card-delivery"]');
    const addressInput = document.getElementById('report-card-delivery-address');
    
    if (addressGroup && deliveryRadios.length > 0) {
      deliveryRadios.forEach(rad => {
        rad.addEventListener('change', (e) => {
          if (e.target.value === '영업점') {
            addressGroup.style.display = 'none';
            if (addressInput) addressInput.required = false;
          } else {
            addressGroup.style.display = 'block';
            if (addressInput) addressInput.required = true;
          }
        });
      });
    }
  }

  // 작성할 업무 대분류(5단 라디오 카드) 선택에 따른 토글
  preWorkTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const type = e.target.value;
      
      // 모든 세부 칩 그룹을 일단 다 숨김
      reportDetailGroups.forEach(group => {
        group.classList.add('hidden');
      });
      
      // 현재 선택된 대분류에 매칭되는 소분류 칩 그룹만 활성화
      const activeGroup = document.getElementById(`detail-${type}`);
      if (activeGroup) {
        activeGroup.classList.remove('hidden');
      }
      
      // 동적 입력 필드 실시간 갱신
      updateDynamicReportFields();
    });
  });

  // 이벤트 위임 기법: 칩 라디오 버튼 변경 등 모든 폼 변화 발생 시 동적 필드 실시간 동기화
  if (preWritingForm) {
    preWritingForm.addEventListener('change', (e) => {
      if (e.target.name && e.target.name.startsWith('detail-')) {
        updateDynamicReportFields();
      }
    });
  }

  // 초기 상태 로딩을 위한 자동 동적 필드 빌드
  updateDynamicReportFields();

  // Pre-writing Form Submission
  if (preWritingForm) {
    preWritingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtnText = preWritingForm.querySelector('.submit-form-btn span');
      const submitBtnIcon = preWritingForm.querySelector('.submit-form-btn i');
      const originalText = submitBtnText ? submitBtnText.textContent : '서류 임시 제출 완료';
      
      if (submitBtnText) submitBtnText.textContent = '서류 제출 중...';
      if (submitBtnIcon) submitBtnIcon.className = 'fa-solid fa-spinner fa-spin';
      
      setTimeout(() => {
        const selectedWorkRadio = document.querySelector('input[name="pre-work-type"]:checked');
        const selectedWorkType = selectedWorkRadio ? selectedWorkRadio.value : 'cif';
        
        const nameVal = reportUserName ? reportUserName.value : '';
        
        const targetNames = {
          cif: '신규 신청',
          report: '제신고 & 변경',
          autodebit: '자동이체 등록',
          doc: '기초 서류 작성',
          security: '창구 보안 업무'
        };
        const targetNameText = targetNames[selectedWorkType] || '신규 신청';
        
        // 선택된 칩 세부 값 획득
        const checkedDetailRadio = document.querySelector(`input[name="detail-${selectedWorkType}-val"]:checked`);
        const detailText = checkedDetailRadio ? checkedDetailRadio.value : '';
        
        const displayJobText = `${targetNameText} (${detailText})`;
        
        // Update success message UI
        if (displayName) displayName.textContent = nameVal;
        if (displayJob) displayJob.textContent = displayJobText;
        
        // Swapping states
        preWritingForm.classList.add('hidden');
        if (successMessage) successMessage.classList.remove('hidden');
        
        // Restore submit button state
        if (submitBtnText) submitBtnText.textContent = originalText;
        if (submitBtnIcon) submitBtnIcon.className = 'fa-solid fa-arrow-right';
        
        playNotificationSound('double');
        showToast('서류 작성이 완료되었습니다.');
      }, 1000);
    });
  }

  // Edit/Reset form button inside success layout
  if (editFormBtn) {
    editFormBtn.addEventListener('click', () => {
      if (successMessage) successMessage.classList.add('hidden');
      if (preWritingForm) preWritingForm.classList.remove('hidden');
    });
  }

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
  // --- 7대 금융 업무별 동적 질문 및 서류 조건 정의 ---
  const checklistConfig = {
    personal_new: {
      questions: [
        {
          id: "q_p_job",
          title: "가입자의 직업 구분을 선택해 주세요.",
          options: [
            { text: "직장인 (근로소득자)", val: "employee" },
            { text: "주부 / 학생 / 무직", val: "none" },
            { text: "개인사업자", val: "business" }
          ]
        },
        {
          id: "q_p_purpose",
          title: "금융거래 목적 증빙 방법을 선택해 주세요.",
          options: [
            { text: "급여 이체용", val: "salary" },
            { text: "공과금 이체용", val: "utility" },
            { text: "사업 거래용", val: "biz_deal" }
          ]
        }
      ],
      getDocuments: (answers) => {
        const docs = [
          { text: "본인 실명 확인 증표 (신분증)", desc: "주민등록증, 운전면허증, 여권 등 (만 17세 이상)" },
          { text: "거래인감 또는 본인 서명", desc: "통장에 등록할 도장 또는 서명 준비" }
        ];
        
        if (answers.q_p_job === 'employee' || answers.q_p_purpose === 'salary') {
          docs.push({ text: "재직증명서", desc: "회사 발행 3개월 이내 원본" });
          docs.push({ text: "건강보험자격득실확인서", desc: "국민건강보험공단 발행본" });
        }
        if (answers.q_p_job === 'business' || answers.q_p_purpose === 'biz_deal') {
          docs.push({ text: "사업자등록증명원", desc: "홈택스 발급 3개월 이내" });
          docs.push({ text: "부가가치세과세표준증명원", desc: "최근 연도 발급 필수" });
        }
        if (answers.q_p_job === 'none' && answers.q_p_purpose === 'utility') {
          docs.push({ text: "공과금 영수증", desc: "본인 명의 아파트관리비 고지서 또는 전기/가스 영수증" });
        }
        return docs;
      }
    },
    rent_loan: {
      questions: [
        {
          id: "q_r_income",
          title: "소득 증빙 구분을 선택해 주세요.",
          options: [
            { text: "근로소득자 (직장인)", val: "salary" },
            { text: "사업소득자 (개인사업)", val: "business" },
            { text: "소득 없음 (추정 소득 활용)", val: "none" }
          ]
        },
        {
          id: "q_r_house",
          title: "임차 대상 주택의 종류는 무엇인가요?",
          options: [
            { text: "아파트 / 주거용 오피스텔", val: "apt" },
            { text: "다세대 빌라 / 연립주택", val: "villa" },
            { text: "단독 / 다가구 주택", val: "house" }
          ]
        }
      ],
      getDocuments: (answers) => {
        const docs = [
          { text: "확정일자부 임대차계약서 원본", desc: "주민센터 등에서 확정일자를 부여받은 계약서 필수" },
          { text: "임차주택 등기사항전부증명원 (등기부등본)", desc: "말소사항 포함 최근 발행분" },
          { text: "주민등록등본 및 초본 (최근 5년 주소변동 포함)", desc: "주민등록번호 전체 표시본" },
          { text: "가족관계증명서 (상세)", desc: "배우자 유무 확인용" }
        ];
        if (answers.q_r_income === 'salary') {
          docs.push({ text: "재직증명서", desc: "회사 발행본" });
          docs.push({ text: "근로소득원천징수영수증", desc: "최근 2개년 회사 발행 직인 날인본" });
        } else if (answers.q_r_income === 'business') {
          docs.push({ text: "사업자등록증 사본 및 소득금액증명원", desc: "국세청 발급 최근 연도 소득 증빙" });
        } else if (answers.q_r_income === 'none') {
          docs.push({ text: "연금수령증명서 또는 신용카드 사용내역서", desc: "최근 1년 건강보험료 납부확인서 등 대체 증빙" });
        }
        if (answers.q_r_house === 'house') {
          docs.push({ text: "전입세대열람내역 (도로명/지번 둘 다)", desc: "주민센터에서 임대차계약서 지참 후 발급 가능" });
        }
        return docs;
      }
    },
    home_loan: {
      questions: [
        {
          id: "q_h_use",
          title: "대출 자금의 용도가 무엇인가요?",
          options: [
            { text: "주택 구입용 자금", val: "purchase" },
            { text: "생활 안정용 자금", val: "living" }
          ]
        },
        {
          id: "q_h_income",
          title: "차주의 소득 확인 방법을 선택해 주세요.",
          options: [
            { text: "소득금액증명원 제출", val: "tax_proof" },
            { text: "근로소득 원천징수영수증 제출", val: "salary_proof" }
          ]
        }
      ],
      getDocuments: (answers) => {
        const docs = [
          { text: "등기사항전부증명원 (등기부등본)", desc: "대상 주택 정보 열람용" },
          { text: "인감증명서 2통 및 인감도장", desc: "대출 약정 및 근저당권 설정용" },
          { text: "주민등록등본 및 초본", desc: "최근 주소 이력 전체 포함본" }
        ];
        if (answers.q_h_use === 'purchase') {
          docs.push({ text: "매매계약서 원본", desc: "소유권 이전 전 매매 사실 입증용" });
        } else if (answers.q_h_use === 'living') {
          docs.push({ text: "등기필증 (집문서)", desc: "근저당 설정을 위한 실물 집문서 지참 필수" });
          docs.push({ text: "기존 대출 잔액 확인서", desc: "타행 대출 상환 연계 시 준비" });
        }
        if (answers.q_h_income === 'tax_proof') {
          docs.push({ text: "소득금액증명원", desc: "세무서 또는 홈택스 발급분" });
        } else if (answers.q_h_income === 'salary_proof') {
          docs.push({ text: "최근 2개년 근로소득원천징수영수증", desc: "근무지 발행 직인 날인본" });
        }
        return docs;
      }
    },
    corporate_new: {
      questions: [
        {
          id: "q_c_type",
          title: "법인의 조직 형태가 무엇인가요?",
          options: [
            { text: "주식회사", val: "stock" },
            { text: "유한회사 / 합명회사", val: "limited" }
          ]
        },
        {
          id: "q_c_visitor",
          title: "영업점 내방자는 누구인가요?",
          options: [
            { text: "대표이사 직접 내방", val: "ceo" },
            { text: "대리인 임직원 내방", val: "employee" }
          ]
        }
      ],
      getDocuments: (answers) => {
        const docs = [
          { text: "법인등기사항전부증명원 (법인등기부등본)", desc: "발급일로부터 3개월 이내 원본" },
          { text: "법인 인감증명서", desc: "발급일로부터 3개월 이내 원본" },
          { text: "법인 인감도장", desc: "서류 및 약정서 날인용 실물 지참" },
          { text: "법인 정관 및 주주명부", desc: "정관은 원본대조필 법인인감 날인본" }
        ];
        if (answers.q_c_visitor === 'ceo') {
          docs.push({ text: "대표이사 실명 확인 신분증", desc: "주민등록증 또는 운전면허증" });
        } else if (answers.q_c_visitor === 'employee') {
          docs.push({ text: "내방인(대리인) 신분증", desc: "주민등록증 또는 운전면허증" });
          docs.push({ text: "위임장 (법인인감 날인)", desc: "업무 위임 내역 기재 필수" });
          docs.push({ text: "대리인 재직증명서", desc: "법인 발행 임직원 증빙 서류" });
        }
        return docs;
      }
    },
    corporate_loan: {
      questions: [
        {
          id: "q_cl_security",
          title: "원하시는 대출의 담보 유형을 선택해 주세요.",
          options: [
            { text: "부동산 담보 대출", val: "estate" },
            { text: "보증서 발급 대출 (신보/기보)", val: "guarantee" },
            { text: "신용 대출", val: "credit" }
          ]
        },
        {
          id: "q_cl_guarantor",
          title: "대표이사 연대보증인 동반 여부를 선택해 주세요.",
          options: [
            { text: "대표이사 연대보증 동반함", val: "ceo_guarantor" },
            { text: "연대보증 없음 (순수 담보/보증서)", val: "no_guarantor" }
          ]
        }
      ],
      getDocuments: (answers) => {
        const docs = [
          { text: "사업자등록증명원 및 법인등기부등본", desc: "3개월 이내 원본" },
          { text: "법인인감증명서 및 법인인감도장", desc: "체결용 서류 지참" },
          { text: "최근 3개년도 법인 재무제표", desc: "국세청 홈택스 또는 회계사 확인 날인본" },
          { text: "국세 및 지방세 납세증명서", desc: "체납 여부 확인용 유효기간 이내본" }
        ];
        if (answers.q_cl_security === 'estate') {
          docs.push({ text: "부동산 등기필증 및 등기부등본", desc: "담보물 제공 권리 확인 서류" });
        } else if (answers.q_cl_security === 'guarantee') {
          docs.push({ text: "신용보증기금/기술보증기금 보증서 원본", desc: "사전 승인된 보증서 지참" });
        }
        if (answers.q_cl_guarantor === 'ceo_guarantor') {
          docs.push({ text: "대표이사 개인 인감증명서 및 주민등록초본", desc: "연대보증인 자격 증빙 서류" });
          docs.push({ text: "대표이사 개인 인감도장 및 신분증", desc: "동반 방문 및 날인 필수" });
        }
        return docs;
      }
    },
    proxy_work: {
      questions: [
        {
          id: "q_pr_owner",
          title: "본인(위임자)의 고객 성격을 선택해 주세요.",
          options: [
            { text: "개인 고객 (성인)", val: "individual" },
            { text: "미성년자 자녀", val: "minor" },
            { text: "법인 고객", val: "corporate" }
          ]
        },
        {
          id: "q_pr_type",
          title: "대리 처리하실 업무의 유형이 무엇인가요?",
          options: [
            { text: "예적금 해지 및 예금 출금", val: "cancel" },
            { text: "신규 계좌 개설", val: "new_acc" },
            { text: "카드 및 보안매체/비밀번호 변경", val: "security" }
          ]
        }
      ],
      getDocuments: (answers) => {
        const docs = [
          { text: "대리인(내방자) 실물 신분증", desc: "주민등록증 또는 운전면허증" },
          { text: "위임장 원본", desc: "위임자 인감 날인 필수 (미성년자 제외)" }
        ];
        if (answers.q_pr_owner === 'individual') {
          docs.push({ text: "위임자 본인 인감증명서 (3개월 이내)", desc: "주민센터 발행 개인인감증명서 원본" });
        } else if (answers.q_pr_owner === 'minor') {
          docs.shift(); // 위임장 제거
          docs.push({ text: "가족관계증명서 (상세/주민번호 공개)", desc: "내방자와 미성년자 자녀의 친권 증빙용" });
          docs.push({ text: "미성년자 자녀 기준 기본증명서 (상세)", desc: "친권권리 확인을 위한 상세 필수" });
          docs.push({ text: "법정대리인 동의서", desc: "은행 창구 비치 서식 작성" });
        } else if (answers.q_pr_owner === 'corporate') {
          docs.push({ text: "법인 인감증명서 및 위임장(법인인감 날인)", desc: "법인 자산 인출 권한 대조용" });
        }
        if (answers.q_pr_type === 'cancel') {
          docs.push({ text: "거래 통장 실물 및 등록 도장", desc: "인감도장 지참 시 예금 출금 가능" });
        }
        return docs;
      }
    },
    inheritance_work: {
      questions: [
        {
          id: "q_in_agree",
          title: "상속인들의 동의 및 방문 형태가 무엇인가요?",
          options: [
            { text: "상속인 전원 동의 및 공동 청구", val: "all_agree" },
            { text: "상속인 중 1인의 단독 상속 청구", val: "single_claim" }
          ]
        },
        {
          id: "q_in_will",
          title: "피상속인(사망자)의 유언장 유무를 선택해 주세요.",
          options: [
            { text: "유언장 없음 (법정 상속)", val: "no_will" },
            { text: "유언공증서 / 법원 공인 유언서 있음", val: "will_exist" }
          ]
        }
      ],
      getDocuments: (answers) => {
        const docs = [
          { text: "피상속인(사망자) 폐쇄가족관계증명서 (상세)", desc: "주민등록번호 전체 공개 및 사망 기재본" },
          { text: "피상속인(사망자) 기본증명서 (상세)", desc: "사망일시 및 사망사실 확인용" },
          { text: "상속인 전원의 주민등록초본 및 신분증 사본", desc: "상속 자격 검증용" },
          { text: "상속재산 분할협의서", desc: "상속인 전원의 인감날인 필수 서식" }
        ];
        if (answers.q_in_agree === 'all_agree') {
          docs.push({ text: "상속인 전원 인감증명서 각 1통", desc: "분할협의서 인감 대조용" });
          docs.push({ text: "내방하지 않은 상속인의 위임장 및 인감증명서", desc: "대리 청구 시 필요" });
        } else if (answers.q_in_agree === 'single_claim') {
          docs.push({ text: "상속재산 단독 청구 합의서", desc: "상속자 전원의 단독 청구 동의 인감 날인본" });
        }
        if (answers.q_in_will === 'will_exist') {
          docs.push({ text: "검인필 유언서 원본 또는 유언공정증서 원본", desc: "법원 검인 절차를 거친 증빙서류 필수" });
        }
        return docs;
      }
    }
  };

  const checkedAnswers = {}; // 문진 답변 결과 보관용
  const checkedState = {
    personal_new: [],
    rent_loan: [],
    home_loan: [],
    corporate_new: [],
    corporate_loan: [],
    proxy_work: [],
    inheritance_work: []
  };

  let activeTab = 'personal_new';
  const tabButtons = document.querySelectorAll('.tab-btn');
  const checklistItemsEl = document.getElementById('checklist-items');
  const progressBarEl = document.getElementById('checklist-progress-bar');
  const progressPctEl = document.getElementById('checklist-progress-pct');
  const checklistQuestionsContainer = document.getElementById('checklist-questions-container');

  function updateChecklistProgress() {
    if (!checkedState[activeTab]) return;
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

  // AI 판별용 모의 서류 템플릿 (7대 동적 서류 수에 대응하기 위해 Proxy로 동적 생성)
  const aiMockDocTemplates = new Proxy({}, {
    get: function(target, tabName) {
      const config = checklistConfig[tabName];
      if (!config) return [];
      const items = config.getDocuments(checkedAnswers);
      return items.map((item) => {
        return `
          <div class="mock-doc-header">
            <span class="mock-doc-title">${item.text}</span>
            <span class="mock-doc-watermark">제출용</span>
          </div>
          <div class="mock-doc-body">
            <div class="mock-doc-row"><span class="mock-doc-label">제출 부서</span><span class="mock-doc-value">iM Bank 영업점 창구</span></div>
            <div class="mock-doc-row"><span class="mock-doc-label">서류 설명</span><span class="mock-doc-value">${item.desc}</span></div>
            <div class="mock-doc-row"><span class="mock-doc-label">상태</span><span class="mock-doc-value" style="color: var(--brand-mint-dark); font-weight: bold;">AI 판독 완료</span></div>
          </div>
          <div class="mock-doc-footer"><span>iM SmartQ AI OCR 엔진</span><span>[적합 서류]</span></div>
        `;
      });
    }
  });

  // AI 판별 결과 시나리오 맵 (Proxy를 사용해 동적 생성)
  const aiVerifyScenarios = new Proxy({}, {
    get: function(target, tabName) {
      const config = checklistConfig[tabName];
      if (!config) return [];
      const items = config.getDocuments(checkedAnswers);
      return items.map((item, idx) => {
        if (item.text.includes("신분증") || item.text.includes("주민등록")) {
          return {
            readiness: '100%',
            suitability: '적합',
            guide: '본인 실명 확인 증표로 유효하며, 주민등록번호 뒷자리 마스킹 처리가 올바르게 검증되었습니다. 즉시 사용이 가능합니다.',
            isSuccess: true
          };
        }
        if (idx === 1) {
          return {
            readiness: '80%',
            suitability: '적합 (보완 권고)',
            guide: `제출하신 [${item.text}] 서류의 발급 일자 및 도장 날인 상태는 유효하나, 일부 민감 개인정보에 대한 안전 마스킹 처리를 권장합니다.`,
            isSuccess: true
          };
        }
        return {
          readiness: '100%',
          suitability: '적합',
          guide: `[${item.text}] 서류 구비 요건이 완벽하게 충족되었습니다. iM Bank 규정에 적합하여 바로 창구 제출이 가능합니다.`,
          isSuccess: true
        };
      });
    }
  });

  // 탭 클릭 이벤트 바인딩
  if (tabButtons) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeTab = e.target.getAttribute('data-tab') || 'card';
        renderChecklist();
      });
    });
  }

  // 상황 문진 질문 렌더링 및 답변 관리 함수
  function renderChecklistQuestions() {
    if (!checklistQuestionsContainer) return;

    // 만약 검색창에 입력된 텍스트가 없으면(초기 상태/선택안함), 질문 영역을 강제 숨김 처리 후 즉시 리턴
    const searchInput = document.getElementById('checklist-search-input');
    if (!searchInput || searchInput.value.trim() === '') {
      checklistQuestionsContainer.style.display = 'none';
      checklistQuestionsContainer.innerHTML = '';
      return;
    }
    
    const config = checklistConfig[activeTab];
    if (!config || !config.questions || config.questions.length === 0) {
      checklistQuestionsContainer.style.display = 'none';
      checklistQuestionsContainer.innerHTML = '';
      return;
    }

    checklistQuestionsContainer.style.display = 'block';
    checklistQuestionsContainer.innerHTML = '';

    // 질문 헤더 제목
    const headerTitle = document.createElement('div');
    headerTitle.style.cssText = "font-size: 13px; font-weight: 800; color: var(--brand-mint-dark); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;";
    headerTitle.innerHTML = `<i class="fa-solid fa-circle-question" style="color: var(--brand-mint);"></i><span>맞춤 서류를 확인하기 위해 몇 가지를 선택해 주세요.</span>`;
    checklistQuestionsContainer.appendChild(headerTitle);

    config.questions.forEach((q) => {
      // 답변이 지정되지 않았다면 첫 번째 옵션값으로 자동 초기 설정
      if (checkedAnswers[q.id] === undefined) {
        checkedAnswers[q.id] = q.options[0].val;
      }

      const qBox = document.createElement('div');
      qBox.style.cssText = "margin-bottom: 12px; display: flex; flex-direction: column; gap: 6px;";
      
      const qTitle = document.createElement('div');
      qTitle.style.cssText = "font-size: 11.5px; font-weight: 700; color: var(--dark-text);";
      qTitle.textContent = q.title;
      qBox.appendChild(qTitle);

      const chipsWrapper = document.createElement('div');
      chipsWrapper.style.cssText = "display: flex; flex-wrap: wrap; gap: 8px;";

      q.options.forEach((opt) => {
        const label = document.createElement('label');
        const isActive = checkedAnswers[q.id] === opt.val;
        
        label.style.cssText = `
          padding: 6px 12px;
          border-radius: 20px;
          border: 1.5px solid ${isActive ? 'var(--brand-mint)' : 'var(--light-gray)'};
          background-color: ${isActive ? 'var(--brand-mint-light)' : '#ffffff'};
          color: ${isActive ? 'var(--brand-mint-dark)' : 'var(--dark-gray)'};
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 4px;
        `;

        label.innerHTML = `
          <input type="radio" name="${q.id}" value="${opt.val}" ${isActive ? 'checked' : ''} style="display: none;">
          <span>${opt.text}</span>
        `;

        const radio = label.querySelector('input');
        radio.addEventListener('change', () => {
          checkedAnswers[q.id] = opt.val;
          playNotificationSound('click');
          
          // 상황 질문(맞춤형 선택지)이 변경되었으므로, 이전에 체크했던 체크박스 이력을 완벽 리셋하여 찌꺼기 방지!
          if (checkedState[activeTab]) {
            checkedState[activeTab] = [];
          }
          
          // 라디오 변경 시 문진 다시 그려서 보더 색상 피드백을 주고 서류 리스트 리프레시!
          renderChecklistQuestions();
          renderChecklistItemsOnly();
        });

        chipsWrapper.appendChild(label);
      });

      qBox.appendChild(chipsWrapper);
      checklistQuestionsContainer.appendChild(qBox);
    });
  }

  // 실제 필요 서류들만 드로잉하는 헬퍼 함수
  function renderChecklistItemsOnly() {
    if (!checklistItemsEl) return;
    checklistItemsEl.innerHTML = '';

    const config = checklistConfig[activeTab];
    if (!config) return;

    // 동적으로 계산된 서류들 취득
    const items = config.getDocuments(checkedAnswers);

    // 가변 상태배열 크기 자동 조정 (기존 체크 데이터 유지용)
    if (!checkedState[activeTab]) {
      checkedState[activeTab] = [];
    }
    
    // 만약 계산된 서류 수보다 체크상태 배열이 작으면 false로 메꿔줌
    while (checkedState[activeTab].length < items.length) {
      checkedState[activeTab].push(false);
    }
    // 초과되는 인덱스는 잘라냄
    if (checkedState[activeTab].length > items.length) {
      checkedState[activeTab] = checkedState[activeTab].slice(0, items.length);
    }

    const states = checkedState[activeTab];

    items.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'checklist-item';
      
      const isChecked = states[index] || false;
      
      itemEl.innerHTML = `
        <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; text-align: left; width: 100%;">
          <input type="checkbox" class="checklist-checkbox" data-index="${index}" ${isChecked ? 'checked' : ''} style="margin-top: 3px; flex-shrink: 0;">
          <div>
            <div style="font-weight: 600; font-size: 13.5px; color: #2c3e50;">${item.text}</div>
            <div style="font-size: 11.5px; color: #7f8c8d; margin-top: 2px; line-height: 1.4;">${item.desc}</div>
          </div>
        </label>
      `;
      
      const checkbox = itemEl.querySelector('.checklist-checkbox');
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          checkedState[activeTab][index] = e.target.checked;
          updateChecklistProgress();
        });
      }
      
      checklistItemsEl.appendChild(itemEl);
    });

    updateChecklistProgress();
  }

  // 체크리스트 아이템 동적 렌더링 메인 함수
  function renderChecklist() {
    // 1. 상황 질문을 그리고
    renderChecklistQuestions();
    // 2. 바뀐 질문 상태에 의거해 최종 서류 그리기
    renderChecklistItemsOnly();
  }

  function updateChecklistProgress() {
    if (!checkedState[activeTab]) return;
    const total = checkedState[activeTab].length;
    const checkedCount = checkedState[activeTab].filter(Boolean).length;
    const percentage = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
 
    if (progressBarEl) progressBarEl.style.width = `${percentage}%`;
    if (progressPctEl) progressPctEl.textContent = `${percentage}%`;
  }

  // AI 일괄 진단 버튼 클릭 시 모달 기동
  if (aiBatchStartBtn) {
    aiBatchStartBtn.addEventListener('click', () => {
      openAiBatchScanModal();
    });
  }

  function openAiBatchScanModal() {
    aiCurrentStep = 0;
    const config = checklistConfig[activeTab];
    if (config) {
      const items = config.getDocuments(checkedAnswers);
      aiTotalSteps = items.length;
    } else {
      aiTotalSteps = 0;
    }
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
    if (aiCurrentStep >= aiTotalSteps) {
      showBatchResults();
      return;
    }

    const config = checklistConfig[activeTab];
    if (!config) return;
    const items = config.getDocuments(checkedAnswers);
    const currentItem = items[aiCurrentStep];

    // 스캔 안내 타이틀 갱신
    if (aiScanDocTargetName) {
      aiScanDocTargetName.textContent = `[${aiCurrentStep + 1}/${aiTotalSteps}] ${currentItem.text}`;
    }

    // 모의 서류 템플릿 로드
    const templates = aiMockDocTemplates[activeTab] || [];
    if (aiMockDocument) {
      aiMockDocument.innerHTML = templates[aiCurrentStep] || '<div>문서 스캔 영역</div>';
    }

    // 버튼 활성화 초기화
    if (aiStartScanBtn) {
      aiStartScanBtn.disabled = false;
      const btnSpan = aiStartScanBtn.querySelector('span');
      if (btnSpan) btnSpan.textContent = '서류 촬영 및 AI 진단';
      const btnIcon = aiStartScanBtn.querySelector('i');
      if (btnIcon) btnIcon.className = 'fa-solid fa-camera';
    }
  }

  if (aiStartScanBtn) {
    aiStartScanBtn.addEventListener('click', () => {
      aiStartScanBtn.disabled = true;
      const btnSpan = aiStartScanBtn.querySelector('span');
      if (btnSpan) btnSpan.textContent = 'AI OCR 분석 및 진단 중...';
      const btnIcon = aiStartScanBtn.querySelector('i');
      if (btnIcon) btnIcon.className = 'fa-solid fa-spinner fa-spin';

      if (aiScanLaserLine) aiScanLaserLine.classList.add('animating');
      playNotificationSound('beep');

      setTimeout(() => {
        if (aiScanLaserLine) aiScanLaserLine.classList.remove('animating');
        
        const scenarios = aiVerifyScenarios[activeTab] || [];
        const result = scenarios[aiCurrentStep] || { readiness: '100%', suitability: '적합', guide: '확인 완료', isSuccess: true };
        aiStepResults.push(result);

        aiCurrentStep++;
        loadScanStep();
      }, 1500);
    });
  }

  // 개별 서류 단계 건너뛰기 (넘기기) 버튼 클릭 리스너 바인딩
  const aiSkipStepBtn = document.getElementById('ai-skip-step-btn');
  if (aiSkipStepBtn) {
    aiSkipStepBtn.addEventListener('click', () => {
      playNotificationSound('click');
      
      // 현재 단계를 '미진단' 처리하여 결과 배열에 누적
      aiStepResults.push({
        readiness: '0%',
        suitability: '미진단',
        guide: '서류 촬영 및 AI 진단 단계가 건너뛰어졌습니다.',
        isSuccess: false,
        isSkipped: true
      });

      // 다음 단계로 전환
      aiCurrentStep++;
      loadScanStep();
    });
  }

  function showBatchResults() {
    if (aiScanStepCamera) aiScanStepCamera.classList.add('hidden');
    if (aiResultContainer) aiResultContainer.classList.remove('hidden');

    if (aiBatchResultList) {
      aiBatchResultList.innerHTML = '';
    }

    const config = checklistConfig[activeTab];
    if (!config) return;
    const items = config.getDocuments(checkedAnswers);
    let fitCount = 0;
    let skippedCount = 0;

    items.forEach((item, index) => {
      const res = aiStepResults[index] || {
        readiness: '0%',
        suitability: '미진단',
        guide: '서류 촬영 및 AI 진단 단계가 생략(건너뜀)되었습니다.',
        isSuccess: false,
        isSkipped: true
      };

      if (res.isSkipped) {
        skippedCount++;
      }

      const resultItemEl = document.createElement('div');
    resultItemEl.className = 'ai-report-item';
      resultItemEl.style.borderBottom = '1px solid #f1f2f6';
      resultItemEl.style.padding = '12px 0';

      let suitabilityStyle = 'background-color:#f1f2f6; color:#7f8c8d;';
      if (!res.isSkipped) {
        suitabilityStyle = res.isSuccess ? 'background-color:#e3fcef; color:#00a389;' : 'background-color:#ffebe6; color:#de350b;';
        if (res.isSuccess) {
          fitCount++;
        }
      }

      resultItemEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:700; font-size:14px; color:#2c3e50;">${item.text}</span>
          <span style="font-size:11px; font-weight:800; padding:2px 8px; border-radius:12px; ${suitabilityStyle}">${res.suitability} (${res.readiness})</span>
        </div>
        <div style="font-size:12px; color:#7f8c8d; margin-top:6px; line-height:1.4;">${res.guide}</div>
      `;

      aiBatchResultList.appendChild(resultItemEl);
    });



    const totalCount = items.length;
    const isAllPassed = fitCount === totalCount;
    
    if (aiResultStatusTitle) {
      if (isAllPassed) {
        aiResultStatusTitle.textContent = '서류 진단 완료 (적합)';
        aiResultStatusTitle.style.color = '#00a389';
      } else if (skippedCount > 0) {
        aiResultStatusTitle.textContent = '일부 서류 진단 보류 (미진단 포함)';
        aiResultStatusTitle.style.color = '#f39c12';
      } else {
        aiResultStatusTitle.textContent = '서류 보완 필요 (부적합)';
        aiResultStatusTitle.style.color = '#de350b';
      }
    }

    if (aiBatchSummaryText) {
      aiBatchSummaryText.textContent = `총 ${totalCount}개 중 [적합 ${fitCount}개] [미진단 ${skippedCount}개]`;
    }

    if (aiBatchSummaryPct) {
      const pct = Math.round((fitCount / totalCount) * 100);
      aiBatchSummaryPct.textContent = `준비율 ${pct}%`;
    }

    if (aiConfirmBtn) {
      // 결과 적용 버튼 클릭 시, 이전 리스너 누적 방지를 위해 클론 기법 적용
      const newConfirmBtn = aiConfirmBtn.cloneNode(true);
      aiConfirmBtn.parentNode.replaceChild(newConfirmBtn, aiConfirmBtn);
      
      newConfirmBtn.addEventListener('click', () => {
        items.forEach((item, idx) => {
          const res = aiStepResults[idx];
          if (res && res.isSuccess && !res.isSkipped) {
            checkedState[activeTab][idx] = true;
          } else {
            checkedState[activeTab][idx] = false;
          }
        });
        renderChecklist();
        
        if (aiScanModal) aiScanModal.classList.add('hidden');
        showToast('AI 진단 결과가 체크리스트에 동기화되었습니다.');
      });
    }
  }

  if (closeAiModalBtn && aiScanModal) {
    closeAiModalBtn.addEventListener('click', () => {
      aiScanModal.classList.add('hidden');
    });
  }

  // ==========================================================================
  // --- 11. 수기 송금전표 AI OCR 및 실시간 행원 단말 연동 제어 ---
  // ==========================================================================
  
  // OCR Service Layer 인터페이스 정의 (요구사항 20번)
  class OCRService {
    constructor(mode = 'mock') {
      this.mode = mode;
    }
    
    // 전표 스캔 분석 수행
    analyze(voucherType, images) {
      if (this.mode === 'mock') {
        return this.getMockAnalysis(voucherType, images);
      } else {
        // 향후 실제 OCR API 연동 시 확장구역
        return null;
      }
    }

    getMockAnalysis(voucherType, images) {
      if (voucherType === 'SINGLE_TRANSFER') {
        return {
          type: "SINGLE_TRANSFER",
          images: [images[0]],
          ocrData: {
            withdrawalAccount: "123-456-789012",
            bank: "iM뱅크",
            recipientAccount: "234-567-890123",
            recipientName: "김철수",
            amount: 500000,
            sender: "홍길동",
            purpose: "개인 송금"
          },
          ocrConfidence: {
            withdrawalAccount: 0.98,
            bank: 0.99,
            recipientAccount: 0.72, // 신뢰도 낮음 -> "확인 필요" 고지 대상
            recipientName: 0.97,
            amount: 0.99,
            sender: 0.99,
            purpose: 0.95
          }
        };
      } else if (voucherType === 'MASS_TRANSFER') {
        // 이미지 개수에 맞춰 거래 목록 매핑 (각 거래에 sourceImageId 연동)
        const matchedTransactions = [];
        const baseTransactions = [
          { bank: "iM뱅크", accountNumber: "123-456-789012", accountHolder: "홍길동", amount: 500000, description: "급여", ocrConfidence: 0.99 },
          { bank: "국민은행", accountNumber: "234-567-890123", accountHolder: "김철수", amount: 300000, description: "급여", ocrConfidence: 0.75 }, // 신뢰도 낮음
          { bank: "신한은행", accountNumber: "345-678-901234", accountHolder: "이영희", amount: 700000, description: "급여", ocrConfidence: 0.99 },
          { bank: "우리은행", accountNumber: "456-789-012345", accountHolder: "박민수", amount: 400000, description: "보너스", ocrConfidence: 0.98 },
          { bank: "하나은행", accountNumber: "567-890-123456", accountHolder: "최지우", amount: 600000, description: "급여", ocrConfidence: 0.99 }
        ];

        images.forEach((img, idx) => {
          const base = baseTransactions[idx % baseTransactions.length];
          matchedTransactions.push({
            bank: base.bank,
            accountNumber: base.accountNumber,
            accountHolder: base.accountHolder,
            amount: base.amount,
            description: base.description,
            sourceImageId: img.id,
            ocrConfidence: base.ocrConfidence
          });
        });

        // 데모 중복 검사를 위한 임시 중복 데이터 이식 (이미지가 2장 이상일 때)
        // ※ 전표 개수를 초과하지 않도록 마지막 항목을 첫 번째와 동일 데이터로 덮어씀
        if (images.length >= 2) {
          const lastIdx = matchedTransactions.length - 1;
          matchedTransactions[lastIdx] = {
            bank: matchedTransactions[0].bank,
            accountNumber: matchedTransactions[0].accountNumber,
            accountHolder: matchedTransactions[0].accountHolder,
            amount: matchedTransactions[0].amount,
            description: matchedTransactions[0].description,
            sourceImageId: images[lastIdx].id,
            ocrConfidence: 0.99
          };
        }

        // 총액 계산
        let totalAmt = 0;
        matchedTransactions.forEach(t => totalAmt += t.amount);

        return {
          type: "MASS_TRANSFER",
          images: images,
          transactions: matchedTransactions,
          totalCount: matchedTransactions.length,
          totalAmount: totalAmt
        };
      }
    }
  }

  // 모의 스캔 서비스 싱글톤 인스턴스 생성
  const aiOcrService = new OCRService('mock');

  // 모달 내 뷰 단계 제어 엘리먼트들
  const selectView = document.getElementById('scan-step-select-view');
  const captureView = document.getElementById('scan-step-capture-view');
  const resultView = document.getElementById('scan-step-result-view');
  const successView = document.getElementById('scan-step-success-view');

  // 단계 인디케이터
  const stepInds = [
    document.getElementById('step-ind-1'),
    document.getElementById('step-ind-2'),
    document.getElementById('step-ind-3'),
    document.getElementById('step-ind-4')
  ];

  // 제어 버튼들
  const goToCaptureBtn = document.getElementById('go-to-capture-btn');
  const backToSelectBtn = document.getElementById('back-to-select-btn');
  const finishCaptureBtn = document.getElementById('finish-capture-btn');
  const btnMockShoot = document.getElementById('btn-mock-shoot');
  const btnMockGallery = document.getElementById('btn-mock-gallery');
  const ocrRetryBtn = document.getElementById('ocr-retry-btn');
  const ocrSendBtn = document.getElementById('ocr-send-btn');
  const finishScanFlowBtn = document.getElementById('finish-scan-flow-btn');
  const ocrAddMoreShootBtn = document.getElementById('ocr-add-more-shoot-btn');

  // 대량 촬영 이미지 슬롯 정보
  const massImageSlotsContainer = document.getElementById('mass-image-slots-container');
  const massImageThumbnails = document.getElementById('mass-image-thumbnails');
  const massSlotsCount = document.getElementById('mass-slots-count');

  // 데이터 폼 컨테이너 및 안내 뱃지
  const ocrFormStandard = document.getElementById('ocr-form-standard');
  const ocrFormMulti = document.getElementById('ocr-form-multi');
  const ocrSourceImageBox = document.getElementById('ocr-source-image-box');
  const laserEffect = document.getElementById('laser-effect');
  const demoVoucherPreview = document.getElementById('demo-voucher-preview');

  // 에러 및 중복 알림 배너
  const integrityErrorBanner = document.getElementById('ocr-integrity-error-banner');
  const duplicateWarningBanner = document.getElementById('ocr-duplicate-warning-banner');

  // 현재 선택된 이체 유형 및 업로드 이미지 개체
  let selectedVoucherType = 'SINGLE_TRANSFER'; // SINGLE_TRANSFER, MASS_TRANSFER
  let massUploadedImages = []; // { id: "IMG...", name: "전표 X", url: ... }
  let ocrResultData = null;    // AI 분석 결과 원본 객체 백업
  let activePreviewImageIndex = 0; // 대량 이체 결과 확인 시 왼쪽 뷰에 띄울 액티브 이미지 인덱스
  let activeStream = null;      // 실시간 하드웨어 카메라 비디오 스트림 객체 백업

  // [행원 데이터베이스] (실시간 접수 목록 - 데모용 기본 3건 사전적재)
  window.staffVoucherDb = [
    {
      id: "T202608191001",
      type: "SINGLE_TRANSFER",
      customer: { name: "고객 A" },
      images: [{ id: "IMG001", name: "전표 1" }],
      transactions: [{ bank: "iM뱅크", accountNumber: "123-456-789012", accountHolder: "김철수", amount: 500000, description: "개인 송금" }],
      totalCount: 1,
      totalAmount: 500000,
      status: "WAITING",
      createdAt: "2026-08-19 10:31",
      updatedAt: "2026-08-19 10:31"
    },
    {
      id: "T202608191002",
      type: "SINGLE_TRANSFER",
      customer: { name: "고객 B" },
      images: [{ id: "IMG001", name: "전표 1" }],
      transactions: [{ bank: "국민은행", accountNumber: "508-12-345678-9", accountHolder: "홍길순", amount: 1000000, description: "용돈" }],
      totalCount: 1,
      totalAmount: 1000000,
      status: "WAITING",
      createdAt: "2026-08-19 10:33",
      updatedAt: "2026-08-19 10:33"
    },
    {
      id: "T202608191003",
      type: "MASS_TRANSFER",
      customer: { name: "고객 C" },
      images: [
        { id: "IMG001", name: "전표 1" },
        { id: "IMG002", name: "전표 2" },
        { id: "IMG003", name: "전표 3" }
      ],
      transactions: [
        { bank: "iM뱅크", accountNumber: "508-99-888777-6", accountHolder: "홍길동", amount: 500000, sourceImageId: "IMG001" },
        { bank: "국민은행", accountNumber: "234-567-890123", accountHolder: "김철수", amount: 500000, sourceImageId: "IMG002" },
        { bank: "신한은행", accountNumber: "345-678-901234", accountHolder: "이영희", amount: 500000, sourceImageId: "IMG003" }
      ],
      totalCount: 3,
      totalAmount: 1500000,
      status: "WAITING",
      createdAt: "2026-08-19 10:35",
      updatedAt: "2026-08-19 10:35"
    }
  ];

  // 실시간 비디오 카메라 스트림 구동 개시
  function startActiveCameraStream() {
    const video = document.getElementById('camera-stream');
    const preview = document.getElementById('demo-voucher-preview');
    const hint = document.getElementById('viewfinder-hint');
    if (!video) return;

    // 만약 이미 스트림이 활성화되어 있다면 중복 요청 차단
    if (activeStream) return;

    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment", // 스마트폰 후면 카메라 강제 호출
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    }).then(stream => {
      activeStream = stream;
      video.srcObject = stream;
      video.style.display = 'block'; // 비디오 스트림 표출
      if (preview) preview.style.display = 'none'; // 백업용 모의 프리뷰 숨김
      if (hint) hint.style.display = 'none';        // 안내 텍스트 숨김
    }).catch(err => {
      console.warn("실시간 카메라 렌즈 획득 실패 (PC 혹은 권한차단):", err);
      video.style.display = 'none';
      if (preview) preview.style.display = 'block'; // 실패 시 모의 프리뷰로 폴백
      if (hint) hint.style.display = 'block';       // 안내 텍스트 유지
    });
  }

  // 실시간 비디오 카메라 스트림 해제/정지
  function stopActiveCameraStream() {
    const video = document.getElementById('camera-stream');
    const preview = document.getElementById('demo-voucher-preview');
    
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      activeStream = null;
    }
    if (video) {
      video.srcObject = null;
      video.style.display = 'none';
    }
    if (preview) {
      preview.style.display = 'block';
    }
  }

  // 단계 전환 제어 함수
  function gotoScanStep(stepNum) {
    if (!selectView || !captureView || !resultView || !successView) return;
    
    const easyModeLayoutContainer = document.getElementById('easy-mode-layout-container');
    const isEasyActive = easyModeLayoutContainer && !easyModeLayoutContainer.classList.contains('hidden');
    
    const modalHeader = document.querySelector('#transfer-voucher-modal .modal-header');
    const scanFlowSteps = document.querySelector('#transfer-voucher-modal .scan-flow-steps');
    const easySelectView = document.getElementById('easy-scan-step-select-view');

    selectView.classList.add('hidden');
    captureView.classList.add('hidden');
    resultView.classList.add('hidden');
    successView.classList.add('hidden');
    if (easySelectView) easySelectView.classList.add('hidden');

    stepInds.forEach(ind => {
      if (ind) ind.classList.remove('active-step');
    });

    // 2단계(촬영) 이외의 타 단계 진입 시 카메라 스트림 즉시 정지
    if (stepNum !== 2) {
      stopActiveCameraStream();
    }

    if (stepNum === 1) {
      if (isEasyActive) {
        if (easySelectView) easySelectView.classList.remove('hidden');
        if (modalHeader) modalHeader.classList.add('hidden');
        if (scanFlowSteps) scanFlowSteps.classList.add('hidden');
      } else {
        selectView.classList.remove('hidden');
        if (modalHeader) modalHeader.classList.remove('hidden');
        if (scanFlowSteps) scanFlowSteps.classList.remove('hidden');
        if (stepInds[0]) stepInds[0].classList.add('active-step');
      }
      if (typeof renderMySentVoucherList === 'function') {
        renderMySentVoucherList();
      }
    } else if (stepNum === 2) {
      captureView.classList.remove('hidden');
      if (stepInds[1]) stepInds[1].classList.add('active-step');
      
      // 실시간 하드웨어 카메라 구동 시작!
      startActiveCameraStream();

      // 대량 이체 다중 등록 바 및 타이틀 세팅
      const captureTitle = document.getElementById('capture-title-text');
      const captureGuidance = document.getElementById('capture-guidance-text');
      
      if (selectedVoucherType === 'MASS_TRANSFER') {
        if (captureTitle) captureTitle.textContent = "대량 이체 전표를 촬영해주세요.";
        if (captureGuidance) captureGuidance.textContent = "여러 장의 전표를 한 번에 추가 등록할 수 있습니다.";
        massImageSlotsContainer.classList.remove('hidden');
        renderMassThumbnails();
      } else {
        if (captureTitle) captureTitle.textContent = "전표를 촬영해 주세요.";
        if (captureGuidance) captureGuidance.textContent = "전표 전체가 화면에 들어오도록 촬영해주세요.";
        massImageSlotsContainer.classList.add('hidden');
      }

      // 모의 배경 가이드 이미지 매핑 (실시간 비디오 실패 시의 렌더용 백업)
      if (demoVoucherPreview) {
        demoVoucherPreview.style.background = selectedVoucherType === 'MASS_TRANSFER' 
          ? "linear-gradient(135deg, #ede7f6 0%, #b39ddb 100%)" 
          : "linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)";
        demoVoucherPreview.style.borderRadius = "8px";
        demoVoucherPreview.style.boxShadow = "0 6px 18px rgba(0,0,0,0.35)";
        demoVoucherPreview.style.width = "75%";
        demoVoucherPreview.style.height = "55%";
        demoVoucherPreview.innerHTML = `
          <div style="padding: 14px; color: #333; font-family: sans-serif; display: flex; flex-direction: column; justify-content: space-between; height: 100%; box-sizing: border-box;">
            <div style="display:flex; justify-content: space-between; border-bottom: 2px solid #005670; padding-bottom: 4px;">
              <strong style="font-size: 11px; color:#005670;">iM Bank 전표 스캔</strong>
              <span style="font-size: 8px; font-weight:700; color: #e74c3c;">[대기중]</span>
            </div>
            <div style="font-size: 10px; font-weight: 700; margin-top: 10px;">
              업무유형: ${selectedVoucherType === 'MASS_TRANSFER' ? '대량이체 (다중 전표)' : '단일이체 (전표 1장)'}<br>
              가이드 격자선에 맞춰 전표 앞면을 위치시켜 주세요.
            </div>
            <div style="text-align: right; font-size: 8px; color: #666;">iM SmartQ AI OCR</div>
          </div>
        `;
      }

    } else if (stepNum === 3) {
      resultView.classList.remove('hidden');
      if (stepInds[2]) stepInds[2].classList.add('active-step');
      
      // 왼쪽 프리뷰 세팅
      activePreviewImageIndex = 0;
      updatePreviewImageBox();
      
      // 오른쪽 보정/검증 폼 빌드
      buildOcrEditForm();
    } else if (stepNum === 4) {
      successView.classList.remove('hidden');
      if (stepInds[3]) stepInds[3].classList.add('active-step');
      
      // 모의 분석 및 전송 로더 시작
      const loaderBar = document.getElementById('sending-bar-fill');
      const loaderText = document.getElementById('sending-status-text');
      const successBox = document.getElementById('scan-send-success-box');
      const sendingLoader = document.getElementById('scan-sending-loader');
      const checklistProgress = document.getElementById('mass-analysis-progress-checklist');
      
      if (loaderBar && loaderText && successBox && sendingLoader) {
        successBox.classList.add('hidden');
        sendingLoader.classList.remove('hidden');
        loaderBar.style.width = "0%";
        loaderText.textContent = "전송 준비 중...";
        
        // 대량 이체일 경우 순차분석 텍스트 진행효과 노출 (요구사항 8번)
        if (selectedVoucherType === 'MASS_TRANSFER') {
          checklistProgress.classList.remove('hidden');
          checklistProgress.innerHTML = '';
          
          massUploadedImages.forEach((img, idx) => {
            const row = document.createElement('div');
            row.id = `checklist-row-${idx}`;
            row.style.marginBottom = "6px";
            row.style.color = "#7f8c8d";
            row.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color:var(--brand-mint);"></i> <span>${img.name} 분석 중...</span>`;
            checklistProgress.appendChild(row);
          });

          // 분석 순차 체크마크 딜레이
          massUploadedImages.forEach((img, idx) => {
            setTimeout(() => {
              const row = document.getElementById(`checklist-row-${idx}`);
              if (row) {
                row.style.color = "var(--brand-mint-dark)";
                row.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--brand-mint);"></i> <span>${img.name} 분석 완료 ✓</span>`;
                playNotificationSound('beep');
              }
            }, (idx + 1) * 450);
          });
        } else {
          checklistProgress.classList.add('hidden');
        }

        const totalStepsDuration = selectedVoucherType === 'MASS_TRANSFER' ? (massUploadedImages.length * 450 + 500) : 1200;

        setTimeout(() => {
          loaderBar.style.width = "50%";
          loaderText.textContent = "구조화 데이터 전송 패키지 압축 및 채널 암호화 중 (50%)...";
        }, totalStepsDuration / 3);

        setTimeout(() => {
          loaderBar.style.width = "90%";
          loaderText.textContent = "행원 정보 단말 실시간 접수 중 (90%)...";
        }, (totalStepsDuration / 3) * 2);

        setTimeout(() => {
          loaderBar.style.width = "100%";
          loaderText.textContent = "전송 완료!";
          
          setTimeout(() => {
            // 전송 완료 성공 정보 세팅
            sendingLoader.classList.add('hidden');
            successBox.classList.remove('hidden');
            
            const newId = "T20260819" + Math.floor(1000 + Math.random() * 9000);
            document.getElementById('display-staff-ticket-id').textContent = newId;
            document.getElementById('display-staff-voucher-type').textContent = selectedVoucherType === 'MASS_TRANSFER' ? '대량 이체' : '단일 이체';
            
            let sizeText = '';
            if (selectedVoucherType === 'MASS_TRANSFER') {
              sizeText = `${ocrResultData.totalCount}건 / ${ocrResultData.totalAmount.toLocaleString()}원`;
            } else {
              sizeText = `${ocrResultData.ocrData.amount.toLocaleString()}원`;
            }
            document.getElementById('display-staff-total-amount').textContent = sizeText;
            
             // 전역 DB에 수신 적재
            const newRecord = {
              id: newId,
              type: selectedVoucherType,
              customer: { name: reportUserName ? reportUserName.value || "고객" : "고객" },
              images: selectedVoucherType === 'MASS_TRANSFER' ? [...massUploadedImages] : [{ id: "IMG001", name: "단일 전표" }],
              transactions: selectedVoucherType === 'MASS_TRANSFER' ? [...ocrResultData.transactions] : [ocrResultData.ocrData],
              totalCount: selectedVoucherType === 'MASS_TRANSFER' ? ocrResultData.totalCount : 1,
              totalAmount: selectedVoucherType === 'MASS_TRANSFER' ? ocrResultData.totalAmount : ocrResultData.ocrData.amount,
              ocrOriginalData: selectedVoucherType === 'MASS_TRANSFER' ? JSON.parse(JSON.stringify(ocrResultData.transactions)) : JSON.parse(JSON.stringify(ocrResultData.ocrData)),
              status: "WAITING",
              createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              isMySent: true // 💡 내가 보낸 전표 리스트 필터링용 플래그
            };
            window.staffVoucherDb.unshift(newRecord); // 가장 최근 것을 맨 앞으로!
            
            playNotificationSound('double');
            showToast('전표 연동 수신 성공!');
            renderStaffVoucherList();
            if (typeof renderMySentVoucherList === 'function') {
              renderMySentVoucherList(); // 💡 내 전송 리스트 갱신
            }
          }, 300);
        }, totalStepsDuration);
      }
    }
  }

  // 거래 유형 카드 선택 리스너 바인딩
  const vTypeCards = document.querySelectorAll('.v-type-card');
  vTypeCards.forEach(card => {
    card.addEventListener('click', () => {
      vTypeCards.forEach(c => {
        c.classList.remove('active');
        c.style.borderColor = "var(--light-gray)";
        c.style.backgroundColor = "var(--white)";
      });
      card.classList.add('active');
      card.style.borderColor = "var(--brand-mint)";
      card.style.backgroundColor = "var(--brand-mint-light)";
      selectedVoucherType = card.getAttribute('data-vtype');
    });
  });

  // 단계 이동 이벤트 트리거
  if (goToCaptureBtn) {
    goToCaptureBtn.addEventListener('click', () => {
      // 대량 이체일 때 등록 배열 초기화
      if (selectedVoucherType === 'MASS_TRANSFER') {
        massUploadedImages = [];
      }
      gotoScanStep(2);
      playNotificationSound('beep');
    });
  }

  if (backToSelectBtn) {
    backToSelectBtn.addEventListener('click', () => {
      gotoScanStep(1);
      playNotificationSound('beep');
    });
  }

  // 대량 촬영 목록 빌드
  function renderMassThumbnails() {
    if (!massImageThumbnails) return;
    massImageThumbnails.innerHTML = '';
    massSlotsCount.textContent = `${massUploadedImages.length}장 등록됨`;

    if (massUploadedImages.length === 0) {
      massImageThumbnails.innerHTML = `<span style="font-size:10px; color:var(--cool-gray); display:flex; align-items:center; height:100%;">등록된 전표가 없습니다. 추가 촬영해 주세요.</span>`;
      if (finishCaptureBtn) finishCaptureBtn.classList.add('hidden');
      return;
    }

    if (finishCaptureBtn) finishCaptureBtn.classList.remove('hidden');

    massUploadedImages.forEach((img, idx) => {
      const slot = document.createElement('div');
      slot.style.display = "flex";
      slot.style.alignItems = "center";
      slot.style.gap = "4px";
      slot.style.padding = "4px 8px";
      slot.style.backgroundColor = "#fff";
      slot.style.border = "1px solid var(--light-gray)";
      slot.style.borderRadius = "6px";
      slot.style.fontSize = "10.5px";
      slot.style.flexShrink = "0";

      slot.innerHTML = `
        <i class="fa-solid fa-receipt" style="color:var(--brand-mint-dark);"></i>
        <span>${img.name}</span>
        <button type="button" class="del-slot-btn" data-idx="${idx}" style="background:none; border:none; color:#e74c3c; cursor:pointer; margin-left:4px; font-weight:700;">&times;</button>
      `;

      // 삭제 액션 연동
      const delBtn = slot.querySelector('.del-slot-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetIdx = parseInt(delBtn.getAttribute('data-idx'));
          massUploadedImages.splice(targetIdx, 1);
          playNotificationSound('beep');
          renderMassThumbnails();
        });
      }

      massImageThumbnails.appendChild(slot);
    });
  }

  // 카메라 촬영 및 파일 분석 (실제 카메라 파일 URL 지원)
  function executeVoucherCapture(customImgUrl) {
    if (laserEffect) {
      laserEffect.style.display = "block";
    }
    playNotificationSound('beep');

    setTimeout(() => {
      if (laserEffect) laserEffect.style.display = "none";
      playNotificationSound('double');

      if (selectedVoucherType === 'MASS_TRANSFER') {
        // 대량 이체 이미지 1건 증설
        const nextIdx = massUploadedImages.length + 1;
        const bg = customImgUrl || "linear-gradient(135deg, #ede7f6 0%, #b39ddb 100%)";
        
        massUploadedImages.push({
          id: `IMG00${nextIdx}`,
          name: `전표 ${nextIdx}`,
          url: bg
        });

        showToast(`${nextIdx}번째 전표 촬영 등록 완료!`);
        renderMassThumbnails();
      } else {
        // 단일 이체 OCR 실행
        const bg = customImgUrl || "linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)";
        ocrResultData = aiOcrService.analyze('SINGLE_TRANSFER', [bg]);
        gotoScanStep(3);
        showToast('단일 전표 OCR 분석 성공!');
      }
    }, 1000);
  }

  // 실제 카메라 연동 및 실시간 웹파인더 스냅샷 촬영 트리거
  if (btnMockShoot) {
    btnMockShoot.addEventListener('click', () => {
      const video = document.getElementById('camera-stream');
      const canvas = document.getElementById('camera-canvas');
      
      // 1. 실시간 후면 카메라 스트림이 돌고 있는 경우 → 비디오 화면 그대로 캡처!
      if (activeStream && video && canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth || video.clientWidth;
        canvas.height = video.videoHeight || video.clientHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgDataUrl = canvas.toDataURL('image/jpeg');

        if (selectedVoucherType === 'MASS_TRANSFER') {
          // ── 대량이체: 카메라 스트림 유지 → 연속 촬영 ──
          executeVoucherCapture(imgDataUrl);
          // 촬영 플래시 효과 (스트림 유지한 채 시각 피드백)
          video.style.opacity = '0.2';
          setTimeout(() => { video.style.opacity = '1'; }, 120);
        } else {
          // ── 단일이체: 촬영 후 카메라 스트림 종료 ──
          stopActiveCameraStream();
          executeVoucherCapture(imgDataUrl);
        }
      } else {
        // 2. 카메라 미연동 또는 스트림 없음 → 재시동 시도
        if (selectedVoucherType === 'MASS_TRANSFER') {
          // 대량이체: 카메라를 다시 켜서 연속 촬영 재개
          startActiveCameraStream();
          showToast('카메라를 다시 시작합니다. 잠시 후 촬영하세요.');
        } else {
          const realCameraInput = document.getElementById('real-camera-input');
          if (realCameraInput) {
            realCameraInput.click();
          } else {
            executeVoucherCapture();
          }
        }
      }
    });
  }

  // 실제 카메라 촬영 완료 시 이벤트 감지
  const realCameraInput = document.getElementById('real-camera-input');
  if (realCameraInput) {
    realCameraInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const imgUrl = URL.createObjectURL(file); // 임시 이미지 blob url 생성
        executeVoucherCapture(imgUrl);
        realCameraInput.value = ''; // 재촬영 대비 초기화
      }
    });
  }

  if (btnMockGallery) {
    btnMockGallery.addEventListener('click', () => {
      // 갤러리 업로드 시에도 파일 업로드를 위해 capture 속성이 없는 파일 다이얼로그 호출 가능
      const realCameraInput = document.getElementById('real-camera-input');
      if (realCameraInput) {
        // 갤러리/앨범 탐색을 위해 임시로 capture 속성을 제거했다가 띄움
        realCameraInput.removeAttribute('capture');
        realCameraInput.click();
        // 다이얼로그 클릭 후 카메라용으로 0.5초 뒤 capture 복구
        setTimeout(() => {
          realCameraInput.setAttribute('capture', 'environment');
        }, 500);
      } else {
        showToast('갤러리에서 이체 전표 파일을 선택 중...');
        setTimeout(executeVoucherCapture, 500);
      }
    });
  }

  // 대량 촬영 완료 버튼
  if (finishCaptureBtn) {
    finishCaptureBtn.addEventListener('click', () => {
      if (massUploadedImages.length === 0) {
        alert('촬영 혹은 추가된 전표가 없습니다.');
        return;
      }
      ocrResultData = aiOcrService.analyze('MASS_TRANSFER', massUploadedImages);
      gotoScanStep(3);
      playNotificationSound('double');
      showToast('대량 이체 일괄 OCR 분석 성공!');
    });
  }

  // 결과 창에서 누락 전표 추가 촬영 연동 (요구사항 10번)
  if (ocrAddMoreShootBtn) {
    ocrAddMoreShootBtn.addEventListener('click', () => {
      // 대량 이체 촬영 화면으로 리다이렉트
      gotoScanStep(2);
      playNotificationSound('beep');
    });
  }

  if (ocrRetryBtn) {
    ocrRetryBtn.addEventListener('click', () => {
      gotoScanStep(2);
      playNotificationSound('beep');
    });
  }

  if (ocrSendBtn) {
    ocrSendBtn.addEventListener('click', () => {
      // 누락 필수 정보 무결성 검증
      let hasIntegrityError = false;
      if (selectedVoucherType === 'MASS_TRANSFER') {
        ocrResultData.transactions.forEach(t => {
          if (!t.bank || !t.accountNumber || !t.accountHolder || !t.amount) {
            hasIntegrityError = true;
          }
        });
      } else {
        const d = ocrResultData.ocrData;
        if (!d.withdrawalAccount || !d.bank || !d.recipientAccount || !d.recipientName || !d.amount) {
          hasIntegrityError = true;
        }
      }

      if (hasIntegrityError) {
        integrityErrorBanner.classList.remove('hidden');
        playNotificationSound('beep');
        showToast('⚠ 필수 작성 누락 항목을 확인해 주세요.', true);
        return;
      } else {
        integrityErrorBanner.classList.add('hidden');
      }

      // 최종 금융거래 경고 모달/안내 후 전송 진행
      const isConfirmed = confirm("AI가 인식한 전표 정보를 확인하셨습니까?\n최종 금융거래 처리는 창구 행원의 확인 후 진행됩니다.");
      if (!isConfirmed) return;

      gotoScanStep(4);
    });
  }

  if (finishScanFlowBtn) {
    finishScanFlowBtn.addEventListener('click', () => {
      const transferVoucherModal = document.getElementById('transfer-voucher-modal');
      if (transferVoucherModal) {
        transferVoucherModal.classList.add('hidden');
      }
      if (typeof gotoScanStep === 'function') {
        gotoScanStep(1);
      }
      playNotificationSound('beep');
    });
  }

  // 왼쪽 원본 뷰파인더 썸네일 업데이트
  function updatePreviewImageBox() {
    if (!ocrSourceImageBox) return;
    
    // 하이라이트 박스 클리어
    clearOcrHighlights();

    if (selectedVoucherType === 'MASS_TRANSFER') {
      const img = massUploadedImages[activePreviewImageIndex] || { name: "전표", url: "linear-gradient(135deg, #ede7f6 0%, #b39ddb 100%)" };
      ocrSourceImageBox.style.background = img.url;
      document.getElementById('display-preview-source-id').textContent = `[${img.name}]`;
      
      ocrSourceImageBox.innerHTML = `
        <div style="padding:10px; color:#333; height:100%; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box;">
          <div style="font-size:10px; font-weight:700; border-bottom:1px solid rgba(0,0,0,0.1); padding-bottom:3px;">${img.name} (대량 의뢰서)</div>
          <div style="font-size:9.5px; font-weight:600; line-height:1.3;">
            ※ 대량이체 일괄전표 AI OCR 매핑<br>
            자동 텍스트 라인 세분화 추출 완료.
          </div>
          <div style="font-size:8px; color:#666; text-align:right;">iM SmartQ AI OCR</div>
        </div>
      `;
    } else {
      const source = ocrResultData;
      ocrSourceImageBox.style.background = source.images[0] || "linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)";
      document.getElementById('display-preview-source-id').textContent = `[단일 전표]`;
      
      ocrSourceImageBox.innerHTML = `
        <div style="padding:10px; color:#333; height:100%; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box; position:relative; z-index:1;">
          <div style="font-size:10px; font-weight:700; border-bottom:1px solid rgba(0,0,0,0.1); padding-bottom:3px;">단일 이체 전표 원본</div>
          <div style="font-size:9.5px; font-weight:600; line-height:1.3;">
            ※ 단일거래 OCR 판독<br>
            출금/수취/예금주/금액 추출 성공.
          </div>
          <div style="font-size:8px; color:#666; text-align:right;">iM SmartQ AI OCR</div>
        </div>
        <!-- 하이라이트 박스 DOM 유지 -->
        <div id="ocr-hl-withdrawalAccount" class="ocr-hl-box" style="position: absolute; border: 2px solid #e74c3c; background: rgba(231, 76, 60, 0.18); top: 18%; left: 32%; width: 55%; height: 12%; border-radius:3px; display: none; pointer-events: none; z-index: 20; animation: blink-effect 0.8s infinite alternate;"></div>
        <div id="ocr-hl-bank" class="ocr-hl-box" style="position: absolute; border: 2px solid #e74c3c; background: rgba(231, 76, 60, 0.18); top: 33%; left: 32%; width: 35%; height: 12%; border-radius:3px; display: none; pointer-events: none; z-index: 20; animation: blink-effect 0.8s infinite alternate;"></div>
        <div id="ocr-hl-recipientAccount" class="ocr-hl-box" style="position: absolute; border: 2px solid #e74c3c; background: rgba(231, 76, 60, 0.18); top: 48%; left: 32%; width: 55%; height: 12%; border-radius:3px; display: none; pointer-events: none; z-index: 20; animation: blink-effect 0.8s infinite alternate;"></div>
        <div id="ocr-hl-recipientName" class="ocr-hl-box" style="position: absolute; border: 2px solid #e74c3c; background: rgba(231, 76, 60, 0.18); top: 63%; left: 32%; width: 35%; height: 12%; border-radius:3px; display: none; pointer-events: none; z-index: 20; animation: blink-effect 0.8s infinite alternate;"></div>
        <div id="ocr-hl-amount" class="ocr-hl-box" style="position: absolute; border: 2px solid #e74c3c; background: rgba(231, 76, 60, 0.18); top: 78%; left: 32%; width: 45%; height: 12%; border-radius:3px; display: none; pointer-events: none; z-index: 20; animation: blink-effect 0.8s infinite alternate;"></div>
      `;
    }
  }

  function clearOcrHighlights() {
    const boxes = document.querySelectorAll('.ocr-hl-box');
    boxes.forEach(box => box.style.display = "none");
  }

  // 중복 거래 검출 함수 (요구사항 12번)
  function checkDuplicateTransactions() {
    if (selectedVoucherType !== 'MASS_TRANSFER') return;
    
    // 수취계좌 및 금액 대조 판별
    const dups = [];
    const tx = ocrResultData.transactions;
    
    for (let i = 0; i < tx.length; i++) {
      for (let j = i + 1; j < tx.length; j++) {
        if (tx[i].accountNumber === tx[j].accountNumber && tx[i].amount === tx[j].amount && tx[i].bank === tx[j].bank) {
          dups.push(i);
          dups.push(j);
        }
      }
    }

    const uniqueDups = [...new Set(dups)];
    if (uniqueDups.length > 0) {
      duplicateWarningBanner.classList.remove('hidden');
      // 테이블에 중복 표시
      uniqueDups.forEach(idx => {
        const row = document.getElementById(`mass-table-row-${idx}`);
        if (row) {
          row.style.backgroundColor = "#FFF9E6";
          row.style.color = "#d35400";
        }
      });
    } else {
      duplicateWarningBanner.classList.add('hidden');
    }
  }

  // 중복 건 삭제 액션 연동
  document.getElementById('btn-resolve-dup-delete').addEventListener('click', () => {
    if (selectedVoucherType !== 'MASS_TRANSFER') return;
    
    const tx = ocrResultData.transactions;
    const seen = new Set();
    const filteredTx = [];
    
    tx.forEach(t => {
      const key = `${t.bank}-${t.accountNumber}-${t.amount}`;
      if (!seen.has(key)) {
        seen.add(key);
        filteredTx.push(t);
      }
    });

    ocrResultData.transactions = filteredTx;
    ocrResultData.totalCount = filteredTx.length;
    let totalAmt = 0;
    filteredTx.forEach(t => totalAmt += t.amount);
    ocrResultData.totalAmount = totalAmt;

    duplicateWarningBanner.classList.add('hidden');
    buildOcrEditForm(); // 다시 폼 다시 그림
    showToast('중복 이체 거래가 자동 제거되었습니다.');
    playNotificationSound('double');
  });

  document.getElementById('btn-resolve-dup-keep').addEventListener('click', () => {
    duplicateWarningBanner.classList.add('hidden');
    showToast('중복 경고 상태를 해제하고 원본을 유지합니다.');
    playNotificationSound('beep');
  });

  // III. 동적 OCR 수정 폼 빌드 함수
  function buildOcrEditForm() {
    if (!ocrFormStandard || !ocrFormMulti) return;
    ocrFormStandard.classList.add('hidden');
    ocrFormMulti.classList.add('hidden');
    
    // 배너 초기화
    integrityErrorBanner.classList.add('hidden');
    duplicateWarningBanner.classList.add('hidden');

    if (selectedVoucherType === 'MASS_TRANSFER') {
      ocrFormMulti.classList.remove('hidden');
      
      document.getElementById('multi-total-count-label').textContent = `총 ${ocrResultData.totalCount} 건`;
      document.getElementById('multi-total-amount-label').textContent = `총 금액 ${ocrResultData.totalAmount.toLocaleString()} 원`;
      
      const tbody = document.getElementById('ocr-multi-table-body');
      if (tbody) {
        tbody.innerHTML = '';
        
        ocrResultData.transactions.forEach((rec, idx) => {
          const tr = document.createElement('tr');
          tr.id = `mass-table-row-${idx}`;
          tr.style.cursor = "pointer";
          
          // 신뢰도 뱃지 파싱 (요구사항 13번)
          const confBadge = rec.ocrConfidence < 0.8
            ? `<span style="background-color:#ffeaa7; color:#d63031; padding:1px 3px; border-radius:3px; font-weight:800; font-size:8.5px;">⚠ 확인필요</span>`
            : `<span style="background-color:#ebf8f6; color:#00b894; padding:1px 3px; border-radius:3px; font-weight:800; font-size:8.5px;">✓ 99%</span>`;

          // 원본 전표 출처 이름 매치
          const sourceName = massUploadedImages.find(img => img.id === rec.sourceImageId)?.name || "전표";

          tr.innerHTML = `
            <td style="padding:6px; font-weight:700;">${idx + 1}</td>
            <td style="padding:6px; font-weight:700; color:var(--brand-mint-dark);">${sourceName}</td>
            <td style="padding:4px;"><input type="text" value="${rec.bank}" class="multi-row-input" data-idx="${idx}" data-field="bank"></td>
            <td style="padding:4px;"><input type="text" value="${rec.accountNumber}" class="multi-row-input" data-idx="${idx}" data-field="accountNumber"></td>
            <td style="padding:4px;"><input type="text" value="${rec.accountHolder}" class="multi-row-input" data-idx="${idx}" data-field="accountHolder"></td>
            <td style="padding:4px; text-align:right;">
              <input type="number" value="${rec.amount}" class="multi-row-input" data-idx="${idx}" data-field="amount" style="text-align:right; width:80%;">
              <div style="margin-top:2px;">${confBadge}</div>
            </td>
          `;

          // 행 클릭 시 왼쪽의 원본 전표 썸네일로 스위칭 동기화 (요구사항 19번 연동)
          tr.addEventListener('click', () => {
            const sourceIndex = massUploadedImages.findIndex(img => img.id === rec.sourceImageId);
            if (sourceIndex !== -1 && sourceIndex !== activePreviewImageIndex) {
              activePreviewImageIndex = sourceIndex;
              updatePreviewImageBox();
              playNotificationSound('beep');
            }
          });

          tbody.appendChild(tr);
        });

        // 대량 인풋 변경 실시간 연동
        const multiInputs = tbody.querySelectorAll('.multi-row-input');
        multiInputs.forEach(input => {
          input.addEventListener('input', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            const field = e.target.getAttribute('data-field');
            const val = e.target.value;
            
            if (field === 'amount') {
              ocrResultData.transactions[idx][field] = parseInt(val) || 0;
            } else {
              ocrResultData.transactions[idx][field] = val;
            }

            // 총합 실시간 재계산
            let sum = 0;
            ocrResultData.transactions.forEach(t => sum += t.amount);
            ocrResultData.totalAmount = sum;
            document.getElementById('multi-total-amount-label').textContent = `총 금액 ${sum.toLocaleString()} 원`;
          });
        });

        // 중복 거래 검사 자동 기동
        checkDuplicateTransactions();
      }

    } else {
      // 단일 이체 폼 동적 구성
      ocrFormStandard.classList.remove('hidden');
      ocrFormStandard.innerHTML = '';
      
      const fieldLabels = {
        withdrawalAccount: "출금계좌번호",
        bank: "수취은행",
        recipientAccount: "수취계좌번호",
        recipientName: "예금주명",
        amount: "송금금액",
        sender: "보내는 사람",
        purpose: "송금 목적"
      };

      const d = ocrResultData.ocrData;
      const confidence = ocrResultData.ocrConfidence;

      Object.keys(d).forEach(key => {
        const val = d[key];
        const label = fieldLabels[key] || key;
        const conf = confidence[key] || 1.0;
        
        // 신뢰도가 0.8 미만일 경우 "확인 필요" 뱃지 노출 (요구사항 13번)
        const badge = conf < 0.8
          ? `<span style="background-color: #FFF2F4; border: 1px solid #FFCCD3; color: #D0021B; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-left: 6px;"><i class="fa-solid fa-triangle-exclamation"></i> ⚠ 확인필요 (${Math.round(conf * 100)}%)</span>`
          : `<span style="color:#2ecc71; font-size:10px; font-weight:700; margin-left:6px;"><i class="fa-solid fa-circle-check"></i> ✓ ${Math.round(conf * 100)}%</span>`;

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        formGroup.style.marginBottom = "8px";
        
        const isAmount = key === 'amount';
        const inputType = isAmount ? 'number' : 'text';
        
        formGroup.innerHTML = `
          <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
            <span>${label}</span>
            ${badge}
          </label>
          <input type="${inputType}" class="form-input ocr-std-input" data-key="${key}" value="${val}" required style="font-weight: 800;">
        `;

        const inputEl = formGroup.querySelector('.ocr-std-input');
        
        // 💡 중요: 항목 포커스(클릭) 시 원본 전표 해당 영역 강조 오버레이 바인딩 (요구사항 15번)
        if (inputEl) {
          inputEl.addEventListener('focus', () => {
            clearOcrHighlights();
            const hlBox = document.getElementById(`ocr-hl-${key}`);
            if (hlBox) {
              hlBox.style.display = "block";
            }
          });
          inputEl.addEventListener('blur', () => {
            // 약간의 딜레이 후 박스 숨김
            setTimeout(() => {
              const hlBox = document.getElementById(`ocr-hl-${key}`);
              if (hlBox && document.activeElement !== inputEl) {
                hlBox.style.display = "none";
              }
            }, 100);
          });

          // 인풋 값 변경 시 데이터 갱신
          inputEl.addEventListener('input', (e) => {
            const k = e.target.getAttribute('data-key');
            const v = e.target.value;
            if (k === 'amount') {
              ocrResultData.ocrData[k] = parseInt(v) || 0;
            } else {
              ocrResultData.ocrData[k] = v;
            }
          });
        }

        ocrFormStandard.appendChild(formGroup);
      });
    }
  }

  // ==========================================================================
  // --- 11-B. 행원 정보 단말 (Staff View) 실시간 제어 로직 (삭제 처리) ---
  // ==========================================================================

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
    },

    invest: {
      title: "투자 성향 진단",
      icon: "fa-solid fa-chart-line",
      questions: [
        {
          q: "Q1. 본인의 금융 투자 상품(주식, 펀드 등)에 대한 지식 및 경험 수준은?",
          options: [
            { text: "주식, 채권, 파생상품 등 투자 상품의 원리와 위험성에 대해 풍부한 이해를 갖춤", score: { aggressive: 3, safe: 0 } },
            { text: "펀드나 예적금 위주로 투자해 봤으며 기본적인 금융 상품 구조는 이해함", score: { aggressive: 1, safe: 1 } },
            { text: "투자 금융 상품에 대한 지식이 거의 없으며 예적금 이외에는 거래한 적이 없음", score: { aggressive: 0, safe: 3 } }
          ]
        },
        {
          q: "Q2. 투자한 자산의 평가 금액이 시장 변동성으로 인해 하루 만에 -10% 급락했을 때 당신의 반응은?",
          options: [
            { text: "시장의 일시적인 변동이므로 무덤덤하게 버티거나 저점 추가 매수 기회로 활용", score: { aggressive: 3, safe: 0 } },
            { text: "불안하긴 하지만 원금 손실을 확정 짓지 않고 상황을 지켜보며 대기함", score: { aggressive: 1, safe: 1 } },
            { text: "밤잠을 설칠 정도로 패닉에 빠져 추가 손실을 막기 위해 즉시 전액 매도", score: { aggressive: 0, safe: 3 } }
          ]
        },
        {
          q: "Q3. 기대 가능한 투자 수익률과 원금 손실의 위험도 중 어떤 쪽에 집중하시나요?",
          options: [
            { text: "원금 손실 위험이 있더라도 시중 예적금보다 2~3배 이상 높은 공격적인 수익 추구", score: { aggressive: 3, safe: 0 } },
            { text: "안정성과 고수익을 균형 있게 고려하여 물가상승률 이상의 중위험·중수익 선호", score: { aggressive: 1, safe: 1 } },
            { text: "단 0.1%의 원금 손실 가능성도 허용하지 않으며 예금자 보호가 가능한 자산 보전이 최우선", score: { aggressive: 0, safe: 3 } }
          ]
        },
        {
          q: "Q4. 이번 투자에 활용하고자 하는 여유 자금의 예상 예치 및 회수 기간은?",
          options: [
            { text: "3년 이상 길게 묶어두고 중간 변동성을 극복하며 장기 복리 효과를 노릴 자금", score: { aggressive: 3, safe: 0 } },
            { text: "1년 내외의 적정 기간 동안 투자하여 상황에 따라 현금화가 필요할 수도 있는 자금", score: { aggressive: 1, safe: 1 } },
            { text: "6개월 미만 단기로 굴려야 하며 필요 시 언제든 바로 인출해 사용해야 하는 자금", score: { aggressive: 0, safe: 3 } }
          ]
        },
        {
          q: "Q5. 본인의 소득 수준 및 자산 현황 대비, 이번 투자 자금의 성격과 비중은?",
          options: [
            { text: "전체 자산 중 일부 여유 소득으로 투자 실패 시에도 생계나 미래 계획에 영향이 없음", score: { aggressive: 3, safe: 0 } },
            { text: "일정 기간 뒤 전세금, 학자금 등 용도가 정해져 있어 절대 잃어서는 안 되는 성격의 자금", score: { aggressive: 0, safe: 3 } }
          ]
        }
      ],
      results: {
        safe: {
          title: "원금 보전 최우선 안정형",
          desc: "투자 원금의 단 1% 손실 가능성도 허용하지 않으며, 기대 수익률이 낮더라도 시중 금리 대비 안정적인 국공채 펀드 등 자산의 절대 안전 보전을 최우선 가치로 여기는 현명한 자산가입니다."
        },
        aggressive: {
          title: "수익 추구 적극 공격투자형",
          desc: "시장의 격렬한 단기 변동성을 기꺼이 감내할 준비가 되어 있으며, 글로벌 혁신 AI 기술 기업 주식 등 초과 고수익을 기대할 수 있는 액티브 성장형 상품에 비중을 과감히 실어 자산을 증식시키는 투자 모험가입니다."
        }
      }
    }
  };

  let activeCategory = 'card';
  let currentQuestionIndex = 0;
  let userScores = {};

  // 금융 성향 테스트 상태 초기화 함수 (Intro 화면으로 복원)
  window.resetFinancialQuiz = function() {
    if (quizCardBox) quizCardBox.classList.add('hidden');
    if (quizIntroBox) quizIntroBox.classList.remove('hidden');
    if (quizResultBox) quizResultBox.classList.add('hidden');
    
    currentQuestionIndex = 0;
    userScores = {};
    activeCategory = 'card';
  };

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

    // 동적 상품 카드 생성 영역 (투자 성향의 경우 설명 의무 보호를 위해 상품 추천을 숨김)
    const recTitle = document.querySelector('#quiz-result-box .recommended-title');
    const container = document.getElementById('recommended-products-container');
    
    if (activeCategory === 'invest') {
      if (recTitle) recTitle.style.display = 'none';
      if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
      }
    } else {
      if (recTitle) recTitle.style.display = 'block';
      if (container) {
        container.style.display = 'block';
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
  const transferVoucherModal = document.getElementById('transfer-voucher-modal');

  const closePreWritingBtn = document.getElementById('close-pre-writing-modal-btn');
  const closeChecklistBtn = document.getElementById('close-checklist-modal-btn');
  const closeFinancialTestBtn = document.getElementById('close-financial-test-modal-btn');
  const closeTransferVoucherBtn = document.getElementById('close-transfer-voucher-modal-btn');

  // 1회성 공통 동의 모달 관련 변수 및 엘리먼트 정의
  const commonConsentModal = document.getElementById('common-consent-modal');
  const closeCommonConsentBtn = document.getElementById('close-common-consent-modal-btn');
  const submitCommonConsentBtn = document.getElementById('submit-common-consent-btn');
  
  const agreeAllCheckbox = document.getElementById('agree-all-consents');
  const individualConsentCheckboxes = document.querySelectorAll('.individual-consent');
  const agreePolicy = document.getElementById('agree-policy-check');
  const agreeRequired = document.getElementById('agree-required-check');
  const agreeOptional = document.getElementById('agree-optional-check');
  
  let pendingModalId = null;

  // 전체 동의 토글 로직
  if (agreeAllCheckbox) {
    agreeAllCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      individualConsentCheckboxes.forEach(cb => {
        cb.checked = isChecked;
      });
    });
  }

  // 개별 동의 상태에 따른 전체 동의 체크박스 자동 갱신
  individualConsentCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const allChecked = Array.from(individualConsentCheckboxes).every(item => item.checked);
      if (agreeAllCheckbox) {
        agreeAllCheckbox.checked = allChecked;
      }
    });
  });

  // 약관 상세 펼치기 토글 제어 리스너
  const consentDetailBtns = document.querySelectorAll('.btn-consent-detail');
  consentDetailBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const targetId = this.getAttribute('data-target');
      const panel = document.getElementById(targetId);
      const icon = this.querySelector('i');
      
      if (panel) {
        panel.classList.toggle('hidden');
        if (icon) {
          if (panel.classList.contains('hidden')) {
            icon.style.transform = 'rotate(0deg)';
          } else {
            icon.style.transform = 'rotate(180deg)';
          }
        }
      }
    });
  });

  // 동의 모달 닫기
  if (closeCommonConsentBtn && commonConsentModal) {
    closeCommonConsentBtn.addEventListener('click', () => {
      commonConsentModal.classList.add('hidden');
      pendingModalId = null;
    });
  }

  // 동의하고 계속하기 완료 처리
  if (submitCommonConsentBtn && commonConsentModal) {
    submitCommonConsentBtn.addEventListener('click', () => {
      // 필수 약관 동의 체크 검증
      if (!agreePolicy.checked || !agreeRequired.checked) {
        alert('서비스 이용을 위해 필수 약관(개인정보 처리방침 확인 및 필수 수집·이용 동의)에 동의해 주셔야 합니다.');
        return;
      }

      // 동의 상태 저장
      localStorage.setItem('smartq_consent', 'true');
      if (agreeOptional.checked) {
        localStorage.setItem('smartq_marketing_consent', 'true');
      } else {
        localStorage.removeItem('smartq_marketing_consent');
      }

      // 모달 전환
      commonConsentModal.classList.add('hidden');
      if (pendingModalId) {
        const targetModal = document.getElementById(pendingModalId);
        if (targetModal) {
          targetModal.classList.remove('hidden');
          
          // 만약 미리작성 모달이 열린다면 초기 스위칭 트리거 실행
          if (pendingModalId === 'pre-writing-modal') {
            const defaultRadio = document.querySelector('input[name="pre-work-type"][value="cif"]');
            if (defaultRadio) {
              defaultRadio.checked = true;
              defaultRadio.dispatchEvent(new Event('change'));
            }
          } else if (pendingModalId === 'transfer-voucher-modal') {
            if (typeof gotoScanStep === 'function') {
              gotoScanStep(1);
            }
          }
        }
        pendingModalId = null;
      }
    });
  }

  // 모달 진입 전 가로채기 공통 함수
  function openModalWithConsentCheck(targetModalId) {
    const isConsented = localStorage.getItem('smartq_consent') === 'true';
    
    if (isConsented) {
      // 이미 최초 1회 동의가 완료되었으면 바로 목적지 모달 열기
      const targetModal = document.getElementById(targetModalId);
      if (targetModal) {
        targetModal.classList.remove('hidden');
        if (targetModalId === 'pre-writing-modal') {
          const defaultRadio = document.querySelector('input[name="pre-work-type"][value="cif"]');
          if (defaultRadio) {
            defaultRadio.checked = true;
            defaultRadio.dispatchEvent(new Event('change'));
          }
        } else if (targetModalId === 'transfer-voucher-modal') {
          if (typeof gotoScanStep === 'function') {
            gotoScanStep(1);
          }
        }
      }
    } else {
      // 동의하지 않은 경우, 동의 팝업을 띄우고 목적지 저장
      pendingModalId = targetModalId;
      if (commonConsentModal) {
        commonConsentModal.classList.remove('hidden');
        // 체크박스들 초기화 (기존 찌꺼기 방지)
        if (agreeAllCheckbox) agreeAllCheckbox.checked = false;
        individualConsentCheckboxes.forEach(cb => cb.checked = false);
      }
    }
  }

  // 미리작성 모달 열기
  if (quickPreWritingBtn) {
    quickPreWritingBtn.addEventListener('click', () => {
      openModalWithConsentCheck('pre-writing-modal');
      playNotificationSound('beep');
    });
  }

  // 송금전표 모달 열기
  if (quickScanBtn) {
    quickScanBtn.addEventListener('click', () => {
      openModalWithConsentCheck('transfer-voucher-modal');
      playNotificationSound('beep');
    });
  }

  // 쉬운 모드 전용 대형 송금전표 버튼 열기 연동
  const easyScanBtn = document.getElementById('btn-easy-scan');
  if (easyScanBtn) {
    easyScanBtn.addEventListener('click', () => {
      openModalWithConsentCheck('transfer-voucher-modal');
      playNotificationSound('beep');
    });
  }

  // 쉬운 모드 전표 타입 선택 및 촬영 진입 이벤트 바인딩
  const easyVoucherSelectBtns = document.querySelectorAll('.easy-voucher-select-btn');
  easyVoucherSelectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedVoucherType = btn.getAttribute('data-vtype');
      
      // 대량 이체일 때 등록 배열 초기화
      if (selectedVoucherType === 'MASS_TRANSFER') {
        massUploadedImages = [];
      }
      
      if (typeof gotoScanStep === 'function') {
        gotoScanStep(2); // 바로 2단계 촬영 뷰로 진입!
      }
      playNotificationSound('beep');
    });
  });

  // 쉬운 모드 전표 선택 취소 버튼 바인딩
  const easyScanCancelBtn = document.getElementById('easy-scan-cancel-btn');
  if (easyScanCancelBtn) {
    easyScanCancelBtn.addEventListener('click', () => {
      const transferVoucherModal = document.getElementById('transfer-voucher-modal');
      if (transferVoucherModal) {
        transferVoucherModal.classList.add('hidden');
      }
      playNotificationSound('beep');
    });
  }

  // 쉬운 모드 전용 미리작성 버튼 열기 연동
  const easyPreWritingBtn = document.getElementById('btn-easy-pre-writing');
  if (easyPreWritingBtn) {
    easyPreWritingBtn.addEventListener('click', () => {
      openModalWithConsentCheck('pre-writing-modal');
      playNotificationSound('beep');
    });
  }

  // 쉬운 모드 전용 서류체크 버튼 열기 연동
  const easyChecklistBtn = document.getElementById('btn-easy-checklist');
  if (easyChecklistBtn && checklistModal) {
    easyChecklistBtn.addEventListener('click', () => {
      checklistModal.classList.remove('hidden');
      renderChecklist(); // 진척도 및 체크리스트 강제 렌더링
      playNotificationSound('beep');
    });
  }

  // 쉬운 모드 전용 금융성향 테스트 버튼 열기 연동
  const easyFinancialTestBtn = document.getElementById('btn-easy-financial-test');
  if (easyFinancialTestBtn) {
    easyFinancialTestBtn.addEventListener('click', () => {
      if (typeof resetFinancialQuiz === 'function') {
        resetFinancialQuiz();
      }
      openModalWithConsentCheck('financial-test-modal');
      playNotificationSound('beep');
    });
  }

  // --- 쉬운 모드 (Easy Mode) 토글 시스템 제어 ---
  const easyModeToggleBtn = document.getElementById('easy-mode-toggle-btn');
  const easyModeLayoutContainer = document.getElementById('easy-mode-layout-container');
  const quickMenuGrid = document.querySelector('.quick-menu-grid');
  
  if (easyModeToggleBtn) {
    easyModeToggleBtn.addEventListener('click', () => {
      const isEasyActive = easyModeLayoutContainer && !easyModeLayoutContainer.classList.contains('hidden');
      
      if (isEasyActive) {
        // 쉬운 모드 끄기 처리
        if (easyModeLayoutContainer) easyModeLayoutContainer.classList.add('hidden');
        if (quickMenuGrid) quickMenuGrid.classList.remove('hidden'); // 기존 2x2 그리드 복원
        
        // 버튼 톤앤무드 복원
        easyModeToggleBtn.style.backgroundColor = 'var(--brand-mint-light)';
        easyModeToggleBtn.style.color = 'var(--brand-mint-dark)';
        easyModeToggleBtn.style.border = '2px solid var(--brand-mint)';
        easyModeToggleBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass-plus"></i> 쉬운 모드 켜기';
        
        showToast('쉬운 모드가 해제되었습니다.');
      } else {
        // 쉬운 모드 켜기 처리
        if (easyModeLayoutContainer) easyModeLayoutContainer.classList.remove('hidden');
        if (quickMenuGrid) quickMenuGrid.classList.add('hidden'); // 기존 2x2 그리드 숨기기
        
        // 버튼 톤앤무드 활성화 강조 (차콜 톤으로 켜짐 표시)
        easyModeToggleBtn.style.backgroundColor = '#2c3e50';
        easyModeToggleBtn.style.color = '#ffffff';
        easyModeToggleBtn.style.border = '2px solid #2c3e50';
        easyModeToggleBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass-minus"></i> 쉬운 모드 끄기';
        
        showToast('쉬운 모드가 활성화되었습니다. 글씨와 버튼이 크고 명확해집니다.');
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
  if (quickFinancialTestBtn) {
    quickFinancialTestBtn.addEventListener('click', () => {
      // 모달 진입 시 이전에 풀고 있던 데이터 찌꺼기 완벽하게 초기화 리셋!
      if (typeof resetFinancialQuiz === 'function') {
        resetFinancialQuiz();
      }
      openModalWithConsentCheck('financial-test-modal');
      playNotificationSound('beep');
    });
  }

  // 닫기 버튼 이벤트 바인딩
  const setupModalClose = (closeBtnEl, modalEl) => {
    if (closeBtnEl && modalEl) {
      const handleClose = () => {
        modalEl.classList.add('hidden');
        if (modalEl.id === 'transfer-voucher-modal') {
          if (typeof gotoScanStep === 'function') {
            gotoScanStep(1);
          }
        } else if (modalEl.id === 'financial-test-modal') {
          // 금융성향 테스트 모달을 X 나 배경클릭으로 닫을 때도 즉시 상태 초기화 리셋!
          if (typeof resetFinancialQuiz === 'function') {
            resetFinancialQuiz();
          }
        }
        playNotificationSound('beep');
      };
      
      closeBtnEl.addEventListener('click', handleClose);
      
      // 오버레이 배경 클릭 시 닫기
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
          handleClose();
        }
      });
    }
  };

  setupModalClose(closePreWritingBtn, preWritingModal);
  setupModalClose(closeChecklistBtn, checklistModal);
  setupModalClose(closeFinancialTestBtn, financialTestModal);
  setupModalClose(closeTransferVoucherBtn, transferVoucherModal);

  // --- 내가 보낸 전표 목록 조회 및 상세 팝업 제어 ---
  const sentVouchersList = document.getElementById('sent-vouchers-list');
  const sentVouchersCount = document.getElementById('sent-vouchers-count');
  
  const sentVoucherDetailModal = document.getElementById('sent-voucher-detail-modal');
  const closeSentVoucherDetailBtn = document.getElementById('close-sent-voucher-detail-btn');
  const closeSentVoucherDetailBtnBottom = document.getElementById('close-sent-voucher-detail-btn-bottom');

  window.renderMySentVoucherList = function() {
    if (!sentVouchersList || !sentVouchersCount) return;
    
    // 내가 보낸 전표만 필터링 (데모 샘플 데이터와 격리)
    const mySentList = (window.staffVoucherDb || []).filter(item => item.isMySent === true);
    sentVouchersCount.textContent = `${mySentList.length}건`;

    if (mySentList.length === 0) {
      sentVouchersList.innerHTML = '<div style="font-size: 11.5px; color: var(--cool-gray); text-align: center; padding: 12px 0;">최근 전송한 전표 내역이 없습니다.</div>';
      return;
    }

    sentVouchersList.innerHTML = '';
    mySentList.forEach(item => {
      const card = document.createElement('div');
      card.className = 'my-sent-card';
      card.style.padding = '10px 12px';
      card.style.border = '1px solid var(--light-gray)';
      card.style.borderRadius = '8px';
      card.style.backgroundColor = '#fff';
      card.style.cursor = 'pointer';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';
      card.style.boxShadow = 'var(--shadow-xs)';
      card.style.transition = 'all 0.2s';

      card.addEventListener('mouseenter', () => { card.style.borderColor = 'var(--brand-mint)'; });
      card.addEventListener('mouseleave', () => { card.style.borderColor = 'var(--light-gray)'; });

      const dateStr = item.createdAt ? item.createdAt.substring(11) : '';

      card.innerHTML = `
        <div>
          <div style="font-weight: 700; font-size: 12px; color: var(--dark-text);">${item.type === 'MASS_TRANSFER' ? '대량 이체 전표' : '단일 이체 전표'}</div>
          <div style="font-size: 10.5px; color: var(--cool-gray); margin-top: 4px;">접수번호: ${item.id} | ${dateStr}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 800; font-size: 12.5px; color: var(--brand-mint-dark);">${item.totalAmount.toLocaleString()}원</div>
          <div style="font-size: 9.5px; color: var(--cool-gray); margin-top: 2px;">상세 보기 <i class="fa-solid fa-chevron-right" style="font-size: 8px;"></i></div>
        </div>
      `;

      card.addEventListener('click', () => {
        openSentVoucherDetail(item);
      });

      sentVouchersList.appendChild(card);
    });
  };

  function openSentVoucherDetail(item) {
    if (!sentVoucherDetailModal) return;
    
    document.getElementById('detail-view-ticket-id').textContent = item.id;
    document.getElementById('detail-view-type').textContent = item.type === 'MASS_TRANSFER' ? '대량 이체' : '단일 이체';
    document.getElementById('detail-view-time').textContent = item.createdAt;
    document.getElementById('detail-view-amount').textContent = `${item.totalAmount.toLocaleString()}원`;

    const statusEl = document.getElementById('detail-view-status');
    if (statusEl) {
      if (item.status === 'WAITING') {
        statusEl.textContent = '창구 대기중';
        statusEl.style.backgroundColor = '#e3fcef';
        statusEl.style.color = '#00a389';
      } else {
        statusEl.textContent = '처리 완료';
        statusEl.style.backgroundColor = '#f1f2f6';
        statusEl.style.color = '#7f8c8d';
      }
    }

    const tbody = document.getElementById('detail-view-transactions-body');
    if (tbody) {
      tbody.innerHTML = '';
      const txs = item.transactions || [];
      txs.forEach(t => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--light-gray)';
        
        const bankVal = t.bank || '-';
        const accountVal = t.accountNumber || t.recipientAccount || '-';
        const holderVal = t.accountHolder || t.recipientName || '-';
        const amtVal = t.amount ? `${t.amount.toLocaleString()}원` : '0원';

        tr.innerHTML = `
          <td style="padding: 8px; font-weight: 700;">${bankVal}</td>
          <td style="padding: 8px; color: var(--dark-gray); font-family: monospace; word-break: break-all;">${accountVal}</td>
          <td style="padding: 8px;">${holderVal}</td>
          <td style="padding: 8px; text-align: right; font-weight: 700;">${amtVal}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    sentVoucherDetailModal.classList.remove('hidden');
    playNotificationSound('beep');
  }

  if (sentVoucherDetailModal) {
    const closeDetail = () => {
      sentVoucherDetailModal.classList.add('hidden');
      playNotificationSound('beep');
    };
    if (closeSentVoucherDetailBtn) closeSentVoucherDetailBtn.addEventListener('click', closeDetail);
    if (closeSentVoucherDetailBtnBottom) closeSentVoucherDetailBtnBottom.addEventListener('click', closeDetail);
    
    sentVoucherDetailModal.addEventListener('click', (e) => {
      if (e.target === sentVoucherDetailModal) {
        closeDetail();
      }
    });
  }

  // --- 체크리스트 업무 통합 검색 및 추천 선택지 드롭다운 제어 ---
  const checklistSearchInput = document.getElementById('checklist-search-input');
  const checklistDropdownResults = document.getElementById('checklist-dropdown-results');
  const checklistOptItems = document.querySelectorAll('.checklist-opt-item');

  if (checklistSearchInput && checklistDropdownResults) {
    // 1. 인풋 클릭 / 포커스 시 드롭다운 펼침
    const showDropdown = () => {
      checklistDropdownResults.style.display = 'block';
      filterResults();
    };

    checklistSearchInput.addEventListener('focus', showDropdown);
    checklistSearchInput.addEventListener('click', (e) => {
      e.stopPropagation();
      showDropdown();
    });

    // 2. 키 입력 시 실시간 검색어 기반 필터링
    const filterResults = () => {
      const query = checklistSearchInput.value.trim().toLowerCase();
      checklistOptItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (query === '' || text.includes(query)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    };

    checklistSearchInput.addEventListener('input', filterResults);

    // 3. 선택지 클릭 시 해당 탭 클릭 강제 트리거 및 렌더링 동기화
    checklistOptItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const tabValue = item.getAttribute('data-val');
        const tabName = item.textContent;

        if (tabValue === 'none') {
          checklistSearchInput.value = '';
          // 선택안함 시 상황 질문 컨테이너도 함께 강제 숨김 및 비움
          if (checklistQuestionsContainer) {
            checklistQuestionsContainer.style.display = 'none';
            checklistQuestionsContainer.innerHTML = '';
          }
          // 선택안함 시 체크리스트 영역 비움
          if (checklistItemsEl) {
            checklistItemsEl.innerHTML = '<div style="font-size: 12px; color: var(--cool-gray); text-align: center; padding: 24px 0;">조회하실 업무명을 검색하여 선택해 주세요.</div>';
          }
          if (progressBarEl) progressBarEl.style.width = '0%';
          if (progressPctEl) progressPctEl.textContent = '0%';
        } else {
          checklistSearchInput.value = tabName;
          
          // 업무 변경 진입 시, 이전에 이 업무에서 선택했던 모든 문진 답변과 서류 체크 이력을 원천 리셋!
          const config = checklistConfig[tabValue];
          if (config && config.questions) {
            config.questions.forEach(q => {
              delete checkedAnswers[q.id];
            });
          }
          if (checkedState[tabValue]) {
            checkedState[tabValue] = [];
          }
          
          // 숨겨진 원래의 탭 버튼 강제 클릭! (기존 JS 연동 구조 고스란히 재활용)
          const targetTabBtn = document.querySelector(`.tab-btn[data-tab="${tabValue}"]`);
          if (targetTabBtn) {
            targetTabBtn.click();
          }
        }

        checklistDropdownResults.style.display = 'none';
        playNotificationSound('beep');
      });
    });

    // 4. 드롭다운 바깥 클릭 시 닫기
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.checklist-search-wrapper')) {
        checklistDropdownResults.style.display = 'none';
      }
    });

    // 5. 체크리스트 모달이 처음 열릴 때 검색 입력창 및 추천 초기화
    const checklistBtn = document.getElementById('btn-quick-checklist');
    if (checklistBtn) {
      checklistBtn.addEventListener('click', () => {
        checklistSearchInput.value = '';
        checklistDropdownResults.style.display = 'none';
        if (checklistItemsEl) {
          checklistItemsEl.innerHTML = '<div style="font-size: 12px; color: var(--cool-gray); text-align: center; padding: 24px 0;">조회하실 업무명을 검색하여 선택해 주세요.</div>';
        }
        if (progressBarEl) progressBarEl.style.width = '0%';
        if (progressPctEl) progressPctEl.textContent = '0%';
      });
    }
  }

});
