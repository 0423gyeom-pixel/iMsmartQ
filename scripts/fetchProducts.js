const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const TARGET_URL = 'https://www.imbank.co.kr/com_ebz_fpm_sub_main.jsp';
const OUTPUT_FILE = path.join(__dirname, '..', 'products.json');

async function main() {
  console.log('Starting product fetching script...');
  
  let products = [];
  let scrapeSuccess = false;

  // --- Tier 1: Axios + Cheerio ---
  try {
    console.log('Tier 1: Trying to fetch via Axios + Cheerio...');
    const response = await axios.get(TARGET_URL, { 
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = response.data;
    const $ = cheerio.load(html);
    
    // 연령별 추천 상품 리스트 파싱
    const productItems = $('.prdctList dl');
    
    if (productItems.length === 0) {
      throw new Error('Static HTML parsing yielded 0 products from .prdctList dl.');
    }
    
    productItems.each((i, el) => {
      const categoryText = $(el).find('dt .category').text().trim(); // 예: "카드 / 체크카드"
      const nameText = $(el).find('dt span').not('.category').text().trim(); // 예: "Master Y+  체크카드"
      const benefitText = $(el).find('dd').first().text().trim(); // 예: "Y+ 체크카드의 다양한 서비스..."
      
      if (!nameText) return;

      let category = '예금';
      let icon = 'fa-solid fa-piggy-bank';
      let image = '';
      
      if (categoryText.includes('카드')) {
        category = '카드';
        icon = 'fa-solid fa-credit-card';
        if (nameText.includes('Z')) {
          image = './im_i_card.png';
        } else if (nameText.includes('Y+')) {
          image = './im_travel_card.png';
        } else {
          image = './im_one_card.png';
        }
      } else if (categoryText.includes('대출')) {
        category = '대출';
        icon = 'fa-solid fa-hand-holding-dollar';
      } else if (categoryText.includes('적금')) {
        category = '적금';
        icon = 'fa-solid fa-piggy-bank';
      } else if (categoryText.includes('예금') || categoryText.includes('통장') || categoryText.includes('저축')) {
        category = '예금';
        icon = 'fa-solid fa-vault';
      }

      // 성향 매칭 규칙 (환각 방지)
      let matchTypes = [];
      const lowerName = nameText.toLowerCase();
      const lowerBenefit = benefitText.toLowerCase();

      if (category === '카드') {
        if (lowerName.includes('z') || lowerName.includes('i') || lowerBenefit.includes('할인') || lowerBenefit.includes('배달') || lowerBenefit.includes('소비')) {
          matchTypes.push('smart');
        }
        if (lowerName.includes('y+') || lowerBenefit.includes('해외') || lowerBenefit.includes('라운지') || lowerBenefit.includes('여행')) {
          matchTypes.push('travel');
        }
        if (lowerName.includes('greit') || lowerName.includes('무조건') || lowerBenefit.includes('조건없이') || lowerBenefit.includes('기본')) {
          matchTypes.push('simple');
        }
      } else if (category === '예금' || category === '적금') {
        if (lowerName.includes('핫플') || lowerBenefit.includes('위치') || lowerBenefit.includes('인증') || lowerBenefit.includes('미션')) {
          matchTypes.push('challenger');
        } else if (lowerName.includes('세븐') || lowerName.includes('자유') || lowerBenefit.includes('소액') || lowerBenefit.includes('단기')) {
          matchTypes.push('savings');
        } else {
          matchTypes.push('deposit');
        }
      }

      // 중복 방지
      if (!products.some(p => p.name === nameText)) {
        products.push({
          id: `scraped-${category === '카드' ? 'card' : 'deposit'}-${i}`,
          category: category,
          name: nameText,
          rate: category === '예금' || category === '적금' ? '최고 연 3.5%~4.5%' : '-',
          benefit: benefitText,
          icon: icon,
          image: image,
          matchTypes: matchTypes,
          lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ')
        });
      }
    });

    // 롤링 배너 예적금 상품 파싱 추가 (예: 세븐적금, iM자유적금)
    $('.banner_list li').each((i, el) => {
      const altText = $(el).find('img').attr('alt') || '';
      if (!altText) return;
      
      const name = altText.split(' ')[0] || altText;
      const desc = altText.replace(name, '').trim();

      if (!name) return;

      if (products.some(p => p.name.includes(name) || name.includes(p.name))) {
        return;
      }

      let matchTypes = ['savings'];
      if (name.includes('핫플')) {
        matchTypes = ['challenger'];
      }

      products.push({
        id: `scraped-banner-${i}`,
        category: '적금',
        name: name,
        rate: name.includes('세븐') ? '최고 연 4.0%' : '최고 연 3.8%',
        benefit: desc || '실속 있는 우대금리를 챙길 수 있는 대표 적금 상품',
        icon: 'fa-solid fa-piggy-bank',
        matchTypes: matchTypes,
        lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ')
      });
    });

    scrapeSuccess = true;
    console.log(`Tier 1 scrape successful! Parsed ${products.length} products.`);
  } catch (error) {
    console.log(`Tier 1 failed: ${error.message}`);
  }

  // --- Tier 2: Puppeteer Fallback ---
  if (!scrapeSuccess || products.length === 0) {
    try {
      console.log('Tier 2: Trying to fetch via Puppeteer headless...');
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 15000 });
      
      const data = await page.evaluate(() => {
        const list = [];
        document.querySelectorAll('.prdctList dl').forEach((el, index) => {
          const cat = el.querySelector('dt .category')?.textContent.trim() || '';
          const name = el.querySelector('dt span:not(.category)')?.textContent.trim() || '';
          const benefit = el.querySelector('dd')?.textContent.trim() || '';
          if (name) {
            list.push({ index, categoryText: cat, name, benefit });
          }
        });
        return list;
      });
      
      await browser.close();
      
      if (data.length > 0) {
        products = data.map(item => {
          let category = '예금';
          let icon = 'fa-solid fa-piggy-bank';
          if (item.categoryText.includes('카드')) {
            category = '카드';
            icon = 'fa-solid fa-credit-card';
          } else if (item.categoryText.includes('대출')) {
            category = '대출';
            icon = 'fa-solid fa-hand-holding-dollar';
          }

          let matchTypes = [];
          if (category === '카드') {
            if (item.name.includes('Z') || item.benefit.includes('할인')) matchTypes.push('smart');
            if (item.name.includes('Y+') || item.benefit.includes('해외')) matchTypes.push('travel');
            if (item.name.includes('GREiT')) matchTypes.push('simple');
          } else {
            if (item.name.includes('핫플')) matchTypes.push('challenger');
            else if (item.name.includes('세븐') || item.name.includes('자유')) matchTypes.push('savings');
            else matchTypes.push('deposit');
          }

          return {
            id: `puppeteer-${category === '카드' ? 'card' : 'deposit'}-${item.index}`,
            category: category,
            name: item.name,
            rate: category === '예금' || category === '적금' ? '최고 연 3.8%' : '-',
            benefit: item.benefit,
            icon: icon,
            matchTypes: matchTypes,
            lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ')
          };
        });
        scrapeSuccess = true;
        console.log('Tier 2 scrape successful!');
      }
    } catch (error) {
      console.log(`Tier 2 failed: ${error.message}`);
    }
  }

  // --- Tier 3: Final Fallback to Existing json ---
  if (!scrapeSuccess || products.length === 0) {
    console.warn('크롤링 실패, 기존 데이터 유지');
    if (fs.existsSync(OUTPUT_FILE)) {
      try {
        const existingData = fs.readFileSync(OUTPUT_FILE, 'utf-8');
        products = JSON.parse(existingData);
        console.log('Successfully maintained existing products.json values.');
      } catch (err) {
        console.error('Failed to read existing products.json:', err.message);
      }
    }
  } else {
    // Write new scraped data to products.json
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2), 'utf-8');
    console.log(`Successfully updated products.json with ${products.length} products.`);
  }
}

main().catch(console.error);
